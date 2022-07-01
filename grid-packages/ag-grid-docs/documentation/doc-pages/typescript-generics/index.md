---
title: "Typescript Generics"
---

As of v28 AG Grid now supports Typescript Generics for row data and cell values. This leads to greatly improved developer experience via code completion and compile time validation of row data properties.

## Row Data

### Configure via GridOptions

To provide a row data interface to the grid set this as the generic `TData` parameter on the `GridOptions<TData>` interface. The generic row data interface will then be used throughout the grid options whenever row data is accessible. This includes properties, callbacks, events and even the gridApi.

```ts 
// Row Data interface
interface ICar {
    make: string;
    model: string;
    price: number;
}

// Pass ICar to GridOptions as a generic
const gridOptions: GridOptions<ICar> = {
    // rowData is typed as ICar[]
    rowData: [ { make: 'Ford', model: 'Galaxy', price: 20000 } ],

    // Callback with params type: GetRowIdParams<ICar>
    getRowId: (params) => {
        // params.data : ICar
        return params.data.make + params.data.model;
    },

    // Event with type: RowSelectedEvent<ICar>
    onRowSelected: (event) => {
        // event.data: ICar | undefined
        if (event.data) {
            const price = event.data.price;
        }
    }
}

// Grid Api methods use ICar interface
const cars: ICar[] = gridOptions.api!.getSelectedRows();
```

[[note]]
| You do not need to explicitly type callbacks and events that are defined as part of `GridOptions`. Typescript will correctly pass the generic type down the interface hierarchy.

### Stand-alone Use

It is possible to configure the generic row data type on standalone functions / properties. For example, a stand alone grid event handler can accept the generic parameter on the event type.

```ts
function onRowSelected(event: RowSelectedEvent<ICar>) {
    if (event.data) {
        const price = event.data.price;
    }
}
```

### Typed as TData | undefined

For a number of events and callbacks when a generic interface is provided the `data` property is typed as `TData | undefined` instead of `any`. This is because it is possible for the `data` property to be undefined under certain grid configurations. 

A good example of this is when Row Grouping is enabled. The `onRowSelected` event is fired for both leaf and group rows. Data is only present on leaf nodes and so the event should be written to handle cases when `data` is undefined.

```ts 
function onRowSelected(event: RowSelectedEvent<ICar>) {
    // event.data is typed as ICar | undefined
    if (event.data) {
        // Leaf row with data
        const price = event.data.price;
    } else {
        // This is a group row
    }
}
```

## Cell Value

When working with cell values it is now possible to provide a generic interface for the `value` property where this exists.

### Stand-alone Use

The generic parameter `TValue` needs to be explicitly provided to the interfaces when it is required. Here is an example of a `valueFormatter` for the price column where the `params.value` is now correctly typed as a `number` as we provide `number` to the `ValueFormatterParams` interface.

```ts
const colDefs: ColDef<ICar>[] = [
     {
        field: 'price',
        valueFormatter: (params: ValueFormatterParams<ICar, number>) => {
            // params.value : number
            return "£" + params.value;
        }
    }
];
```

The `TValue` generic type is also supported by the `ICellRendererParams<TData, TValue>` interface which is used when creating custom [Cell Renderers](/component-cell-renderer).

### Typed as TValue | undefined

For a number of events and callbacks when a generic interface is provided the `value` property is typed as `TValue | undefined` instead of `any`. This is because it is possible for the `value` property to be undefined under certain grid configurations. 

## Generic Type Example

<grid-example title='Generic Types' name='generic' type='generated'></grid-example>

## Fallback Default

If generic interfaces are not provided then the grid will use the default type of `any`. This means that generics in AG Grid are completely optional and are opt in. Grid options is defined as `GridOptions<TData = any>` so if a generic parameter is not provided then `any` is used in its place. 

Likewise for cell values if you do not provide a generic parameter `any` is used for the value property. For example cell renderer params is defined as `ICellRendererParams<TData = any, TValue = any>`.