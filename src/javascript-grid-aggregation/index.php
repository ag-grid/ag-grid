<?php
$key = "Aggregation";
$pageTitle = "ag-Grid Aggregation";
$pageDescription = "One of the most powerful features of ag-Grid is it's ability to aggregate data. Learn how to aggregate using ag-Grid";
$pageKeyboards = "ag-Grid JavaScript Grid Aggregation";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Aggregation</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Aggregation rows is available in ag-Grid Enterprise.
    </p>

    <h3>Grouping with Aggregation</h3>

    <p>
        When grouping, you can apply an aggregation function to any column to populate the group
        row with values. You can pick from the grid's built in aggregation functions or
        provide your own.
    </p>
    <p>
        <b>Built In Functions: </b>Out of the box the grid provides <i>sum, min, max,
            first, last</i>. To use one of these, set <i>colDef.aggFunc</i> to the string
        of the function you require.
    </p>
    <p>
        <b>User Provided Functions: </b>To provide your own function, set <i>colDef.aggFunction</i>
        to your custom function. The function will be provided with an array of values that it should
        aggregate onto one value that it then returns.
    </p>

        <pre><code>// column that uses the built in 'sum' function
colDef1.aggFunc = 'sum';

// column that uses a user provided function
colDef2.aggFunc = function(values) {
    var sum = 0;
    values.forEach( function(value) {sum += value;} );
    return sum;
}
</code></pre>

    <h4>Example Option 1 - Simple Summing</h4>

    <p>
        The example below shows simple sum aggregation on fields gold, silver, bronze and total.
    </p>
    <p>
        The example also shows the use of a grouping column. The grouping column is specified in the grid options.
        By specifying the grouping column (and not relying on the default column) the column header name is set,
        and also the field to use for the leaf nodes (the athlete name).
    </p>

    <show-example example="example2"></show-example>

    <h4>Example Option 2 - Custom Aggregation Functions</h4>

    <p>
        The example below shows a complex custom aggregation over age giving
        a min and a max age. The aggregation function takes an array of rows and returns
        one row that's an aggregate of the passed rows. The function knows whether
        it is working with leaf nodes or aggregated nodes by checking the type of the value.
    </p>

    <p>
        The age columns is aggregated a second time with a custom average function.
        The average function also needs to know if it is working with leaf nodes or
        group nodes, as if it's group nodes then the average is weighted.
    </p>

    <p>
        This example also demonstrates configuring the group column along with the other columns. If the
        grouping was turned off (via the API or the tool panel), the group column would remain in the grid.
    </p>

    <show-example example="example4"></show-example>

    <h3>Grouping with Aggregation - using groupRowAggNodes Callback</h3>

    <p>
        Using <i>colDef.aggFunc</i> is the preferred way of doing aggregations. However you may find scenarios
        where you cannot define your aggregations with respect to row values alone. Maybe you are aggregating
        sales records in different currencies and you need to read the currency code from another column and then
        convert the record to a common currency for aggregation - the point being you need data from more than
        just one column, or you want to put the results into different columns to the inputs for the calculation.
        For that reason, you can take control of the row aggregation by providing a groupRowAggNodes function as a grid callback.
    </p>

    <note>
        Using <i>colDef.aggFunc</i> is the preferred way of doing aggregations, only use <i>groupRowAggNodes</i>
        if you cannot achieve what you want as it will make your code more complex and be less likely to work with
        future grid features like pivoting.
    </note>

    <p>
        For groups, when aggregating, the grid stores the results in the colId of the column. For example, if you
        have a group defined as follows:
        <pre>colDef = {
    field: 'abby',
    valueGetter: 'data.a + data.b',
    colId: 'aaa'
}</pre>
    Then the result of the aggregation will be stored in <i>data.aaa</i> and not in 'abby'. Most of the time this
    will not matter for you as the colId will default to the field if colId is missing and it doesn't violate uniqueness.
    You need to be aware of this, as if you store the result in a place other than the colId, it won't work.
    </p>

    <p>
        Below shows a contrived example using <i>groupRowAggNodes</i>. The example makes no sense, however it
        serves the demonstration. It takes the number of medals as inputs and creates two outputs, one as a normal
        sum and another by multiplying the result by Math.PI.
    </p>

    <show-example example="exampleGroupRowAggNodes"></show-example>

    <h4>suppressUseColIdForGroups</h4>

    <p>
        If you wish the grid to get the values as normal from the groups (ie fields and valueGetters) and not depend
        on the colId then you can override this behaviour by setting the grid property
        <i>suppressUseColIdForGroups=true</i>.
    </p>

    <h3>Recomputing Aggregates</h3>

    <p>
        If the data changes after the aggregation is done, you can tell the grid to recompute the aggregates.
        This is through throw the api method <i>recomputeAggregates</i>. For example, if you allow editing,
        and want the aggregates to update as new values are edited, then create code like the following:

        <pre>// add a listener to the editable colDef
colDef.onCellValueChanged = function() {
    gridOptions.api.recomputeAggregates();
}</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>