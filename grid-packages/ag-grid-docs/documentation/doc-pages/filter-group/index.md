---
title: "Group Filter"
enterprise: true
---

The Group Filter makes it simpler to set up filters on [Group Columns](/grouping-display-types/) when using [Row Grouping](/grouping/). It allows you to use [Provided Filters](/filter-provided/) or [Custom Filters](/component-filter/) defined on underlying columns directly in the group column(s).

<image-caption src="filter-group/resources/group-filter.png" alt="Group Filter" width="28rem" centered="true"></image-caption>

Where there are multiple underlying columns in the group column, a dropdown is provided to allow you to switch between the different column filters.

## Enabling Group Filter

To use Group Filter, specify the following in your [Group Column Configuration](/grouping-single-group-column/#group-column-configuration):

<snippet>
const gridOptions = {
    autoGroupColumnDef: [
        // group column(s) configured to use the Group Filter
        { filter: 'agGroupColumnFilter' },
    ]
}
</snippet>

You must also have filters defined on the underlying columns which are being used in the grouping. If none of the columns in the grouping have filters defined, the Group Filter will not be displayed.

[[note]]
| Note the following grid options will not work with the Group Filter:
| - Tree Data - The Group Filter only works with row grouping, and cannot be used when `treeData = true`.
| - `autoGroupColumnDef.filterValueGetter` - This property will be ignored for Group Filter. Filter value getters on the underlying columns will still be used as normal.
| - `autoGroupColumnDef.field` - This property will be ignored for Group Filter.

## Single Group Column Example

The following example shows the Group Filter with a [Single Group Column](/grouping-single-group-column/).

- `autoGroupColumnDef.filter = 'agGroupColumnFilter'` is set to enable the Group Filter for the **Group** column.
- In the Group Filter for the **Group** column:
    - A dropdown is displayed to allow you to change which underlying filter is displayed.
    - The **Athlete** column is not shown in the dropdown as it does not have a filter defined.
- The floating filter for the **Group** column is read-only. If you set a value against both the **Country** and **Year** filters, the floating filter will display the filter value for the field selected in the Group Filter dropdown.
- The other columns demonstrate the different provided filters, and can be added to the group column by dragging them into the [Row Group Panel](/grouping-group-panel/) at the top.
- If you remove all of the columns from the grouping except for the **Athlete** column, the option to show the filter in the **Group** column will be hidden as there is no valid filter to display.

<grid-example title='Group Filter with Single Group Column' name='group-filter-single' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "rowgrouping", "menu", "filterpanel"] }'></grid-example>

## Multiple Group Column Example

The following example shows the Group Filter with [Multiple Group Columns](/grouping-multiple-group-columns/).

- `autoGroupColumnDef.filter = 'agGroupColumnFilter'` is set to enable the Group Filter.
- The **Country** and **Year** columns are both group columns and are therefore using the Group Filter.
- The Group Filters for **Country** and **Year** don't show the field dropdown as there is only one underlying column per group column.
- The floating filters for **Country** and **Year** are using the floating filters from the underlying columns.

<grid-example title='Group Filter with Multiple Group Columns' name='group-filter-multiple' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Group Floating Filter

The floating filter for the Group Filter can display in one of two ways depending on how the group columns are configured. It will either show a read-only value, or use the floating filter from the underlying column.

When using a single group column, the floating filter will always be read-only. It will display the value for the currently selected field in the Group Filter dropdown.

For multiple group columns, the floating filter will show the underlying filter if the underlying column is hidden, or the read-only value if the column is visible.

If you are using [Custom Filters](/component-filter/), your filter will need to implement `getModelAsString()` for the read-only group floating filter to be able to display a value.

## Filter Dropdown Behaviour

The dropdown to select the underlying filter will behave slightly differently depending on the columns in the grouping:
- Columns without filters defined will never be shown in the dropdown.
- If there is only one column in the group, the dropdown will not be shown.
- If there are multiple columns in the group, but only one has a filter defined, the dropdown will be displayed but disabled, and will show the column with the filter.

## Filter Model and API

As the Group Filter uses the filters from the underlying columns, the filter model will be shown against the underlying columns and not the group column(s).

If you wish to access the filter instance(s) via the [Filter API](/filter-api/#accessing-individual-filter-component-instances), you should use the underlying column fields, and not the group column(s).