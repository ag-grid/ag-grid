<?php
$pageTitle = "Aggregation: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Aggregation. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Grid Aggregation";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Aggregation</h1>

    <p class="lead">
        When grouping, you can apply an aggregation function to any column to populate the group
        row with values. You can pick from the grid's built in aggregation functions or
        provide your own.
    </p>

    <? enterprise_feature("Aggregation"); ?>

    <h2>Defining Aggregations</h2>

    <p>
        You can define aggregations on columns in the following three ways:
    </p>

    <ol class="content">
    <li>
        <b>Built In Functions: </b>Out of the box the grid provides <code>sum, min, max,
            count, avg, first, last</code>. To use one of these, set <code>colDef.aggFunc</code> to the string
        of the function you require.
    </li>
    <li>
        <b>User Registered Functions: </b>You can install your own aggregation functions into the
        grid and reference them as if they were grid provided functions by calling api.addAggFunc(key,func).
    </li>
    <li>
        <b>Direct Functions: </b>Lastly you can provide a
        function directly by setting <code>colDef.aggFunc</code>
        to your custom function. Direct functions do not appear in the toolPanel when selecting functions
        for your columns.
    </li>
    </ol>

    <p>
        Aggregation functions are provided with an array of values that it should
        aggregate into one value that it then returns. The following code snippet
        shows defining aggregations for columns in each of the three ways explained
        above.
    </p>

        <snippet>
// Option 1: column that uses the built in 'sum' function
colDef1.aggFunc = 'sum';

// Option 2: register aggFunc to grid called 'abc', then reference by name
gridOptions.api.addAggFunc('abc', myCustomAggFunc);
colDef2.aggFunc = 'abc';

// Option 3: column uses a function directly
colDef3.aggFunc = myCustomAggFunc;

// this is the function 2 and 3 above are using
function myCustomAggFunc(values) {
    var sum = 0;
    values.forEach( function(value) {sum += value;} );
    return sum;
}</snippet>

<note>
Using a function directly will not work with column state, like
<a href="../javascript-grid-column-definitions/#saving-and-restoring-column-state">Saving and Restoring Column State</a>.
If you require state management with custom aggregation, use <code>addAggFunc</code> to register it.
</note>

    <h2>Restricting Functions</h2>

    <p>
        By default, all functions are available to all value columns. To restrict the functions on
        a column, use the <code>allowedAggFuncs</code> column property.
        <snippet>
// define Gold column
colDef = {
    headerName: 'Gold',
    field: 'gold',
    // allow gui to set aggregations for this column
    enableValue: true,
    // restrict aggregations to sum, min and max
    allowedAggFuncs: ['sum','min','max']
    ...
}</snippet>
    </p>

    <h2>Example 1 - Built In Functions</h2>

    <p>
        The example below shows simple aggregation using the built in functions. The following
        should be noted:
    </p>

    <ul class="content">
        <li>
            In order for aggregations to be used, a group column is specified. The example groups
            by country by setting <code>rowGroup=true</code> for the country column.
        </li>
        <li>
            Column gold, silver, bronze and total all have <code>enableValue=true</code>. This tells
            the grid to allow the user to select aggregation functions for these columns. Aggregation
            functions can be selected from the menu and also in the tool panel.
        </li>
        <li>
            The gold, silver, bronze and total columns all have a different aggregation functions active.
        </li>
        <li>
            The gold column has <code>allowedAggFuncs=['sum','min','max']</code> which restricts the user
            to selecting only sum, min or max as the aggregation function for this column.
        </li>
    </ul>

    <?= grid_example('Built-In Functions', 'built-in-functions', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'setfilter']]) ?>

    <note>
        Remember to mark value columns with <code>enableValue=true</code> when using the <a href="../javascript-grid-tool-panel/">Tool Panel</a>.
        Otherwise you won't be able to drag and drop them to the 'Values' section in the Tool Panel.
    </note>


    <h2 id="customAggregationFunctions">Custom Aggregation Functions</h2>

    <p>
        It is possible to add your own custom aggregation to the grid. Custom aggregation functions can be applied
        directly to the column or registered to the grid and reference by name (similar to grid provided functions).
    </p>

    <p>
        A custom aggregation function takes a list of values and should return the result of the aggregation.
    </p>

    <snippet>
// custom simple aggregation, complete 'sum' of values
function mySum(values) {
    var result = 0;
    values.forEach( function(value) {
        if (typeof value === 'number') {
            result += value;
        }
    });
    return result;
}

// Option 1 - reference the function directly with a column
var columnA = {
    field: 'a',
    aggFunc: mySum
};

