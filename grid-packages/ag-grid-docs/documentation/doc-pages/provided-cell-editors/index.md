---
title: "Provided Cell Editors"
---

The grid comes with some cell editors provided out of the box. These cell editors are listed here.

- [Text Cell Editor](/provided-cell-editors/#text-cell-editor)
- [Large Text Cell Editor](/provided-cell-editors/#large-text-cell-editor)
- [Select Cell Editor](/provided-cell-editors/#select-cell-editor)
- [Rich Select Cell Editor](/provided-cell-editors/#rich-select-cell-editor) (AG Grid Enterprise Only)

<grid-example title='Editors' name='editors' type='generated' options='{ "enterprise": true, "modules": ["clientside","richselect"] }'></grid-example>

## Text Cell Editor

Simple text editor that uses the standard HTML `input`. This editor is the default if none other specified.

Specified with `agTextCellEditor`.

Takes the following parameters:
    - `useFormatter`: If `true`, the editor will use the provided `colDef.valueFormatter` to format the value displayed in the editor.
    - `maxLength`: Max number of characters to allow. Default is 524288.

```js
columnDefs: [
    {
        cellEditor: 'agTextCellEditor',
        valueFormatter: (params) => '£' + params.value,
        cellEditorParams: {
            useFormatter: true
        }
        // ...other props
    }
]
```

## Large Text Cell Editor

Simple editor that uses the standard HTML `textarea`. Best used in conjunction with `cellEditorPopup=true`.

Specified with `agLargeTextCellEditor`.

Takes the following parameters:
    - `maxLength`: Max number of characters to allow. Default is 200.
    - `rows`: Number of character rows to display. Default is 10.
    - `cols`: Number of character columns to display. Default is 60.

```js
columnDefs: [
    {
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
            maxLength: 100,
            rows: 10,
            cols: 50
        }
        // ...other props
    }
]
```

## Select Cell Editor

Simple editor that uses HTML `select`.

Specified with `agSelectCellEditor`.

Takes the following parameter:
- `values`: List of values to display.

```js
columnDefs: [
    {
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
        }
        // ...other props
    }
]
```

Note there is no need to specify `cellEditorPopup=true` for Select Cell Editor as the browsers Select widget will appear on top of the grid.

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
| browsers standard Select (ie avoid `agSelectCellEditor`) and instead use `agRichSelectCellEditor` or
| create your own using a [Cell Editor Component](/component-cell-editor/).

## Rich Select Cell Editor

An alternative to using the browser's `select` popup for dropdowns inside the grid. Available in AG Grid Enterprise only. 

Benefits over browser's `select` are as follows:
- Uses DOM row visualisation so very large lists can be displayed.
- Integrates with the grid perfectly, avoiding glitches seen with the standard select.
- Uses HTML to render the values: you can provide cell renderers to customise what each value looks like.
- FuzzySearch of values: You can type within the Editor to select a specific record.

Specified with `agRichSelectCellEditor`.

[[only-react]]
|Should always set `cellEditorPopup=true`. Otherwise the editor will be clipped to the cell contents.

Takes the following parameters:
- `values`: List of values to be selected from.
- `cellHeight`: The row height, in pixels, of each value.
- `formatValue`: A callback function that allows you to change the displayed value for simple data.
- `cellRenderer`: The cell renderer to use to render each value. Cell renderers are useful for rendering rich HTML values, or when processing complex data. See [Cell Rendering Components](/component-cell-renderer/)
    for creating custom cell renderers.
- `searchDebounceDelay`: The value in `ms` for the fuzzy search debounce delay. Default is 300.

```js
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
            cellHeight: 20,
            formatValue: value => value.toUpperCase(),
            cellRenderer: MyCellRenderer,
            searchDebounceDelay: 500
        }
        // ...other props
    }
]
```
