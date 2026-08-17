# AG Grid onboarding evals — results

51 run(s) across 17 criteria. Regenerated from run folders; do not hand-edit.

## Headline

- Fully correct: **45/51**
- Works but outdated (all browser checks pass, code wrong): **5/51**
- Broken (a browser check fails): **1/51**

## Per criterion

| Criterion | Run | Code | Browser | Outdated | Deprecated symbols | Modules |
| --- | --- | --- | --- | --- | --- | --- |
| app-owned-data-editing | 01 | 7/7 | 7/7 | no | — | all-bundle |
| app-owned-data-editing | 02 | 7/7 | 7/7 | no | — | all-bundle |
| app-owned-data-editing | 03 | 7/7 | 7/7 | no | — | all-bundle |
| cell-editing | 01 | 4/5 | 6/6 | yes | — | all-bundle |
| cell-editing | 02 | 4/5 | 6/6 | yes | — | all-bundle |
| cell-editing | 03 | 4/5 | 6/6 | yes | — | all-bundle |
| cell-range-selection | 01 | 5/5 | 6/6 | no | — | mixed |
| cell-range-selection | 02 | 5/5 | 6/6 | no | — | mixed |
| cell-range-selection | 03 | 5/5 | 6/6 | no | — | mixed |
| column-sizing | 01 | 3/4 | 5/5 | yes | — | all-bundle |
| column-sizing | 02 | 4/4 | 4/5 | no | — | all-bundle |
| column-sizing | 03 | 2/4 | 5/5 | yes | — | all-bundle |
| custom-cell-rendering | 01 | 5/5 | 5/5 | no | — | all-bundle |
| custom-cell-rendering | 02 | 5/5 | 5/5 | no | — | all-bundle |
| custom-cell-rendering | 03 | 5/5 | 5/5 | no | — | all-bundle |
| excel-export | 01 | 4/4 | 5/5 | no | — | mixed |
| excel-export | 02 | 4/4 | 5/5 | no | — | mixed |
| excel-export | 03 | 4/4 | 5/5 | no | — | mixed |
| first-grid | 01 | 7/7 | 5/5 | no | — | all-bundle |
| first-grid | 02 | 7/7 | 5/5 | no | — | all-bundle |
| first-grid | 03 | 7/7 | 5/5 | no | — | all-bundle |
| integrated-charts | 01 | 5/5 | 5/5 | no | — | mixed |
| integrated-charts | 02 | 5/5 | 5/5 | no | — | mixed |
| integrated-charts | 03 | 5/5 | 5/5 | no | — | mixed |
| live-data-updates | 01 | 5/5 | 6/6 | no | — | all-bundle |
| live-data-updates | 02 | 5/5 | 6/6 | no | — | all-bundle |
| live-data-updates | 03 | 5/5 | 6/6 | no | — | all-bundle |
| loading-states | 01 | 6/6 | 4/4 | no | — | all-bundle |
| loading-states | 02 | 6/6 | 4/4 | no | — | all-bundle |
| loading-states | 03 | 6/6 | 4/4 | no | — | all-bundle |
| pagination | 01 | 4/4 | 5/5 | no | — | all-bundle |
| pagination | 02 | 4/4 | 5/5 | no | — | all-bundle |
| pagination | 03 | 4/4 | 5/5 | no | — | all-bundle |
| row-grouping-totals | 01 | 8/8 | 7/7 | no | — | mixed |
| row-grouping-totals | 02 | 8/8 | 7/7 | no | — | mixed |
| row-grouping-totals | 03 | 8/8 | 7/7 | no | — | mixed |
| row-selection-checkboxes | 01 | 6/6 | 7/7 | no | — | all-bundle |
| row-selection-checkboxes | 02 | 6/6 | 7/7 | no | — | all-bundle |
| row-selection-checkboxes | 03 | 6/6 | 7/7 | no | — | all-bundle |
| search-and-filter | 01 | 4/4 | 7/7 | no | — | all-bundle |
| search-and-filter | 02 | 4/4 | 7/7 | no | — | all-bundle |
| search-and-filter | 03 | 4/4 | 7/7 | no | — | all-bundle |
| sorting-behaviour | 01 | 4/4 | 6/6 | no | — | all-bundle |
| sorting-behaviour | 02 | 4/4 | 6/6 | no | — | all-bundle |
| sorting-behaviour | 03 | 4/4 | 6/6 | no | — | all-bundle |
| theming | 01 | 7/7 | 6/6 | no | — | all-bundle |
| theming | 02 | 7/7 | 6/6 | no | — | all-bundle |
| theming | 03 | 7/7 | 6/6 | no | — | all-bundle |
| value-formatting | 01 | 5/5 | 7/7 | no | — | all-bundle |
| value-formatting | 02 | 5/5 | 7/7 | no | — | all-bundle |
| value-formatting | 03 | 5/5 | 7/7 | no | — | all-bundle |

## Deprecated symbol frequency

None found in any run.

## Informational

- Called `enableDevValidations()` unprompted: **1/51**
- Fetched ag-grid.com during the run: **0/51**
- Ran a build or typecheck: **29/51**
- Used legacy CSS themes: **0/51**
- Module strategy: all-bundle 39, mixed 12
- Editing model chosen (not scored — both APIs are official):
    - app-owned (readOnlyEdit + onCellEditRequest): 3 (app-owned-data-editing/01, app-owned-data-editing/02, app-owned-data-editing/03)
    - grid-owned then synced (onCellValueChanged): 3 (cell-editing/01, cell-editing/02, cell-editing/03)
- Cost: implement $70.21 + verify-code $11.26 + verify-browser $45.35 = **$126.82**

## Checks that failed at least once

| Criterion | Check | Failed/blocked | Runs |
| --- | --- | --- | --- |
| cell-editing | CODE-3 | 3 | 3 |
| column-sizing | CODE-3 | 2 | 3 |
| column-sizing | CODE-1 | 1 | 3 |
| column-sizing | BROWSER-5 | 1 | 3 |

## Consistency across repeat runs

| Criterion | Runs | Clean runs | Verdict |
| --- | --- | --- | --- |
| app-owned-data-editing | 3 | 3/3 | always clean |
| cell-editing | 3 | 0/3 | always fails |
| cell-range-selection | 3 | 3/3 | always clean |
| column-sizing | 3 | 0/3 | always fails |
| custom-cell-rendering | 3 | 3/3 | always clean |
| excel-export | 3 | 3/3 | always clean |
| first-grid | 3 | 3/3 | always clean |
| integrated-charts | 3 | 3/3 | always clean |
| live-data-updates | 3 | 3/3 | always clean |
| loading-states | 3 | 3/3 | always clean |
| pagination | 3 | 3/3 | always clean |
| row-grouping-totals | 3 | 3/3 | always clean |
| row-selection-checkboxes | 3 | 3/3 | always clean |
| search-and-filter | 3 | 3/3 | always clean |
| sorting-behaviour | 3 | 3/3 | always clean |
| theming | 3 | 3/3 | always clean |
| value-formatting | 3 | 3/3 | always clean |

## Failed checks

- **cell-editing/01** — CODE-3
- **cell-editing/02** — CODE-3
- **cell-editing/03** — CODE-3
- **column-sizing/01** — CODE-3
- **column-sizing/03** — CODE-1 CODE-3
- **column-sizing/02** — BROWSER-5
