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
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [rowData, setRowData] = useState([
        { athlete: "Michael Phelps", age: 25 },
        { athlete: "Michael Phelps", age: 30 }
    ]);

    function useDynamicCallback(callback) {
        const ref = useRef();
        ref.current = callback;
        return useCallback((...args) => ref.current.apply(this, args), []);
    }

    const onGridReady = params => {
        setGridApi(params.api);
    };

    const navigateToNextCell = params => {
        var previousCell = params.previousCellPosition,
            suggestedNextCell = params.nextCellPosition,
            nextRowIndex,
            renderedRowCount;
        switch (params.key) {
            case KEY_DOWN:
                nextRowIndex = previousCell.rowIndex - 1;
                if (nextRowIndex < -1) {
                    return null;
                }
                return {
                    rowIndex: nextRowIndex,
                    column: previousCell.column,
                    floating: previousCell.floating
                };
            case KEY_UP:
                nextRowIndex = previousCell.rowIndex + 1;
                renderedRowCount = gridApi.getModel().getRowCount();
                if (nextRowIndex >= renderedRowCount) {
                    return null;
                }
                return {
                    rowIndex: nextRowIndex,
                    column: previousCell.column,
                    floating: previousCell.floating
                };
            case KEY_LEFT:
            case KEY_RIGHT:
                return suggestedNextCell;
            default:
                throw "this will never happen, navigation is always one of the 4 keys above";
        }
    };

    return (
        <div
            style={{ width: "500px", height: "500px" }}
            className="ag-theme-alpine"
        >
            <AgGridReact
                rowData={rowData}
                navigateToNextCell={navigateToNextCell}
                onGridReady={onGridReady}
            >
                <AgGridColumn field="athlete" headerName="Name" minWidth={170} />
                <AgGridColumn field="age" />
            </AgGridReact>
        </div>
    );
};
```

Here the expectation is that on up key the focus would move down, and on the down key the focus would move up.

The problem here is that the `gridApi` in `navigateToNextCell` has been "captured" (or "closed over") before it's been set
and subsequent updates to it will not be reflected in later calls.

What we need to do to resolve this is to alter about our approach slightly - in the case of callbacks like this we want to have
a "dynamic" callback which will always capture the latest values used:

```jsx
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [rowData, setRowData] = useState([
        { athlete: "Michael Phelps", age: 25 },
        { athlete: "Michael Phelps", age: 30 }
    ]);

    function useDynamicCallback(callback) {
        const ref = useRef();
        ref.current = callback;
        return useCallback((...args) => ref.current.apply(this, args), []);
    }

    const onGridReady = params => {
        setGridApi(params.api);
    };

    const navigateToNextCell = useDynamicCallback((params) => {
        var previousCell = params.previousCellPosition,
            suggestedNextCell = params.nextCellPosition,
            nextRowIndex,
            renderedRowCount;
        switch (params.key) {
            case KEY_DOWN:
                nextRowIndex = previousCell.rowIndex - 1;
                if (nextRowIndex < -1) {
                    return null;
                }
                return {
                    rowIndex: nextRowIndex,
                    column: previousCell.column,
                    floating: previousCell.floating
                };
            case KEY_UP:
                nextRowIndex = previousCell.rowIndex + 1;
                renderedRowCount = gridApi.getModel().getRowCount();
                if (nextRowIndex >= renderedRowCount) {
                    return null;
                }
                return {
                    rowIndex: nextRowIndex,
                    column: previousCell.column,
                    floating: previousCell.floating
                };
            case KEY_LEFT:
            case KEY_RIGHT:
                return suggestedNextCell;
            default:
                throw "this will never happen, navigation is always one of the 4 keys above";
        }
    });

    return (
        <div
            style={{ width: "500px", height: "500px" }}
            className="ag-theme-alpine"
        >
            <AgGridReact
                rowData={rowData}
                navigateToNextCell={navigateToNextCell}
                onGridReady={onGridReady}
            >
                <AgGridColumn field="athlete" headerName="Name" minWidth={170} />
                <AgGridColumn field="age" />
            </AgGridReact>
        </div>
    );
};
```

By making use of `useRef` and `useCallback` in our new method `useDynamicCallback` we ensure that all values within the
supplied function will be the latest value.

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

