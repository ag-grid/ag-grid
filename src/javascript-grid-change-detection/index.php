<?php
$key = "Change Detection";
$pageTitle = "ag-Grid Change Detection";
$pageDescription = "ag-Grid uses Change Detection to allow updating only cells that have changed values. This page explains how you can use the change detection inside of ag-Grid.";
$pageKeyboards = "ag-Grid Change Detection";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">Change Detection</h1>

    <p>
        The grid has built in change detection so when you change a cells value, all dependent
        cells will reflect the change. Dependent cells are cells that are one of
        the following:
        <ul>
            <li>
                Cells using <a href="../javascript-grid-value-getters/">valueGetter's</a>, where
                they reference the changed value.
            </li>
            <li>
                Group rows showing results from <a href="../javascript-grid-aggregation/">row aggregation</a>,
                where the value is part of the aggregated set.
            </li>
        </ul>
    </p>

    <p>
        This section explains the grid's change detection that makes this possible.
    </p>

    <note>
        If you are using Angular or React to build your cells (eg using an Angular or React cellRenderer),
        then you will be already benefiting from binding and change detection that your framework provides.
        In this scenario, your components refresh() method will get called with the new value when the value
        changes. It is your components responsibility to save this new value to the components state
        so it will be picked up as a change from the frameworks change detection.
    </note>

    <h2>Change Detection Algorithm</h2>

    <p>
        The change detection algorithm is as follows: When you update a value in the grid, the grid will:
        <ol>
            <li>
                If the value's column has an <a href="../javascript-grid-aggregation/">aggregation</a>, the aggregation
                is recomputed.
            </li>
            <li>
                The displayed value in every rendered cell is checked against it's most up to date value.
                If the value is different, the cell is refreshed. This makes sure any cells with
                <a href="../javascript-grid-value-getters/">valueGetters</a> that were impacted
                will get refreshed. This is done with rendered cells only - e.g. if the grid has 20,000
                rows, but only 40 are displayed due to the vertical scroll position, then only 40
                rows are required to be checked.
            </li>
        </ol>
    </p>

    <note>
        You might ask, is checking every cell against it's value a performance problem? The answer is no.
        What ag-Grid does is similar to the change detection algorithm's in frameworks such as React or Angular.
        Doing this many check's in JavaScript is not a problem. Slowness comes when the DOM is updated to
        many times. ag-Grid minimises the DOM updates by only updating the DOM where changes are detected.
        <br/>&nbsp;
        <br/>
        You might also ask, does ag-Grid have a cool Virtual DOM like React does? The answer is no. The grid has
        state stored in the Row Model. So rather than comparing the actual DOM with a virtual DOM,
        the grid compares 'the value that was rendered last time into the DOM' with with the value's
        in the Row Model.
    </note>

    <h3>Comparing Values</h3>

    <p>
        By default the grid will compare values by using triple equals, eg <i>"oldValue === newValue"</i>.
        This will work most of the time for you, especially if your values are simple strings and numbers.
        This may be a problem if the value is an object as object references will be used for comparison.
        If the data has change, but the object reference is the same, then you will need to override
        how the value's are compared.
    </p>

    <p>
        A value is an attribute of your row data record. So if you update the attribute on the
        row data, but the row data record is the same instance, then the triple equals will work on the
        attribute. So as long as you replace full object values as attributes, or are using simple
        strings and numbers as attributes, then you will never need to provide your own custom equals method.
    </p>

    <p>
        If you do need to provide custom comparison of objects, use the <code>colDef.equals(val1,val2)</code> method.
        For example, the following code snippet provides custom comparison to a 'Name' column where the
        name is stored in a complex object.
    </p>

    <pre><span class="codeComment">// column with custom equals method for change detection</span>
