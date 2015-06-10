<?php
$key = "Sorting";
$pageTitle = "AngularJS Angular Grid Sorting";
$pageDescription = "AngularJS Angular Grid Sorting";
$pageKeyboards = "AngularJS Angular Grid Sorting";
include '../documentation_header.php';
?>

<div>

    <h2>Sorting</h2>

    <h4>Enable Sorting</h4>

    <p>
        Turn sorting on for the grid by enabling sorting in the grid options.
    </p>

    <p>
        Sort a column by clicking on the column header. To do multi-column sorting,
        hold down shift while clicking the column header.
    </p>

    <h4>Custom Sorting</h4>

    <p>
        Custom sorting is provided at a column level by configuring a comparator on the column definition.
        The sort methods gets the value as well as the entire data row.
    </p>

    <pre>
colDef.comparator = function (value1, value2, data1, data2) {
    return value1 - value2;
}</pre>

    <p>
        Example below shows custom sorting on the Date column.
    </p>

    <show-example example="example1"></show-example>

    <h4>Sorting API</h4>

    <p>
        Sorting can be controlled via the Sorting API via the following methods:
        <ul>
        <li><b>setSortModel(sortModel):</b> To set the sort.</li>
        <li><b>getSortModel():</b> To return the state of the currently active sort.</li>
    </ul>
    </p>

    <p>
        Both methods work with a list of sort objects, each object containing a sort field
        and direction. The order of the sort objects depicts the order in which the columns
        are sorted. For example, the below array represents the model of firstly sorting
        by country ascending, and then by sport descending.
    </p>

    <pre>[
    {field: country, sort: 'asc'},
    {field: sport, sort: 'desc'}
]</pre>

    <p>
        The example below shows the API in action.
    </p>

    <show-example example="sortingApi"></show-example>

</div>

<?php include '../documentation_footer.php';?>