// Option 2 - register the function with the grid property aggFuncs
gridOptions.aggFuncs: {
    mySumFunc: mySum
};

var columnB = {
    field: 'a',
    aggFunc: 'mySumFunc'
};
</snippet>

    <h2>Example 2 - Custom Aggregation Functions</h2>

    <p>
        The next example shows many custom aggregation functions configured in a variety
        of ways and demonstrating different things aggregation functions can do.
    </p>

    <p>
        The following can be noted from the example:
    </p>

    <ul class="content">
        <li>
            <p>
                <b>Min/Max on Age Column</b>:
                The function creates an aggregation over age giving a min and a max age. The function knows
                whether it is working with leaf nodes (original row data items) or aggregated nodes (ie groups)
                by checking the type of the value. If the value is a number, it's a row data item, otherwise
                it's a group. This is because the result of the aggregation has two values based on one input
                value.
            </p>
            <p>
                The min/max function is then set by placing the function directly as the <code>colDef.aggFunc</code>.
            </p>
        </li>
        <li>
            <p>
                <b>Average on Age Column</b>:
                The age columns is aggregated a second time with a custom average function.
                The average function also needs to know if it is working with leaf nodes or
                group nodes, as if it's group nodes then the average is weighted. The grid
                also provides an average function that works in the same way, so there is no
                value in providing your own average function like this, it is done in this example
                for demonstration purposes.
            </p>
            <p>
                The average function is also set by placing the function directly as the <code>colDef.aggFunc</code>.
            </p>
        </li>
        <li>
            <p>
                <b>Sum on Gold</b>:
                The gold column gets a custom <code>sum</code> aggregated function. The new sum function doesn't do
                anything different to the built in sum function, however it serves as a demonstration on how
                you can override. Maybe you want to provide a sum function that uses for example the <code>math.js</code>
                library.
            </p>

            <p>
                The sum function is set using a <code>gridOptions</code> property.
            </p>
        </li>
        <li>
            <p>
                <b>'123' on Silver</b>:
                The '123' function ignores the inputs and always returns the value 123. Because it is registered
                as an aggregation function, it can be reference by name in the column definitions. Having a function
                return the same thing isn't very useful, however for the example it demonstrates easily where in
                the grid the function was used.
            </p>
            <p>
                The '123' function, like 'sum', is set using a <code>gridOptions</code> property.
            </p>
        </li>
        <li>
            <p>
                <b>'xyz' on Bronze</b>:
                The 'xyz' function is another function with much use, however it demonstrates you can return anything
                from an aggregation function - as long as your aggregation function can handle the result (if you have
                groups inside groups) and as long as your cell renderer can render the result (if using <code>cellRenderer</code>).
            </p>

            <p>
                The 'xyz' function is set using the API. Note that we also set 'xyz' in the grid options as otherwise
                the grid would complain 'Function not found' as it tries to use the function before it is set
                via the API.
            </p>
        </li>
    </ul>

    <?= grid_example('Custom Aggregation Functions', 'custom-agg-functions', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'setfilter']]) ?>

    <p>
        Note that custom aggregations will get called for the top level rows to calculate a 'Grand Total',
        not just for row groups. For example if you have 10 rows in the grid, the grid will still call the
        aggregation with 10 values to get a grand total aggregation.
    </p>

    <p>
        The grand total aggregation is normally not seen, unless the grid is configured with
        <a href="../javascript-grid-grouping/#grouping-footers">Grouping Total Footers</a>. Total footers
        display the result of the aggregation for top level, for example displaying a grand total even
        if no row grouping is active.
    </p>

    <p>
        When the grid is empty, the aggregations are still called once with an empty set. This is to calculate
        the grand total aggregation for the top level.
    </p>

    <h2>Example 3 - Multi-Column Aggregation</h2>

    <p>
        The next example shows a ratio calculation to demonstrate how to create an <code>aggFunc</code> that uses values
        from multiple columns.
    </p>

    <p>
        When values from multiple columns are required, a value object containing all the required values across multiple
        columns should be passed around instead of a simple value. This value object should also contain a
        <code>toString()</code> method so it can also be resolved by the grid to a single value. This is shown in
        the code snippet below:
    </p>

<snippet>

var columnDefs = [
  { field: 'gold', aggFunc: 'sum' },
  { field: 'silver', aggFunc: 'sum' },
  { headerName: 'Ratio', colId: 'ratio', valueGetter: ratioValueGetter, aggFunc: ratioAggFunc}
];

