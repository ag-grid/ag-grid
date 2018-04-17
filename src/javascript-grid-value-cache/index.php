<?php
$pageTitle = "ag-Grid - Working with Data: Value Cache";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Value Cache. The Value Cache is used to store results of value getters. It is always on, enhancing the performance of the grid. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Cache";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1 class="first-h1">Value Cache</h1>

    <p class="lead">
        The value cache is used for the results of <a href="../javascript-grid-value-getters">valueGetters</a>.
        If you are not using value getters, then you do not need the value cache.
    </p>

    <p>
        Each time the grid requires a value from a value getter, the <code>valueGetter</code> is executed. For most use
        cases, this will not be an issue, as value getter will execute quickly and not have any noticeable performance
        implications for your application. However sometimes you might implement time intensive tasks in your
        value getters. If this is the case, then you can opt to turn on the value cache to store the results of the
        value getters.
    </p>

    <p>
        When the value cache is turned on, each time a value getter is executed, it's result is stored in the value cache.
        If the data in the grid has not changed since the last time the value getter was used, then the value is retrieved
        from the cache instead of executing the value getter again.
    </p>

    <p>
        This value cache is for advanced users who have time consuming value getters and want to speed up their
        applications by introducing a cache to reduce the number of times value getters get executed.
    </p>

    <note>
        <p>
            One client of ag-Grid had 1,000 rows and 20 columns in a grid. A lot of the columns were doing advanced
            maths, using third party maths API in the valueGetter for 8 of the columns. The client was also grouping
            and the summing by the columns containing the value getters. This meant, if more rows were added, the grid
            recomputed the aggregations, resulting in all the value getters getting called again, causing the grid
            to stall for around 1,000ms as rows were added.
        </p>
        <p>
            Introducing the value cache meant the value getters were execute once when the initial data was loaded, so
            the 1,000ms happened once. Then when delta changes came in, the value getters were only executed on the
            new records, giving an almost seamless experience to the user.
        </p>
    </note>

    <h2>Example - Value Cache</h2>

    <p>
        Below shows a grid demonstrating the value cache. The column on the right has a value getter
        that has a <code>console.log()</code>
        statement. This will allow us to see exactly when the value getter is called. So it is best
        to open this example in a new tab and open up the development console. From the example,
        the following can be noted:
    </p>

    <ul class="content">
        <li>
            When the grid is initially loaded, the <b>value getter is called over 100 times</b>. This is for the following
            reasons:
            <ul class="content">
                <li>The aggregation requires each value for the group total.</li>
                <li>The DOM requires each value that is displayed (because of scrolling, not all are displayed)</li>
            </ul>
        </li>
        <li>
            As you <b>scroll up and down</b> the grid, the value getters are executed, as the DOM needs values for rendering.
        </li>
        <li>
            As you <b>open and close groups</b>, the value getters are executed, as the DOM needs values for rendering.
        </li>
        <li>
            Now turn the value cache <b>on</b> by selecting the radio button at the top. The grid gets reset and then
            works with the value cache on. Notice in the console that the value getter gets executed exactly 100 times,
            once for each row. Even through the value getter result is used in two places (aggregation and rendering
            the row), the value getter is only called once. Even scrolling and opening / closing the groups does not
            result in the value getter getting executed again.
        </li>
    </ul>

    <?= example('Value Cache', 'value-cache', 'vanilla', array("enterprise" => 1)) ?>

    <note>
        Note that the example still works fast when the value cache is turned off. This emphasises
        you don't need to turn the value cache on if your application is not getting slowed down by your
        value getters.
    </note>

    <h2>Value Cache Properties</h2>

    <p>
        The following are the grid properties related to the value cache.
    </p>

    <table class="table reference">
        <?php include './valueCacheProperties.php' ?>
        <?php printPropertiesRows($valueCacheProperties) ?>
    </table>

    <h2>Expiring the Value Cache</h2>

    <p>
        The value cache starts empty. Then as value getters execute, their results are stored and the value cache
        fills up. Certain events trigger the value cache to be emptied. This is called expiring the value
        cache. Once expired, every value getter will get executed again next time the value is needed.
        The events that cause the value cache to expire are the following:

    </p>
    <ul class="content">
        <li>New row data is set into the grid via <code>setRowData()</code> API or changing the
            <code>rowData</code> framework bound property*.</li>
        <li>New columns are set into the grid via <code>setColumnDefs()</code> API or changing the
            <code>columnDefs</code> framework bound property*.</li>
        <li>Data is modified using the <code>rowNode.setData(data)</code> or
            <code>rowNode.setDataValue(col,value)</code> node API methods.</li>
        <li>A value is modified in the grid using the grid's UI editing feature, e.g. the user double clicks
            a cell and enters a new value.</li>
        <li>The <code>expireValueCache()</code> grid API method gets called by the application.</li>
    </ul>
    <note>* Assuming your framework allows binding properties and this is what you are using.</note>

    <h2>Example - Expiring through Editing</h2>

    <p>
        The first example above didn't have any editing, so there was no concern for expiring the value cache.
        This example introduces grid editing. The example differs from the last in the following ways:
