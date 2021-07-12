---
title: "Row Grouping - Row Group Panel"
enterprise: true
---

## Filtering on Group Columns

Filter on group columns is more complex than filtering on normal columns as the data inside the column can be a mix of data from different columns. For example if grouping by Country and Year, should the filter be for Year or for Country?

For auto generated group columns, the filter will work if you specify one of `field`, `valueGetter` or `filterValueGetter`.