---
title: "Clipboard"
enterprise: true
---

You can copy and paste items to and from the grid using the system clipboard.

##  Copy to Clipboard

Users can copy to the clipboard:
 - By pressing the keys <kbd>Ctrl</kbd>+<kbd>C</kbd> while focus is on the grid.
 - Or Selecting 'Copy' from the context menu that appears when you right click over a cell.

The copy operation will copy selected ranges, selected rows, or the currently focused cell, based on this order:

- If range selected (via range selection), copy range.
- Else if rows selected (via row selection), copy rows.
- Else copy focused cell.

Headers can also be included when copying to clipboard using <kbd>Ctrl</kbd>+<kbd>C</kbd> by setting: `gridOptions.copyHeadersToClipboard=true`.

[[note]]
| You can copy multiple ranges in range selection by holding down <kbd>Ctrl</kbd> to select multiple ranges and then copy.

[[note]]
| Performing multiple <kbd>Ctrl</kbd>+&lt;left click> operations followed by <kbd>Ctrl</kbd>+<kbd>C</kbd> will not preserve original cell layout
| but rather copy them vertically to the clipboard.

When row selection is enabled the copy shortcut will copy the selected row, instead of the focused cell. Depending on your use case, you may wish to
ignore copying rows and copy the focused cell. To do this you can enable the option `gridOptions.suppressCopyRowToClipboard=true`.

### Copy via the API
You can use the Grid API methods: `copySelectedRowsToClipboard(...)` and `copySelectedRangeToClipboard(...)`
to copy rows or ranges respectively, these API calls take optional parameters to enable copying column and group headers.

<api-documentation source='grid-api/api.json' section='clipboard' names='["copySelectedRangeToClipboard", "copySelectedRowsToClipboard"]'  ></api-documentation>

##  Paste from Clipboard

Paste to clipboard can only be done in the following ways:

- Press keys <kbd>Ctrl</kbd>+<kbd>V</kbd> while focus in on the grid with a **single cell selected**. The paste will then proceed starting at the selected cell if multiple cells are to be pasted.
- Press keys <kbd>Ctrl</kbd>+<kbd>V</kbd> while focus in on the grid with a **range of cells selected**. If the selected range being pasted is larger than copied range, it will repeat if it fits evenly, otherwise it will just copy the cells into the start of the range.

[[note]]
| The 'paste' operation in the context menu is not possible and hence always disabled.
| It is not possible because of a browser security restriction that JavaScript cannot
| take data from the clipboard without the user explicitly doing a paste command from the browser
| (e.g. <kbd>Ctrl</kbd>+<kbd>V</kbd> or from the browser menu). If JavaScript could do this, then websites could steal
| data from the client via grabbing from the clipboard maliciously. The reason why the grid keeps
| the paste in the menu as disabled is to indicate to the user that paste is possible and it provides
| the shortcut as a hint to the user. This is also why the API cannot copy from clipboard.


## Toggle Paste On / Off

Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation). To turn paste operations off, set grid property `suppressClipboardPaste=true`.

The colDef has a property `suppressPaste` where you can specify to not allowing clipboard paste for a particular cell. This can be a boolean or a function (use a function to specify for a particular cell, or boolean for the whole column).

<api-documentation source='column-properties/properties.json' section='columns' names='["suppressPaste"]'></api-documentation>

## Clipboard Events

The following events are relevant to clipboard operations:

- `pasteStart`: Paste event has started.
- `pasteEnd`: Paste event has ended.
- `cellValueChanged`: A cells value has changed. Typically happens after editing but also if cell value is changed as a result of paste operation.

For a paste operation the events will be fired as:

1. One `pasteStart` event.
1. Many `cellValueChanged` events.
1. One `pasteEnd` event.

If the application is doing work each time it receives a `cellValueChanged`, you can use the `pasteStart` and `pasteEnd` events to suspend the applications work and then do the work for all cells impacted by the paste operation after the paste operation.

There are no events for paste to clipboard as this does not update the grids data.

## Clipboard Example

Below you can:

- Copy with the Context Menu or <kbd>Ctrl</kbd>+<kbd>C</kbd>.
- Paste with <kbd>Ctrl</kbd>+<kbd>V</kbd>.
- Copy with the provided buttons.
- Notice for paste that events `pasteStart`, `pasteEnd` and `cellValueChanged` are logged to the console.
- Buttons 'Toggle Paste On' and 'Toggle Paste Off' turn pasting on and off.

The example has both row click selection and range selection enabled. You probably won't do
this in your application as it's confusing, it's done below just to demonstrate them side by side.

<grid-example title='Clipboard example' name='simple' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Controlling Clipboard Copy

If you want to do the copy to clipboard yourself (ie not use the grids clipboard interaction) then implement the callback `sendToClipboard(params)`. Use this if you are in a non-standard web container that has a bespoke API for interacting with the clipboard. The callback gets the data to go into the clipboard, it's your job to call the bespoke API.

The example below shows using `sendToClipboard(params)`, but rather than using the clipboard, demonstrates the callback by just printing the data to the console.

<grid-example title='Controlling Clipboard Copy' name='custom' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Processing Clipboard Data

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

### Processing Whole Paste Operation

The interface and parameters for processing the whole paste operation is as follows:

<api-documentation source='grid-options/properties.json' section='clipboard' names='["processDataFromClipboard"]'  ></api-documentation>

In summary the `processDataFromClipboard` takes a 2d array of data that was taken from the clipboard and the method returns a 2d array of data to be used. For the method to have no impact, it should return the 2d array it was provided. The method is free to return back anything it wants, as long as it is a 2d array of strings.

The example below demonstrates `processDataFromClipboard`. Note the following:


- Pasting data that is copied from cells in the 'Green' highlighted column works as normal. Note that it uses `processDataFromClipboard` returning the 2d array it was provided with.

- Pasting any data from cells in the 'Red' highlighted column will result in 2x2 cells getting pasted with contents `[ ['Orange', 'Orange'], ['Grey', 'Grey'] ]`. To see this, copy and paste some 'Red' cells from column F. This is achieved by `processDataFromClipboard` returning the same 2d array always regardless of the data from the clipboard.

- Pasting any data where a cell starts with 'Yellow' will result in the paste operation getting cancelled. To see this, copy and paste some 'Yellow' cells from column G. This is achieved by `processDataFromClipboard` returning null.

<grid-example title='Example Process All' name='process-all' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

## Changing the Delimiter

By default, the grid will use `\t` (tab) as the field delimiter. This is to keep the copy / paste compatible with Excel. If you want another delimiter then use the property `clipboardDelimiter`.

## Using enableCellTextSelection

If instead of using the Clipboard service to copy/paste the contents from a cell, you just want to manually select the text and use the operating system copy/paste. You should set `enableCellTextSelection=true` in the gridOptions. It's important to mention that this config should be combined with `ensureDomOrder=true` also in the gridOptions.

[[note]]
| This is not an enterprise config and can be used at any time to enable cell text selection.

<grid-example title='Using enableCellTextSelection' name='cellTextSelection' type='generated'></grid-example>

## More Complex Example

The example below demonstrates:

- Uses CSV by setting `clipboardDelimiter=','`. To test, copy to clipboard, then paste into a text editor.
- Does not allow paste into the 'silver' column by setting `colDef.suppressPaste=true`.

<grid-example title='Complex Example' name='complex' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "range", "clipboard"] }'></grid-example>

