import argparse
import json
from pathlib import Path

from .chat import answer, index_sources
from .dataset import DATASET, read_dataset, write_dataset
from .score import read_predictions, score


def main():
    parser = argparse.ArgumentParser(description="Busbooking evaluation toolkit")
    commands = parser.add_subparsers(dest="command", required=True)
    generate = commands.add_parser("generate", help="write the synthetic dataset")
    generate.add_argument("--output", type=Path, default=DATASET)
    compare = commands.add_parser("compare", help="score two JSONL prediction files")
    compare.add_argument("candidate_a", type=Path)
    compare.add_argument("candidate_b", type=Path)
    compare.add_argument("--dataset", type=Path, default=DATASET)
    chat = commands.add_parser("chat", help="search repository evidence")
    chat.add_argument("question", nargs="?")
    chat.add_argument("--model", help="summarize retrieved evidence with a local Ollama model")
    args = parser.parse_args()

    if args.command == "generate":
        write_dataset(args.output)
    elif args.command == "compare":
        try:
            results = {
                label: score(read_dataset(args.dataset), read_predictions(path))
                for label, path in (("A", args.candidate_a), ("B", args.candidate_b))
            }
        except (ValueError, OSError) as exc:
            parser.error(str(exc))
        a = results["A"]["overall"]["passed"]
        b = results["B"]["overall"]["passed"]
        results["outcome"] = "tie" if a == b else ("A" if a > b else "B")
        print(json.dumps(results, indent=2))
    else:
        passages = index_sources()
        def reply(question):
            try:
                print(answer(question, passages, args.model))
            except (OSError, ValueError, KeyError, TypeError) as exc:
                print(f"Local model unavailable or returned an invalid response ({exc}).")
                print(answer(question, passages))

        if args.question:
            reply(args.question)
            return
        print("Ask about the repository. Press Ctrl-D or Ctrl-C to exit.")
        while True:
            try:
                question = input("> ")
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if question.strip():
                reply(question)


if __name__ == "__main__":
    main()
