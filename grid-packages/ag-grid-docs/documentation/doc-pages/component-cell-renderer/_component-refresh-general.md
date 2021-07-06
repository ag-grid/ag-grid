|### Events Causing Refresh
|
|The grid can refresh the data in the browser, but not every refresh / redraw of the grid results in the refresh method
|of your cell renderer getting called. The following items are those that **do** cause refresh to be called:
|
|- Calling `rowNode.setDataValue(colKey, value)` to set a value directly onto the `rowNode`. This is the preferred API way to change one value from outside of the grid.
|- When editing a cell and editing is stopped, so that cell displays new value after editing.
|- Calling `api.refreshCells()` to inform grid data has changed (see [Refresh](/view-refresh/)).
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
|### Grid vs Component Refresh
|
|The refresh method returns back a boolean value. If you do not want to handle the refresh in the cell renderer, just return back `false` from an otherwise empty method. This will indicate to the grid that you did not refresh and the grid will instead destroy the component and create another instance of your component from scratch instead.
|
