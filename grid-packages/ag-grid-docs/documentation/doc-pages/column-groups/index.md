---
title: "Column Groups"
---

Grouping columns allows you to have multiple levels of columns in your header and the ability, if you want, to 'open and close' column groups to show and hide additional columns.

Grouping columns is done by providing the columns in a tree hierarchy to the grid. There is no limit to the number of levels you can provide.

Here is a code snippet of providing two groups of columns.

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

Below shows an example of column group configuration.

<grid-example title='Basic Grouping' name='basic-grouping' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## Column Definitions vs Column Group Definitions

The list of Columns in `gridOptions.columnDefs` can be a mix of Columns and Column Groups.
You can mix and match at will, every level can have any number of Columns and Column Groups and in any order.
The difference in Column vs Column Group definitions is as follows:

- The `children` attribute is mandatory for Column Groups and not applicable for Columns.
- If a definition has a `children` attribute, it is treated as a Column Group. If it does not have a `children` attribute, it is treated as a Column.
- Most other attributes are not common across groups and columns (eg `groupId` is only used for groups). If you provide attributes that are not applicable (eg you give a column a `groupId`) they will be ignored.

## Showing / Hiding Columns

A group can have children initially hidden. If you want to show or hide children, set `columnGroupShow` to either `'open'` or `'closed'` to one or more of the children. When a children set has `columnGroupShow` set, it behaves in the following way:

- **open:** The child is only shown when the group is open.
- **closed:** The child is only shown when the group is closed.
- **everything else:** Any other value, including `null` and `undefined`, the child is always shown.

If a group has any child that is dependent on the open / closed state, the open / close icon will appear. Otherwise the icon will not be shown.

Having columns only show when closed is useful when you want to replace a column with others. For example, in the code snippet above (and the example below), the 'Total' column is replaced with other columns when the group is opened.

If a group has an 'incompatible' set of children, then the group opening / closing will not be activated. An incompatible set is one which will have no columns visible at some point (i.e. all are set to 'open' or 'closed').

## Pinning and Groups

Pinned columns break groups. So if you have a group with 10 columns, 4 of which are inside the pinned area, two groups will be created, one with 4 (pinned) and one with 6 (not pinned).

## Moving Columns and Groups

If you move columns so that columns in a group are no longer adjacent, then the group will again be broken and displayed as one or more groups in the grid.

## Resizing Groups

If you grab the group resize bar, it resizes each child in the group evenly distributing the new additional width. If you grab the child resize bar, only that one column will be resized.

<image-caption src="column-groups/resources/header-resize.jpg" maxwidth="35rem" alt="Header Resize" centered="true"></image-caption>

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

## Align the Header Group Label To The Right

The labels in the grouping headers are positioned with `display: flex`. To make the group headers right-aligned, add the following rule set in your application, after the grid's stylesheets. Change the theme class to the one you use.

```css
.ag-theme-alpine .ag-header-group-cell-label {
    flex-direction: row-reverse;
}
```

## Marry Children

Sometimes you want columns of the group to always stick together. To achieve this, set the column group property `marryChildren=true`. The example below demonstrates the following:

- Both 'Athlete Details' and 'Sports Results' have `marryChildren=true`.
- If you move columns inside these groups, you will not be able to move the column out of the group. For example, if you drag 'Athlete', it is not possible to drag it out of the 'Athlete Details' group.
- If you move a non group column, e.g. Age, it will not be possible to place it in the middle of a group and hence impossible to break the group apart.
- It is possible to place a column between groups (e.g. you can place 'Age' between the 'Athlete Details' and 'Sports Results').

<grid-example title='Marry Children' name='marry-children' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Advanced Grouping Example

And here, to hammer in the 'no limit to the number of levels or groups', we have a more complex example. The grid here doesn't make much sense, it's just using the same Olympic Winners data and going crazy with the column groups. The example also demonstrates the following features:

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
