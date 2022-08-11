---
title: "Clipboard"
enterprise: true
---

You can copy and paste items to and from the grid using the system clipboard.

## How to copy

Copying from the grid is <b>enabled by default</b> for enterprise users. To copy your selection to the system clipboard, you can use the keybind <kbd>Ctrl</kbd>+<kbd>C</kbd>, or right click on a cell and select 'Copy' from the context menu. Unless [Range Selection](/range-selection) or [Row Selection](/row-selection) is enabled, you will only be copying from the currently focused cell.

When copying multiple cells, the contents will be copied in an Excel compatible format, with fields
separated by a `\t` (tab) character.

## Copying Cell Ranges

When [Cell Ranges](/range-selection) are enabled by setting `gridOptions.enableRangeSelection=true`, copying will copy the Cell Range's content to your clipboard. Select a range by clicking on a cell and dragging with the mouse, then copy with the <kbd>Ctrl</kbd>+<kbd>C</kbd> keybind.

Multiple cell ranges can be selected at once using <kbd>Ctrl</kbd> and dragging with the mouse. When copying, all ranges will be copied to the clipboard. Note that the relative positions of multiple ranges is not preserved when copying, they are stacked vertically in the clipboard.

The column headers can be copied to the clipboard in addition to the cell contents by enabling the option `copyHeadersToClipboard`.

<api-documentation source='grid-options/properties.json' section='clipboard' names='["copyHeadersToClipboard"]'  ></api-documentation>

In the below example `copyHeadersToClipboard` has been enabled, try:
- Select a cell range with click & drag
- Copy with <kbd>Ctrl</kbd>+<kbd>C</kbd>
- Paste into an external program / text editor, note that the column headers were also copied.

<grid-example title='Copying Cell Ranges' name='copy-range' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Copying Rows

When [Row Selection](/row-selection) is enabled by setting `gridOptions.rowSelection` to either `"single"` or `"multiple"`, then copying while a row is selected will add the whole row's contents to your clipboard.

The below example demonstrates copying rows:
- Please select one or more rows in the example below and press CTRL+C
- Paste copied content in a text editor
- Note pasted content includes all selected rows

<grid-example title='Copying Rows' name='copy-row' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "clipboard"] }'></grid-example>

If you want to use row selection for another purpose and wish to copy the focused cell instead of selected rows, you can disable copying rows by setting
`gridOptions.suppressCopyRowsToClipboard=true`.

<api-documentation source='grid-options/properties.json' section='clipboard' names='["suppressCopyRowsToClipboard"]'  ></api-documentation>

The below example demonstrates copying the focused cell only when using row selection:
- Please select one or more rows in the example below and press CTRL+C
- Paste copied content in a text editor
- Note pasted content includes focused cell only

<grid-example title='Suppress Copying Rows' name='suppress-copy-row' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "clipboard"] }'></grid-example>

## Mixed Copying Cell Ranges & Rows

The copy operation copies the selected content in the following order of precedence:

1. Cell Ranges (if [Range Selection](/range-selection) is enabled)
2. Row Selection (if [Row Selection](/row-selection) is enabled and `suppressCopyRowsToClipboard` is <b>not</b> enabled)
3. Focused Cell

When both range selection and row selection are enabled, the default behaviour of copying ranges over copying rows can make it impossible for users to copy rows (as the selected cell range is copied by default). Enabling the grid option `gridOptions.suppressCopySingleCellRanges=true` makes it possible to copy the selected rows when only a single cell is selected via range selection. 

<api-documentation source='grid-options/properties.json' section='clipboard' names='["suppressCopySingleCellRanges"]'  ></api-documentation>

In this mode, when multiple cells are selected via range selection, the cell range is copied and not the selected rows. This behaviour is not enabled by default since it can be confusing for the copy behaviour to change depending on how much is selected.

The below example has range selection, row selection and `suppressCopySingleCellRanges` enabled.
- Select a range by clicking & dragging on a cell.
- Copy with <kbd>Ctrl</kbd>+<kbd>C</kbd>, paste into a text editor, observe that the range was copied.
- Deselect this range by clicking on any cell
- Select one or more rows by moving focus with the arrow keys and pressing the <kbd>SPACE</kbd> key to toggle the row's selection.
- Copy with <kbd>Ctrl</kbd>+<kbd>C</kbd>, paste into a text editor and observe that the rows were copied.

<grid-example title='Copying Mixed Ranges & Rows' name='copy-mixed' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Custom clipboard interaction

If you want to do the copy to clipboard yourself (ie not use the grids clipboard interaction) then implement the callback `sendToClipboard(params)`. Use this if you are in a non-standard web container that has a bespoke API for interacting with the clipboard. The callback gets the data to go into the clipboard, it's your job to call the bespoke API.

The example below shows using `sendToClipboard(params)`, but rather than using the clipboard, demonstrates the callback by just printing the data to the console.

<grid-example title='Controlling Clipboard Copy' name='custom' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Copying via the API

You can use the Grid API methods: `copySelectedRowsToClipboard(...)` and `copySelectedRangeToClipboard(...)`
to copy rows or ranges respectively, these API calls take optional parameters to enable copying column and group headers.

<api-documentation source='grid-api/api.json' section='clipboard' names='["copySelectedRangeToClipboard", "copySelectedRowsToClipboard"]'  ></api-documentation>

