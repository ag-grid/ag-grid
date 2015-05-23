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


    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
