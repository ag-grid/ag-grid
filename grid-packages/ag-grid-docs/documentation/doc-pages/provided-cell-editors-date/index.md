---
title: "Date Cell Editors"
---

## Date Cell Editor

Simple date editor that uses the standard HTML date `input`. Requires cell values to be of type `Date`.

Specified with `agDateCellEditor` and configured with `IDateCellEditorParams`.

<grid-example title='Date Editor' name='date-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

### Interface

<interface-documentation interfaceName='IDateCellEditorParams' names='["min","max","step"]'></interface-documentation>

```js
columnDefs: [
    {
        cellEditor: 'agDateCellEditor',
        cellEditorParams: {
            min: '2000-01-01',
            min: '2019-12-31',
        }
        // ...other props
    }
]
```


## Date as String Cell Editor

Simple date editor that uses the standard HTML date `input`. Similar to the **Date Cell Editor**, but works off of cell values with `string` type.

The date format is controlled via [Cell Data Types](/cell-data-types/) and the [Date as String Data Type Definition](/cell-data-types/#date-as-string-data-type-definition). The default is `'yyyy-mm-dd'`.

Specified with `agDateStringCellEditor` and configured with `IDateStringCellEditorParams`.

<grid-example title='Date as String Editor' name='date-as-string-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

### Interface

<interface-documentation interfaceName='IDateStringCellEditorParams' names='["min","max","step"]'></interface-documentation>

```js
columnDefs: [
    {
        cellEditor: 'agDateStringCellEditor',
        cellEditorParams: {
            min: '2000-01-01',
            min: '2019-12-31',
        }
        // ...other props
    }
]
```


## Next Up

Continue to the next section: [Checkbox Cell Editor](../provided-cell-editors-checkbox/).

