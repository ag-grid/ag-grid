---
title: "Fine Tuning"
frameworks: ["react"]
---

This section describes some of the finer grain tuning you might want to do with your React & AG Grid application.

## Avoiding Stale Closures (i.e. old props values)

A common issue that React hook users will encounter is capturing old values in a closure - this is not unique to React
but is a common issue with JavaScript in general, but it is something that is more common when using Hooks.

An example of this (in the context of using AG Grid) would be something like this:

```jsx
const KEY_LEFT = 'ArrowLeft';
const KEY_UP = 'ArrowUp';
const KEY_RIGHT = 'ArrowRight';
const KEY_DOWN = 'ArrowDown';

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
const KEY_LEFT = 'ArrowLeft';
const KEY_UP = 'ArrowUp';
const KEY_RIGHT = 'ArrowRight';
const KEY_DOWN = 'ArrowDown';

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

## Row Data Control

By default the AG Grid React component will check props passed in to determine if data has changed 
and will only re-render based on actual changes.

For `rowData` we provide an option for you to override this behaviour by the `rowDataChangeDetectionStrategy` property:

```jsx

<AgGridReact
    onGridReady={this.onGridReady}
    rowData={this.state.rowData}
    rowDataChangeDetectionStrategy={ChangeDetectionService.IdentityCheck}
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

