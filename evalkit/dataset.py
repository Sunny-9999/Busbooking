"""Generate synthetic search scenarios and reference outcomes."""
import gzip
import itertools
import json
from pathlib import Path

DATASET = Path(__file__).with_name("data") / "search-cases.jsonl.gz"
CITIES = ("Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Tumakuru", "Hassan")
DATES = ("2027-01-05", "2027-01-06", "2027-01-07", "2027-01-08")


def make_cases():
    routes = tuple(itertools.permutations(CITIES, 2))
    scenarios = itertools.product(routes, DATES, range(5), range(5),
                                  ("shorter", "empty", "same", "other"), range(1, 5))
    for index, ((origin, destination), date, first, second, transition, seats) in enumerate(scenarios):
        other = next(city for city in CITIES if city not in (origin, destination))
        buses = []
        for target, count in ((destination, first), (other, second)):
            for _ in range(count):
                buses.append(dict(id=len(buses) + 1, origin=origin.lower(),
                                  destination=target.lower(), date=date, seats=seats))
        buses.append(dict(id=len(buses) + 1, origin=origin.lower(),
                          destination=destination.lower(), date=date, seats=0))
        buses.append(dict(id=len(buses) + 1, origin=origin.lower(),
                          destination=destination.lower(), date="2027-02-01", seats=1))
        followup = {
            "shorter": (other, date) if 0 < second < first else (destination, "2027-03-01"),
            "empty": (destination, "2027-03-01"),
            "same": (destination, date),
            "other": (other, date),
        }[transition]
        queries = [
            dict(origin=origin.upper(), destination=target.upper(), date=day)
            for target, day in ((destination, date), followup)
        ]
        expected = []
        for query in queries:
            ids = [bus["id"] for bus in buses
                   if bus["origin"] == query["origin"].lower()
                   and bus["destination"] == query["destination"].lower()
                   and bus["date"] == query["date"] and bus["seats"] > 0]
            expected.append(dict(ids=ids, alert=not ids))
        yield dict(id=f"search-{index:05}", transition=transition,
                   buses=buses, queries=queries, expected=expected)


def write_dataset(path):
    with path.open("wb") as output:
        with gzip.GzipFile(filename="", mode="wb", fileobj=output, mtime=0) as archive:
            for case in make_cases():
                archive.write((json.dumps(case, separators=(",", ":")) + "\n").encode())


def read_dataset(path=DATASET):
    with gzip.open(path, "rt", encoding="utf-8") as archive:
        for line in archive:
            yield json.loads(line)
