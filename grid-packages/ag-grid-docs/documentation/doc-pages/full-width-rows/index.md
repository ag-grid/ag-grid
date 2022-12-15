---
title: "Full Width Rows"
---

Under normal operation, AG Grid will render each row as a horizontal list of cells. Each cell in the row will correspond to one column definition. It is possible to switch this off and allow you to provide one component to span the entire width of the grid and not use columns. This is useful if you want to embed a complex component inside the grid instead of rendering a list of cells. This technique can be used for displaying panels of information.

[[note]]
| You may be wondering what full width rows are useful for. Their usage is very rare and most
| applications will not use them. If you cannot think of a use case for it, then don't worry,
| do not use it. Full width rows were initially introduced into AG Grid to support
| [Master / Detail](/master-detail/) before the grid provided direct support for master / detail.
| Now that master / detail is directly supported, the usefulness of full width is reduced.

## Simple Example of Full Width Rows


Below shows a simple example using full width. The following can be noted:

- The rows for countries France, Italy and Peru have full width components instead of cells.

- Sorting and filtering all work as if the data was displayed as normal.

<grid-example title='Simple Full Width' name='simple-full-width' type='generated' options=' { "exampleHeight": 580 }'></grid-example>

## Understanding Full Width

A `fullWidth` (full width) component takes up the entire width of the grid. A full width component:

- is not impacted by horizontal scrolling.
- is the width of the grid, regardless of what columns are present.
- is not impacted by pinned sections of the grid, will span left and right pinned areas regardless.
- does not participate in the navigation, rangeSelection (AG Grid Enterprise) or contextMenu (AG Grid Enterprise) of the main grid.

To use `fullWidth`, you must:

1. Implement the `isFullWidthRow(params)` callback, to tell the grid which rows should be treated as `fullWidth`.
1. Provide a `fullWidthCellRenderer`, to tell the grid what `cellRenderer` to use when doing `fullWidth` rendering.

<api-documentation source='grid-options/properties.json' section='styling' names='["isFullWidthRow"]' config='{"overrideBottomMargin":"0rem"}'></api-documentation>
<api-documentation source='grid-options/properties.json' section='fullWidth' names='["fullWidthCellRenderer"]' ></api-documentation>

The cell renderer can be any AG Grid cell renderer. Refer to
[Cell Rendering](/component-cell-renderer/) on how to build cell renderers.
The cell renderer for `fullWidth` has one difference to normal cell renderers: the parameters passed
are missing the value and column information as the `cellRenderer`, by definition, is not tied to a particular
column. Instead you should work off the data parameter, which represents the value for the entire row.

The `isFullWidthRow(params)` callback receives a `params` object containing the `rowNode` as its input and should return a boolean
`true` (use `fullWidth`) or `false` (do not use `fullWidth` and render as normal).


## Sorting and Filtering


Sorting and Filtering are NOT impacted by full width. Full width is a rendering time feature. The sorting
and filtering applied to the data is done before rendering and is not impacted.

## Detailed Full Width Example

Below shows a detailed full width example including pinned rows and columns.
The example's data is minimalistic to focus on how
the full width impacts rows. For demonstration, the pinned rows are shaded blue (with
full width a darker shade of blue) and body full width rows are green.
The following points should be noted:


- Full width can be applied to any row, including pinned rows. The example demonstrates full width in pinned top, pinned bottom and body rows.

- Full width rows can be of any height, which is specified in the usual way using the `getRowHeight(params)` callback. The example sets body `fullWidth` rows to 55px.

- The pinned full width rows are not impacted by either the vertical or horizontal scrolling.

- The body full width rows are impacted by vertical scrolling only, and not the horizontal scrolling.
- The full width rows span the entire grid, including the pinned left and pinned right sections.
- The full width rows are the width of the grid, despite the grid requiring horizontal scrolling to show the cells.

- The example is showing a flat list of data. There is no grouping or parent / child relationships between the full width and normal rows.

<grid-example title='Basic Full Width' name='basic-full-width' type='generated' options=' { "exampleHeight" : 595 }'></grid-example>


## Full Width Keyboard Navigation

When using full width rows, the full width cell renderer is responsible for implementing support for keyboard navigation among its focusable elements. This is why by default, focusing a grid cell with a full width cell renderer will focus the entire cell instead of any of the elements inside the full width cell renderer. 

Adding support for keyboard navigation and focus requires a custom `suppressKeyboardEvent` function in grid options. See [Suppress Keyboard Events](/keyboard-navigation/#suppress-keyboard-events).

An example of this is shown below, enabling keyboard navigation through the full width cell elements when pressing <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd>:

- Click on the `United Kingdom` row, press the <kbd>Tab</kbd> a few times and notice that the full width `France` row can be tabbed into, along with the button, link and textbox. At the end of the cell elements, the tab focus moves to the next cell in the next row
- Use <kbd>Shift</kbd>+<kbd>Tab</kbd> to navigate in the reverse direction

The `suppressKeyboardEvent` callback is used to capture tab events and determine if the user is tabbing forward or backwards. It also suppresses the default behaviour of moving to the next cell if tabbing within the child elements. 

If the focus is at the beginning or the end of the cell children and moving out of the cell, the keyboard event is not suppressed, so focus can move between the children elements. Also, when moving backwards, the focus needs to be manually set while preventing the default behaviour of the keyboard press event.

<grid-example title='Full Width Keyboard Navigation' name='full-width-keyboard-navigation' type='mixed'></grid-example>
