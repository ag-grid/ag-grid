[[only-react]]
|### Events Causing Refresh
|
|When the grid can refresh a cell (instead of replacing it altogether) then the update can occur in one of two ways:
|
|- A component will have it's props refreshed, with all corresponding lifecycle methods called (i.e. `componentWillReceiveProps`, `getDerivedStateFromProps`)
|- A `refresh` method that you implement will be called
|
|If you provide a `refresh` method then this method will be called over the component's props being refreshed.
|
|Note that if you're using Hooks for a Cell Renderer and decide to implement the `refresh` method then you'll need to expose it with
|`forwardRef` & `useImperativeHandle`. Please refer to the [Hook](/react-hooks/) documentation (or the examples on this page) for more information.
|
|In the context of "refresh" being referenced from here on then it'll refer to either of the mechanisms above, whichever you choose to implement.
|
|The grid can refresh the data in the browser, but not every refresh / redraw of the grid results in the refresh method of your cell renderer getting called, or for props to be updated.
|
|The following items are those that **do** cause refresh to be called:
|
|- Calling `rowNode.setDataValue(colKey, value)` to set a value directly onto the `rowNode`. This is the preferred API way to change one value from outside of the grid.
|- When editing a cell and editing is stopped, so that cell displays new value after editing.
|- Calling `api.refreshCells()` to inform grid data has changed (see [Refresh](/view-refresh/)).
|- Bound `rowData` changes and `immutableData` is set (see [Immutable Data](/immutable-data/)).
|
|If any of the above occur and the grid confirms the data has changed via [Change Detection](/change-detection/), then the `refresh()` method will be called.
|
|The following will **not** result in the cell renderer's refresh method being called:
|
|- Calling `rowNode.setData(data)` to set new data into a `rowNode`. When you set the data for the whole row, the whole row in the DOM is recreated again from scratch.
|- Scrolling the grid vertically causes columns (and their containing cells) to be removed and inserted due to column virtualisation.
|
|All of the above will result in the component being destroyed and recreated.
|
|[[note]]
||If the grid cannot safely determine a given row then cell components will always be replaced, instead of refreshed - as such
||we strongly encourage [Immutable Data](/immutable-data/) be used whenever possible.
||
||Doing so will allow AG Grid to intelligently determine which cells have changed in a given update and only refresh those cells.
||
||Using Immutable Data is analogous to providing a `key` to an array of components in React - it allows for cells to be refreshed (if possible) instead
||of being replaced.
|
|### Grid vs Component Refresh
|
|If you choose to implement the `refresh` method, then note that this method returns back a boolean value. If you do not
|want to handle the refresh in the cell renderer, just return back `false` from an otherwise empty method. This will
|indicate to the grid that you did not refresh and the grid will instead destroy the component and create another instance of your component from scratch instead.
