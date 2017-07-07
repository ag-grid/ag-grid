<?php
$key = "Value Cache";
$pageTitle = "ag-Grid Value Cache";
$pageDescription = "ag-Grid uses a Value Cache to store the results from executing value getters. This cache can be configured to behave in different ways depending on how changeable your data is.";
$pageKeyboards = "ag-Grid Value Cache";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">Value Cache</h1>

    <p>
        The value cache is used for the results of <a href="../javascript-grid-value-getters">valueGetter's</a>.
        If you are not using valueGetter's, then you are not using the value cache and do not need to be concerned
        about it.
    </p>

    <p>
        Each time a valueGetter is executed, it's result is stored in the value cache. If the data in the grid
        has not changed since the last time the valueGetter was used, then the value is retrieved from the cache
        instead of executing the valueGetter again.
    </p>

    <p>
        For 90% of the time using valueGetter's you do not need to know about the value cache. This section is for
        advanced users who need to know more about how the value cache works. You will learn when the value cache
        is used, how often your valueGetters are called, and how to take control of the value cache invalidation
        to increase or decrease the number of calls to your valueGetters.
    </p>

    <h1>Example - Value Getter Cache</h1>

    <p>
        We will get start with an example with one difference: One of the valueGetters has a <code>console.log()</code>
        statement. This will allow us to see exactly when the valueGetter is called. From the example, the following
        can be noted:
    </p>
    <ul>
        <li>The <b>'Total'</b> column has a <code>valueGetter</code> that as well as returning the value,
            also prints to the console when it gets called. You can see this in the developer tools console.</li>
        <li>The value's in the <b>Total</b> column are used many times as follows:
            <ul>
                <li>For displaying the value in the cell.</li>
                <li>For calculating the group total for the total column (ie the figure 87,040 is
                a sum of the 5 values below it).</li>
                <li>For calculating the <b>'Total x 10'</b> column, as that value getter also
                references teh values in the <b>'Total'</b> column.</li>
            </ul>
        </li>
        <li>
            Despite the values getting used multiple times, each valueGetter is executed exactly once.
            This can be observed by opening the development console and observing the log message
            the valueGetter prints.
        </li>
        <li>
            If you close and then re-open a group, the valueGetter's are not re-executed, even though
            the values are needed to re-create the DOM elements that represent the cells.
        </li>
        <li>
            Hitting <b>'Refresh Cells'</b> will refresh all the cells, but again the valueGetters will not get re-executed.
        </li>
        <li>
            Hitting <b>'Invalidate Cache'</b> and then <b>'Refresh Cells'</b> will result in the valueGetters
            getting re-executed, as the cell refresh operation requires the values and the cache was invalidated.
            You will notice invalidating and then refreshing doesn't do anything noticable to the grid, the
            data is the same, the only hint that anything happened is the valueGetter's console messages.
        </li>
        <li>
            Changing any value in the grid (either editing via the UI or editing via the button)
            <b>'Change One Value'</b> will result in the value cache getting cleared and all cells
            getting refreshed (where change detection then updates any changes cells and only changed cells).
        </li>
    </ul>
    <show-example example="exampleValueCache"></show-example>

    <note>
        It is not possible to partially invalidate the cache, eg it is not possible to invalidate only a
        portion of the cells. You might think that if you update a cell, then you only need to invalidate
        that row's data as the valueGetters can only access that row. That is not true - a valueGetter
        is a function where you can take data from anywhere in the grid and the grid is none the wiser.
        So if you change any value, then every single valueGetter is potentially impacted as far as the grid
        is concerned so the whole value cache is invalidated.
    </note>

    <h1 id="invalidating">Invalidating the Value Cache</h1>

    <p>
        The value cache starts empty, then as valueGetters execute, their results are stored, and the value cache
        fills up. Certain events trigger the value cache to be emptied. This is called invalidating the value
        cache. Once invalidated, every valueGetter will get executed again next time the value is needed.
        The events that cause the value cache to invalidate are the following:
        <ul>
            <li>New row data is set into the grid via <code>setRowData()</code> API or changing the
                <code>rowData</code> framework bound property*.</li>
            <li>New columns are set into the grid via <code>setColumnDefs()</code> API or changing the
                <code>columnDefs</code> framework bound property*.</li>
            <li>Data is modified using the <code>rowNode.setData(data)</code> or
                <code>rowNode.setDataValue(col,value)</code> node API methods.</li>
            <li>A value is modified in the grid using the grid's UI editing feature.</li>
            <li>The <code>invalidateValueCache()</code> API method gets called by the application.</li>
        </ul>
        <i>* Assuming your framework allows binding properties and this is what you are using.</i>
    </p>

    <h1 id="value-cache-">Changing the Value Cache Strategy</h1>

    <p>
        Above details how the cache operates under normal operations. In essence, the value cache gets purged
        whenever the grid is aware of a change to the underlying data. This strategy is the default strategy.
        There are three strategies for the value cache which are as follows:
        <ul>
            <li><b>Off:</b> The value cache is not used. Each time a value from a valueGetter is needed,
            the valueGetter is executed. Use this if your data is changing and the grid is not aware (eg
            you are changing the data directly and not using the grid's API's). This will then make sure
            the most up to date values are always received from the valueGetter's.</li>
            <li><b>Invalidate After Update:</b> The default. The value cache is invalidated after an update
            to any data. This will suit most people's needs.</li>
            <li><b>Invalidate Never:</b> The value cache is never automatically expired. The only event that
            will invalidate the value cache will be the <code>api.invalidateValueCache()</code> method. Use
            this if your data is changing, but you don't want to execute valueGetter's again. One example
            is if you are adding or removing rows to your data and the valueGetters are not calculating
            across rows, thus removing or adding rows has no impact on the other rows.</li>
        </ul>
    </p>

    <p>
        Set the value cache strategy by setting the grid property <code>valueCacheStrategy</code> to
        one of {off, invalidateNever, invalidateAfterUpdate}
    </p>

    <pre>gridOptions = {
    <span class="codeComment">// set to off, invalidateNever, invalidateAfterUpdate</span>
    valueCacheStrategy: 'off',
    ...
}</pre>

    <p>
        Most of the time you will use the default strategy of 'Invalidate After Update' so you don't
        need to change this setting.
    </p>

    <note>
        <p>
            Most of the time, the default <b>'Invalidate After Update'</b> strategy will be perfect for what you want.
        </p>
        <p>
            Use <b>'Off'</b> if you want to turn the value cache off. It will slow the grid down a bit, but it
            guarantees your valueGetters will always get called. This is best used when your data is changing
            outside of the control of the grid.
        </p>
        <p>
            Use <b>'Invalidate Never'</b> if you want to control exactly when the value cache invalidates. This is
            best used when the default behaviour is invalidating the cache to frequently, and you know your data
            doesn't need it to be invalidated as much.
        </p>
    </note>

    <h2>Example - Value Cache Strategy "Off"</h2>

    <p>
        The example below is almost identical to the example above. The difference is the value cache
        is turned off. Note the following:
    </p>

    <ul>
        <li>
            When the grid initialises, there are 24 valueGetter calls for the total column rather than
            12 in the example above. This is because of the chaining, where the column "Total x 10" is
            referencing the "Total" column, thus doubles the number of calls.
        </li>
        <li>
            Each time you open / close the group, the valueGetter gets called again, as each time a cell
            is drawn, it executes the valueGetter.
        </li>
        <li>
            When you edit, as before the grid will get values for all cells for change detection, however
            again it will execute the valueGetter 24 times and not just 12.
        </li>
    </ul>

    <show-example example="exampleValueCacheOff"></show-example>

    <h2>Example - Value Cache Strategy "Invalidate Never"</h2>

    <p>
        This example is again almost identical to the example above. The difference here is the value cache
        is turned on but to never invalidate. Note the following:
    </p>

    <ul>
        <li>
            When the grid initialises, there are 12 valueGetter calls as above. The values are getting cached.
        </li>
        <li>
            After you edit a cell, either through the UI or through the API by pressing <b>'Update One Value'</b>,
            the valueGetters are not called again, so the total columns are not correctly refreshed. Because the
            grid already executed the valueGetter's for this column, it will not do it again, it will instead take
            values from the value cache.
        </li>
        <li>
            If you click <b>'Invalidate Value Cache'</b> after you have done some edits, and then click
            <b>'Refresh Cells'</b>, the total columns will update.
        </li>
    </ul>

    <show-example example="exampleValueCacheNever"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
