<?php
$pageTitle = "Fill Handle: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Range Selection Fill Handle. Drag the mouse over cells to create a Range Selection, the last cell will contain a handle ta can be dragged to run tasks on the new range. Version 21 is available for download now, take it for a free two month trial.";
$pageKeyboards = "range selection fill handle javascript grid ag-grid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 class="heading-enterprise">Fill Handle</h1>

    <p class="lead">
        When working with a Range Selection, it might be useful to have a fill inside the last cell
        to help run operations on cells as you increase or decrease the size of the range.
    </p>

    <? enterprise_feature("Fill Handle"); ?>

    <h2>Range Selection Examples with Fill Handle</h2>

    <h3>Default Example</h3>

    <p>
        The example below demonstrates the basic features of the fill handle that are described by: 

        <ul>
            <li>When a range of strings or a mix of strings and numbers are selected and that range is extended, the range items 
                will be copied in order until all new cells have been properly filled.
            </li>
            <li>
                When a range of numbers is selected and that range is extended, the Grid will detect the linear progression of the 
                selected items and fill the extra cells with calculated values.
            </li>
            <li>
                When a range of numbers is selected and the range is increased while pressing the <code>option / alt</code> key, the behavior
                will be the same as when a range of strings or mixed values is selected.
            </li>
            <li>When reducing the size of the range, cells that are no longer part of the range will be cleared (set to null).</li>
        </ul>
    </p>

    <?= example('Fill Handle', 'fill-handle', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h3>Reducing the Range Size</h3>

    <p>
        If the behavior for decreasing selection needs to be prevented, the flag <code>suppressClearOnFillReduction</code> should be set to true.
    </p>

    <?= example('Fill Handle - Range Reduction', 'fill-handle-reduction', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h3>Custom User Function</h3>

    <p>
        Often times, there is a need to use a custom list to fill values instead of simply copying values or increasing number 
        values using liner progression. On these scenarios, the <code>fillOperation</code> callback should be used.
    </p>

    <p>
        The interface for <code>fillOperation</code> callback is as follows:
    </p>
    <snippet>
        // function for fillOperation
        function fillOperation(params: FillOperationParams) => any;

        // interface for params
        interface FillOperationParams {
            event: MouseEvent, // The MouseEvent that generated the fill operation
            values: any[], // The values that have been processed by the fill operation
            initialValues: any[], // The values that were present before processing started
            currentIndex: number, // Index of the current processed value
            api: GridApi, // the grid API
            columnApi: ColumnApi, // the grid Column API
            context: any,  // the context
            direction: string // up, down, left or right
            column?: Column, // only present if direction is up / down
            rowNode?: RowNode // only present if direction is left / right
        }

        // example fillOperation
        gridOptions.fillOperation = function(params) {
            return 'Foo';
        }
    </snippet>

    <note>
        If a fillOperation callback is provided, the fillHandle will always run it. If the current values are not
        relevant to the fillOperation function that was provided, <code>false</code> should be returned to allow 
        the grid to process the values as it normally would.
    </note>

    <p> The example below will use the custom <code>fillOperation</code> for the <strong>Day of the week</strong> column, but it will
    use the default operation for any other column.
    </p>


    <?= example('Custom FillOperation', 'custom-fill-operation', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
