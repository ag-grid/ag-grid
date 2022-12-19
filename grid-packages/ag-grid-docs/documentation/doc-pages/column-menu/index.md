---
title: "Column Menu"
enterprise: true
---

The column menu appears when you click on the menu icon in the column header. For AG Grid Community, only the filter is shown. For AG Grid Enterprise, a tabbed component containing a 1) Menu, 2) Filter and 3) Column Management panel is shown.

## Showing the Column Menu

The menu will be displayed by default and will be made up of three panels. If you want to change the order or what panels are shown, or hide them, you can specify the property `menuTabs` in the `colDef`.

The property `menuTabs` is an array of strings. The valid values are: `'filterMenuTab'`, `'generalMenuTab'` and `'columnsMenuTab'`.

- `generalMenuTab`: Include to show the main panel.
- `filterMenuTab`: Include to show the filter panel.
- `columnsMenuTab`: Include to show the column selection panel.

To not show the menu at all, set this property to an empty array`[]`. In addition, you can set the attribute `suppressMenu=true` to the column definition to not show the menu for a particular column.

The order of the menu tabs shown in the menu will match the order you specify in this array.

If you don't specify a `menuTabs` for a `colDef` the default is: `['generalMenuTab', 'filterMenuTab', 'columnsMenuTab']`

## Customising the General Menu Tab

The main menu panel, by default, will show a set of items. You can adjust which of these items get display, or you can start from scratch and provide your own items. To customise the menu, provide the `getMainMenuItems()` callback.

The result of `getMainMenuItems()` should be a list with each item either a) a string or b) a MenuItem description. Use 'string' to pick from built in menu items (listed below) and use MenuItem descriptions for your own menu items.

<api-documentation source='grid-options/properties.json' section='accessories' names='["getMainMenuItems"]'  ></api-documentation>

## Built In Menu Items

The following is a list of all the default built in menu items with the rules about when they are shown.

- `pinSubMenu`: Submenu for pinning. Always shown.
- `valueAggSubMenu`: Submenu for value aggregation. Always shown.
- `autoSizeThis`: Auto-size the current column. Always shown.
- `autoSizeAll`: Auto-size all columns. Always shown.
- `rowGroup`: Group by this column. Only shown if column is not grouped. Note this will appear once there is row grouping.
- `rowUnGroup`: Un-group by this column. Only shown if column is grouped. Note this will appear once there is row grouping.
- `resetColumns`: Reset column details. Always shown.
- `expandAll`: Expand all groups. Only shown if grouping by at least one column.
- `contractAll`: Contract all groups. Only shown if grouping by at least one column.

Reading the list above it can be understood that the list `defaultItems` changes on different calls to the `getMainMenuItems()` callback, depending on, for example, what columns are current used for grouping.

If you do not provide a `getMainMenuItems()` callback, then the rules alone decides what gets shown. If you do provide a `getMainMenuItems()`, then the `defaultItems` will be filled using the rules above and you return from the callback whatever you want, using the `defaultItems` only if you want to.

## Menu Item Separators

You can add menu item separators as follows:

```js
menuItems.push('separator')
```

## Repositioning the Popup

If not happy with the position of the popup, you can override it's position using `postProcessPopup(params)` callback. This gives you the popup HTML element so you can change it's position should you wish to.

<api-documentation source='grid-options/properties.json' section='accessories' names='["postProcessPopup"]'  ></api-documentation>

## Hiding the Column Menu

Hide the column menu with the grid API `hidePopupMenu()`, which will hide either the [context menu](/context-menu/) or the column menu, whichever is showing.

## Example Column Menu

The example below shows the `getMainMenuItems()` in action. To demonstrate different scenarios, the callback returns something different based on the selected column as follows:

- Athlete column appends custom items to the list of built in items.
- Athlete column contains a sub menu.
- Age column provides custom items and adds one built in default item.
- Country column trims down the default items by removing values.
- Date column changes the order of the tabs to `['filterMenuTab', 'generalMenuTab', 'columnsMenuTab']`
- Sport column changes the order of the tabs to `['filterMenuTab', 'columnsMenuTab']`. Note that the `'generalMenuTab'` is suppressed.
- Gold column changes the tabs to `['generalMenuTab']`. Note that the `'filterMenuTab'` and `'columnsMenuTab'` are suppressed.
- Silver column hides the menu by suppressing all the menuTabs that can be shown: `[]`.
- All other columns return the default list.
- `postProcessPopup` is used on the Gold column to reposition the menu 25px lower.

<grid-example title='Column Menu' name='column-menu' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Customising the Columns Menu Tab

The behaviour and appearance of the Columns Menu tab can be customised by supplying `ColumnsMenuParams` to the column definition: `colDef.columnsMenuParams`. Note that all of the properties are initially set to `false`.

<interface-documentation interfaceName='ColumnsMenuParams' ></interface-documentation>

The following example demonstrates all of the above columns menu tab properties **except columnLayout** which will be covered later on. Note the following:

- All columns menu tabs have been configured to ignore column moves in the grid by setting `suppressSyncLayoutWithGrid=true` on the default column definition.
- The **Name** column doesn't show the top filter section as `suppressColumnFilter`, `suppressColumnSelectAll` and `suppressColumnExpandAll` are all set to `true`.
- The **Age** column shows the group columns in a collapsed state as `contractColumnSelection` is set to `true`.

<grid-example title='Customising Columns Menu Tab' name='customising-columns-menu-tab' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel" ] }'></grid-example>

## Custom Column Layout

By default the order of columns in the Columns Menu Tab is derived from the `columnDefs` supplied in the grid options, and is kept in sync with the grid when columns are moved.

However, a custom column layout can be provided using the **columnLayout** property in the `colDef.columnsMenuParams`.

<snippet>
const gridOptions = {
    // original column definitions supplied to the grid
    columnDefs: [
        {
            columnsMenuParams: {
                columnLayout: [{
                    headerName: 'Group 1', // group doesn't appear in grid
                    children: [
                        { field: 'c' }, // custom column order with column "b" omitted
                        { field: 'a' }
                    ]
                }]
            }
        },
        { field: 'b' },
        { field: 'c' }
    ]
}
</snippet>

[[note]]
| When providing a custom columns layout by setting the **columnLayout** property, the `suppressSyncLayoutWithGrid` will automatically set to true. This means that reordering the columns in the grid will not reorder the columns in the list shown in columns menu tab.

The following example demonstrates providing custom column layouts in the column menu tab via the **columnLayout** property. Note the following:

- Open the column menu for the `age` column and note it shows the actual column order shown in the grid.
- Reorder columns in the grid - drag the `age` column and drop it on the left of the `name` column.
- Open the column menu for the `name` column and note that the column layout shows the `name` column followed by the `age` column  (as a custom column layout is not synchronized with the grid column order).
- Open the column menu for the `age` column and note that the column layout shows the `age` column before the `name` column.

<grid-example title='Customising Columns Layout' name='customising-columns-layout' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel" ] }'></grid-example>

## Popup Parent

Under most scenarios, the menu will fit inside the grid. However if the grid is small and / or the menu is very large, then the menu will not fit inside the grid and it will be clipped. This will lead to a bad user experience.

To fix this, you should set property `popupParent` which is explained in the [popup parent](/context-menu/#popup-parent) for context menus.
