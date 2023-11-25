---
title: "Number Cell Editor"
---

Simple number editor that uses the standard HTML number `input`.

## Enabling Number Cell Editor

<grid-example title='Number Editor' name='number-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Specified with `agNumberCellEditor` and configured with `INumberCellEditorParams`.

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

<grid-example title='Number Editor with Changed Precision' name='number-editor-step-and-precision' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

The stepping behaviour to increment/decrement the numeric value using the <kbd>↑</kbd> <kbd>↓</kbd> arrow keys can be customized using the properties below:


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

<grid-example title='Number Editor with Changed Precision' name='number-editor-prevent-stepping' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

The stepping behavior to increment/decrement the numeric value using the <kbd>↑</kbd> <kbd>↓</kbd> arrow keys can be disabled as shown below:

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