## How to Paste

Paste is enabled by default in the enterprise version and is possible as long as the cells you're pasting into are [editable](/cell-editing) (non-editable cells cannot be modified, even with a paste operation). You can paste using the keybind <kbd>Ctrl</kbd>+<kbd>V</kbd> while focus is on the grid.

The behaviour of paste changes depending whether you have a single cell or a range selected:

- When a **single cell is selected**. The paste will proceed starting at the selected cell if multiple cells are to be pasted.
- When a **range of cells selected**. If the selected range being pasted is larger than copied range, it will repeat if it fits evenly, otherwise it will just copy the cells into the start of the range.

[[note]]
| The 'paste' operation in the context menu is not possible and hence always disabled.
| It is not possible because of a browser security restriction that JavaScript cannot
| take data from the clipboard without the user explicitly doing a paste command from the browser
| (e.g. <kbd>Ctrl</kbd>+<kbd>V</kbd> or from the browser menu). If JavaScript could do this, then websites could steal
| data from the client via grabbing from the clipboard maliciously. The reason why the grid keeps
| the paste in the menu as disabled is to indicate to the user that paste is possible and it provides
| the shortcut as a hint to the user. This is also why the API cannot copy from clipboard.

## Disabling Paste

You can turn paste operations off for the entire grid, by setting the grid property `suppressClipboardPaste=true`.

Or you can disable pasting for a specific column or cell by setting the property `suppressPaste` on the column definition. This can be a boolean or a function (use a function to specify for a particular cell, or boolean for the whole column).

<api-documentation source='column-properties/properties.json' section='columns' names='["suppressPaste"]'></api-documentation>

## Processing Pasted Data

It is possible to process clipboard data before pasting it into the grid. This can be done either on individual cells or the whole paste operation.

### Processing Individual Cells

The interfaces and parameters for processing individual cells are as follows:

<api-documentation source='grid-options/properties.json' section='clipboard' names='["processCellForClipboard", "processHeaderForClipboard", "processGroupHeaderForClipboard", "processCellFromClipboard"]'  ></api-documentation>

These three callbacks above are demonstrated in the example below. Note the following:

- When cells are copied to the clipboard, values are prefixed with 'C-'. Cells can be copied by dragging a range with the mouse and hitting <kbd>Ctrl</kbd>+<kbd>C</kbd>.
- When cells are pasted from the clipboard, values are prefixed with 'Z-'. Cells can be pasted by hitting <kbd>Ctrl</kbd>+<kbd>V</kbd>.
- When headers are copied to the clipboard, values are prefixed with 'H-'. Headers can be copied by using the context menu.
- When group headers are copied to the clipboard, values are prefixed with 'GH-'. Headers can be copied by using the context menu.

<grid-example title='Example Process' name='process' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Changing the Delimiter for Copy & Paste

By default, the grid will use `\t` (tab) as the field delimiter. This is to keep the copy / paste compatible with Excel. If you want another delimiter then you can set the property `gridOptions.clipboardDelimiter` to a value of your choosing.

## Using the browser's text selection

The grid's selection and copy features replace the built-in browser behaviour for selecting and copying text. If you want to use the normal browser behaviour instead, you should set `enableCellTextSelection=true` in the gridOptions. It's important to mention that this config should be combined with `ensureDomOrder=true` also in the gridOptions.

[[note]]
| This is not an enterprise config and can be used at any time to enable cell text selection.

<grid-example title='Using Browser text selection' name='cellTextSelection' type='generated'></grid-example>

## Clipboard Events

The following events are relevant to clipboard operations:

<api-documentation source='grid-events/events.json' section='clipboard' names='["pasteStart","pasteEnd"]' config='{"overrideBottomMargin":"0rem"}'></api-documentation>
<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged"]' config='{ "hideMore":false}'></api-documentation>

For a paste operation the events will be fired as:

1. One `pasteStart` event.
1. Many `cellValueChanged` events.
1. One `pasteEnd` event.

If the application is doing work each time it receives a `cellValueChanged`, you can use the `pasteStart` and `pasteEnd` events to suspend the applications work and then do the work for all cells impacted by the paste operation after the paste operation.

There are no events triggered by copy to clipboard as this does not change the grids data.

<grid-example title='Clipboard Events' name='clipboard-events' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Known Issues

The Grid uses the browser's [Clipboard Api](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) to send and get data from the Operating System's clipboard, because of that, there are a number of known restrictions that block access to the data, such as: 

1. The application has to be hosted in a `https` environment, even during development work in `localhost`.
1. If the grid is inside an IFrame, access to the clipboard needs to be explicitly allow as follows:

    ```html
    <iframe src="index.html" allow="clipboard-read; clipboard-write"></iframe>
    ```
1. When the conditions above are met, clipboard access must be granted to the browser, see below:
    <image-caption src="clipboard/resources/permission.png" alt="Clipboard Access" width="18rem" constrained="true"></image-caption>

The grid tries to evaluate if access to the Clipboard is possible or not, and when the access is blocked it will default to the legacy clipboard access mode automatically. In some machines, when this process happens the first time, it leads empty data being pasted into the grid. To workaround theses problems, the `suppressClipboardApi` option was introduced and should be used as follows: 

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country' },
        { field: 'year' },
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'total' }
    ],
    suppressClipboardApi: true,
}
</snippet>
