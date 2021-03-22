---
title: "Excel Export - Rows"
enterprise: true
---

## Export Selected Rows
<grid-example title='Excel Export - Selected Rows' name='excel-export-selected-rows' type='generated' options='{ "enterprise": true }'></grid-example>

## Export Multi Line Cells
<grid-example title='Excel Export - Multi Line' name='excel-export-multi-line' type='generated' options='{ "enterprise": true }'></grid-example>

## Pinned Rows

If the pinned rows are not relevant to the data, they can be excluded from the export by using the `skipPinnedTop=true` and `skipPinnedBottom=true` params.

Note the following:

- By default, all pinned rows are exported.
- If `Skip Pinned Top Rows` is checked, the rows pinned at the top will be skipped.
- If `Skip Pinned Bottom Rows` is checked, the rows pinned at the bottom will be skipped.

<grid-example title='Excel Export - Pinned Rows' name='excel-export-pinned-rows' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>
