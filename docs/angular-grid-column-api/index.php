<?php
$key = "Column API";
$pageTitle = "AngularJS Angular Column API";
$pageDescription = "Angular Grid allows you to save and restore the column state. This includes column widths, agg fields and visibility.";
$pageKeyboards = "AngularJS Angular Column API";
include '../documentation_header.php';
?>

<div>

    <h2>Column API</h2>

    <h3>Show / Hide Columns</h3>

    <p>
        To show and hide columns via the API, use the methods:
    <ul>
        <li><b>api.hideColumn(colId, hide)</b>: To show / hide a specific column, where colId = the id of the
            column you want to show / hide and hide = true to hide, false to show.</li>
        <li><b>api.hideColumns(colIds, hide)</b>: Same as above, but you pass a list of column id's in.</li>
    </ul>

    <h3>Save / Restore Full State</h3>

    <p>
        The show / hide above shows and hides specific columns. It is also possible to store the
        entire state of the columns and restore them again. This includes visibility (overlaps with the
        above), width, pivots and values.
    </p>

    <ul>
        <li><b>api.getColumnState()</b>: Returns the state of a particular column.</li>
        <li><b>api.setColumnState(state)</b>: To set the state of a particular column.</li>
    </ul>

    <p>
        The methods above get and set the state. The result is a Javascript array object that
        can be converted to / from JSON. An example of what the JSON might look like is as follows:
    </p>

<pre>[
{colId: "athlete", aggFunc: "sum",  hide: false, pivotIndex: 0,    width: 150},
{colId: "age",     aggFunc: null,   hide: true,  pivotIndex: null, width: 90}
]
</pre>

    <p>
        It is intended that the values in the json mimic the values in the column definitions.
        So if you want to re-apply the state to a set of column definitions as the default
        values, override the values of the same name in the corresponding column definition.
    </p>

    <p>
        The values have the following meaning:
    <ul>
        <li><b>colId</b>: The ID of the column. See
            <a href="angular-grid-column-definitions/index.php">column definitions</a> for explanation
            of column ID</li>
        <li><b>aggFunc</b>: If this columns is a value column, this field specifies the aggregation function.
        If the column is not a value column, this field is null.</li>
        <li><b>hide</b>: True if the column is hidden, otherwise false.</li>
        <li><b>pivotIndex</b>: The index of the pivot. If the column is not pivoted, this field is null.
        If multiple columns are used to pivot, this index provides the order of the pivot.</li>
        <li><b>width</b>: The width of the column. If the column was resized, this reflects the new value.</li>
    </ul>
    </p>

    <show-example example="columnStateExample"></show-example>
</div>

<?php include '../documentation_footer.php';?>
