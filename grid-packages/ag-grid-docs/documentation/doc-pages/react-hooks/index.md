---
title: "Best Practices"
frameworks: ["react"]
---

AG Grid fits perfectly into the React rendering ecosystem. This page explains best practices for using React with AG Grid.

This page assumes you are using React Hooks and not React Classes.

## Setting Row Data

When setting Row Data, we recommend using `useState`.

```jsx
const App = () => {
    const [rowData, setRowData] = useState([
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ]);

    // ... other setup

    return (
        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
            <AgGridReact
                rowData={rowData}
                // ... other props
                >
            </AgGridReact>
        </div>
    );
};
```

All examples in the documentation use `useState` for Row Data and Column Definitions. However all code snippets in the documentation leave these hooks out for easier reading.

## Column Definitions

When setting Column Definitions, we recommend using `useState` and JavaScript / JSON definitions (not HTML Markup).

```jsx
const App = () => {
    const [columnDefs, setColumnDefs] = useState([
        {field: 'make'},
        {field: 'model'},
    ]);

    return ( <AgGridReact columnDefs={columnDefs} /> );
};
```

If you do not put Column Definitions into state then the grid will be provided with a new set of Column Definitions each time the parent component is rendered. This will result in unexpected behaviour in the grid, such as the column state (column order, width etc) getting reset.

```jsx
const App = () => {
    // do NOT do this, will result in extra Grid processing
    const columnDefs = [
        {field: 'make'},
        {field: 'model'},
    ];

    return ( <AgGridReact columnDefs={columnDefs} /> );
};
```

All examples in the documentation use `useState` for Row Data and Column Definitions. However all code snippets in the documentation leave these hooks out for easier reading.

We do not recommend HTML Markup. This is for the same reason as above, in that each time the parent component is rendered, a new set of Column Definitions is created and passed to the grid, potentially resetting state of the Columns.

```jsx
// do NOT define Columns in HTML like this
const App = () => {
    return (
        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
            <AgGridReact>
                <AgGridColumn field="make"></AgGridColumn>
                <AgGridColumn field="model"></AgGridColumn>
            </AgGridReact>
        </div>
    );
};
```

If you are currently using HTML Column Definitions, it's fine to continue if you are not experiencing any unexpected Column State changes. We do not intend dropping support for HTML Column Definitions. However going forward, you should prefer JavaScript Definitions and `useState`.

## Use Callback

## useState vs useMemo

For all the attributes where we recommend using `useState`, you could also use `useMemo`. Which one to use is up to you. We find `useState` is more in line with React applications where the Parent Application changes state for a Child Component.

## Components

```jsx
const MyCellRenderer = p => <span>{p.value}</span>;

const App = () => {
    const [columnDefs] = useState([
        
        // reference the Cell Renderer above
        { field: 'make', cellRenderer: MyCellRenderer },
        
        // or put inline
        { field: 'model', cellRenderer: p => <span>{p.value}</span> },

        // optionally for best performance, memo() the renderer, so render
        // cycles don't occur unnecessarily
        { field: 'price', cellRenderer: memo(MyCellRenderer) }
    ]);

    return ( <AgGridReact columnDefs={columnDefs} /> );
};
```


## Use State, Use Memo

All examples in the documentation use best practices with regards `useState` and `useMemo`, e.g. `rowData` and `columnDefs` are always set using `useState`. However all code snippets in the documentation leave these hooks out for simpler reading of the documentation.

## Use Callback

>> Beware, stale references

