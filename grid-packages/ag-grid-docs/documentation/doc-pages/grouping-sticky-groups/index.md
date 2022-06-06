---
title: "Row Grouping - Sticky Groups"
enterprise: true
---

This section covers the Sticky Groups, where group rows that are expanded will be displayed at the top of the viewport while the last child of the group is also in the viewport.

## Enabling Sticky Groups

To enable sticky groups, use the `groupRowsSticky` property.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'total' }
    ],
    groupRowsSticky: true
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.

The example below demonstrates the default row grouping behaviour with sticky groups. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- When you scroll expand a group and scroll the grid, the group row will remain at the top as `groupRowsSticky = true`

<grid-example title='Single Group Column' name='with-single-group-column' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## With Multiple Group Columns

Sticky groups works with Multiple Group Columns.

[[note]]
| The properties `groupRowsSticky` and `groupHideOpenParents` do not work together, turning both on at the same time will cause unexpected behaviour.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'total' }
    ],
    groupDisplayType: 'multipleColumns',
    groupRowsSticky: true
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared, and a group column displayed for each column that we are grouping by and `groupRowsSticky=true` turns on sticky groups.

This is demonstrated in the following example, note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- Separate group columns are displayed for `country` and `year` as `groupDisplayType = 'multipleColumns'`.

- When you scroll expand a group and scroll the grid, the group row will remain at the top as `groupRowsSticky = true`.

<grid-example title='Multiple Group Columns' name='with-multiple-group-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## With Group Rows

Sticky groups works with Group Rows.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'sport' },
        { field: 'total' }
    ],
    groupDisplayType: 'groupRows',
    groupRowsSticky: true
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.
These row groups will be displayed using Group Rows as `groupDisplayType = 'groupRows'` and `groupRowsSticky=true` turns on sticky groups.

The example below demonstrates the Group Rows display type. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- Instead of group columns, the row groups are displayed using full width group rows as `groupDisplayType = 'groupRows'`.

- When you scroll expand a group and scroll the grid, the group row will remain at the top as `groupRowsSticky = true`

<grid-example title='Group Rows' name='with-group-rows' type='mixed' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn about the [Sorting Groups](../grouping-sorting/).