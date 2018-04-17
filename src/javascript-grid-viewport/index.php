<?php
$pageTitle = "ag-Grid Row Models: ViewPort Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Viewport is a rowModel that allows showing a 'window' of data in your client.";
$pageKeyboards = "ag-Grid ViewPort";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 class="first-h1 heading-enterprise">Viewport Row Model</h1>

    <note>
        Don't use Viewport Row Model unless you understand what advantages it offers and whether or not you need them.</p>
        We find many of our users are using Viewport Row Model when they don't need to and end up with unnecessarily
        complicated applications as a result. We'd recommend taking a look at our most powerful row model the
        <a href="../javascript-grid-enterprise-model/">enterprise row model</a> as an alternative.
        <br><br>
        The differences between row models can be found in our <a href="../javascript-grid-row-models/">row models summary page</a>
    </note>

    <p>
        A Viewport is a rowModel that allows showing a 'window' of data in your client. Typically all the data
        will reside on the server and the server will know what data is displayed in the client. This is again
        useful for the server to push changes out to the client as it knows what data is currently displayed.
    </p>

    <p>
        To enable the ViewPort, set the grid property <code>rowModelType='viewport'</code>.
    </p>

    <p>
        The term 'viewport' is a common term in GUI's used to describe the visible area when scrolls are used
        to display content that is larger than the visible area. In ag-Grid, the viewport is referred to as the
        vertical scroll position, thus it defines the rows that are currently rendered by the grid.
    </p>

    <p>
        ag-Grid uses 'DOM row virtualisation' which means it only renders the rows you currently see. So ag-Grid
        already uses the concept of a viewport for rendering the rows. The grid extends this concept and maps
        the viewport information to the <code>viewportRowModel</code>.
    </p>

    <p>
        Use a viewport to display large live sets of data in the grid. The 'large' referring to you only want
        to load a subset of the data into the grid. The 'live' referring to the data is updating at the source
        (typically a server) and the source sends updates to the grid when displayed data is changed.
    </p>

    <p>
        The diagram belows shows how the viewport maps to a connection to your dataset. The dataset connection
        knows what the viewport is displaying and sends up data accordingly. When the user scrolls, the viewport
        will 'get' data from the source. If / when the data changes, the source will 'push' the data to the
        viewport if it knows the viewport is displaying that data.
    </p>
    <img src="./viewport.png" class="img-fluid"/>

    <note>
        It is the responsibility of the grid to display the data. It is the responsibility of the application
        (ie your code) to fetch the data. So if you are doing WebSockets or otherwise, all of that coding
        belongs in the client code.
    </note>

    <h2>Interface <code>IViewportDatasource</code></h2>

    <p>
        To use the viewportRowModel you provide the grid with a <code>viewportDatasource</code>. A viewportDatasource
        should look like the following:
    </p>

    <snippet>
interface IViewportDatasource {

    // Gets called exactly once before viewPort is used.
    // Passes methods to be used to tell viewPort of data loads / changes.
    init(params: IViewportDatasourceParams): void;

    // Tell the viewport what the scroll position of the grid is, so it knows what rows it has to get
    setViewportRange(firstRow: number, lastRow: number): void;

    // Gets called once when viewPort is no longer used. If you need to do any cleanup, do it here.
    destroy?(): void;
}
        
interface IViewportDatasourceParams {

    // datasource calls this method when the total row count changes. 
    // This in turn sets the height of the grids vertical scroll.
    setRowCount: (count:number) =&gt; void;

    // datasource calls this when new data arrives. The grid then updates 
    // the provided rows. The rows are mapped [rowIndex]=&gt;rowData].
    setRowData: (rowData:{[key:number]:any}) =&gt; void;

