---
title: "Row Grouping - Opening Groups"
enterprise: true
---

This section covers different ways to control how row groups are expanded and collapsed.

## Opening Group Levels by Default

To open all groups down to a given group level use the `groupDefaultExpanded` grid option as shown below: 

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', hide: true, rowGroup: true },
        { field: 'year', hide: true, rowGroup: true },
        { field: 'sport' },
        { field: 'total' }
    ],
    // all 'country' row groups will be open by default
    groupDefaultExpanded: 1
}
</snippet>

In the snippet above, all `country` row groups will be expanded by default as `groupDefaultExpanded = 1`.

By default `groupDefaultExpanded = 0` which means no groups are expanded by default. To expand all row groups
set `groupDefaultExpanded = -1`.

The example below demonstrates the `groupDefaultExpanded` behaviour. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- All `country` row groups are expanded by default as `groupDefaultExpanded = 1`.

<grid-example title='Group Default Expanded' name='group-default-expanded' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Open Groups by Default

To have groups open by default, implement the grid callback `isGroupOpenByDefault`. This callback is invoked
each time a group is created.

<snippet>
const gridOptions = {
    // expand when year is '2004' or when country is 'United States'
    isGroupOpenByDefault: params => {
        return (params.field == 'year' && params.key == '2004') ||
            (params.field == 'country' && params.key == 'United States');
    }
}
</snippet>

The params passed to the callback have the `IsGroupOpenByDefaultParams` interface:

<interface-documentation interfaceName='IsGroupOpenByDefaultParams' ></interface-documentation>

In the example below, the country 'United States' and year '2004' are expanded by default. Note that year '2004' is expanded for all
countries, not just 'United States'.

<grid-example title='Open by Default' name='open-by-default' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Expand / Collapse Groups via API  

It is possible to expand and collapse all group rows using the `expandAll()` and `collapseAll()` grid API's as shown below: 

<api-documentation source='grid-api/api.json' section='rowGroups' names='["expandAll", "collapseAll"]'></api-documentation>

When more custom behaviour is required, obtain a reference to the rowNode and then call `api.setRowNodeExpanded(rowNode, boolean)`.

<api-documentation source='grid-api/api.json' section='rowGroups' names='["setRowNodeExpanded"]'></api-documentation>

For example, to expand a group with the name 'United States' would be done as follows:

<snippet>
gridOptions.api.forEachNode(node => {
    if (node.key === 'United States') {
        gridOptions.api.setRowNodeExpanded(node, true);
    }
});
</snippet>

The following example demonstrates different ways to expand / collapse row groups via the grid API.

<grid-example title='Expand / Collapse Groups via API' name='expand-collapse-api' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn about grouping with [Complex Objects](../grouping-complex-objects/).