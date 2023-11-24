---
title: "Number Cell Editor"
---

Simple number editor that uses the standard HTML number `input`.

Specified with `agNumberCellEditor` and configured with `INumberCellEditorParams`.

```js
columnDefs: [
    {
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            min: 1,
            max: 100
        }
        // ...other props
    }
]
```

<grid-example title='Number Editor' name='number-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

## Changing Step and Precision

```js
columnDefs: [
    {
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            precision: 2,
            step: 0.25,
            showStepperButtons: true
        }
        // ...other props
    }
]
```

<grid-example title='Number Editor with Changed Precision' name='number-editor-step-and-precision' type='generated' options='{ "modules": ["clientside"] }'></grid-example>


## Prevent Stepping

```js
columnDefs: [
    {
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            preventStepping: true
        }
        // ...other props
    }
]
```


<grid-example title='Number Editor with Changed Precision' name='number-editor-prevent-stepping' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

## Interface

<interface-documentation interfaceName='INumberCellEditorParams' names='["min","max","precision","step","showStepperButtons", "preventStepping"]'></interface-documentation>

## Next Up

Continue to the next section: [Date Cell Editor](../provided-cell-editors-date/).