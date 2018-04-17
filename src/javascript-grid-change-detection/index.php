<?php
$pageTitle = "Change Detection: A Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Change Detection. As you change data inside the grid, the grid runs Change Detection to check if any other cells need to be updated to reflect the change. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Change Detection";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1 class="first-h1">Change Detection</h1>

    <p class="lead">
        The grid has built in change detection.
        When a value in the grid changes, either via the UI or via the grid API, the grid will check
        all cells to see which ones need updating and update exactly only those cells, so minimal
        changes are made to the DOM.
    </p>

<!--    <note>
        The grid having change detection built in is cool. This section explains how it works.
        If you are happy to just use the change detection and are not worried about the implementation
        details, feel free to skip this section. You may read this section when you find you need
        to understand what's happening.
    </note>
-->
    <p>
        Change detection can be broken down into the following two categories:
    </p>
        <ol class="content">
            <li>
                <b>Value Change Detection:</b> When a value for any cell changes (e.g. after an edit),
                the grid goes through
                every cell in the grid and compares the current value to the previous value.
                If the values differ, the cell is refreshed. This allows all cells using
                <code>valueGetters</code> to be kept up to date where a change to one cell (that was
                edited) may impact the value of another cell (that references the first cell) - just
                like Excel!
            </li>
            <li>
                <b>Aggregation Change Detection:</b> When a value for any cell changes,
                the grid will recalculate all
                <a href="../javascript-grid-aggregation/">aggregations</a> that are impacted
                by the changed value. This means the grid will automatically keep aggregation
                results (the values in the grouped row) up to date as the data beneath it changes.
            </li>
        </ol>

    <note>
        If you are using Angular or React to build your cells (eg using an Angular or React cellRenderer),
        then you will be already benefiting from binding and change detection that your framework provides.
        In this scenario, your component's <code>refresh()</code> method will get called with the new value when the value
        changes. It is your component's responsibility to save this new value to the components state
        so it will be picked up as a change from the frameworks change detection.
    </note>

    <h2>Example - Change Detection and Value Getters</h2>

    <p>
        The example below shows the impact of change detection on value getters. The grid is
        doing all the refresh by itself with no need for the client application explicitly requesting
        a refresh. Notice the following:
    </p>
    <ul class="content">
        <li>
            The 'Total' column uses a value getter to calculate the sum of all values in that row.
        </li>
        <li>
            Edit any of the values in columns A to F by double clicking a cell and entering a new value.
        </li>
        <li>
            The 'Total' column gets automatically refreshed and flashes.
        </li>
    </ul>

    <?= example('Change Detection and Value Getters', 'change-detection-value-getters', 'generated', array("enterprise" => 1)) ?>

    <h2>1. Value Change Detection</h2>

    <p>
        The grid keeps a local copy of all values rendered in each cell. When a refresh of the cell
        is requested, the cell will only be refreshed if the value has changed.
    </p>

    <note>
        You might ask, is checking every cell against it's value a performance problem? The answer is no.
        What ag-Grid does is similar to the change detection algorithm's in frameworks such as React or Angular.
        Doing this many check's in JavaScript is not a problem. Slowness comes when the DOM is updated
        many times. ag-Grid minimises the DOM updates by only updating the DOM where changes are detected.
        <br/>&nbsp;
        <br/>
        You might also ask, does ag-Grid have a cool Virtual DOM like React does? The answer is no. The grid has
        state stored in the Row Model. So rather than comparing the actual DOM with a virtual DOM,
        the grid compares 'the value that was rendered last time into the DOM' with with the value's
        in the Row Model. Having a virtual DOM in this case would be redundant as the grid already has
        data structures to compare.
    </note>

    <h3>Comparing Values</h3>

    <p>
        This section explains how the grid compares values. This is of interest if you want to compare
        values in a different way.
    </p>

    <p>
        By default the grid will compare values by using triple equals, eg <code>"oldValue === newValue"</code>.
        This will work most of the time for you, especially if your values are simple types
        (string, number, boolean) or immutable objects.
        This will be a problem for mutable objects as object references will be used for comparison
        which won't detect internal changes in the object.
        If using mutable objects (data has changed but it's the same object reference),
        then you will need to override how the value's are compared.
    </p>

    <p>
        If your row data attributes are simple types (string, boolean, number) or immutable
        objects you don't need to implement your own comparison method.
    </p>

    <p>
        If you do need to provide custom comparison of objects, use the <code>colDef.equals(val1,val2)</code> method.
        For example, the following code snippet provides custom comparison to a 'Name' column where the
        name is stored in a complex object.
    </p>

    <snippet>
// column with custom equals method for change detection
colDef = {

    // method returns true if first and last names are equal
    equals: function(person1, person2) {
        var firstNameEqual = person1.firstName === person2.firstName;
        var lastNameEqual = person2.lastName === person2.lastName;
        return firstNameEqual && lastNameEqual;
    }
    ...
}</snippet>

    <h3>Triggering Value Change Detection</h3>

    <p>
        The following operations will <b>automatically</b> trigger change detection on all visible cells:
    </p>

        <ol class="content">
            <li>Editing any value via the grid UI (e.g. double clicking a cell and entering a new value).</li>
            <li>Using the <code>rowNode.setDataValue(col,value)</code> Row Node method.</li>
            <li>Using the <code>api.updateRowData(transaction)</code> API method.</li>
        </ol>

    <p>
        If you do not want change detection to be automatically done, then set the grid property
        <code>suppressChangeDetection=true</code>. This will stop the change detection process firing
        when the above events happen. Ideally you should not want to turn off change detection, however
        the option is there if you choose to turn it off. One thing that may entice you to turn it off
        is if you have some custom value getters that are doing some time intensive calculations, you may want
        limit the number of times they are called and have more control over when refreshing is done.
    </p>

    <p>
        To <b>manually</b> run value change detection to refresh all visible cells
        call <a href="../javascript-grid-refresh/">api.refreshCells()</a>.
    </p>

    <h2>2. Aggregation Change Detection</h2>

    <p>
        Aggregation change detection means rerunning
        <a href="../javascript-grid-aggregation/">aggregations</a> when a value changes.
        So for example, if you are grouping by a column and summing by a value, and one of
        those values change, then the summed value should also change.
    </p>

    <h3>Example - Re-Aggregation of Groups</h3>

    <p>
        The example below shows change detection impacting the result of groups. The grid is doing
        all the refresh by itself with no need for the client application explicitly requesting a
        refresh. Notice the following:
    </p>

    <ul class="content">
        <li>
            Column 'Group' is marked as a <a href="../javascript-grid-grouping/">Row Group</a>
            and columns A to F are marked as <a href="../javascript-grid-aggregation/">Aggregation</a>
            columns so that their values are summed into the group level.
        </li>
        <li>
            Column 'Total' has a valueGetter which gives a sum of all columns A to F.
        </li>
        <li>
            Columns A to F are editable. If you edit a cells value, then the aggregate value at the group
            level is also updated to reflect the change. This is because the grid is recalculating the
            aggregations as a result of the change.
        </li>
        <li>
            All cells are configured to use one of the grids
            <a href="../javascript-grid-cell-rendering/#animate-renderer">animation
                cell renderer</a> instead of flashing cells.
        </li>
    </ul>

    <?= example('Change Detection with Groups', 'change-detection-groups', 'generated', array("enterprise" => 1)) ?>

    <p>
        Notice above that the group column is also editable (eg you can change one of the rows from group 'A'
        to group 'G'), however the row does <b>not</b> move into the correct group after this change is made.
        This is discussed below in the section <a href="#sorting-filtering-grouping">Change Detection and Sorting, Filtering, Grouping</a>.
    </p>

    <h3>Triggering Aggregation Change Detection</h3>

    <p>
        The following operations will <strong>automatically</strong> trigger aggregation change detection:
    </p>
        <ol>
            <li>Editing any value via the grid UI (e.g. double clicking a cell and entering a new value).</li>
            <li>Using the <code>rowNode.setDataValue(col,value)</code> Row Node method.</li>
            <li>Using the <code>api.updateRowData(transaction)</code> API method.</li>
        </ol>

    <p>
        To <b>manually</b> run aggregation change detection to re-compute the aggregated values,
        then call <a href="../javascript-grid-data-update/index.php#refreshInMemoryRowModel">
            api.refreshInMemoryRowModel('aggregate')</a>.
    </p>

    <h2 id="sorting-filtering-grouping">Change Detection and Sorting, Filtering, Grouping</h2>

    <p> When a value changes, the grid's automatic change detection will update: </p>
    <ul class="content">
        <li>Aggregated values.</li>
        <li>Values displayed in cells.</li>
    </ul>

    <p>The grid will <b>not</b>:</p>

    <ul class="content">
        <li>Sort</li>
        <li>Filter</li>
        <li>Group</li>
    </ul>

    <p>
        The reason why sorting, filtering and grouping is not done automatically is that it
        would be considered bad user experience in most use cases to change the displayed
        rows while editing. For example, if a user edits a cell, then the row should not
        jump location (due to sorting and grouping) or even worse, disappear altogether (if
        the filter removes the row due to the new value failing the filter).
    </p>

    <p>
        For this reason, if you want to update the sorting, filtering or group grouping
        after an update, you should listen for the event <code>cellValueChanged</code> and call
        <a href="../javascript-grid-data-update/#bulk-updating">api.updateRowData(transaction)</a>
        with the rows that were updated.
    </p>

    <h3>Example - Change Detection and Filter / Sort / Group</h3>

    <p>
        The following example is the same as the example above
        <a href="./#example-change-detection-and-groups">Change Detection and Groups</a>
        except it gets the grid to do an batch update so that the grouping, sorting
        and filtering are recomputed. From the example, the following can be noted:
    </p>
        <ul class="content">
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

    <?= example('Change Detection with Filter / Sort / Group', 'change-detection-filter-sort-group', 'generated', array("enterprise" => 1)) ?>

    <h2>Aggregation Path Selection</h2>

    <p>
        When data in the grid updates and aggregations are active, the grid will not recompute
        all aggregations again from scratch. Instead it will be selective as to what aggregations
        need to be re-computed.
    </p>

    <h2>Tree Path Selection</h2>

    <p>
        When a value changes, the grid will recompute the immediate group the row is in, and then any parent
        group, all the way to the root. This is known as 'tree path selection' - only the part of the tree
        that need to be recalculated are recalculated.
    </p>

    <p>
        If you are updating many rows at the same time using an <a href="../javascript-grid-data-update/">update
        transaction</a>, the grid will do all updates first, then recompute all aggregations against the combined
        impacted paths only.
    </p>

    <h2>Column Path Selection</h2>

    <p>
        By default, the grid will recalculate aggregations on all columns for the updated tree path,
        even if only one of the columns values were changed. This is because the grid assumes any column has
        the potential to impact any other column, should the column be referenced in a valueGetter.
    </p>

    <p>
        If you are sure that a value change impacts that one column only, then you can
        set the grid property <code>aggregateOnlyChangedColumns=true</code>. This will re-aggregate
        only the changed column and not all columns after a single cell is updated.
    </p>

    <h2>Example - Tree Path & Column Path Selection</h2>

    <p>
        Consider the example below and you edit a cell value under under the groups "Bottom" -> "Group B2"
        and column "Column C". The grid will only recompute column C aggregations for "Group B2" and "Bottom".
        It will not recompute any aggregates for any other groups or for any other columns.
    </p>

    <p>
        The tree path selection (ie not updating anything in the group "Top") is active always in the grid
        and the column selection (only updating column "Column C") is active because of the grid property
        <code>aggregateOnlyChangedColumns=true</code>.
    </p>

    <p>
        The path selections ensure only the minimal amount of recalculations are done.
    </p>

    <p>
        To demonstrate this, the example installs it's own aggregation function for summing.
        This is identical to the normal summing provided by the grid while also printing
        out to the console when it gets called. This allows the example to show when the
        aggregations are done and on what.
    </p>

    <p>
        So with the example below, open up the console and notice the following:
    </p>
        <ul class="content">
            <li>
                When the grid initialises, the aggregation gets complete 84 times
                (6 columns * 14 groups). That's all paths in the group tree and
                all columns.
            </li>
            <li>
                When one value changes (either via UI or via the first button 'Update
                One Value') then the grid recomputes the values for the impacted path
                only, and for the changed column only.
            </li>
            <li>
                When some values change via a transactions using any of the other buttons,
                then all columns are recomputed but only on the changed path.
            </li>
        </ul>


    <?= example('Change Detection with Delta Aggregation', 'change-detection-delta-aggregation', 'generated', array("enterprise" => 1)) ?>


    <h2>Change Detection and Pivot</h2>

    <p>
        Everything above stands for when you are doing <a href="../javascript-grid-pivoting/">pivoting</a>.
        There are no new concepts to introduce, so let's just get stuck into an example.
    </p>

    <p>
        When you click any of the buttons below, remember you are not changing the displayed cells
        values, as when you pivot, each cell is an aggregation of underlying data and the underlying
        data is no longer displayed in the grid (doing a pivot removes leaf nodes).
    </p>

    <p>
        From the example, you can observe:
    </p>

    <ul class="content">
        <li>
            Uncheck '<b>Group & Pivot</b>' to see what the data looks like when it is flat. You can see
            it's a list of student records showing student scores and age. For seeing the impact
            of value changes on pivots, keep this checked while selecting the other buttons.
        </li>
        <li>
            Button '<b>Set One Value</b>' updates one value using <code>rowNode.setDataValue()</code>.
            The grid aggregates the new value for display.
        </li>
        <li>
            Button '<b>Update Points</b>' updates one record using <code>api.updateRowData(transaction)</code>.
            The grid aggregates the new value for display.
        </li>
        <li>
            Button '<b>Add New Group</b>' adds one record for 'Year 5' using <code>api.updateRowData(transaction)</code>.
            The grid does a delta change and adds one more row to represent this group while not touching
            the DOM with the remaining rows.
        </li>
        <li>
            Button '<b>Add Physics Row</b>' adds one record with subject 'Physics' using
            <code>api.updateRowData(transaction)</code>. This impacts the columns in the grid
            as we are pivoting on 'course', so a new column is added for 'Physics'. Again this is
            all done without touching the remaining columns or rows in the grid.
        </li>
        <li>
            Button '<b>Remove All Physics</b>' removes all 'Physics' records
            <code>api.updateRowData(transaction)</code>. As before, this impacts the columns, all 'Physics'
            columns are removed.
        </li>
        <li>
            Button '<b>Move Course</b>' updates a row's course using <code>api.updateRowData(transaction)</code>.
            This results in the aggregations changing in two locations, once where the course was removed,
            and another where the course was added.
        </li>
    </ul>

    <?= example('Change Detection Pivot', 'change-detection-pivot', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
