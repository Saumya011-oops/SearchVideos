import chromadb
from chromadb.config import Settings
from pipeline.embedder import embed_query
from pipeline.config import CHROMA_DIR, CHROMA_COLLECTION_NAME

_client = None
_collection = None


def init_store():
    """Initialize (or reopen) persistent ChromaDB collection."""
    global _client, _collection
    if _collection is not None:
        return _collection

    _client = chromadb.PersistentClient(path=CHROMA_DIR)
    _collection = _client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    print(f"  ChromaDB collection '{CHROMA_COLLECTION_NAME}' "
          f"({_collection.count()} existing chunks)")
    return _collection


def store_chunks(collection, embedded_chunks: list) -> int:
    """
    Add embedded chunks to the ChromaDB collection.
    Returns number of chunks added.
    """
    if not embedded_chunks:
        return 0

    ids, embeddings, documents, metadatas = [], [], [], []

    for item in embedded_chunks:
        chunk = item["chunk"]
        # Unique ID: video_id + start time
        chunk_id = f"{chunk['video_id']}_{chunk['start']:.2f}"

        ids.append(chunk_id)
        embeddings.append(item["embedding"])
        documents.append(chunk["text"])
        metadatas.append({
            "video_id": chunk["video_id"],
            "start": chunk["start"],
            "end": chunk["end"],
            "transcript_only": chunk.get("transcript_only", ""),
            "visual_only": chunk.get("visual_only", ""),
        })

    # Upsert to avoid duplicates when re-processing the same video
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )
    print(f"  Stored {len(ids)} chunks in ChromaDB")
    return len(ids)


def query(collection, query_text: str, n_results: int = 5) -> list:
    """
    Query the collection for the most relevant chunks.
    Returns list of result dicts with metadata and score.
    """
    query_embedding = embed_query(query_text)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    output = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, dist in zip(documents, metadatas, distances):
        # ChromaDB cosine distance: 0 = identical, 2 = opposite
        # Convert to a 0-1 relevance score
        relevance = 1.0 - (dist / 2.0)
        output.append({
            "text": doc,
            "video_id": meta["video_id"],
            "start": meta["start"],
            "end": meta["end"],
            "transcript_only": meta.get("transcript_only", ""),
            "visual_only": meta.get("visual_only", ""),
            "relevance_score": round(relevance, 4),
        })

    return output


def list_videos(collection) -> list:
    """Return distinct video IDs stored in the collection."""
    if collection.count() == 0:
        return []

    all_meta = collection.get(include=["metadatas"])["metadatas"]
    video_ids = sorted({m["video_id"] for m in all_meta})
    return video_ids
