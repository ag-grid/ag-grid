---
title: "Column Groups"
---

Columns can be grouped in the grid's header using Column Groups. This can be complimented with Open and Close functionality to show / hide Columns.

Column Groups are configured by providing a hierachy of Column Definitions. If a Column Definition contains the `children` attribute then the grid treats it as a Column Group.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            headerName: 'Athlete Details',
            children: [
                { field: 'athlete' },
                { field: 'age' },
                { field: 'country' },
            ]
        },
        {
            headerName: 'Sports Results',
            children: [
                { field: 'sport' },
                { field: 'total', columnGroupShow: 'closed' },
                { field: 'gold', columnGroupShow: 'open' },
                { field: 'silver', columnGroupShow: 'open' },
                { field: 'bronze', columnGroupShow: 'open' },
            ]
        }
    ],
}
</snippet>

Set the attribute `columnGroupShow` on groups children to set the expand and collapse policy as follows:

- **`open`:** The child is only shown when the group is open.
- **`closed`:** The child is only shown when the group is closed.
- **`null`, `undefined`:** The child is always shown.

<grid-example title='Basic Grouping' name='basic-grouping' type='generated' options='{ "exampleHeight": 550 }'></grid-example>


## Selecting Components

By default the grid provided Header Group Component is used. To use a Custom Group Component set `headerGroupComponent` on the Column Definition.

md-include:column-def-javascript.md
md-include:column-def-vue.md

See [Registering Components](../components/) for an overview of registering componnets.

## Custom Group Component

The example below shows a Custom Column Group Component.

<grid-example title='Header Group' name='header-group-component' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

As with Column Headers, the grid will always handle resize and column moving. The Custom Component is responsible for the following:

- **Group Open / Close:** If the group can expand (one or more columns visibility depends on the open / closed state of the group) then the Custom Component should handle the interaction with the user for opening and closing groups.

md-include:group-component-interface-javascript.md
md-include:group-component-interface-angular.md
md-include:group-component-interface-react.md
md-include:group-component-interface-vue.md

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='IHeaderGroupParams' ></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomHeaderGroupProps' ></interface-documentation>
</framework-specific-section>

md-include:open-close-javascript.md
md-include:open-close-angular.md
md-include:open-close-react.md
md-include:open-close-vue.md

## Groups & Column Pinning

Pinned columns break groups. So if you have a group with 10 columns, 4 of which are inside the pinned area, two groups will be created, one with 4 (pinned) and one with 6 (not pinned).

## Groups & Column Moving

If you move columns so that columns in a group are no longer adjacent, then the group will again be broken and displayed as one or more groups in the grid.

Sometimes you want columns of the group to always stick together. To achieve this, set the column group property `marryChildren=true`. The example below demonstrates the following:

- Both 'Athlete Details' and 'Sports Results' have `marryChildren=true`.
- If you move columns inside these groups, you will not be able to move the column out of the group. For example, if you drag 'Athlete', it is not possible to drag it out of the 'Athlete Details' group.
- If you move a non group column, e.g. Age, it will not be possible to place it in the middle of a group and hence impossible to break the group apart.
- It is possible to place a column between groups (e.g. you can place 'Age' between the 'Athlete Details' and 'Sports Results').

<grid-example title='Marry Children' name='marry-children' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Resizing Groups

If you grab the group resize bar, it resizes each child in the group evenly distributing the new additional width. If you grab the child resize bar, only that one column will be resized.

<image-caption src="column-groups/resources/header-resize.png" width="30rem" centered="true" alt="Header Resize" constrained="true" toggledarkmode="true"></image-caption>

## Colouring Groups

The grid doesn't colour the groups for you. However you can use the column definition `headerClass` for this purpose. The `headerClass` attribute is available on both columns and column groups.


<snippet suppressFrameworkContext="true">
const gridOptions = {
    columnDefs: [
        // the CSS class name supplied to 'headerClass' will get applied to the header group
        { headerName: 'Athlete Details', headerClass: 'my-css-class', children: []}
    ]
}
</snippet>

## Text Alignment

The labels in the grouping headers are positioned with `display: flex`. To make the group headers right-aligned, add the following rule set in your application, after the grid's stylesheets. Change the theme class to the one you use.

```css
.ag-theme-quartz .ag-header-group-cell-label {
    flex-direction: row-reverse;
}
```

## Sticky Label

When Column Groups are too wide, the **Header Label** is always visible while scrolling the grid horizontally. To suppress this behaviour, set the column group property `suppressStickyLabel=true`. The example below demonstrates the following:

- Both 'Athlete Details' and 'Sport Results' have `suppressStickyLabel=true`.
- If you scroll the grid horizontally, the header label will not be visible until the column is completely out of view.

<grid-example title='Sticky Label' name='suppress-sticky-label' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Mulitiple Levels

This example demonstrates a grid with many levels. The example doesn't make sense, it's contrieved to demonstrate multip group levels. Note the following:

- Using the API to open and close groups. To do this, you will need to provide your groups with an ID during the definition, or look up the groups ID via the API (as an ID is generated if you don't provide one).
- Demonstrates `colDef.openByDefault` property, where it sets this on E and F groups, resulting in these groups appearing as open by default.
- Uses `defaultColGroupDef` and `defaultColDef` to apply a class to some of the headers. Using this technique, you can apply style to any of the header sections.

<grid-example title='Advanced Grouping' name='advanced-grouping' type='generated' options='{ "extras": ["fontawesome"], "exampleHeight": 680 }'></grid-example>

## Group Changes

Similar to adding and removing columns, you can also add and remove column groups. If the column definitions passed in have column groups, then the columns will be grouped to the new configuration.

The example below shows adding and removing groups to columns. Note the following:

- Select **No Groups** to show all columns without any grouping.
- Select **Participant in Group** to show all participant columns only in a group.
- Select **Medals in Group** to show all medal columns only in a group.
- Select **Participant and Medals in Group** to show participant and medal columns in groups.
- As groups are added and removed, note that the state of the individual columns is preserved. To observe this, try moving, resizing, sorting, filtering etc and then add and remove groups, all the changed state will be preserved.

<grid-example title='Group Changes' name='group-changes' type='generated'></grid-example>

The example above shows adding and removing groups. It is also possible to add and remove columns from groups. This is demonstrated in the example below. Note the following:

- The example has two groups: **Athlete Details** and **Sports Results**
- The example has two sets of columns, **Normal Cols** and **Extra Cols**.
- When you move from **Normal Cols** to **Extra Cols**, three new columns are added to the list. Two belong to the **Athlete Details** group, the other belongs to no group.

<grid-example title='Group Changes 2' name='group-changes-2' type='generated'></grid-example>

## Column Height

By default the grid will resize the header cell to span the whole height of the header container, as shown in the example below.

Note the following: 

- The **Age** column header cell is not under a column group cell, but spans the entire height of the header container.

<grid-example title='Span Header Height' name='span-header-height' type='generated' options='{ "exampleHeight": 300 }'></grid-example>

Using the **Column Property** `suppressSpanHeaderHeight` the Grid will balance the column headers with different number of levels with an empty column group header cell, as shown in the example below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            headerName: 'Athlete Details',
            children: [
                { field: 'athlete' },
                { field: 'country' },
            ],
        },
        {
            field: 'age',
            width: 90,
            suppressSpanHeaderHeight: true,
        }
    ]
}
</snippet>

Note the following:

- The **Age** column has an empty column group header cell above it (shown with red borders).

<grid-example title='Padded Header' name='padded-header' type='generated' options='{ "exampleHeight": 300 }'></grid-example>
