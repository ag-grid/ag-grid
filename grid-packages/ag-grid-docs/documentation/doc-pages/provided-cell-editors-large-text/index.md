---
title: "Large Text Cell Editor"
---

Simple editor that uses the standard HTML `textarea`. Best used in conjunction with `cellEditorPopup=true`.

Specified with `agLargeTextCellEditor` and configured with `ILargeTextEditorParams`.

```js
columnDefs: [
    {
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true
        // ...other props
    }
]
```

<grid-example title='Large Text Editor' name='large-text-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

## Cols and Rows

```js
columnDefs: [
    {
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
            maxLength: 100,
            rows: 15,
            cols: 50
        }
        // ...other props
    }
]
```

<grid-example title='Large Text Editor Cols and Rows' name='large-text-editor-cols-rows' type='generated' options='{ "modules": ["clientside"] }'></grid-example>


## Interface

<interface-documentation interfaceName='ILargeTextEditorParams' names='["maxLength","rows","cols"]'></interface-documentation>

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
``````

Continue to the next section: [Select Cell Editor](../provided-cell-editors-select/).