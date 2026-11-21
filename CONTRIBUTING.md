# Contributing

Issues and pull requests are welcome for evaluation cases, scoring, retrieval quality, and tooling. Describe the problem, the expected behavior, and how you verified the change. For a new case, name the behavior it distinguishes and include its expected result.

Run these checks from a full Git checkout:

```sh
python3 -m unittest discover -s evalkit/tests
node portfolio/search/verify.mjs
```

If you change the dataset generator, regenerate the corpus with `python3 -m evalkit generate` and include the updated archive. Use synthetic or explicitly redistributable material and include provenance for any external data. A contribution that adds model comparisons should record the baseline, evidence, and any differences in the conditions under which candidates ran.
