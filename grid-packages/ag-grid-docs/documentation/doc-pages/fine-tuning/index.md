---
title: "Fine Tuning"
frameworks: ["react"]
---

This section describes some of the finer grain tuning you might want to do with your React & ag-Grid application.

## Cell Component Rendering

React renders components asynchronously and although this is fine in the majority of use cases it can 
be the case that in certain circumstances a very slight flicker can be seen where an old component is 
destroyed but the new one is not yet rendered by React.

In order to eliminate this behaviour the Grid will "pre-render" cell components and replace them with 
the real component once they are ready.

What this means is that the `render` method on a given Cell Component will be invoked twice, once for 
the pre-render and once for the actual component creation.

In the vast majority of cases this will result in overall improved performance but if you wish to 
disable this behaviour you can do so by setting the `disableStaticMarkup` property on the `AgGridReact` 
component to `true`:

```jsx
<AgGridReact
    disableStaticMarkup={true}
```

Note that this pre-render only applies to Cell Components - other types of Components are unaffected.

## Row Data & Column Def Control

By default the ag-Grid React component will check props passed in to determine if data has changed 
and will only re-render based on actual changes.

For `rowData` and `columnDefs` we provide an option for you to override this behaviour by the `rowDataChangeDetectionStrategy` and `columnDefsChangeDetectionStrategy` properties respectively:

```jsx

<AgGridReact
    onGridReady={this.onGridReady}
    rowData={this.state.rowData}
    rowDataChangeDetectionStrategy={ChangeDetectionService.IdentityCheck}
    columnDefsChangeDetectionStrategy={ChangeDetectionService.NoCheck}
    //...other properties
```

The following table illustrates the different possible combinations:

| Strategy | Behaviour | Notes |
| -------- | --------- | ----- |
| `IdentityCheck` | Checks if the new prop is exactly the same as the old prop (i.e. `===`) | Quick, but can result in re-renders if no actual data has changed |
| `DeepValueCheck` | Performs a deep value check of the old and new data | Can have performance implication for larger data sets |
| `NoCheck` | Does no checking - passes the new value as is down to the grid | Quick, but can result in re-renders if no actual data has changed |

For `rowData` the default value for this setting is:

| ImmutableData | Default          |
| ------------- | ---------------- |
| `true`        | `IdentityCheck`  |
| `false`       | `DeepValueCheck` |

If you're using Redux or larger data sets then a default of `IdentityCheck` is a good idea 
provided you ensure you make a copy of the new row data and do not mutate the `rowData` passed in.

For `columnDefs` the default value for this setting is `NoCheck` - this allows the grid to 
determine if a column configuration change is to be applied or not. This is the preferred and 
most performant choice.

