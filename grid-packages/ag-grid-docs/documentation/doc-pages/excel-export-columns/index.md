---
title: "Excel Export - Columns"
enterprise: true
---

## Column Headers

In some situations, you could be interested in exporting only the grid data, without exporting the header cells. For this scenario, we provide the `skipColumnGroupHeaders=true` and `skipColumnHeaders=true` params.

Note the following:

- Initially, grouped headers and header are exported.
- Group Headers will be skipped if `Skip Column Group Headers` is checked.
- Normal headers will be skipped if `Skip Column Headers` is checked.

<grid-example title='Excel Export - Column Headers' name='excel-export-column-headers' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

## Hidden Columns

By default, hidden columns are not exported. If you would like all columns to be exported regardless of the current state of grid, use the `allColumns=true` params.

Note the following:

- By default, only visible columns will be exported. The bronze, silver, and gold columns will not.
- If `Export All Columns` is checked, the bronze, silver, and gold columns will be included in the export.

<grid-example title='Excel Export - Hidden Columns' name='excel-export-hidden-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>
