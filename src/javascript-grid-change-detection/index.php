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
        The grid has built in change detection. This means when you update the value of a cell,
        either through the UI or via the grid's API, the grid will automatically work out all
        the cells that need to be updated to reflect the new value.
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
        <ul>
            <li>
                <b>Value Change Detection:</b> When a value for any cell changes, the grid goes through
                every cell in the grid and compares the new value to the currently rendered value.
                If the values differ, the cell is refreshed. This means all cells using
                <code>valueGetter's</code> will have their values updated if they depended on the
                changed cell.
            </li>
            <li>
                <b>Aggregation Change Detection:</b> When a value for any cell changes,
                the grid will recalculate all
                <a href="../javascript-grid-aggregation/">aggregations</a> that are impacted
                by the changed value. This means the grid will automatically keep aggregation
                results (the values in the grouped row) up to date as the data beneath it changes.
            </li>
        </ul>
    </p>

    <note>
        If you are using Angular or React to build your cells (eg using an Angular or React cellRenderer),
        then you will be already benefiting from binding and change detection that your framework provides.
        In this scenario, your components refresh() method will get called with the new value when the value
        changes. It is your components responsibility to save this new value to the components state
        so it will be picked up as a change from the frameworks change detection.
    </note>

    <h2>Example - Change Detection and Value Getter's</h2>

    <p>
        Notice the code for setting up the grid is simple. All of the refreshing and recalculating of values
        is done internally by the grid.
    </p>

    <p>
        The example below shows the impact of change detection on value getters. The grid is
        doing all the refresh by itself with no need for the client application explicitly requesting
        a refresh. Notice the following:
    <ul>
        <li>
            The 'Total' column uses a value getter to calculate the sum of all values in that row.
        </li>
        <li>
            Edit any of the values in columns A to F.
        </li>
        <li>
            The 'Total' column gets automatically refreshed and flashes.
        </li>
    </ul>
    </p>

    <show-example example="exampleChangeDetectionValueGetter"></show-example>

    <h2>Value Change Detection</h2>

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
        By default the grid will compare values by using triple equals, eg <i>"oldValue === newValue"</i>.
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

    <h2>Triggering Value Change Detection</h2>

    <p>
        The following operations will <b>automatically</b> trigger change detection on all visible cells:
        <ol>
            <li>Editing any value via the grid UI (e.g. double clicking a cell and entering a new value).</li>
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

    <p>
        To <b>manually</b> run value change detection to refresh all visible cells
        call <a href="../javascript-grid-refresh/">api.refreshCells()</a>.
    </p>

    <h2>Aggregation Change Detection</h2>

    <p>
        On top of checking all DOM cells values, the grid will <b>automatically</b> update any
        <a href="../javascript-grid-aggregation/">aggregation</a> that the value can impact.
    </p>

    <p>
        To <b>manually</b> run aggregation change detection to re-compute the aggregated values,
        then call <a href="../javascript-grid-data-update/index.php#refreshInMemoryRowModel">
            api.refreshInMemoryRowModel('aggregate')</a>.
    </p>

    <h2 id="example-change-detection-and-groups">Example - Change Detection and Groups</h2>

    <p>
        The example below shows change detection impacting the result of groups. From the example, the
        following can be noted:
        <ul>
            <li>
                Column 'Group' is marked as a <a href="../javascript-grid-grouping/">Row Group</a>
                and columns A to F are marked as <a href="../javascript-grid-aggregation/">Aggregation</a>
                columns so that their values are summed into the group level.
            </li>
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

    <p>
        Notice the code for setting up the grid is simple. All of the refreshing and recalculating of values is
        done internally by the grid.
    </p>


    <h2>Change Detection and Sorting, Filtering, Grouping</h2>

    <p>
        When a value changes, the grid's automatic change detection will update:
    <ul>
        <li>Aggregated values.</li>
        <li>Values displayed in cells.</li>
    </ul>
    The grid will <b>not</b>:
    <ul>
        <li>Sort</li>
        <li>Filter</li>
        <li>Group</li>
    </ul>
    </p>

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

    <h2>Example - Change Detection and Filter / Sort / Group</h2>

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

    <h2 id="path-selection">Aggregation Path Selection</h2>

    <p>
        When the grid needs to update aggregations, it will only update aggregations that are
        impacted by the changed values. This is done using path selection.
    </p>

    <p>
        Path selection means, when a value is changed, the aggregation will only:
        <ul>
            <li>Update the parent group(s) of the value.</li>
            <li>For single cell changes*, only update the column.</li>
        </ul>
    </p>

    <p>
        <i>
            *single cell changes are when you update using the UI or you update via
            the <code>rowNode.setRowData(column, data)</code> API. If you update using
            a transaction, then all columns are recomputed on the effected path.
        </i>
    </p>

    <p>
        This is easiest explained with an example. Consider the example below and you edit
        a cell value under "Bottom" -> "Group B2" -> "Column C". Then the grid will only
        recompute column C aggregations for "Group B2" and "Bottom". It will not recompute
        any aggregates for any other groups or for any other columns.
    </p>

    <p>
        The path selection ensures only the minimal amount of recalculations are done.
    </p>

    <h2>Example Aggregation Path Selection</h2>

<!--    <ul>
        <li>
            When editing cell (or calling rowNode.setDataValue(col, val)), aggregations are recomputed on changed
            tree only AND on changed column only.
        </li>
        <li>
            When updating with transaction (or calling rowNode.setData(data), aggregations are recomputed on changed
            tree only on ALL columns.
        </li>
    </ul>
-->
    <show-example example="exampleChangeDetectionDeltaAggregation"></show-example>

    <h2>Refresh Turns</h2>

    <p>
        A refresh turn happens at the following points:
    </p>
    <ul>
        <li>
            Grid initialisation, transaction around setting columns, and then row data.
        </li>
        <li>
            columnController.setColumnDefs();
        </li>
        <li>
            inMemoryRowModel.setRowData();
        </li>
        <li>
            inMemoryRowModel.updateRowData(); (transaction update)
        </li>
        <li>
            rowRenderer.refreshView(); (after any UI update needed, eg scrolling, filter, etc)
        </li>
        <li>
            valueService.setValue(); // AFTER value is updated (as we call once to get old value)
        </li>
    </ul>

    <show-example example="exampleChangeDetectionPivot"></show-example>

    <p>
        Problems:
    </p>
    <ul>
        <li>Aggregations on expressions don't work</li>
        <li>
            Difficult to understand: a) change detection on value b) caching of valueGetters
            c) re-calc of aggregated values
        </li>
    </ul>

    <p>Ideas</p>

    <ul>
        <li>Do we cache value getters between data changes?</li>
    </ul>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
