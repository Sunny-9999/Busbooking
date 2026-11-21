# Bus search patch comparison

## Task

Fix search results in `BusBookingComponent.searchbtn()`. Every search should display only its own matching buses. When a search has no matches, clear the previous list and show the existing no-results alert once. Preserve the current origin, destination, date, and positive-seat filtering.

[Baseline method](../../front-end-code/src/app/bus-booking/bus-booking.component.ts#L80-L110) at commit `5079ff7cdb022a12546283047c0c2c327f6363e9`. The two candidates are illustrative patches prepared for this case. No live model runs or model-specific performance claims are part of this comparison.

## Reproduce the results

From the repository root, run `node portfolio/search/verify.mjs`. The script reads the pinned revision, applies each patch independently in a temporary directory, and runs the same cases against all three variants. A new component stand-in is used for each scenario. Repeated searches within a scenario reuse its state.

| Scenario | Baseline | Candidate A | Candidate B |
| --- | --- | --- | --- |
| Match origin, destination, date, and available seats | Pass | Pass | Pass |
| Show the alert on an initial empty search | Fail | Pass | Pass |
| Replace two results with one on the next search | Fail | Fail | Pass |
| Clear previous results and alert on a later empty search | Fail | Fail | Pass |

## Independent reviews

**[Candidate A](candidate-a.patch)** changes an assignment in the alert condition to an equality check. The first empty search now alerts. A later search with one match returns bus IDs `[3, 2]` instead of `[3]` because the old second entry survives. A later empty search alerts but still displays `[1, 2]`.

**[Candidate B](candidate-b.patch)** clears the results array at the start of each search and uses an equality check for the alert. It preserves the existing match conditions and reuses the existing array. The shorter search returns `[3]`, and the empty follow-up returns `[]` with one alert.

| Criterion | A | B |
| --- | --- | --- |
| Required behavior | 2/4. Restores the alert, with incorrect results on both repeat-search scenarios. | 4/4. Results reflect the latest search and the alert fires on zero matches. |
| Preservation and scope | 4/4. Leaves the existing filters intact and changes only the alert condition. | 4/4. Keeps the original filters and confines the changes to result state and the alert condition. |
| Maintainability | 4/4. The comparison directly expresses the zero-match condition. | 4/4. The array reset is explicit and placed before the method repopulates it. |

**Decision** Prefer B. A correct alert still leaves the user looking at buses from another search. B addresses that user-visible failure while retaining the existing filtering.

The checks exercise the search method with loaded fixture data. Angular template rendering, request timing, and booking submission are outside this case.
