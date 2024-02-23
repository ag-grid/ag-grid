---
title: "Column Menu"
enterprise: true
---

The column menu is launched from the grid header, and displays a list of menu items, along with the ability to select columns and display filters.

<note>
|AG Grid Community does not have a menu, but can launch [Column Filters](../filtering) if enabled (see [Launching Filters](../filter-api/#launching-filters) for configuration details).
</note>

The following example shows the new-format column menu:
- The **Athlete** column does not have filtering enabled, and only shows the main menu.
- The **Age** column has filtering enabled, and shows an additional filter icon. Open and apply a filter to see the behaviour.
- The **Country** column has filtering enabled with the floating filter. Open and apply a filter to see the behaviour.
- Right-clicking on the column headers will also display the column menu.
- Right-clicking in the empty space to the right of the column headers will display the column menu with options to choose/reset the columns.

<grid-example title='Column Menu' name='column-menu' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

The new-format column menu is enabled by setting `columnMenu = 'new'`.

## Customising the Column Menu

How the column menu is launched from the header can be configured via the following column definition properties.

<api-documentation source='column-properties/properties.json' section='header' names='["suppressHeaderMenuButton", "suppressHeaderFilterButton", "suppressHeaderContextMenu"]'></api-documentation>

The column menu button can be hidden until moused over by the grid option `suppressMenuHide`.

<api-documentation source='grid-options/properties.json' section='accessories' names='["suppressMenuHide"]'></api-documentation>

The following example demonstrates different ways of customising the column menu:
- The **Athlete** column has a filter and the menu button suppressed, but still available via right-click.
- The **Age** column has a floating filter and the menu suppressed, but still available via right-click.
- The **Country** column has a filter and the header filter button suppressed.
- The **Year** column has a floating filter and the header filter button suppressed.
- The **Sport** column has no filter and the menu suppressed on right-click.
- The **Gold** column has no filter and the menu button suppressed, but still available via right-click
- The **Silver** column has a filter (with the header filter button suppressed), and the menu button suppressed but still available via right-click.
- The **Bronze** column has a floating filter and the menu button suppressed, but still available via right-click.
- The **Total** column has the menu button, header filter button and right-click menu suppressed.

<grid-example title='Customising the Column Menu' name='customising-column-menu' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Legacy Tabbed Column Menu

The menu can also be displayed in a tabbed format with three panels. This is currently the default behaviour, but will be switched in the next major release. If you want to change the order or what panels are shown, or hide them, you can specify the property `menuTabs` in the `colDef`.

The property `menuTabs` is an array of strings. The valid values are: `'filterMenuTab'`, `'generalMenuTab'` and `'columnsMenuTab'`.

- `generalMenuTab`: Include to show the main panel.
- `filterMenuTab`: Include to show the filter panel.
- `columnsMenuTab`: Include to show the column chooser panel.

The order of the menu tabs shown in the menu will match the order you specify in this array.

If you don't specify a `menuTabs` for a `colDef` the default is: `['generalMenuTab', 'filterMenuTab', 'columnsMenuTab']`

The following example demonstrates the legacy tabbed menu:
- The **Athlete** column shows the default tabs.
- The **Age** column changes the order of the tabs to `['filterMenuTab', 'generalMenuTab', 'columnsMenuTab']`
- The **Country** column changes the order of the tabs to `['filterMenuTab', 'columnsMenuTab']`. Note that the `'generalMenuTab'` is suppressed.
- The **Year** column changes the tabs to `['generalMenuTab']`. Note that the `'filterMenuTab'` and `'columnsMenuTab'` are suppressed.
- The **Sport** column hides the menu by suppressing all the menuTabs that can be shown: `[]`.

<grid-example title='Column Menu' name='column-menu-legacy' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Customising the Menu Items

The main menu list, by default, will show a set of items. You can adjust which of these items get displayed, or you can start from scratch and provide your own items. There are two ways to customise the menu items:

1. Set `colDef.mainMenuItems`. This can either be a list of menu items, or a callback which is passed the list of default menu items.
2. Set the grid option `getMainMenuItems()`. This callback will be passed the list of default menu items as well as the column.

Note that `colDef.mainMenuItems` will take priority over `getMainMenuItems()`.

The menu item list should be a list with each item either a) a string or b) a `MenuItemDef` description. Use 'string' to pick from built-in menu items (listed below) and use `MenuItemDef` descriptions for your own menu items.

<api-documentation source='column-properties/properties.json' section='header' names='["mainMenuItems"]'></api-documentation>

<api-documentation source='grid-options/properties.json' section='accessories' names='["getMainMenuItems"]'></api-documentation>

### Built-In Menu Items

The following is a list of all the default built-in menu items with the rules about when they are shown.

- `sortAscending`: Sort the column in ascending order. Shown when `columnMenu = 'new'` and the column is not already sorted in ascending order.
- `sortDescending`: Sort the column in descending order. Shown when `columnMenu = 'new'` and the column is not already sorted in descending order.
- `sortUnSort`: Clear the sort on the column. Shown when `columnMenu = 'new'` and the column is already sorted.
- `columnFilter`: Show the column filter. Shown when `columnMenu = 'new'`, a filter is enabled, and the header filter button and floating filter button are not displayed.
- `columnChooser`: Show the column chooser. Shown when `columnMenu = 'new'`.
- `pinSubMenu`: Sub-menu for pinning. Always shown.
- `pinSubMenu`: Sub-menu for pinning. Always shown.
- `valueAggSubMenu`: Sub-menu for value aggregation. Always shown.
- `autoSizeThis`: Auto-size the current column. Always shown.
- `autoSizeAll`: Auto-size all columns. Always shown.
- `rowGroup`: Group by this column. Only shown if column is not grouped. Note this will appear once there is row grouping.
- `rowUnGroup`: Un-group by this column. Only shown if column is grouped. Note this will appear once there is row grouping.
- `resetColumns`: Reset column details. Always shown.
- `expandAll`: Expand all groups. Only shown if grouping by at least one column.
- `contractAll`: Collapse all groups. Only shown if grouping by at least one column.

