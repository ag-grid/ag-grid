[[only-react]]
|### Events Causing Refresh
|
|When the grid can refresh a cell (instead of replacing it altogether) then the update will occur as follows:
|
|- For class components, `componentWillReceiveProps`, `getDerivedStateFromProps` will get called and the function re-rendered.
|- For functional components, the function will get called gain with new props.
|
|The grid can refresh the data in the browser, but not every refresh / redraw of the grid results in the refresh of your cell renderer.
|
|The following items are those that **do** cause refresh to be called:
|
|- Calling `rowNode.setDataValue(colKey, value)` to set a value directly onto the `rowNode`. This is the preferred API way to change one value from outside of the grid.
|- When editing a cell and editing is stopped, so that cell displays new value after editing.
|- Calling `api.refreshCells()` to inform grid data has changed (see [Refresh](/view-refresh/)).
|- Bound `rowData` changes and `immutableData` is set (see [Immutable Data](/immutable-data/)).
|
|If any of the above occur and the grid confirms the data has changed via [Change Detection](/change-detection/), then the Cell Renderer is refreshed.
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
