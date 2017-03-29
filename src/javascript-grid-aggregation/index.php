<?php
$key = "Aggregation";
$pageTitle = "ag-Grid Aggregation";
$pageDescription = "One of the most powerful features of ag-Grid is it's ability to aggregate data. Learn how to aggregate using ag-Grid";
$pageKeyboards = "ag-Grid JavaScript Grid Aggregation";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Aggregation</h2>

    <h3>Grouping with Aggregation</h3>

    <p>
        When grouping, you can apply an aggregation function to any column to populate the group
        row with values. You can pick from the grid's built in aggregation functions or
        provide your own as follows:
    </p>
    <p>
        <ol>
        <li>
            <b>Built In Functions: </b>Out of the box the grid provides <i>sum, min, max,
                first, last</i>. To use one of these, set <i>colDef.aggFunc</i> to the string
            of the function you require.
        </li>
        <li>
            <b>User Registered Functions: </b>You can install your own aggregation functions into the
            grid and reference them as if they were grid provided functions by calling api.addAggFunc(key,func).
        </li>
        <li>
            <b>Direct Functions: </b>Lastly you can provide a
            function directly by setting <i>colDef.aggFunc</i>
            to your custom function. Direct functions do not appear in the toolPanel when selecting functions
            for your columns.
        </li>
        </ol>
    </p>

    <p>
        Aggregation functions are provided with an array of values that it should
        aggregate into one value that it then returns.
    </p>

        <pre><span class="codeComment">// Option 1: column that uses the built in 'sum' function</span>
colDef1.aggFunc = 'sum';

<span class="codeComment">// Option 2: register aggFunc to grid called 'abc', then reference by name</span>
gridOptions.api.addAggFunc('abc', myCustomAggFunc);
colDef2.aggFunc = 'abc';

<span class="codeComment">// Option 3: column uses a function directly</span>
colDef3.aggFunc = myCustomAggFunc;

<span class="codeComment">// this is the function 2 and 3 above are using</span>
function myCustomAggFunc(values) {
    var sum = 0;
    values.forEach( function(value) {sum += value;} );
    return sum;
}
</pre>

    <h4>Example Option 1 - Simple Summing</h4>

    <p>
        The example below shows simple sum aggregation on fields gold, silver, bronze and total.
    </p>
    <p>
        The example also shows the use of a grouping column. The grouping column is specified in the grid options.
        By specifying the grouping column (and not relying on the default column) the column header name is set,
        and also the field to use for the leaf nodes (the athlete name).
    </p>

    <show-example example="exampleAggregation"></show-example>

    <h4>Example Option 2 - Custom Aggregation Functions</h4>

    <p>
        The next example shows many custom aggregation functions configured in a variety
        of ways and demonstrating different things aggrgation functions can do.
    </p>

    <b>Min/Max on Age Column</b>

    <p>
        The function creates an aggregation over age giving a min and a max age. The function knows
        whether it is working with leaf nodes (original row data items) or aggregated nodes (ie groups)
        by checking the type of the value. If the value is a number, it's a row data item, otherwise
        it's a group. This is because the result of the aggregation has two values based on one input
        value.
    </p>

    <p>
        The min/max function is set by placing the function directly as the <i>colDef.aggFunc</i>.
    </p>

    <b>Average on Age Column</b>

    <p>
        The age columns is aggregated a second time with a custom average function.
        The average function also needs to know if it is working with leaf nodes or
        group nodes, as if it's group nodes then the average is weighted.
    </p>

    <p>
        The average function is also set by placing the function directly as the <i>colDef.aggFunc</i>.
    </p>

    <b>Sum on Gold</b>

    <p>
        The gold column gets a custom <i>sum</i> aggregated function. The new sum function doesn't do
        anything different to the built in sum function, however it serves as a demonstration on how
        you can override. Maybe you want to provide a sum function that uses for example the <i>math.js</i>
        library.
    </p>

    <p>
        The sum function is set using a <i>gridOptions</i> property.
    </p>

    <b>'123' on Silver</b>

    <p>
        The '123' function ignores the inputs and always returns the value 123. Because it is registered
        as an aggregation function, it can be reference by name in the column definitions. Having a function
        return the same thing isn't very useful, however for the example it demonstrates easily where in
        the grid the function was used.
    </p>

    <p>
        The '123' function, like 'sum', is set using a <i>gridOptions</i> property.
    </p>

    <b>'xyz' on Bronze</b>

    <p>
        The 'xyz' function is another function with much use, however it demonstrates you can return anything
        from an aggregation function - as long as your aggregation function can handle the result (if you have
        groups inside groups) and as long as your cellRenderer can render the result (if using a cellRenderer).
    </p>

    <p>
        The 'xyz' function is set using the API.
    </p>

    <p>
        Note that the example below gives an error on the console saying it cannot find 'xyz'. This is because
        it tries to aggregate the empty set when the grid is been initialised.
        The same would happen if you set the data via the rowData property. It is because 'xyz' is set after
        the grid is initialised. To prevent this error you should opt for setting the <i>aggFunc</i> as a grid
        property (directly into the grid options)
        or make sure that <i>aggFunc</i> is not used in any column until it is configured into the grid.
    </p>

    <show-example example="exampleAggFunc"></show-example>

    <h3>Initialising Aggregation</h3>

    <p>
        After the grid is initialised, there are two steps with regards setting up aggregation on a column:
        <ol>
            <li>Set the aggregation function on the column via <i>columnApi.setColumnAggFunc(colKey, aggFunc)</i></li>
            <li>Add the columns as an aggregation column via <i>columnApi.addAggregationColumn(colKey)</i></li>
        </ol>
        In other words, you can have the aggFunc set on a column even though the column is not an aggregation column.
        Likewise you can add and remove the column from the list of aggregated columns without removing
        the aggFunc.
    </p>

    <p>
        When the grid initialises, and column definitions that have <i>aggFunc</i> set will be automatically
        added as aggregation functions.
    </p>

    <h2>suppressAggFuncInHeader</h2>

    <p>
        When aggregating, the column headers will include the aggregation function for the column. For example the
        header <i>'Bank Balance'</i> will become <i>'sum(Bank Balance)'</i> if you have the sum aggregation active on the column.
        To turn this off and display simply <i>'Bank Balance'</i> then set the grid property <i>suppressAggFuncInHeader</i>.
    </p>

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