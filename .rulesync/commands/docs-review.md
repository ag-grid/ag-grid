---
targets: ['*']
description: 'Review documentation pages for technical accuracy and example consistency'
---

# Documentation Review - AG Grid

You are a technical documentation reviewer for AG Grid.

## Product Configuration

### Input Requirements

> Required — referenced by exact name in the core methodology.

User provides:

-   Documentation page path: `documentation/ag-grid-docs/src/content/docs/${pageName}/index.mdoc`
-   Live dev URL: `https://localhost:4610/javascript-data-grid/${pageName}/`

### Orchestration Indicator

-   Orchestrator script: none

### File Resolution Rules

> Required — referenced by exact name in the core methodology.

Map documentation references to TypeScript definition files:

| If docs mention                           | Then check file                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| GridOptions / grid option property        | `packages/ag-grid-community/src/entities/gridOptions.ts`                                      |
| ColDef / column definition property       | `packages/ag-grid-community/src/entities/colDef.ts`                                           |
| Interface name like `I*` or specific type | Search `packages/ag-grid-community/src/**/*.ts` and `packages/ag-grid-enterprise/src/**/*.ts` |
| API function / grid API method            | `packages/ag-grid-community/src/api/gridApi.ts`                                               |

### Implementation Resolution Rules

> Required — referenced by exact name in the core methodology.

Map features to source implementation files:

| Feature Category                          | Implementation Path Pattern                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Row models (CSRM, SSRM, infinite, viewport) | `packages/ag-grid-community/src/clientSideRowModel/**/*.ts`, `packages/ag-grid-community/src/infiniteRowModel/**/*.ts`, `packages/ag-grid-enterprise/src/serverSideRowModel/**/*.ts`, `packages/ag-grid-enterprise/src/viewportRowModel/**/*.ts` |
| Column features (sizing, moving, pinning) | `packages/ag-grid-community/src/columns/**/*.ts`, `packages/ag-grid-community/src/columnMove/**/*.ts`, `packages/ag-grid-community/src/columnResize/**/*.ts`, `packages/ag-grid-community/src/columnAutosize/**/*.ts`, `packages/ag-grid-community/src/pinnedColumns/**/*.ts` |
| Cell editing                              | `packages/ag-grid-community/src/edit/**/*.ts`                                                                                                                |
| Filtering                                 | `packages/ag-grid-community/src/filter/**/*.ts`, `packages/ag-grid-enterprise/src/advancedFilter/**/*.ts`                                                    |
| Row grouping / pivoting                   | `packages/ag-grid-enterprise/src/rowGrouping/**/*.ts`, `packages/ag-grid-enterprise/src/pivot/**/*.ts`                                                       |
| Selection                                 | `packages/ag-grid-community/src/selection/**/*.ts`, `packages/ag-grid-enterprise/src/rangeSelection/**/*.ts`                                                 |
| Export (CSV/Excel)                        | `packages/ag-grid-community/src/csvExport/**/*.ts`, `packages/ag-grid-enterprise/src/excelExport/**/*.ts`                                                    |
| Master detail                             | `packages/ag-grid-enterprise/src/masterDetail/**/*.ts`                                                                                                       |
| Menu / context menu                       | `packages/ag-grid-enterprise/src/menu/**/*.ts`                                                                                                               |
| Charts integration                        | `packages/ag-grid-enterprise/src/charts/**/*.ts`                                                                                                             |
| Rich select / editors                     | `packages/ag-grid-enterprise/src/richSelect/**/*.ts`                                                                                                         |
| Sorting                                   | `packages/ag-grid-community/src/sort/**/*.ts`                                                                                                                |
| Pagination                                | `packages/ag-grid-community/src/pagination/**/*.ts`                                                                                                          |
| Tooltips                                  | `packages/ag-grid-community/src/tooltip/**/*.ts`                                                                                                             |
| Drag and drop / row drag                  | `packages/ag-grid-community/src/dragAndDrop/**/*.ts`                                                                                                         |
| Keyboard navigation                       | `packages/ag-grid-community/src/navigation/**/*.ts`                                                                                                          |
| Pinned rows                               | `packages/ag-grid-community/src/pinnedRowModel/**/*.ts`                                                                                                      |
| Clipboard                                 | `packages/ag-grid-enterprise/src/clipboard/**/*.ts`                                                                                                          |
| Status bar                                | `packages/ag-grid-enterprise/src/statusBar/**/*.ts`                                                                                                          |
| Side bar / tool panels                    | `packages/ag-grid-enterprise/src/sideBar/**/*.ts`, `packages/ag-grid-enterprise/src/columnToolPanel/**/*.ts`, `packages/ag-grid-enterprise/src/filterToolPanel/**/*.ts` |
| Set filter                                | `packages/ag-grid-enterprise/src/setFilter/**/*.ts`                                                                                                          |
| Tree data                                 | `packages/ag-grid-enterprise/src/treeData/**/*.ts`                                                                                                           |
| Aggregation                               | `packages/ag-grid-enterprise/src/aggregation/**/*.ts`                                                                                                        |
| Sparklines                                | `packages/ag-grid-enterprise/src/sparkline/**/*.ts`                                                                                                          |

### Example Path Pattern

> Required — referenced by exact name in the core methodology.

`documentation/ag-grid-docs/src/content/docs/${pageName}/_examples/${exampleName}/`

-   Required: `main.ts`
-   Optional: `data.ts`, `styles.css`, `provided/modules/*`

### Example Direct URL Pattern

> Optional — referenced by exact name in the core methodology.

`https://localhost:4610/examples/${pageName}/${exampleName}/vanilla`

The `vanilla` framework variant is used as it loads slightly faster than `typescript`.

### Exceptions File Path

`documentation/ag-grid-docs/src/content/docs/${pageName}/technical-review-exceptions.md`

### Output Paths

> Required — referenced by exact name in the core methodology.

-   Review plans: `reports/docs-review/plans/${pageName}.md`
-   Reports: `documentation/ag-grid-docs/src/content/docs/${pageName}/reports/technical-review-report.md`
-   Summary: `reports/docs-review/summary.md`

### Default Value Verification Hierarchy

> Required — referenced by exact name in the core methodology.

1. First: Check `packages/ag-grid-community/src/gridOptionsDefault.ts` for runtime defaults
2. Then: Check `packages/ag-grid-community/src/gridOptionsInitial.ts` for non-reactive properties (only read at grid initialisation)
3. Fallback: Check interface definition TypeScript comments in `entities/gridOptions.ts` or `entities/colDef.ts`
4. Verify: TypeScript JSDoc comments match actual runtime defaults

### Product-Specific Conventions

-   Interface naming: `GridOptions`, `ColDef`, `ColGroupDef`, `RowNode`, `ICellRendererParams` etc.
-   Column definitions use `ColDef` interface, not `ColumnDef`
-   Grid API accessed via `api` property on the grid instance
-   Enterprise features require `ag-grid-enterprise` package — docs should note enterprise-only features
-   Examples support React, Angular, Vue 3 and vanilla JS frameworks

### Browser Testing Tips

> Required — referenced by exact name in the core methodology.

`.rulesync/rules/docs-review-testing.md`

## Review Methodology

**Read and follow all instructions in `external/ag-shared/prompts/commands/docs/_docs-review-core.md` for the review process, applying the product configuration above.**
