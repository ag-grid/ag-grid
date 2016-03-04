<?php
$key = "Expressions and Context";
$pageTitle = "Grid Expressions and Context Example";
$pageDescription = "Angular Grid Expressions and Context example. Learn how to build a grid using Expressions and Context from Angular Grid";
$pageKeyboards = "AngularJS Angular Grid expressions Context";
include '../documentation_header.php';
?>

<div>

    <h2>Expressions and Context</h2>

    <p>
        Below shows extensive use of value getters (using expressions) and class rules (again using expressions).
        The grid shows 'actual vs budget data and yearly total' for widget sales split by city and country.
    </p>

    <p>
        <b>Location</b> column is showing the aggregation groups, grouping by city and country.
    </p>

    <p>
        <b>Months</b> are effected by the context. The data displayed is either x_act or x_bud data for the month
        (eg jan_act when jan is green, or jan_bud when jan is red). Likewise the background color is also
        changed using class rules dependent on the selected month.
    </p>

    <p>
        <b>Total</b> is the total 'actual' figures display, ie adding up all the green. This also changes (which
        columns to include) as the month is changed.
    </p>

    <p>
        Notice that the example (including calculating the expression on the fly, the grid only calculates
        what's needed to be displayed) runs very fast (once the data is loaded) despite over 6,000 rows.
    </p>

    <p>
        This example is best viewed by opening it in a new tab (click the link on the top right of the example).
    </p>

    <show-example example="monthlySales"></show-example>

</div>

<?php include '../documentation_footer.php';?>
