
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