    // datasource calls this when it wants a row node - typically used
    // when it wants to update the row node data
    getRow: (rowIndex: number) =&gt; RowNode;
}</snippet>

    <h2>Example Sequence</h2>

    <p>
        Reading the interfaces will look confusing if you are looking at the for the first time as the different
        parts don't make sense individually, it's how they all work together that creates the magic. So to
        explain, the following is a sequence of what may happen.
    </p>

        <ol class="content">
        <li>
            You provide a new viewportDatasource to the grid. The grid will then call <code>datasource.init()</code>
            and provide the callbacks the datasource needs. The datasource should store a reference to these callbacks
            and then make an asynchronous call to the server to find out how large the set of data is that needs
            to be displayed.
        </li>
        <li>
            The datasource responds with the size of the data (eg 1,000 rows) and calls <code>params.setRowCount(1000)</code>.
            The grid responds by sizing the vertical scroll to fit 1,000 rows.
        </li>
        <li>
            The grid, due to its physical size on the screen, works out it can display 20 rows at any given time.
            Given the scroll position is at the start, it calls <code>datasource.setViewportRange(0,19)</code> informing
            the datasource what data it needs. The grid will display blank rows for the moment.
        </li>
        <li>
            The datasource will make an asynchronous call to the server asking for rows 0 to 19. Some time later
            the result will come back and the datasource will call <code>params.setRowData(map)</code> where the map will
            have 20 entries, the keys will be the strings (a JavaScript object only allows strings as object keys,
            not numbers) 0 to 19 and the values will be the row data.
        </li>
        <li>
            The grid will refresh all the rows for 0 to 19 with the new data. At this point the current sequence
            is complete. The grid will remain static until either the user scrolls, or the datasource informs of
            a data change.
        </li>
        <li>
            If for example the user scrolls down 100 rows, the sequence above partially repeats, the grid calls <code>datasource.setViewportRange(100,119)</code>,
            the datasource asynchronously responds with <code>params.setRowData(map)</code>.
        </li>
    </ol>

    <h2>Updating Data</h2>

    <p>
        If your data changes, you should get a reference to the node by calling <code>params.getRowData(rowIndex)</code>
        and then call ONE of the following:
    </p>

    <ul class="content">
        <li>
            <code>rowNode.setData(newData)</code>: Call this to set the entire data into the node. The new data will be stored
            inside the rowNode replacing the old data. This will result in the grid
            ripping out the rendered row in the DOM and replacing with a new rendered row. If you have any custom cellRenderers, they
            will be destroyed and new ones created, so no way to achieve animation.
        </li>
        <li>
            <code>rowNode.setDataValue(colKey, newValue)</code>: Call this to set one value into the node. The new value will
            be stored inside the old data, leave the rest of the data untouched. This will result in the grid refreshing
            only the cell that was updated. If the cell has a component with a refresh method, the refresh method will be
            called thus allowing animation. If no refresh method is provided, the grid will remove the cell (and destroy
            the cell renderer if it exists) and create the cell again from scratch.
        </li>
    </ul>

    <h2>Replacing Data</h2>

    <p>
        You may want to completely change data in the viewport, for example if you are showing 'latest 10 trades over 10k'
        which changes over time as to what the trades are, then you just call <code>setRowData()</code> again with the new data.
        The grid doesn't care how many times you call <code>setRowData()</code> with new data. You could alternatively call
        <code>rowNode.setData(data)</code> on the individual row nodes, it will have the same effect.
    </p>

    <p>
        If you want to change the length of data (eg you apply a filter, or the result set otherwise grows or shrinks) then you
        call <code>setRowCount()</code> again. The grid doesn't are how many times you call <code>setRowCount()</code>.
    </p>

    <h2>Sorting</h2>

    <p>
        Only server side sorting is supported, if you want sorting you have to do it yourself on the server side.
        This is done by listening for the <code>sortChanged</code> event and then calling <code>setRowData()</code> with the new
        data when it arrives.
    </p>

    <h2>Filtering</h2>

    <p>
        As with sorting, filtering also must be done on the server side. To implement, listen for the <code>filterChanged</code>
        event and apply the filter to your server side set of data. Then call <code>setRowCount()</code> and <code>setRowData()</code>
        to display the new data.
    </p>

    <h2>Selection</h2>

    <p>
        Selection works with viewport. It is recommended that you implement <code>getRowNodeId()</code> to give a unique
        key to each row. That way, should the same row appear again but in a different location, it will keep its
        selection value. See the example below for setting up <code>getRowNodeId()</code>.
    </p>

    <note>
        Performing multiple row selections using 'shift-click' is only possible for rows that are available within the viewport.
    </note>

    <h2>Grouping</h2>

    <p>
        And you guessed it, if you are doing grouping, you will need to implement this yourself on the server side.
        If you group, then you will need to provide your own <code>groupCellRenderer</code> that gives functionality to your own
        custom grouping. You will also need to manage how the grouping impacts the overall grid's set size yourself (ie
        if you expand a group, the number of rows increases, and likewise contracting will decrease).
    </p>

    <h2>Viewport Settings</h2>

    <p>
        For simplicity the above said the viewport was the rows the grid is currently displaying. This is almost true
        except there are two properties, viewportRowModelPageSize and viewportRowModelBufferSize, to make the
        communication with the server better.
    </p>

    <h3><code>viewportRowModelPageSize</code></h3>
    <p>
        It is not good to have the grid ask for rows one at a time if the user is scrolling slowly. To get around this,
        the grid defines a page size, so it will ask for rows in 'pages'. For example, if the pages size is 5, then
        the viewport will always start and end in numbers divisible by 5 such as 0 to 20 or
        75 to 100. So if the user is scrolling slowly, the viewport will only be requested to get new rows after the
        grid hits 'the next five rows'. The default page size is 5. To change this, set the grid property
        <code>viewportRowModelPageSize</code>.
    </p>

    <h3><code>viewportRowModelBufferSize</code></h3>
    <p>
        In addition to the page size, the grid will also extend the viewport outside the viewable area by the buffer
        size. For example, if the viewport is showing rows 30 to 50, and the buffer is set to 5, the grid will request
        rows 25 to 55 from the viewport. This will reduce 'loading flicker' as the user scrolls through the data.
        The default buffer size is 5. To change this, set the grid property <code>viewportRowModelBufferSize</code>.
    </p>

    <h2>Example Viewport</h2>

    <p>
        The example below shows a viewport in action.
    </p>

    <p>
        Two built in cell renderers are used: <code>animateShowChange</code> (bid, mid and ask columns) and animateSlide
        (volume column). You may find these useful, however they are provided to demonstrate how one could
        achieve a change animation. You will probably want to provide your own custom animation cell renderer
        as how the animation happens will be depend on your application, the type of data and frequency
        of change.
    </p>

    <p>
        The example uses a 'mockServer'. This is because all of the examples in this documentation work
        without any dependencies on any server. In your application, instead of using a mock server, you should
        connect to your real server. However the code in the mockServer example can be used to observe what
        your server code should be doing - it demonstrates keeping a connection open that is aware of the viewport
        position and pushes data to the client based on the viewport position.
    </p>

