
Todo:
-> Change events to proper events
-> Change how selection works (ie remove selectedRows)

Names of Column Events Changed:

Changed:
everything -> columnEverythingChanged
pivot -> columnPivotChanged
value -> columnValueChanged
pinnedCountChanged -> columnPinnedCountChanged

No change:
columnMoved -> columnMoved
columnVisible -> columnVisible
columnGroupOpened -> columnGroupOpened
columnResized -> columnResized

forEachInMemory now replaced with:

forEachNode(callback) - same as what forEachInMemory was.
forEachNodeAfterFilter(callback) -
forEachNodeAfterFilterAndSort(callback) -




dontUseScrolls -> forPrint

// remove onNewRows and onNewCols


best practices for Web Components:
http://webcomponents.org/articles/web-components-best-practices/


web component changes:
agile-grid is now ag-grid


awk -> is now ag  (only bothers TypeScript people)

Events merged into one.


Dist file names all changed.

npm package is now ag-Grid (not angular-grid)

angular module is now agGrid (not angularGrid)

angularGrid global func is now agGridGlobalFunc

api setRows is now setRowData

selectedNodesById and selectedRows are no longer in gridOptions. data out of the grid is now pushed through events (but you can also query it via the api).
