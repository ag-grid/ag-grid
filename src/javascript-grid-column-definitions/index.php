<?php
$key = "ColumnDefs";
$pageTitle = "Column Definitions";
$pageDescription = "ag-Grid Column Definitions";
$pageKeyboards = "ag-Grid Column Definitions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>
    <h2 id="columnDefinitions">Columns Definitions</h2>

    <p>
        Each column in the grid is defined using a column definition. To avoid duplicating column properties when defining
        columns, there are also options to create a default column properties, default column group properties and specific
        column types.
    </p>

    <ul>
        <li><b>columnDefs:</b>  contains the columns definitions in the grid.</li>
        <li><b>defaultColDef (Optional):</b> contains column properties all columns will inherit.</li>
        <li><b>defaultColGroupDef (Optional):</b> contains column group properties all column groups will inherit.</li>
        <li><b>columnTypes (Optional):</b> specific column types containing properties that column definitions can inherit.</li>
    </ul>

    <note>
        Default columns and column types can specify any of the <a href="../javascript-grid-column-properties/">column properties</a> available on a column.
    </note>

    <p>
        The section on <a href="../javascript-grid-grouping-headers/">column groups</a> details how to group columns in the headers.
    </p>

    <p>
        The column definition options shown above can be used as follows:
    </p>

    <pre>var gridOptions = {
    rowData: myRowData,

    <span class="codeComment">// define columns</span>
    columnDefs: {
        <span class="codeComment">// uses the default column properties</span>
        {headerName: 'Col A', field: 'a'}

        <span class="codeComment">// overrides the default with a number filter</span>
        {headerName: 'Col B', field: 'b', filter: 'number'}

        <span class="codeComment">// overrides the default using a column type</span>
        {headerName: 'Col C', field: 'c', type: 'nonEditableColumn'}

        <span class="codeComment">// overrides the default using a multiple column types</span>
        {headerName: 'Col C', field: 'c', type: 'dateColumn,nonEditableColumn'}
    },

    <span class="codeComment">// a default column definition with properties that get applied to every column</span>
    defaultColDef: {
        <span class="codeComment">// set every column width</span>
        width: 100,
        <span class="codeComment">// make every column editable</span>
        editable: true,
        <span class="codeComment">// make every column use 'text' filter by default</span>
        filter: 'text'
    },

    <span class="codeComment">// if we had column groups, we could provide default group items here</span>
    defaultColGroupDef: {}

    <span class="codeComment">// define a column type (you can define as many as you like)</span>
    columnTypes: {
        "nonEditableColumn": {editable: false},
        "dateColumn": {
            // specify we want to use the date filter
            filter: 'date',

            // add extra parameters for the date filter
            filterParams: {
                // provide comparator function
                comparator: function (filterLocalDateAtMidnight, cellValue) {

                    // In the example application, dates are stored as dd/mm/yyyy
                    // We create a Date object for comparison against the filter date
                    var dateParts = cellValue.split("/");
                    var day = Number(dateParts[2]);
                    var month = Number(dateParts[1]) - 1;
                    var year = Number(dateParts[0]);
                    var cellDate = new Date(day, month, year);

                    // Now that both parameters are Date objects, we can compare
                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    } else if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }

    <span class="codeComment">// other grid options here...</span>
}</pre>

    <p>Columns are positioned into the grid according to the order they are specified columnDef's in the grid options.</p>

    <p>
        When the grid creates a column it applies an order of precedence when selecting the properties to use when there is more to choose from.
        As an example, these are the steps used when creating 'Col C' shown above:
    </p>


<pre><span class="codeComment">// Step 1: start with an empty column definition</span>
{}

<span class="codeComment">// Step 2: select the default column properties</span>
{width: 100, editable: true, filter: 'text'}

<span class="codeComment">// Step 3: merge the column type properties (using the 'type' property)</span>
{width: 100, editable: false, filter: 'number'}

<span class="codeComment">// Step 4: finally merge in the colDef properties</span>
{headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'number'}
    </pre>

    <p>
        The following examples demonstrates these column definitions in action:
    </p>

<show-example example="columnDefinitionExample"></show-example>

<?php include '../documentation-main/documentation_footer.php';?>
