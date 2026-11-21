# Coding evaluation rubric

Define the expected behavior and the evidence required to establish it before reviewing candidate patches.

| Criterion | 4 | 3 | 2 | 1 | 0 |
| --- | --- | --- | --- | --- | --- |
| Required behavior | Meets all scoped acceptance checks | Core behavior works with a minor gap | A meaningful requirement works, with a material gap remaining | Limited progress on the required behavior | No working change for the requirement |
| Preservation and scope | Preserves relevant existing behavior and stays within scope | Small unrelated change with no demonstrated impact | Material scope expansion or a secondary regression | Breaks an important existing path | Invalidates the feature or baseline contract |
| Maintainability | Clear, local changes with intent visible in code | Minor readability or consistency issue | Avoidable complexity makes the change harder to review | Design obscures the logic or makes common changes risky | Implementation cannot be meaningfully maintained |

Score each row independently. Use **Unverified** if the evidence cannot support a score. Record validation separately with the command, environment, observed result, and coverage boundary. Attribute a check to the candidate only when it appears in the run record.

## Comparing two coding models

1. Pin the repository revision and record the prompt, requirements, environment, and time or tool constraints. Give each model an isolated checkout from that revision.
2. Preserve each native interaction log and final diff. Give equivalent failures equivalent opportunities for clarification or recovery. Record any setup or follow-up differences and keep each model's work private from the other during the run.
3. Inspect each patch independently. Run the same baseline and acceptance checks, including an edge case that can distinguish two plausible fixes. Record observations separately from model-reported results.
4. Rank by demonstrated impact on the task. A material correctness gap outweighs a minor style preference. If the evidence supports equivalent outcomes, record a tie. If coverage or setup materially limits the comparison, state the limitation alongside the result.

The [search case](search/README.md) demonstrates the patch-review stage with illustrative candidates. It also shows why a first-run test can miss a state bug.
