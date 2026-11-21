"""Score independently submitted outputs against the same reference cases."""
from collections import Counter
import json


def read_predictions(path):
    predictions = {}
    with path.open(encoding="utf-8") as source:
        for number, line in enumerate(source, start=1):
            row = json.loads(line)
            if not isinstance(row, dict) or not isinstance(row.get("id"), str):
                raise ValueError(f"{path}:{number}: expected a string case id")
            if row["id"] in predictions:
                raise ValueError(f"{path}:{number}: duplicate case id {row['id']}")
            results = row.get("results")
            if not isinstance(results, list) or len(results) != 2:
                raise ValueError(f"{path}:{number}: expected two query results")
            for result in results:
                if (not isinstance(result, dict) or set(result) != {"ids", "alert"}
                        or not isinstance(result["ids"], list)
                        or any(type(bus_id) is not int for bus_id in result["ids"])
                        or type(result["alert"]) is not bool):
                    raise ValueError(f"{path}:{number}: expected integer ids and boolean alert")
            predictions[row["id"]] = results
    return predictions


def score(cases, predictions):
    totals = Counter()
    transitions = {}
    unused = set(predictions)
    for case in cases:
        group = transitions.setdefault(case["transition"], Counter())
        actual = predictions.get(case["id"])
        unused.discard(case["id"])
        metrics = {
            "cases": 1,
            "submitted": int(actual is not None),
            "passed": int(actual == case["expected"]),
        }
        totals.update(metrics)
        group.update(metrics)
    if unused:
        raise ValueError(f"{len(unused)} unknown case IDs, including {min(unused)}")
    return {"overall": totals, "by_transition": transitions}
