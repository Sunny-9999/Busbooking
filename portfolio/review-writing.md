# Review writing for a fixed diff

The code is [candidate B](search/candidate-b.patch). The drafts below are illustrative. Content, readability, and faithfulness are scored independently from 0 to 4, with 4 as best.

## Commit message

| Draft | Content | Readability | Faithfulness |
| --- | --- | --- | --- |
| A. `Fix bus search` | 2. Names the area but omits both observable changes. | 4. Easy to scan in Git history. | 4. A search fix is within the diff. |
| B. `Clear stale bus results and restore the empty-search alert` | 4. Identifies both changes. | 4. Gives reviewers enough context on one line. | 4. Both changes follow directly from the patch and focused checks. |

Choose B. The subject identifies the behavior a maintainer would otherwise have to open the diff to discover.

## Inline comment

**Draft** `// Clear the array.`

**Decision** Remove. The reset already expresses that operation. The reason for the change belongs in the PR description, where it can name the repeated-search failure and its verification.

## PR description

**Draft** "Fixes bus search and booking. All tests pass."

**Scores** Content 2/4 because the description omits the observed failure. Readability 4/4 because it is short and direct. Faithfulness 1/4 because the patch changes only search, and the evidence covers four method-level scenarios without a full suite result.

**Revision**

> Reset search results before collecting matches so a shorter query cannot leave earlier buses in the list. Compare the match counter with zero so empty searches show the existing alert.
>
> Verified with `node portfolio/search/verify.mjs`. The selected patch passed the route/date/availability check, the initial empty search, the shorter follow-up search, and the empty follow-up search. The check uses a component stand-in and does not exercise Angular rendering.
