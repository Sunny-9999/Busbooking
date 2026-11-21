# Evaluation toolkit

The toolkit runs locally with Python 3.10+, Node.js 18+, and Git. Run the commands from a full Git checkout so the fixture runner can load the pinned application revision.

## Search dataset

The [compressed JSONL corpus](data/search-cases.jsonl.gz) contains 48,000 synthetic scenarios built from six cities, four dates, positive seat counts, and four follow-up query families. Each scenario contains two queries on the same fixture state, for 96,000 query steps. Each step records the expected ordered bus IDs and whether a no-results alert should appear.

The corpus uses no passenger records or external training data. Its combinatorial variations exercise a single component and are correlated. The results measure this search behavior, not overall model capability. The labels are public reference answers and should be hidden from candidates in held-out runs. In the `shorter` family, cases without a shorter positive result set fall back to an empty search.

Regenerate the corpus with `python3 -m evalkit generate`. Use `--output PATH` to keep a generated copy separate. Generation uses a fixed iteration order and records no timestamp in the gzip header.

## Compare outputs

```sh
node evalkit/predict.mjs a > /tmp/busbooking-a.jsonl
node evalkit/predict.mjs b > /tmp/busbooking-b.jsonl
python3 -m evalkit compare /tmp/busbooking-a.jsonl /tmp/busbooking-b.jsonl
```

The reference runner executes the actual search method from each illustrative patch. To compare external submissions, provide a JSONL file per candidate. Each line uses the case ID and two ordered query results:

```json
{"id":"search-00000","results":[{"ids":[],"alert":true},{"ids":[],"alert":true}]}
```

An exact match on both queries passes a case. Missing rows count against coverage and cannot pass. Unknown IDs, duplicates, and malformed output produce an error. The report includes submitted and passed counts overall and for each transition, and reports a tie when pass counts match. Use the [review rubric](../portfolio/rubric.md) alongside the score to assess scope and maintainability.

## Repository chatbot

```sh
python3 -m evalkit chat
python3 -m evalkit chat "Why can booking show success before inventory updates?"
```

The default mode ranks local documentation passages and displays up to two excerpts with file and line references. It does not need a service or API key.

For generative summaries, install Ollama separately, start its local service, and use an installed local model name:

```sh
python3 -m evalkit chat --model YOUR_LOCAL_MODEL "How are the candidates scored?"
```

The optional mode sends the question and retrieved excerpts to the local Ollama chat endpoint and displays the summary with its source excerpts. Review the excerpts to verify the generated answer. If the endpoint fails, the command displays the excerpts directly. [Ollama chat API](https://docs.ollama.com/api/chat)

## Tests

```sh
python3 -m unittest discover -s evalkit/tests
node portfolio/search/verify.mjs
```
