# Template verification

Every criterion's `template/` folder is a copy of one of four base variants. Each variant was
installed, typechecked, served, and loaded in a real browser via Chrome MCP, and its console was
inspected directly.

## Variants verified

All four verified on 2026-08-14 against `ag-grid-community` / `ag-grid-react` `36.1.0`, Node
v22.21.1, Vite 6.4.3, React 19.

| Variant | Content | `tsc -b` | Browser | Console |
| ------- | ------- | -------- | ------- | ------- |
| `bare-employees` (`4d2bc18950227a0b`) | Vite + React + TS, `src/data.ts` with employee records, **no AG Grid installed**, placeholder `App.tsx` | pass | renders placeholder | clean |
| `employee-grid` (`c91cb5114af41027`) | Above plus a working 50-row employee grid | pass | 50 rows, 4 columns, screenshot confirmed | clean |
| `sales-grid` (`71f715a0ca710966`) | `src/data.ts` with sales records plus a working 120-row grid | pass | 120 rows, 5 columns, screenshot confirmed | clean |
| `employee-grid-10k` (`b3dafdeee2b448a5`) | `employee-grid` with 10,000 rows | pass | renders | clean |

"Clean" means the only console output was Vite's HMR connect/connected debug lines and React's
standard DevTools suggestion. No errors, no warnings, no AG Grid messages.

Two issues were found during verification and fixed before the variants were accepted: a favicon
404, and a default `body` margin that made `height: 100vh` overflow. Both fixes are in the accepted
templates.

## Per-criterion mapping

The hash is over every file in the template excluding `node_modules`, `package-lock.json` and build
output. A criterion's template hash matching a verified variant's hash means the two are
byte-identical, so the browser verification above applies to it directly. All 16 matched; zero
mismatches.

| Criterion | Variant | Hash |
| --------- | ------- | ---- |
| `cell-editing` | `employee-grid` | `c91cb5114af41027` |
| `cell-range-selection` | `sales-grid` | `71f715a0ca710966` |
| `column-sizing` | `employee-grid` | `c91cb5114af41027` |
| `custom-cell-rendering` | `employee-grid` | `c91cb5114af41027` |
| `excel-export` | `sales-grid` | `71f715a0ca710966` |
| `first-grid` | `bare-employees` | `4d2bc18950227a0b` |
| `integrated-charts` | `sales-grid` | `71f715a0ca710966` |
| `live-data-updates` | `employee-grid` | `c91cb5114af41027` |
| `loading-states` | `employee-grid` | `c91cb5114af41027` |
| `pagination` | `employee-grid-10k` | `b3dafdeee2b448a5` |
| `row-grouping-totals` | `sales-grid` | `71f715a0ca710966` |
| `row-selection-checkboxes` | `employee-grid` | `c91cb5114af41027` |
| `search-and-filter` | `employee-grid` | `c91cb5114af41027` |
| `sorting-behaviour` | `employee-grid` | `c91cb5114af41027` |
| `theming` | `bare-employees` | `4d2bc18950227a0b` |
| `value-formatting` | `employee-grid` | `c91cb5114af41027` |

To re-verify after editing a template: `npm install`, `npx tsc -b --noEmit`, `npx vite`, then load
the page in Chrome MCP and read the console. Only one agent can drive Chrome MCP at a time, so this
must be done serially.

## What the templates deliberately do and do not decide

Every template ships a `src/data.ts`, so no prompt asks an agent to invent data.

`first-grid` and `theming` use the bare variant — no AG Grid at all. This is deliberate: any
template that renders a grid has already made the module-registration decision and the theming
decision correctly, which would hand those two criteria their answers.

The consequence, accepted by design, is that **module registration and theming are measured only by
their own two criteria**. The other fourteen inherit a correct registration and a correct theming
setup from their template, so they can only detect failures specific to their own feature.
