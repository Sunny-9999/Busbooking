# Busbooking | Code Review & AI Coding Evaluation Toolkit

I'm Venkat Krishna Sai M, a backend engineer working with Java, Python, and Spring Boot. I take on freelance work in code review, AI coding evaluation, rubric design, and generalist engineering tasks that require tracing behavior across a codebase.

Busbooking is a Java/Spring Boot and Angular application with bus search and booking flows. It doubles as a public work sample for how I turn a source finding into a reproducible check, review proposed changes, and explain a decision against explicit criteria.

## Run the toolkit

```sh
node portfolio/search/verify.mjs
python3 -m evalkit chat "Why can booking show success before inventory updates?"
```

[Evaluation toolkit](evalkit/README.md) includes 48,000 reproducible synthetic cases, a batch runner and scorer for A/B submissions, and a repository chatbot with file and line citations. The chatbot can also summarize the retrieved evidence using a local Ollama model. On the included dataset, illustrative candidate A passed 24,000 cases and candidate B passed 48,000.

## Work samples

| Sample | What to look at |
| --- | --- |
| [Patch comparison](portfolio/search/README.md) | Two illustrative patches against the same commit. One restores the empty-search alert but leaves stale results. The other passes all four focused checks. |
| [Evaluation rubric and run protocol](portfolio/rubric.md) | Independent ratings, evidence requirements, equal treatment across model runs, and when to record a tie. |
| [Full-stack code review](portfolio/code-review.md) | A booking request, a separate inventory update, and a success message that can appear before either completes. Includes severity, source links, and acceptance checks. |
| [Comments, commit message, and PR description](portfolio/review-writing.md) | A fixed-diff writing review with independent scores and a copy-ready revision. |

The runner exercises the search method with stand-ins for Angular dependencies. The legacy app uses Angular 8 and Spring Boot 2.2. End-to-end application behavior was not verified.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for test commands and contribution guidelines. The new evaluation toolkit, synthetic dataset, portfolio material, and evaluation workflow are covered by the [MIT License](licenses/MIT-evalkit.txt). The legacy application directories and assets did not include a license at the baseline. Their redistribution rights require review before applying a repo-wide license.

[Short application pitch](portfolio/application-pitch.md)
