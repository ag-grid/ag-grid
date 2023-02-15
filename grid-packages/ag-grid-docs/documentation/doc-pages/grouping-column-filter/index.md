---
title: "Row Grouping - Group Column Filter"
enterprise: true
---

This section shows how the Group Column Filter can be used when row groups are displayed under group columns.

<image-caption src="grouping-column-filter/resources/group-filter.png" alt="Group Column Filter" width="28rem" centered="true"></image-caption>

The Group Column Filter contains the [Provided Filters](/filter-provided/) or [Custom Filters](/component-filter/) 
defined on the underlying columns directly in the group columns. When there are multiple underlying columns in the group 
column, a dropdown is provided to switch between the different column filters.

[[note]]
| The Group Column Filter will not work with the [Group Rows](/grouping-group-rows/) display type as there are no group columns.

## Enabling Group Column Filter

To use the Group Column Filter, specify the following in your [Group Column Configuration](/grouping-single-group-column/#group-column-configuration):

<snippet>
const gridOptions = {
    autoGroupColumnDef: {
        // group columns configured to use the Group Column Filter
        filter: 'agGroupColumnFilter',
    }
}
</snippet>

You must also have filters defined on the underlying columns which are being used in the grouping. If none of the columns
in the grouping have filters defined, the Group Column Filter will not be displayed.

### Single Group Column

The following example shows the Group Column Filter with a [Single Group Column](/grouping-single-group-column/).

- `autoGroupColumnDef.filter = 'agGroupColumnFilter'` is set to enable the Group Column Filter for the **Group** column.
- In the Group Column Filter for the **Group** column:
    - A dropdown is displayed to allow you to change which underlying filter is displayed.
    - The **Athlete** column is not shown in the dropdown as it does not have a filter defined.
    - The filter shows as active if any of the underlying filters are active.
    - Multiple underlying filters can be active at the same time.
- The floating filter for the **Group** column is read-only. If you set a value against both the **Country** and **Year** filters, the floating filter will display the filter value for the field selected in the Group Column Filter dropdown.
- The other columns demonstrate the different provided filters, and can be added to the group column by dragging them into the [Row Group Panel](/grouping-group-panel/) at the top.
- If you remove all the columns from the grouping except for the **Athlete** column, the option to show the filter in the **Group** column will be hidden as there is no valid filter to display.

<grid-example title='Group Column Filter - Single Group Column' name='group-filter-single' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "rowgrouping", "menu", "filterpanel", "setfilter", "multifilter"] }'></grid-example>

### Multiple Group Columns

The following example shows the Group Column Filter with [Multiple Group Columns](/grouping-multiple-group-columns/).

- `autoGroupColumnDef.filter = 'agGroupColumnFilter'` is set to enable the Group Column Filter.
- The **Country** and **Year** columns are both group columns and are therefore using the Group Column Filter.
- The Group Column Filters for **Country** and **Year** don't show the field dropdown as there is only one underlying column per group column.
- The floating filters for **Country** and **Year** are using the floating filters from the underlying columns.

<grid-example title='Group Column Filter - Multiple Group Columns' name='group-filter-multiple' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>

## Group Column Floating Filter

The floating filter for the Group Column Filter can display in one of two ways depending on how the group columns are configured.
It will either show a read-only value, or use the floating filter from the underlying column.

When using a single group column, the floating filter will always be read-only. It will display the value for the currently
selected field in the Group Column Filter dropdown.

For multiple group columns, the floating filter will show the underlying filter if the underlying column is hidden, or
the read-only value if the underlying column is visible.

If you are using [Custom Filters](/component-filter/), the filter will need to implement `getModelAsString()` for the
read-only group floating filter to be able to display a value.

## Filter Dropdown Behaviour

The dropdown to select the underlying filter will behave slightly differently depending on the columns in the grouping:
- Columns without filters defined will never be shown in the dropdown.
- If there is only one column in the group, the dropdown will not be shown.
- If there are multiple columns in the group, but only one has a filter defined, the dropdown will be displayed but disabled, and will show the column with the filter.

You can see this behaviour by changing which columns are in the grouping using the [Single Group Column Example](#single-group-column) above.

## Filter Model and API

As the Group Column Filter uses the filters from the underlying columns, the filter model will be shown against the underlying
columns and not the group columns.

If you wish to access the filter instances via the [Filter API](/filter-api/#accessing-individual-filter-component-instances),
you should use the underlying column fields, and not the group columns.

## Next Up

Continue to the next section to learn about [Custom Group Filtering](../grouping-custom-filtering/).