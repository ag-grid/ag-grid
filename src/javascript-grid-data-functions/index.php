<?php
$key = "Data Functions";
$pageTitle = "ag-Grid Data Functions";
$pageDescription = "With ag-Grid you can group, pivot and aggregate your data. The terms all relate to each other so here are the overview details you need to know to understand them.";
$pageKeyboards = "ag-Grid Data Functions Grouping Pivot Aggregation";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Data Functions</h2>

    <p>
        Data functions in ag-Grid are <b>row grouping</b>, <b>pivoting</b> and <b>aggregation</b>. All of these
        terms are related but each is a detailed topic by itself. Below gives a summary of the difference functions
        to help frame the detailed explanations.
    </p>

    <h4>Row Grouping</h4>
    <p>
        Rows in the grid are grouped into expandable groups. This is the standard grouping that one typically
        finds in data grids. Aggregation is optional when grouping.
    </p>

    <h4>Aggregation</h4>
    <p>
        When grouping or pivoting you may use aggregation to aggregate values, eg apply a <i>sum()</i> or
        <i>max()</i> on a column.
    </p>

    <h4>Pivoting</h4>
    <p>
        Rows in the grid are pivoted across columns making columns out of rows. Aggregation is mandatory for
        pivot as you need an aggregated value to pivot on.
    </p>

    <h4>AggFunc</h4>
    <p>
        An AggFunc (short for aggregation function) is the aggregation function you are applying to the value.
        Examples are <i>sum()</i> and <i>max()</i>. You can use built in functions or user provided functions.
    </p>

    <h4>Pivot Mode</h4>
    <p>
        Pivot mode is a mode of operation where the grid only focuses on columns that are included in
        a row grouping, aggregation or pivot. The rowData detail is also not shown (you cannot open up
        groups all the way down and view the lowest level detail). Pivot mode is similar to viewing
        a pivot table in a Excel.
    </p>

    <h4>Dimensions and Values</h4>
    <p>
        A <b>dimension</b> column is a column that typically has a set for values. For example the dimension Country
        can have values Ireland, United Kingdom, USA. When a column definition is marked as a dimension it informs
        the grid the column should be selectable for grouping and pivoting.
    </p>
    <p>
        The grid GUI will only allow grouping and pivoting by dimensions.
    </p>
    <p>
        A <b>value</b> column is a column that typically has numbers as values. For example the value column Bank Balance
        can have values £234,242 or £0.4441. When a column definition is marked as a value it informs
        the grid the column should be selectable for aggregations.
    </p>
    <p>
        The grid GUI will only allow aggregating by value columns.
    </p>
    <p>
        Dimension and values are industry standard ideas in data warehousing. See wikipedia for definitions
        on <a href="https://en.wikipedia.org/wiki/Dimension_(data_warehouse)">Dimensions</a> and
        <a href="https://en.wikipedia.org/wiki/Measure_(data_warehouse)">Measures</a> (values are more accurately
        called 'measures' in data warehousing, however we choose to call them 'values' in ag-Grid to be consistent
        with Excel pivoting).
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
