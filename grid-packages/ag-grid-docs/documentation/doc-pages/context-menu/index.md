---
title: "Context Menu"
enterprise: true
---

The user can bring up the context menu by right clicking on a cell. By default, the context menu provides 'copy', 'paste' and 'export'. Copy will copy the selected cells or rows to the clipboard. Paste will always, forever, be disabled.

[[note]]
| The 'paste' operation in the context menu is not possible and hence always disabled.
| It is not possible because of a browser security restriction that JavaScript cannot
| take data from the clipboard without the user explicitly doing a paste command from the browser
| (e.g. <kbd>Ctrl</kbd>+<kbd>V</kbd> or from the browser menu). If JavaScript could do this, then websites could steal
| data from the client by accessing the clipboard maliciously. The reason why the grid keeps
| the disabled paste option in the menu is to indicate to the user that paste is possible and it provides
| the keyboard shortcut as a hint to the user.

## Configuring the Context Menu

You can customise the context menu by providing a `getContextMenuItems()` callback. Each time the context menu is to be shown, the callback is called to retrieve the menu items. This allows the client application to display a menu individually customised to each cell.

The result of `getContextMenuItems(params)` should be a list with each item either a) a string or b) a `MenuItemDef`. Use 'string' to pick from built in menu items and use MenuItem descriptions for your own menu items.

<api-documentation source='grid-options/properties.json' section='accessories' names='["getContextMenuItems"]' ></api-documentation>


If you want to access your underlying data item, you access that through the rowNode as `var dataItem = node.data`.

Note: If you set `checked=true`, then icon will be ignored, these options are mutually exclusive.

If you want to turn off the context menu completely, set the grid property `suppressContextMenu=true`.

## Built In Menu Items

The following is a list of all the default built in menu items with the rules about when they are shown.

- `autoSizeAll`: Auto-size all columns. Not shown by default.
- `expandAll`: When set, it's only shown if grouping by at least one column. Not shown by default.
- `contractAll`: Collapse all groups. When set, it's only shown if grouping by at least one column. Not shown by default.
- `copy`: Copy selected value to clipboard. Shown by default.
- `copyWithHeaders`: Copy selected value to clipboard with headers. Shown by default.
- `copyWithGroupHeaders`: Copy selected value to clipboard with headers and header groups. Shown by default.
- `cut`: Cut the selected value to clipboard. Not shown by default.
- `paste`: Always disabled (see note in clipboard section). Always disabled. Shown by default.
- `resetColumns`: Reset all columns. Not shown by default.
- `export`: Export sub menu (containing csvExport and excelExport). Shown by default.
- `csvExport`: Export to CSV using all default export values. Shown by default.
- `excelExport`: Export to Excel (.xlsx) using all default export values. Shown by default.
- `chartRange`: Chart a range of selected cells. Only shown if charting is enabled. Configured via [chartToolPanelsDef](/integrated-charts-chart-tool-panels/#settings-tool-panel).
- `pivotChart`: Chart a range of selected cells. Only shown if charting is enabled and in pivot mode. Configured via [chartToolPanelsDef](/integrated-charts-chart-tool-panels/#settings-tool-panel).

## Default Context Menu

One drawback of using the AG Grid context menu is that you may want to show the browser's context menu when debugging, for example in order to access your browser's dev tools. If you want the grid to do nothing (and hence allow the browser to display its context menu) then hold down the <kbd>Ctrl</kbd> key while clicking for the context menu. If you always want the grid's context menu, even when <kbd>Ctrl</kbd> is pressed, then set `allowContextMenuWithControlKey=true`.

## Hiding the Context Menu

Hide the context menu with the grid API `hidePopupMenu()`, which will hide either the context menu or the [column menu](/column-menu/), whichever is showing.

## Context Menu Example

Below shows a configured context menu in action demonstrating a customised menu with a mix of custom items. You should notice the following:

- A mix of built in items and custom items are used.
- The first item uses the contents of the cell to display its value.
- Country and Person are sub menus. The country sub menu contains icons.
- The top menu item has CSS classes applied to it.
- The 'Always Disabled' menu item has a tooltip.

<grid-example title='Context Menu Example' name='context-menu' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "range", "clipboard", "charts"] }'></grid-example>

## Popup Parent

Under most scenarios, the menu will fit inside the grid. However if the grid is small and / or the menu is very large, then the menu will not fit inside the grid and it will be clipped.

This will lead to a bad user experience which is demonstrated in the following example:

- Open the context menu or the column menu in the grid
- Notice the menu will not be fully visible (i.e. clipped)

<grid-example title='Small Grid Problem' name='popup-parent-problem' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "clipboard"], "exampleHeight": 400 }'></grid-example>

The solution is to set the `popupParent` element which can be set in the following ways:

<api-documentation source='grid-options/properties.json' section='accessories' names='["popupParent"]' config='{"overrideBottomMargin":"0rem"}' ></api-documentation>
<api-documentation source='grid-api/api.json' section='accessories' names='["setPopupParent"]'></api-documentation>

Each mechanism allows you to set the popup parent to any HTML DOM element. The element must:

1. Exist in the DOM.
1. Cover the same area as the grid (or simply be a parent of the grid), so that when the popup is positioned, it can be positioned over the grid.

Most of the time, you will simply set the popup parent to the document body.

The example below is identical to the previous example except it sets the popup parent to the document body.

<grid-example title='Small Grid Solution' name='popup-parent-solution' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "clipboard"], "exampleHeight": 400 }'></grid-example>
