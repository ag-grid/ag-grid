---
title: "React Hooks"
frameworks: ["react"]
---

This page explains best practices for using React Hooks with AG Grid.

[[warning]]
| This page assumes you are using [React Hooks](https://reactjs.org/docs/hooks-intro.html) and not [React Classes](https://reactjs.org/docs/react-component.html).

## Row Data

When setting Row Data, we recommend using `useState` or `useMemo`.

```jsx
const App = () => {
    const [rowData, setRowData] = useState([
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxster", price: 72000}
    ]);

    return <AgGridReact rowData={rowData} />;
};
```

For applications that set data into the grid (as opposed to showing data statically), it makes sense to favour `useState`
over `useMemo` as loading data usually aligns with changing state in your application.

All examples in the documentation use `useState` for Row Data. However, all code snippets in the documentation leave 
these hooks out for easier reading.

## Column Definitions

When setting Column Definitions, we recommend using `useState` or `useMemo`.

```jsx
const App = () => {
    const [columnDefs, setColumnDefs] = useState([
        {field: 'make'},
        {field: 'model'},
    ]);

    return <AgGridReact columnDefs={columnDefs} />;
};
```

If you do NOT use `useState` or `useMemo`, then the grid will be provided with a new set of Column Definitions each time
the parent component is rendered. This will result in unexpected behaviour in the grid, such as the column state 
(column order, width etc...) getting reset.

It makes sense to use `useState` if your application intends changing Column Definitions and to use `useMemo` if your 
application does not change Column Definitions.

```jsx
const App = () => {
    // do NOT do this, will result in extra Grid processing
    const columnDefs = [
        {field: 'make'},
        {field: 'model'},
    ];

    return <AgGridReact columnDefs={columnDefs} />;
};
```

All examples in the documentation use `useState` for Column Definitions. However all code snippets in the documentation
leave these hooks out for easier reading.

It is also possible to define Columns using HTML Markup. We do not recommend this. This is for the same reason as above,
in that each time the parent component is rendered, a new set of Column Definitions is created and passed to the grid,
potentially resetting state of the Columns. By providing Column Definitions via JavaScript and via a grid property and
using React Hooks `useState` and / or `useMemo`), provides control on when new Column Definitions are provided to the grid.

```jsx
// do NOT define Columns in HTML like this
const App = () => {
    return (
        <AgGridReact>
            <AgGridColumn field="make"></AgGridColumn>
            <AgGridColumn field="model"></AgGridColumn>
        </AgGridReact>
    );
};
```

Recommending JavaScript instead of HTML for Column Definitions follows our rewrite of the Rendering Engine into React 
and our improved understanding of how React works.

If you are currently using HTML Column Definitions, it's fine to continue if you are not experiencing any unexpected 
Column State changes. We do not intend dropping support for HTML Column Definitions. However, going forward, you should 
prefer JavaScript Definitions and `useState`.

## Object Properties vs Simple Properties

For all other properties that are Objects, e.g. `sideBar` and `statusBar`, we also recommend `useState` or `useMemo`. If
you do not use these hooks, then you risk resetting the grid's state each time a render occurs. For example the Side Bar
will get initialised with new configuration from `sideBar` property if a new instance of this property is created on each render.

```jsx
const App = () => {

    // GOOD - only one instance created
    const sideBar = useMemo( ()=> {
        toolPanels: ['filters','columns']
    }, []);

    // BAD - each render could re-create the Status Bar in the grid
    const statusBar = {
        statusPanels: [ 
            { statusPanel: 'agTotalAndFilteredRowCountComponent' }
        ]
    };

    return (
        <AgGridReact sideBar={sideBar} statusBar={statusBar} />
    );
};
```

Properties of simple types (string, boolean and number) do not need to use hooks to prevent unnecessary grid state 
changes. This is because React uses JavaScript comparisons to determine if properties have changed, and JavaScript 
compares by value (not object references) for simple types.

```jsx
const App = () => {

    const rowBuffer = 0;
    const rowSelection = 'multiple';
    const animateRows = true;

    return (
        <AgGridReact 
            // variables assigned, no hooks, properties
            // only set once
            rowBuffer={rowBuffer} 
            rowSelection={rowSelection} 
            animateRows={animateRows} 

            // inline also works well, properties only set once
            rowModelType='clientSide'
            rowHeight="50"
            />
    );
};
```

## Callbacks

For callbacks (both [Event Listeners](/grid-events/) and [Grid Options](/grid-options/) that are functions), you can use
`useCallback()` if you wish, or you can also just set the callback into the grid.

Not using `useCallback()` has no adverse effect on the grid, as changing such does not have any impact on the grid state
(unlike Row Data and Column Definitions, which when changed, have immediate impact on the grid). Changing a callback 
means the new callback will be used next time it is needed.

If you do use `useCallback()`, make sure you set correct dependencies in order to avoid stale closures. We get many 
support issues due to application bugs resulting from stale closures.

```jsx
const App = () => {
    const [clickedCount, setClickedCount] = useState(0);

    // good callback, no hook, no stale data
    const onCellClicked = () => setClickedRow(clickedCount++);

    // bad callback - stale data, dependency missing,
    // will ALWAYS print 0
    const onCellValueChanged = useCallback( ()=> {
        console.log(`number of clicks is ${clickedCount}`);
    }, []);

    // good callback, no stale data
    const onFilterOpened = useCallback( ()=> {
        console.log(`number of clicks is ${clickedCount}`);
    }, [clickedRow]);

    return <AgGridReact 
                onCellClicked={onCellClicked} 
                onCellValueChanged={onCellValueChanged}
                onFilterOpened={onFilterOpened}
                />;
};
```

## Components

Custom Components can be referenced by Name or Direct Reference. This is explained in detail on the page 
[Registering Components](/components/). However, it made sense to make reference to it here, as it's to do with 
integrating with the wider React Rendering Engine.

We recommend referencing components directly, unless you have a reason to reference by name. Reasons to reference by 
name would include a) wanting to make Column Definitions pure JSON or b) wanting to override default components (such as
the default Header Component) provided by the grid.

We prefer Direct Reference as it results in nice looking Column Definitions.

We also recommend the use of `memo` around Components, to avoid wasted component renders on your Component.

Almost all of our examples, where Custom Components are used, are referenced directly. However the examples do not use
`memo` to avoid clutter in the example.

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

    return <AgGridReact columnDefs={columnDefs} />;
};
```

## Immutable Data

When using the grid against an Immutable Store, it's best to provide the callback `getRowId()` to allow the grid to 
identify rows. The grid is then able to identify Rows between new lists of Row Data. For example if Rows are selected, 
and new Row Data is provided such that some Rows are removed, the grid is able to maintain the selection across rows 
that exist in both the old and new lists of Row Data.

See [Updating Row Data](/data-update-row-data/) for more information.
