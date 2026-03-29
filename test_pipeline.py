"""
Quick test script — processes one video and runs a few search queries.

Usage:
    python test_pipeline.py --video /path/to/test_video.mp4

If you don't have a video handy, download a short one with yt-dlp:
    yt-dlp -o test_video.mp4 --format mp4 "<youtube_url>"
"""
import argparse
import sys

import pipeline
import search


TEST_QUERIES = [
    "introduction",
    "main topic or concept",
    "conclusion or summary",
    "visual demonstration",
]


def run_test(video_path: str):
    print("\n" + "=" * 60)
    print("VIDEO-CONTEXT SEARCH ENGINE — TEST RUN")
    print("=" * 60)

    # ── 1. Process the video ──────────────────────────────────────
    try:
        summary = pipeline.process_video(video_path)
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Pipeline error: {e}")
        raise

    print(f"\nIngestion summary:")
    for k, v in summary.items():
        print(f"  {k}: {v}")

    if summary["chunks_created"] == 0:
        print("\nNo chunks were created — check your video file and model loading.")
        return

    # ── 2. Run test queries ───────────────────────────────────────
    print("\n" + "=" * 60)
    print("RUNNING TEST QUERIES")
    print("=" * 60)

    for q in TEST_QUERIES:
        results = search.search(q, n_results=3)
        if results:
            print(f"  -> Top result at {results[0]['start']:.1f}s "
                  f"(score: {results[0]['relevance_score']:.3f})")

    print("\nTest complete. All queries executed successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the video search pipeline")
    parser.add_argument("--video", "-v", required=True, help="Path to a test video file")
    args = parser.parse_args()

    run_test(args.video)