function ratioValueGetter(params) {
    if (!params.node.group) {
        // no need to handle group levels - calculated in the 'ratioAggFunc'
        return createValueObject(params.data.gold, params.data.silver);
    }
}

function ratioAggFunc(values) {
    var goldSum = 0;
    var silverSum = 0;
    values.forEach(function(value) {
        if (value && value.gold) {
            goldSum += value.gold;
        }
        if (value && value.silver) {
            silverSum += value.silver;
        }
    });
    return createValueObject(goldSum, silverSum);
}

function createValueObject(gold, silver) {
    return {
        gold: gold,
        silver: silver,
        toString: function() {
            return (gold && silver) ? gold / silver : 0;
        }
    }
}

</snippet>

    <p>
        The following example demonstrates this approach in action:
    </p>

    <?= grid_example('Multi-Column Aggregation', 'multi-column-aggregation', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'setfilter']]) ?>

    <h2 id="aggregationApi">Aggregation API</h2>

    <p>
        After the grid is initialised, there are two steps to set an aggregation on a column:
    </p>
        <ol class="content">
            <li>Set the aggregation function on the column via <code>columnApi.setColumnAggFunc(colKey, aggFunc)</code></li>
            <li>Add the columns to the list of value columns via <code>columnApi.addValueColumn(colKey)</code></li>
        </ol>

    <p>
        When the grid initialises, any column definitions that have <code>aggFunc</code> set will be automatically
        added as a value column.
    </p>

    <h2 id="columnHeaders">Column Headers</h2>

    <p>
        When aggregating, the column headers will include the aggregation function for the column. For example the
        header <code>'Bank Balance'</code> will become <code>'sum(Bank Balance)'</code> if you have the sum aggregation active on the column.
        To turn this off and display simply <code>'Bank Balance'</code> then set the grid property <code>suppressAggFuncInHeader</code>.
    </p>

    <h2 id="customFullRowAggregation">Custom Full Row Aggregation</h2>

    <p>
        Using <code>colDef.aggFunc</code> is the preferred way of doing aggregations. However you may find scenarios
        where you cannot define your aggregations with respect to individual column values. Maybe you are aggregating
        sales records in different currencies and you need to read the value from one column and the currency code from
        another column and then convert the record to a common currency for aggregation - the point being you need data
        from more than just one column, or you want to put the results into different columns to the inputs for the calculation.
        For that reason, you can take control of the row aggregation by providing a <code>groupRowAggNodes</code> function
        as a grid callback.
    </p>

    <note>
        Using <code>colDef.aggFunc</code> is the preferred way of doing aggregations, only use <code>groupRowAggNodes</code>
        if you cannot achieve what you want as it will make your code more complex. Also note that <code>groupRowAggNodes</code>
        will not work when pivoting.
    </note>

    <p>
        For groups, when aggregating, the grid stores the results in the colId of the column. For example, if you
        have a group defined as follows:
        <snippet>
colDef = {
    field: 'abby',
    valueGetter: 'data.a + data.b',
    colId: 'aaa'
}</snippet>
    Then the result of the aggregation will be stored in <code>data.aaa</code> and not in 'abby'. Most of the time this
    will not matter for you as the colId, if not provided, will default to the field.
        In order for the grid to display the aggregation result, it must be stored in the correct field name.
    </p>

    <p>
        Below shows an  example using <code>groupRowAggNodes</code>. The example doesn't represent a real world scenario,
        it's contrived for demonstration. It takes the number of medals as inputs and creates two outputs, one as a normal
        sum and another by multiplying the result by Math.PI.
    </p>

    <?= grid_example('Custom Full Row Aggregation', 'custom-full-row-aggregation', 'generated', ['enterprise' => true, 'exampleHeight' => 620, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'setfilter']]) ?>

    <h2>Empty Aggregation Calls</h2>

    <p>
        When providing either <a href="#customAggregationFunctions">Custom Aggregation Functions</a>
        or <a href="#customFullRowAggregation">Custom Full Row Aggregation</a> then you will see strange calls to
        these functions where empty lists are provided.
    </p>

    <p>
        The empty aggregation calls happen in the following two scenarios:
    </p>
    <ol>
        <li>
            The grid has no data (usually the case when the gird is initially displayed before the application
            has set data). Aggregating at the root level will request an aggregation of an empty set.
        </li>
        <li>
            The grid has groups and a filter, such that groups are empty.
        </li>
    </ol>

    <h2>Recomputing Aggregates</h2>

    <p>
        If the data changes after the aggregation is done, you can tell the grid to recompute the aggregates
        through the api method <code>refreshClientSideRowModel('aggregate')</code>.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