colDef = {

    <span class="codeComment">// method returns true if first and last names are equal</span>
    equals: function(person1, person2) {
        var firstNameEqual = person1.firstName === person2.firstName;
        var lastNameEqual = person2.lastName === person2.lastName;
        return firstNameEqual && lastNameEqual;
    }
    ...
}</pre>

    <h2>Change Detection Initiation</h2>

    <p>
        The following operations will initiate change detection:
        <ol>
            <li>Editing values via the grid UI (e.g. double clicking a cell and entering a new value).</li>
            <li>Using the <code>rowNode.setDataValue(col,value)</code> Row Node method.</li>
            <li>Using the <code>api.updateRowData(transaction)</code> API method.</li>
        </ol>
    </p>

    <p>
        If you do not want change detection to be automatically done, then set the grid property
        <code>suppressChangeDetection=true</code>. This will stop the change detection process firing
        when the above events happen. Ideally you should not want to turn off change detection, however
        the option is there if you choose to turn it off. One thing that may entice you to turn it off
        is if you have some custom value getters that are doing some time intensive calculations, you may want
        limit the number of times they are called and have more control over when refreshing is done.
    </p>

    <h2>Change Detection Manual Triggering</h2>

    <p>
        If you want the grid to do change detection on all visible cells (ie update the cell
        if the value has changed) then use <a href="../javascript-grid-refresh/">api.refreshCells()</a>.
    </p>

    <p>
        If you want the grid to re-compute the aggregated values, then call
        <a href="../javascript-grid-data-update/index.php#refreshInMemoryRowModel">
            api.refreshInMemoryRowModel('aggregate')</a>.
    </p>

    <h2>Example - Change Detection and Value Getter's</h2>

    <p>
        The example below shows the impact of change detection on value getters. From the example, the
        following can be noted:
        <ul>
            <li>
                Column 'Total' has a valueGetter which gives a sum of all columns A to F.
            </li>
            <li>
                Columns A to F are editable. If you edit a cells value, the total column will also get updated.
            </li>
            <li>
                As values change in the Total column, they are <a href="../javascript-grid-data-update/#flashing">flashed</a>.
            </li>
        </ul>
    </p>

    <show-example example="exampleChangeDetectionValueGetter"></show-example>

    <h2 id="example-change-detection-and-groups">Example - Change Detection and Groups</h2>

    <p>
        The example below shows change detection impacting the result of groups. From the example, the
        following can be noted:
        <ul>
            <li>
                Column 'Total' has a valueGetter which gives a sum of all columns A to F.
            </li>
            <li>
                Columns A to F are editable. If you edit a cells value, the following cells will update:
                    <ul>
                        <li>
                            Total column to the right, as it's using a <a href="../javascript-grid-value-getters/">valueGetter</a>.
                        </li>
                        <li>
                            The group cell above, as it is using the cell in an
                            <a href="../javascript-grid-aggregation/">aggregation</a>.
                        </li>
                    </ul>
            </li>
            <li>
                All cells are configured to use one of the grids
                <a href="../javascript-grid-cell-rendering/animate-renderer">animation
                cell renderer</a> instead of flashing cells.
            </li>
            <li>
                Notice that the group column is also editable, however the row does <b>not</b> move into the correct
                group after this change is made. This is discussed below.
            </li>
        </ul>
    </p>

    <show-example example="exampleChangeDetectionGroups"></show-example>

    <h2>Example - Change Detection and Filter / Sort / Group</h2>

    <p>
        As mentioned, change detection will only update aggregated values (in the
        <a href="../javascript-grid-in-memory/">In Memory Row Model</a> and displayed
        values. It will not try to re-order, re-sort or re-group the data.
        If you want to have the data updated to reflect order, sort and group,
        you should listen for the event <code>cellValueChanged</code> and call
        <a href="../javascript-grid-data-update/#bulk-updating">api.updateRowData(transaction)</a>
        with the rows that were updated.
    </p>

    <p>
        The following example is the same as the example above
        <a href="./#example-change-detection-and-groups">Change Detection and Groups</a>
        except it gets the grid to do an batch update so that the grouping, sorting
        and filtering are recomputed. From the example, the following can be noted:
        <ul>
            <li>
                As before, updating any value will update the total column and aggregated group columns.
            </li>
            <li>
                Updating a group cell will move the row to the new group. If the group does not
                exist, it will be created.
            </li>
            <li>
                If you order by a column (eg order by 'A') and then change the data so that the order
                is incorrect, the grid will fix itself so that the ordering is maintained. In other
                words, the updated row will move to the new sorted position.
            </li>
            <li>
                If you set a filter (eg filter 'A' to be 'less than 50') and then change the data so
                that a row no longer passes the filter, the grid will fix itself so that the filtering
                is maintained. In other words, the updated row will be removed if it no longer passes
                the filter.
            </li>
        </ul>
    </p>

    <show-example example="exampleChangeDetectionFilterSortGroup"></show-example>

    <h2 id="delta-aggregation-rebuilding">Delta Aggregation Rebuilding</h2>

    <p>
        bla bla bla
    </p>

    <show-example example="exampleChangeDetectionDeltaAggregation"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
