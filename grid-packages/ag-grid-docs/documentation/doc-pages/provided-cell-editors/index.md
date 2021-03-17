---
title: "Provided Cell Editors"
---

The grid comes with some cell editors provided out of the box. These cell editors are listed here.

The provided cell editors are as follows:


- `agTextCellEditor`: Simple text editor that uses a standard HTML `input`. This is the default.
- `agPopupTextCellEditor`: Same as 'text' but as popup.
- `agLargeTextCellEditor`: A text popup for inputting larger, multi-line text.
- `agSelectCellEditor`: Simple editor that uses a standard HTML `select`.
- `agPopupSelectCellEditor`: Same as 'select' but as popup.
- `agRichSelectCellEditor (AG Grid Enterprise only)`: A rich select popup that uses row virtualisation.

### agTextCellEditor / agPopupTextCellEditor


Simple text editors that use the standard HTML `input` tag. `agTextCellEditor` is the default used if you do not explicitly set a cell editor.

The only parameter for text cell editors is `useFormatter`. If set to `true`, the grid will use the provided `colDef.cellFormatter` (if one is present).

### agLargeTextCellEditor

Simple editor that uses the standard HTML `textarea` tag.

The `agLargeTextCellEditor` takes the following parameters:

- `maxLength`: Max number of characters to allow. Default is 200.
- `rows`: Number of character rows to display. Default is 10.
- `cols`: Number of character columns to display. Default is 60.

### agSelectCellEditor / agPopupSelectCellEditor

Simple editors that use the standard HTML `select` tag.

The only parameter for text cell editors is `values`. Use this to provide a list of values to the cell editor.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'language',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
            },
        }
    ]
}
</snippet>

[[note]]
|
| We have found the standard HTML Select doesn't have an API that's rich enough to play
| properly with the grid. When a cell is double clicked to start editing, it is desired that
| the Select is a) shown and b) opened ready for selection. There is no API to open a browsers
| Select. For this reason to edit there are two interactions needed 1) double click to start
| editing and 2) single click to open the Select.
| <br />
| We also observed different results while using keyboard navigation to control editing, e.g.
| while using <kbd>Enter</kbd> to start editing. Some browsers would open the Select, others would not.
| This is down to the browser implementation and given there is no API for opening the
| Select, there is nothing the grid can do.
| <br />
| If you are unhappy with the additional click required, we advise you don't depend on the
| browsers standard Select (ie avoid `agSelectCellEditor` and
| `agPopupSelectCellEditor`) and instead use `agRichSelectCellEditor` or
| create your own using a [Cell Editor Component](/component-cell-editor/).

### agRichSelectCellEditor

Available in AG Grid Enterprise only. An alternative to using the browser's `select` popup for dropdowns inside the grid.

The `agRichSelectCellEditor` has the following benefits over the browser's `select` popup:

- Uses DOM row visualisation so very large lists can be displayed.
- Integrates with the grid perfectly, avoiding glitches seen with the standard select.
- Uses HTML to render the values: you can provide cell renderers to customise what each value looks like.
- FuzzySearch of values: You can type within the RichSelectCellEditor to select a specific record.

The `agRichSelectCellEditor` takes the following parameters:


- `values`: List of values to be selected from.

- `cellHeight`: The row height, in pixels, of each value.

- `formatValue`: A callback function that allows you to change the displayed value for simple data.

- `cellRenderer`: The cell renderer to use to render each value. Cell renderers are useful for rendering rich HTML values, or when processing complex data. See [Cell Rendering Components](/component-cell-renderer/)
    for creating custom cell renderers.

- `searchDebounceDelay (Default: 300)`: The value in `ms` for the fuzzy search debounce delay.

