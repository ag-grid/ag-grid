<?php
$key = "ColumnController";
$pageTitle = "Javascript Grid Column Controller";
$pageDescription = "ag-Grid has a column controller for managing columns. This page explains how all the columns work.";
$pageKeyboards = "ag-Grid Column Controller";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Column Controller</h2>

    <p>
        <ul>
            <li>
                inMemoryRowModel.refreshModel()
                <ul>
                    <li>
                        inMemoryRowModel.doRowGrouping()
                    </li>
                    <li>
                        inMemoryRowModel.doFilter()
                    </li>
                    <li>
                        inMemoryRowModel.doPivot() -> pivotService.execute()
                        <ul>
                            <li>
                                pivotService.bucketUpRowNodes()
                            </li>
                            <li>
                                if (newUniqueValues)
                                <ul>
                                    <li>
                                        pivotService.createPivotColumnDefs()
                                    </li>
                                    <li>
                                        columnController.onPivotValueChanged()
                                        <ul>
                                            <li>
                                                columnController.setupGridColumns()
                                            </li>
                                            <li>
                                                columnController.buildDisplayedFromGrid()
                                            </li>
                                            <li>
                                                eventService.dispatchEvent(pivotValueChanged)
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        inMemoryRowModel.doAggregate()
                    </li>
                    <li>
                        inMemoryRowModel.doSort()
                    </li>
                    <li>
                        inMemoryRowModel.doRowsToDisplay()
                    </li>
                </ul>
            </li>
        </ul>
    </p>
    
    <h2>Alternative vs Original</h2>
    
    <p>
        <ul>
            <li>Filters always on Original</li>
            <li>Sorting switch between Original and Alternative</li>
        </ul>
    </p>
    
    <h3>Original Columns</h3>

    <p>
        originalBalancedTree, originalColumns, originalHeaderRowCount
    </p>

    <h3>Grid Columns</h3>

    <p>
        gridBalancedTree, gridColumns, gridHeaderRowCount
    </p>

    <h3>Displayed Columns</h3>

    <p>
        displayedLeftColumnTree, displayedRightColumnTree, displayedCentreColumnTree <br/>
        displayedLeftColumns, displayedRightColumns, displayedCenterColumns
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
