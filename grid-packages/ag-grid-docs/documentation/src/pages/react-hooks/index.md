---
title: "React Hooks & Functional Components"
frameworks: ["react"]
---

### React Hooks

React Hooks are fully supported within ag-Grid - please refer to our working example in
<a href="https://github.com/ag-grid/ag-grid-react-example/">GitHub</a>.

We can break down the type of Hooks you can use within ag-Grid into two broad categories - those
that have lifecycle methods (such as Filters) and those that don't (such as Cell Renderers).

## Hooks without Lifecycle Methods

Cell Renderers, Loading Cell Renderers and Overlay Components are examples of components without lifecycle methods.

For this type of Hook you don't have to do anything special and the Hook should work as
expected within ag-Grid, although it would often be easier to simply use a functional component
in these cases (as there won't be any state to maintain).

## Hooks with Lifecycle Methods

Filters, Cell Editors and Floating Filter Components are examples of components that have
mandatory lifecycle methods.

For these types of components you'll need to wrap your hook with `forwardRef` and then expose
Grid related lifecycle methods  `useImperativeHandle`, for example:

### Hook Cell Editor

```jsx
import React, { useEffect, forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef((props, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
        return {
            getValue: () => {
                return inputRef.current.value;
            }
        };
    });
    return <input type="text" ref={ inputRef } defaultValue={ props.value }/>;
})
```

### Hook Filter

```jsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef((props, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
        return {
            isFilterActive() {
                return inputRef.current.value !== '';
            },

            doesFilterPass: (params) => {
                return params.data.price.toString() === inputRef.current.value;
            }
        };
    });

    return <input type="text" ref={inputRef} onChange={() => props.filterChangedCallback()}/>;
})
```

The same applies to any other component to be used within the grid that requires lifecycle methods to be present.

Please refer to our [Components](../components/) documentation for working examples for the specific
type of component you're interested in.

## Avoiding State Closures (i.e. old props values)

A common issue that React hook users will encounter is capturing old values in a closure - this is not unique to React
but is a common issue with JavaScript in general, but it is something that is more common when using Hooks.

An example of this (in the context of using ag-Grid) would be something like this:

```jsx
const Grid = (props) => {
  const [rowData, setRowData] = useState([]);
  
  const columns = [
    { field: 'firstName' },
    { 
      field: 'lastName', 
      valueSetter: params => handleLastNameChanging(params.data, params.newValue),
      editable: true 
    },
  ];

    return (
    <div className="ag-theme-balham" style={{ height: '500px' }}>
        <AgGridReact
          onGridReady={handleGridReady}
          rowData={rowData || []}
          columnDefs={columns}
        />
    </div>
  );

  function handleLastNameChanging(item, nextValue) {
    const nextData = rowData.map(dataItem => {
      if (dataItem.id !== item.id) {
        return dataItem;
      }

      return {
        ...dataItem,
        lastName: nextValue,
      };
    });
    
    setRowData(nextData);

    return true;
  }
};
```

Here the expectation is that on editing a `lastName` cell the data the `rowData` data set would be updated and this would
eventually flow back down through the hook and update the Grid.

The problem here is that the `rowData` in `handleLastNameChanging` has been "captured" (or "closed over") and subsequent updates to it
will not be reflected in later calls.

What we need to do to resolve this is to think about our approach slightly differently - let's leverage what hooks offer us 
with `useEffect` and let that do our updates for us.

```jsx
const Grid = (props) => {
  const [rowData, setRowData] = useState([]);
  const [editingState, setEditingState] = useState(null);

  const columns = [
    { field: 'firstName' },
    { 
      field: 'lastName', 
      valueSetter: params => setEditingState({ item: params.data, newValue: params.newValue }),
      editable: true 
    },
  ];
  
  useEffect(() => {
    if (!!editingState) {
      handleLastNameChanging(
        rowData,
        editingState.item,
        editingState.newValue
      );
    }
  }, [editingState]);

  return (
    <div className="ag-theme-balham" style={{ height: '500px' }}>
        <AgGridReact
          onGridReady={handleGridReady}
          rowData={rowData || []}
          columnDefs={columns}
        />
    </div>
  );

  function handleLastNameChanging(currentRowData, item, nextValue) {
    const nextData = currentRowData.map(dataItem => {
      if (dataItem.id !== item.id) {
        return dataItem;
      }

      return {
        ...dataItem,
        lastName: nextValue,
      };
    });
    
    setRowData(nextData);

    return true;
  }
};
```

What we're doing here is updating `editingState` when our `valueSetter` is invoked, and making use of a `useEffect` to trigger when this 
state changes.

This allows `handleLastNameChanging` to be passed the latest data and update `rowData` correctly.

This is a fairly common React pattern - you could achieve the same thing with `useCallback` or `useRef`. 

## Rendering Null

If you don't want to output anything on `render` then return an empty string rather than `null`.

If you return `null` then React simply won't render the component and the Grid is unable to
determine if this is by design or an error.

```js
function myRenderer({ data }) {
    if (!data.value) {
        return ''; // not null!
    }

    return (
        data.value
    );
}
```
