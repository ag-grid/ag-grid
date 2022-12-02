---
title: "Column Moving"
---

Columns can be moved in the grid in the following ways:

- Dragging the column header with the mouse or through touch.
- Using the column API.

## API

The column API methods for moving columns are as follows:

<api-documentation source='column-api/api.json' section='Moving' names='["moveColumn", "moveColumns", "moveColumnByIndex"]'></api-documentation>

## Simple Example

The example below demonstrates simple moving via mouse dragging and the API. The following can be noted:

- Dragging the column headers with the mouse moves the column to the new location.
- The **Medals First** and **Medals Last** buttons call the API `moveColumns(keys, toIndex)` to place the medals columns at the start or at the end respectively.
- The **Country First** button calls the API `moveColumn(key, toIndex)` to place the Country column first.
- The **Swap First Two** button calls the API `moveColumnByIndex(fromIndex, toIndex)` to swap the first two columns.
- The **Print Columns** button calls the API `getAllGridColumns()` to print to the dev console the current column order.

<grid-example title='Column Moving Simple' name='moving-simple' type='generated'></grid-example>

## Moving Animation

Column animations happen when you move a column. The default is for animations to be turned on. It is recommended that you leave the column move animations on unless your target platform (browser and hardware) is too slow to manage the animations. To turn OFF column animations, set the grid property `suppressColumnMoveAnimation=true`.

<image-caption src="column-moving/resources/column-animation.gif" alt="Column Animation" maxwidth="35rem" centered="true" constrained="true"></image-caption>

The move column animation transitions the column's position only, so when you move a column, it animates to the new position. No other attribute apart from position is animated.

## Suppress Hide Leave

The grid property `suppressDragLeaveHidesColumns` will stop columns getting removed from the grid if they are dragged outside of the grid. This is handy if the user moves a column outside of the grid by accident while moving a column but doesn't intend to make it hidden.

## Suppress Movable

The column property `suppressMovable` changes whether the column can be dragged. The column header cannot be dragged by the user to move the columns when `suppressMovable=true`. However the column can be inadvertently moved by placing other columns around it thus only making it practical if all columns have this property.

## Lock Position

The column property `lockPosition` locks columns to one side of the grid. When `lockPosition` is set as either `"left"` or `"right"`, the column will always be locked to that position, cannot be dragged by the user, and cannot be moved out of position by dragging other columns.

## Suppress Movable &amp; Lock Position Example

The example below demonstrates these properties as follows:

- The **Age** column is locked `"left"` as the first column in the scrollable area of the grid. It is not possible to move this column, or have other columns moved over it to impact its position. As a result the **Age** column marks the beginning of the scrollable area regardless of its position within the column definitions.
- The **Total** column is locked `"right"` and likewise its position can not be impacted by moving other columns.
- The **Athlete** column has moving suppressed. It is not possible to move this column, but it is possible to move other columns around it.
- The grid has `suppressDragLeaveHidesColumns` set to `true` so columns dragged outside of the grid are not hidden (normally dragging a column out of the grid will hide the column).
- The `defaultColDef` has `lockPinned` set to `true` so it is not possible to pin columns to the left or right of the locked columns. 
- The **Age** **Total** and **Athlete** columns have the user provided `locked-col` and `suppress-movable-col` CSS classes applied to them respectively to change the background colour.

<grid-example title='Column Suppress & Lock' name='suppress-and-lock' type='generated'></grid-example>

## Advanced Locked Position Example

Below is a more real-world example of where locked columns would be used. The first column is a row number, similar to the row column in Excel. The second column is a buttons column - an application could have buttons for actions e.g. 'Delete', 'Buy', 'Sell' etc.

From the example the following can be noted:


- The first two columns are locked into first position by setting `colDef.lockPosition='left'`. This means they cannot be moved out of place, and other columns cannot be moved around them.
- The first two columns have the user provided `locked-col` CSS class applied to them to change the background colour.
- The sample application listens for column pinned events. If any column is pinned, then the locked columns are also pinned. This is to keep the locked columns at the first position.
    - Clicking **Pin Athlete** will pin the Athlete column, which will result in locked columns being pinned.
    - Clicking **Un-Pin Athlete** will un-pin the Athlete column, which will result in locked columns being un-pinned (assuming no other columns are left pinned).

<grid-example title='Advanced Lock' name='advanced-lock' type='generated'></grid-example>

## Lock Visible

When you move columns around it is possible to change their visibility as follows:

- You can hide a column by dragging it outside of the grid.
- You can show a column by dragging it from the [tool panel](/tool-panel/) onto the grid.

The column property `lockVisible` will stop individual columns from been made visible or hidden via the UI. When `lockVisible=true`, the column will not hide when it is dragged out of the grid, and columns dragged from the tool panel onto the grid will not become visible.

There is a slight overlap with the property `suppressDragLeaveHidesColumns`. When `suppressDragLeaveHidesColumns=true` all columns remain visible if they are dragged outside of the grid. This is a good way to block all columns from hiding as the user reorders the columns via dragging. The `lockVisible` property is at the column level and blocks all UI functions that change a column's visibility.

### Lock Visible Example

The example below shows lock visible. The following can be noted:


- The columns **Age**, **Gold**, **Silver** and **Bronze** are all locked visible. It is not possible to hide the columns by dragging them out of the grid and not possible to show the columns by dragging them in from the tool panel.
- If you make a group visible or hidden in the tool panel, the locked columns are not impacted.
- If you drag a group (e.g. the **Athlete** group) out of the grid, all normal columns in the group are removed and all locked columns in the group are left intact.

<grid-example title='Lock Visible' name='lock-visible' type='generated' options='{ "exampleHeight": 550, "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel" ] }'></grid-example>

