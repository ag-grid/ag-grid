---
title: "Large Text Cell Editor"
---

Simple editor that uses the standard HTML `textarea`. Best used in conjunction with `cellEditorPopup=true`.

Specified with `agLargeTextCellEditor` and configured with `ILargeTextEditorParams`.

<grid-example title='Large Text Editor' name='large-text-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

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