<?= example('Viewport Example', 'viewport', 'generated', array( 'enterprise'=> true )) ?>

    <h2>Example Viewport with Pagination</h2>

    <p>
        The example below is almost identical to the above example with the following differences:
    </p>

        <ul class="content">
            <li>
                <code>pagination = true</code> To enable pagination.
            </li>
            <li>
                <code>paginationAutoPageSize = true</code> To set the pagination size to the height of the grid,
                so no vertical scrolls are used.
            </li>
            <li>
                <code>viewportRowModelPageSize = 1</code> Because we are showing exact pages, the user will not
                be scrolling, so there is no need to set a minimum page size. Setting page size to 1 means the grid
                will always ask from the top row through to the bottom row.
            </li>
            <li>
                <code>viewportRowModelBufferSize = 0</code> Likewise because there is no scrolling, there is no
                sense in bringing back extra rows to act as a buffer.
            </li>
        </ul>

    <?= example('Pagination Viewport Example', 'pagination-viewport', 'generated', array( 'enterprise'=> true )) ?>

<!--
This was example put in by niall for trying to figure out how to have unlimited number of rows in grid
    <h1>Very Large Data Set</h1>
-->
    <?/*= example('Viewport Big Data', 'viewport-big-data', 'generated', array( 'enterprise'=> true )) */?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
