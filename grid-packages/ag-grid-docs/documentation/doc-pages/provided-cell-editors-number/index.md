---
title: "Number Cell Editor"
---

Simple number editor that uses the standard HTML number `input`.

The Number Cell Editor allows users to enter numeric values and to modify them using the <kbd>↑</kbd> <kbd>↓</kbd> keys.

## Enabling Number Cell Editor

Edit any cell in the grid below to see the Number Cell Editor.

<grid-example title='Number Editor' name='number-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Enabled with `agNumberCellEditor` and configured with `INumberCellEditorParams`.

```js
columnDefs: [
    {
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            min: 0,
            max: 100
        }
        // ...other props
    }
]
```

## Customisation

### Step and Precision

It is possible to configure the step and precision of the stepping behaviour that increments/decrements the cell value. Edit any cell in the grid below to see a customised stepping behaviour.

<grid-example title='Number Editor with Changed Precision' name='number-editor-step-and-precision' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

The stepping behaviour to increment/decrement the numeric value can be customised using the properties below:

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

### Prevent Stepping

The stepping behaviour can be disabled. Edit any cell in the grid below to see this.

<grid-example title='Number Editor with Changed Precision' name='number-editor-prevent-stepping' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

The stepping behaviour to increment/decrement the numeric value can be disabled as shown below:

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


## API Reference

<interface-documentation interfaceName='INumberCellEditorParams' names='["min","max","precision","step","showStepperButtons", "preventStepping"]'></interface-documentation>

## Next Up

Continue to the next section: [Date Cell Editor](../provided-cell-editors-date/).