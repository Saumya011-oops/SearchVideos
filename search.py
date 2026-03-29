import argparse
import vector_store
from config import DEFAULT_N_RESULTS


def _fmt_time(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


def search(query_text: str, n_results: int = DEFAULT_N_RESULTS) -> list:
    """
    Search the vector store for chunks matching query_text.
    Prints formatted results and returns the raw result list.
    """
    collection = vector_store.init_store()

    if collection.count() == 0:
        print("No videos have been ingested yet. Run pipeline.py first.")
        return []

    print(f'\nSearching for: "{query_text}"')
    print("-" * 60)

    results = vector_store.query(collection, query_text, n_results=n_results)

    if not results:
        print("No results found.")
        return []

    for i, r in enumerate(results, 1):
        start_fmt = _fmt_time(r["start"])
        end_fmt = _fmt_time(r["end"])
        score_pct = f"{r['relevance_score'] * 100:.1f}%"

        print(f"\n[{i}] {r['video_id']}  {start_fmt} - {end_fmt}  (relevance: {score_pct})")
        if r["transcript_only"]:
            snippet = r["transcript_only"][:200]
            if len(r["transcript_only"]) > 200:
                snippet += "..."
            print(f"    Speech : {snippet}")
        if r["visual_only"]:
            snippet = r["visual_only"][:150]
            if len(r["visual_only"]) > 150:
                snippet += "..."
            print(f"    Visual : {snippet}")

    print()
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Search ingested videos")
    parser.add_argument("--query", "-q", required=True, help="Natural language search query")
    parser.add_argument("--n", type=int, default=DEFAULT_N_RESULTS, help="Number of results")
    args = parser.parse_args()

    search(args.query, n_results=args.n)
