---
title: "Row Grouping"
enterprise: true
---

This section covers Row Grouping with links to sub sections that cover the various ways row grouping can be configured and customised.

<image-caption src="grouping/resources/row-grouping.gif" alt="Row Grouping" ></image-caption>

## Enabling Default Row Grouping

When there is at least one active row group, a single group column containing a row grouping hierarchy will be added to
the left-hand side of the grid. To group rows by a particular column, enable the `rowGroup` column property as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'year', rowGroup: true },
        { field: 'sport' },
        { field: 'total' }
    ],
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.

The example below demonstrates the default row grouping behaviour. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- A group column is added to the left-hand side of the grid as there are active row groups.

- The `country` and `year` columns are still shown in the grid (to hide set `hide=true` on their column definitions).

- The number of grouped rows is shown in parentheses at each row group level.

<grid-example title='Default Row Grouping' name='default-row-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Row Grouping Customisations

The previous example demonstrated the [Default Row Grouping](../grouping/#example-default-row-grouping) behavior, 
however extensive Row Grouping customisations are also possible. 

See the following sections for more details: 

- **[Display Types](../grouping-display-types/)** - compares the different ways row groups can be displayed in the grid.
    - ***[Single Group Column](../grouping-single-group-column/)*** - a single group column is automatically added by the grid for all row groups.
    - ***[Multiple Group Columns](../grouping-multiple-group-columns/)*** - group columns are automatically added by the grid for each row group.
    - ***[Group Rows](../grouping-group-rows/)*** - group rows are automatically added by the grid containing the row groups instead of group columns.
    - ***[Custom Group Columns](../grouping-custom-group-columns/)*** - take charge of displaying the row groups without using the built-in display types.
- **[Sorting](../grouping-sorting/)**
- **[Filtering](../grouping-filtering/)**
- **[Group Customisation](../grouping-customisation/)**
- **[Group Footers](../grouping-footers/)**
- **[Provided Groups](../grouping-provided-groups/)**

## API Reference

Row Grouping can be configured using the following grid properties:

<api-documentation source='grid-properties/properties.json' section="rowGrouping"></api-documentation>

## Next Up

Continue to the next section to learn about the different Row Grouping [Display Types](../grouping-display-types/).
