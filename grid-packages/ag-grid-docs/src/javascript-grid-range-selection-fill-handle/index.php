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
        When working with a Range Selection, a Fill Handle allows you to run operations on cells as you adjust the size of the range.
    </p>

    <? enterprise_feature("Fill Handle"); ?>

    <h2>Enabling the Fill Handle</h2>
    <p>
        To enable the Fill Handle, simply set <code>enableFillHandle</code> to <code>true</code> in the <code>gridOptions</code>.
    </p>

    <note>
        It's important to note that if you enable both <code>enableFillHandle</code> and <code>enableRangeHandle</code>,
        the Fill Handle will take precedence.
    </note>

    <h3>Example: Range Selection with Fill Handle</h3>

    <p>
        The example below demonstrates the basic features of the fill handle:

        <ul>
            <li>
                When a range of numbers is selected and that range is extended, the Grid will detect the linear progression of the
                selected items and fill the extra cells with calculated values.
            </li>
            <br>
            <li>When a range of strings or a mix of strings and numbers are selected and that range is extended, the range items
                will be copied in order until all new cells have been properly filled.
            </li>
            <br>
            <li>
                When a range of numbers is selected and the range is increased while pressing the <code>Option / Alt</code> key, the behaviour
                will be the same as when a range of strings or mixed values is selected.
            </li>
            <br>
            <li>
                When a single cell is selected and the range is increased, the value of that cell will be copied to the cells added to the range.
            </li>
            <br>
            <li>
                When a single cell containing a <strong>number</strong> value is selected and the range is increased while pressing the <code>Option / Alt</code> key,
                that value will be incremented (or decremented if dragging to the left or up) by the value of one until all new cells have been filled.
            </li>
            <br>
            <li>When reducing the size of the range, cells that are no longer part of the range will be cleared (set to <code>null</code>).</li>
        </ul>
    </p>

    <?= grid_example('Fill Handle', 'fill-handle', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h3>Example: Reducing the Range Size</h3>

    <p>
        If the behaviour for decreasing selection needs to be prevented, the flag <code>suppressClearOnFillReduction</code> should be set to <code>true</code>.
    </p>

    <?= grid_example('Fill Handle - Range Reduction', 'fill-handle-reduction', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Custom User Function</h2>

    <p>
        Often there is a need to use a custom method to fill values instead of simply copying values or increasing number
        values using linear progression. In these scenarios, the <code>fillOperation</code> callback should be used.
    </p>

    <p>
        The interface for <code>fillOperation</code> is as follows:
    </p>
    <snippet>
        // function for fillOperation
        function fillOperation(params: FillOperationParams) => any;

        // interface for params
        interface FillOperationParams {
            event: MouseEvent, // the MouseEvent that generated the fill operation
            values: any[], // the values that have been processed by the fill operation
            initialValues: any[], // the values that were present before processing started
            currentIndex: number, // index of the current processed value
            api: GridApi, // the grid API
            columnApi: ColumnApi, // the grid Column API
            context: any,  // the context
            direction: string // 'up', 'down', 'left' or 'right'
            column?: Column, // only present if direction is 'up' / 'down'
            rowNode?: RowNode // only present if direction is 'left' / 'right'
        }

        // example fillOperation
        gridOptions.fillOperation = function(params) {
            return 'Foo';
        }
    </snippet>

    <note>
        If a <code>fillOperation</code> callback is provided, the fill handle will always run it. If the current values are not
        relevant to the <code>fillOperation</code> function that was provided, <code>false</code> should be returned to allow
        the grid to process the values as it normally would.
    </note>

    <h3>Example: Using Custom User Functions</h3>

    <p> The example below will use the custom <code>fillOperation</code> for the <strong>Day of the week</strong> column, but it will
    use the default operation for any other column.
    </p>

    <?= grid_example('Custom Fill Operation', 'custom-fill-operation', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
