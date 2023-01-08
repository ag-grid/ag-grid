---
title: "Row Grouping - Unbalanced Groups"
enterprise: true
---

This section covers Unbalanced Groups - when grouping by rows that can contain `null` or `undefined` group values.  

## Handling Unbalanced Groups

By default, unbalanced rows (rows containing `null`, `undefined` or empty values for the column that is being grouped) get grouped together as `(blanks)`. To instead have the nodes remain ungrouped, you can enable the `groupAllowUnbalanced` grid option. We refer to this scenario as **Unbalanced Groups** in that there is a mix of groups and rows as siblings.

The following example demonstrates:

- The `groupAllowUnbalanced` grid option has been set to `true`.
- Data is grouped by column 'State'. Rows are either grouped by state 'New York', 'California' or not grouped.
- Removing the grouping shows that the non grouped rows have no 'State' value.

<grid-example title='Unbalanced Groups' name='unbalanced-groups' type='mixed' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Balanced Groups

When not using unbalanced groups, the grid will, by default, create a (blanks) group and populate it with any rows without a valid group value. The following example demonstrates this default behaviour:

<grid-example title='Balanced Groups' name='balanced-groups' type='mixed' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "rowgrouping"] }'></grid-example>