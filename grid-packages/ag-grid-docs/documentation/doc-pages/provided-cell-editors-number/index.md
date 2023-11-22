---
title: "Number Cell Editor"
---

Simple number editor that uses the standard HTML number `input`.

Specified with `agNumberCellEditor` and configured with `INumberCellEditorParams`.

<grid-example title='Number Editor' name='number-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

## Interface

<interface-documentation interfaceName='INumberCellEditorParams' names='["min","max","precision","step","showStepperButtons"]'></interface-documentation>

```js
columnDefs: [
    {
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            min: 1,
            max: 100,
            precision: 0,
        }
        // ...other props
    }
]
```

## Next Up

Continue to the next section: [Date Cell Editor](../provided-cell-editors-date/).