The `defaultItems` list will change on different calls, depending on, for example, which columns are currently used for grouping.

If you do not override the list of menu items, then the items displayed will be based on the rules above.

### Menu Item Separators

Menu items can be grouped together by adding separators between groups. Separators are defined by the string value `'separator'`. For example, you could add menu item separators as follows:

```js
menuItems.push('separator')
```

### Custom Menu Item Components

In addition to the provided menu items, it is also possible to create custom menu item components.

For more details, refer to the section: [Custom Menu Item Components](/component-menu-item/).

### Example: Customising the Menu Items

The following example demonstrates the `colDef.mainMenuItems` property:

- The **Athlete** column shows the list of built-in items.
- The **Age** column appends custom items to the list of built-in items.
- The **Country** column provides custom items and adds one built-in default item.
- The **Year** column trims down the default items by removing values.

<grid-example title='Customising the Menu Items' name='customising-menu-items' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Customising the Column Chooser

The behaviour and appearance of the Columns Menu tab can be customised by supplying `ColumnChooserParams` to the column definition: `colDef.columnChooserParams`. Note that all of the properties are initially set to `false`.

<interface-documentation interfaceName='ColumnChooserParams'></interface-documentation>

The following example demonstrates all of the above column chooser properties **except columnLayout** which will be covered later on. Note the following:
- Launch the column chooser by selecing `Choose Columns` from any of the column menus.
- The column chooser when launched from any column has been configured to ignore column moves in the grid by setting `suppressSyncLayoutWithGrid=true` on the default column definition.
- The **Name** column chooser doesn't show the top filter section as `suppressColumnFilter`, `suppressColumnSelectAll` and `suppressColumnExpandAll` are all set to `true`.
- The **Age** column chooser shows the group columns in a collapsed state as `contractColumnSelection` is set to `true`.

<grid-example title='Customising Column Chooser' name='customising-column-chooser' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel" ] }'></grid-example>

### Custom Column Layout

By default the order of columns in the column chooser is derived from the `columnDefs` supplied in the grid options, and is kept in sync with the grid when columns are moved.

However, a custom column layout can be provided using the **columnLayout** property in the `colDef.columnChooserParams`.

<snippet>
const gridOptions = {
    // original column definitions supplied to the grid
    columnDefs: [
        {
            columnChooserParams: {
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

<note>
When providing a custom columns layout by setting the **columnLayout** property, the `suppressSyncLayoutWithGrid` property will automatically set to true. This means that reordering the columns in the grid will not reorder the columns in the list shown in columns menu tab.
</note>

The following example demonstrates providing custom column layouts in the column chooser via the **columnLayout** property. Note the following:

- Open the column chooser for the **Name** column and note it shows the custom column order as specified in its `columnLayout`.
- Open the column chooser for the **Age** column and note it shows the actual column order shown in the grid.
- Reorder columns in the grid - drag the **Age** column and drop it on the left of the **Name** column.
- Open the column chooser for the **Age** column and note that the column layout now shows the **Age** column before the **Name** column.
- Open the column chooser for the **Name** column and note that the column layout still shows the **Name** column followed by the **Age** column  (custom column layout is not synchronized with the grid column order).

<grid-example title='Customising Columns Layout' name='customising-columns-layout' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel" ] }'></grid-example>

## Column Menu API / Events

The `gridApi` has the following methods that can be used to interact with the column menu:

<api-documentation source='grid-api/api.json' section='accessories' names='["showColumnChooser", "showColumnFilter", "showColumnMenu", "hidePopupMenu", "hideColumnChooser"]'></api-documentation>

<br />

The following column menu event is emitted by the grid:

<api-documentation source='grid-events/events.json' section='accessories' names='["columnMenuVisibleChanged"]'></api-documentation>

<br />

The following example demonstrates the column menu API and events (by clicking the buttons outside the grid):

<grid-example title='Column Menu API' name='column-menu-api' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel" ] }'></grid-example>

## Menu Popup

The column menu is displayed inside a popup, which can be further configured.

### Repositioning the Popup

If not happy with the position of the popup, you can override its position using the `postProcessPopup(params)` callback. This gives you the popup HTML element so you can change its position should you wish to.

<api-documentation source='grid-options/properties.json' section='accessories' names='["postProcessPopup"]'  ></api-documentation>

The following example demonstrates using `postProcessPopup()` to move the **Age** column menu down by 25 pixels.

<grid-example title='Column Menu Popup' name='column-menu-popup' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel" ] }'></grid-example>

### Popup Parent

Under most scenarios, the menu will fit inside the grid. However if the grid is small and / or the menu is very large, then the menu will not fit inside the grid and it will be clipped. This will lead to a bad user experience.

To fix this, you should set the [Popup Parent](/context-menu/#popup-parent) property.
