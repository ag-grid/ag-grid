---
title: "Row Grouping"
enterprise: true
---

Row Grouping allows rows to be grouped by columns with the grid performing a 'group by' operation on the rows supplied
to the grid. This section introduces Row Grouping and provides links to subsections that cover the various ways Row 
Grouping can be configured and customised.

The grid can be configured to initially display rows in a grouped state or rows can be grouped programmatically through 
the grid API's. Users can also manually group rows through the UI as shown below:

<image-caption src="grouping/resources/row-grouping.gif" maxWidth="90%" constrained="true" centered="true" alt="Row Grouping" ></image-caption>

## Enabling Default Row Grouping

To group rows by a particular column, enable the `rowGroup` column property as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'sport' },
        { field: 'total' }
    ],
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.

Note that the [Single Group Column](../grouping-single-group-column/) display type is used by default.

The example below demonstrates the default row grouping behaviour. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- A group column is added to the left-hand side of the grid as there are active row groups.

- The `country` and `year` columns are hidden as `hide=true` on their column definitions.

<grid-example title='Default Row Grouping' name='default-row-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Row Grouping Customisations

The previous example demonstrated the [Default Row Grouping](../grouping/#example-default-row-grouping) behavior, 
however extensive Row Grouping customisations are also possible as summarised below:

- **[Display Types](../grouping-display-types/)** - compares the different ways row groups can be displayed in the grid.
    - ***[Single Group Column](../grouping-single-group-column/)*** - a single group column is automatically added by the grid for all row groups.
    - ***[Multiple Group Columns](../grouping-multiple-group-columns/)*** - group columns are automatically added by the grid for each row group.
    - ***[Group Rows](../grouping-group-rows/)*** - group rows are automatically added by the grid containing the row groups instead of group columns.
    - ***[Custom Group Columns](../grouping-custom-group-columns/)*** - customise how row groups are displayed without using the built-in display types.
- **[Row Group Panel](../grouping-group-panel/)** - add a panel above the grid to allow users control which columns the rows are grouped by.
- **[Group Order](../grouping-group-order/)** - control how row groups are ordered.
- **[Sorting Groups](../grouping-sorting/)** - configure and customise how row groups are sorted.
- **[Filtering Groups](../grouping-filtering/)** - configure and customise how row groups are filtered.
- **[Group Footers](../grouping-footers/)** - add group footers showing totals for each group level.
- **[Opening Groups](../grouping-opening-groups/)** - control how row groups are expanded and collapsed.
- **[Complex Objects](../grouping-complex-objects/)** - group rows using row data contains complex objects.
- **[Unbalanced Groups](../grouping-unbalanced-groups/)** - group rows when there are `null` or `undefined` group values.

## API Reference

Row Grouping can be configured using the following grid properties:

<api-documentation source='grid-properties/properties.json' section="rowGrouping"></api-documentation>

## Next Up

Continue to the next section to learn about the different Row Grouping [Display Types](../grouping-display-types/).