</p>
        <ul class="content">
            <li>Value Cache is on.</li>
            <li>Editing is enabled.</li>
            <li>There are only 10 rows, so it's easier to count the number of cells.</li>
            <li>
                There is another column <b>'Total x10'</b> which also uses a value getter and references
                the original <b>'Total'</b>column, thus calling this value getter results in an additional call
                to the original value getter.
            </li>
        </ul>
<p>
        As before, we focus on the value getter of the <b>'Total'</b> column and can see how many times it
        gets called via the console. The following can be noted:
    </p>

    <ul class="content">
        <li>The value's in the <b>Total</b> column are used many times as follows:
            <ul class="content">
                <li>For inserting the value into the DOM (ie what's visible in the cell).</li>
                <li>For calculating the group total for the total column (ie the figure 87,040 is
                a sum of the 5 values below it).</li>
                <li>For calculating the <b>'Total x 10'</b> column, as that value getter also
                references the values in the <b>'Total'</b> column.</li>
            </ul>
        </li>
        <li>
            Despite the values getting used multiple times, each value getter is executed exactly once.
            This can be observed by opening the development console and observing the log message
            the value getter prints.
        </li>
        <li>
            If you close and then re-open a group, the value getters are not re-executed, even though
            the values are needed to re-create the DOM elements that represent the cells.
        </li>
        <li>
            Hitting <b>'Refresh Cells'</b> will refresh all the cells, but again the value getters will not get re-executed.
        </li>
        <li>
            Hitting <b>'Invalidate Cache'</b> and then <b>'Refresh Cells'</b> will result in the value getters
            getting re-executed, as the cell refresh operation requires the values and the cache was invalidated.
            You will notice invalidating and then refreshing doesn't do anything noticeable to the grid, the
            data is the same, the only hint that anything happened is the value getter's console messages.
        </li>
        <li>
            Changing any value in the grid, either editing via the UI directly or hitting the
            <b>'Change One Value'</b> button, will result in the value cache getting cleared and all cells
            getting refreshed (where <a href="../javascript-grid-change-detection/">change detection</a>
            then updates any changes cells and only changed cells).
        </li>
    </ul>

    <?= example('Expiring Cache through Editing', 'expiring-through-editing', 'generated', array("enterprise" => 1)) ?>

    <note>
        It is not possible to partially invalidate the cache, eg it is not possible to invalidate only a
        portion of the cells. You might think that if you update a cell, then you only need to invalidate
        that row's data as the value getters can only access that row. That is not true - a value getter
        is a function where you can take data from anywhere in the grid and the grid is none the wiser.
        So if you change any value, then every single value getter is potentially impacted as far as the grid
        is concerned so the whole value cache is invalidated.
    </note>

    <h2>Setting to Never Expire</h2>

    <p>
        Above details how the cache operates under normal operations. In essence, the value cache gets expired
        whenever the grid is aware of a change to the underlying data. This strategy is the default strategy for
        the cache. If you want to <strong>persist the cache</strong> when data updates, then set the grid property
        <code>valueCacheNeverExpires=true</code>.

    </p>

    <p>
        If you have <code>valueCacheNeverExpires=true</code>, then the only event that
        will expire the value cache will be the <code>api.expireValueCache()</code> method. Use
        this if your data is changing, but you don't want to execute value getters again, or you
        want to control exactly when the value cache is expired.
    </p>

    <h3>Example - Never Expire</h3>

    <p>
        This example is again almost identical to the example above. The difference here is the value cache
        is turned on but to never invalidate. Note the following:
    </p>

    <ul class="content">
        <li>
            When the grid initialises, there are 12 value getter calls. The values are getting cached.
        </li>
        <li>
            After you edit a cell, either through the UI or through the API by pressing <b>'Update One Value'</b>,
            the value getters are not called again, so the total columns are not correctly refreshed. Because the
            grid already executed the value getter's for this column, it will not do it again, it will instead take
            values from the value cache.
        </li>
        <li>
            If you click <b>'Invalidate Value Cache'</b> after you have done some edits, and then click
            <b>'Refresh Cells'</b>, the total columns will update.
        </li>
    </ul>

    <?= example('Never expire Value change', 'never-expire', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
