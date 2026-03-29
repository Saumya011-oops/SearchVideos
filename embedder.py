from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL


_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"  Loading embedding model ({EMBEDDING_MODEL})...")
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def embed_chunks(chunks: list) -> list:
    """
    Embed a list of chunk dicts using sentence-transformers.
    Returns list of {"chunk": chunk_dict, "embedding": list[float]}.
    """
    if not chunks:
        return []

    model = _get_model()
    texts = [c["text"] for c in chunks]

    print(f"  Embedding {len(chunks)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)

    result = [
        {"chunk": chunk, "embedding": embedding.tolist()}
        for chunk, embedding in zip(chunks, embeddings)
    ]
    print(f"  Embedding complete (dim={len(result[0]['embedding'])})")
    return result


def embed_query(query_text: str) -> list:
    """Embed a single query string. Returns embedding as list[float]."""
    model = _get_model()
    return model.encode([query_text], convert_to_numpy=True)[0].tolist()
