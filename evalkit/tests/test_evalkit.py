from itertools import islice
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from evalkit.chat import answer, index_sources
from evalkit.dataset import make_cases, read_dataset
from evalkit.score import read_predictions, score


class DatasetTest(unittest.TestCase):
    def test_archive_matches_generator(self):
        count = 0
        for actual, expected in zip(read_dataset(), make_cases(), strict=True):
            self.assertEqual(actual, expected)
            count += 1
        self.assertEqual(count, 48_000)

    def test_missing_prediction_counts_against_coverage(self):
        first, second = islice(read_dataset(), 2)
        stats = score([first, second], {first["id"]: first["expected"]})
        self.assertEqual(stats["overall"], {"cases": 2, "submitted": 1, "passed": 1})

    def test_boolean_bus_id_is_invalid(self):
        row = dict(id="search-00000", results=[dict(ids=[True], alert=False)] * 2)
        with TemporaryDirectory() as directory:
            path = Path(directory) / "predictions.jsonl"
            path.write_text(json.dumps(row), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "integer ids"):
                read_predictions(path)


class ChatTest(unittest.TestCase):
    def test_answers_cite_booking_review(self):
        response = answer("booking success inventory updates", index_sources())
        self.assertIn("portfolio/code-review.md#L", response)

    def test_unmatched_questions_do_not_invoke_model(self):
        with patch("evalkit.chat.summarize") as summarize:
            response = answer("xyzzynotindexed", index_sources(), "local-model")
        self.assertIn("could not find", response)
        summarize.assert_not_called()

    def test_model_summary_keeps_retrieved_evidence(self):
        with patch("evalkit.chat.summarize", return_value="A generated summary.") as summarize:
            response = answer("booking success inventory updates", index_sources(), "local-model")
        self.assertIn("A generated summary.", response)
        self.assertIn("portfolio/code-review.md#L", response)
        self.assertEqual(summarize.call_args.args[2], "local-model")
