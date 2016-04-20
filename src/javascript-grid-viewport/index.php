<?php
$key = "Viewport";
$pageTitle = "ag-Grid Providing Tree Data";
$pageDescription = "You can provide the data to your grid in a tree format. This page explains how to set this up.";
$pageKeyboards = "ag-Grid Javascript Tree";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Viewport</h2>

    <p>
        A Viewport is a rowModel that allows showing a 'window' of data in your client. Typically all the data
        will reside on the server and the server will know what data is displayed in the client. This is again
        useful for the server to push changes out to the client as it knows what data is currently displayed.
    </p>

    <p>
        The term 'viewport' is a common term in GUI's used to describe the visible area when scrolls are used
        to display content that is larger than the visible area. In ag-Grid, the viewPort is referred to as the
        vertical scroll position, thus it defines the rows that are currently rendered by the grid.
    </p>

    <p>
        ag-Grid uses 'DOM row virtualisation' which means it only renders the rows you currently see. So ag-Grid
        already uses the concept of a viewport for rendering the rows. The grid extends this concept and maps
        the viewport information to the <i>viewportRowModel</i>.
    </p>

    <p>
        Use a viewPort to display large live sets of data in the grid. The 'large' referring to you only want
        to load a subset of the data into the grid. The 'live' referring to the data is updating at the source
        (typically a server) and the source sends updates to the grid when displayed data is changed.
    </p>

    <p>
        The diagram belows shows how the viewport maps to a connection to your dataset. The dataset connection
        knows what the viewport is displaying and sends up data accordingly. When the use scrolls, the viewport
        will 'get' data from the source. If / when the data changes, the source will 'push' the data to the
        viewport if it knows the viewport is displaying that data.
    </p>
    <img src="./viewport.png"/>

    <note>
        It is the responsibility of the grid to display the data. It is the responsibility of the application
        (ie your code) to fetch the data. So if you are doing WebSockets or otherwise, all of that coding
        belongs in the client code.
    </note>

    <h3>Interface IViewportDatasource</h3>

    <p>
        To use the viewportRowModel you provide the grid with a <i>viewportDatasource</i>. A viewportDatasource
        should look like the following:
    </p>

    <pre>interface IViewportDatasource {

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
    setRowCount: (count:number) => void;

    // datasource calls this when new data arrives. The grid then updates 
    // the provided rows. The rows are mapped [rowIndex]=>rowData].
    setRowData: (rowData:{[key:number]:any}) => void;

    // datasource calls this when it wants a row node - typically used
    // when it wants to update the row node data
    getRow: (rowIndex: number) => RowNode;
}
</pre>

    <h3>Example Sequence</h3>

    <p>
        Reading the interfaces will look confusing if you are looking at the for the first time as the different
        parts done make sense individually, it's how they all work together that creates the magic. So to
        explain, the following is a sequence of what may happen.
    </p>

    <p>
        <ol>
        <li>
            You provide a new viewportDatasource to the grid. The grid will then call <i>datasource.init()</i>
            and provide the callbacks the datasource needs. The datasource should store a reference to these callbacks
            and then make an asynchronous call to the server to find out how large the set of data is that needs
            to be displayed.
        </li>
        <li>
            The datasource responds with the size of the data (eg 1,000 rows) and calls <i>params.setRowCount(1000)</i>.
            The grid responds by sizing the vertical scroll to fit 1,000 rows.
        </li>
        <li>
            The grid, due to it's physical size on the screen, works out it can display 20 rows at any given time.
            Given the scroll position is at the start, it calls <i>datasource.setViewportRange(0,19)</i> informing
            the datasource what data it needs. The grid will display blank rows for the moment.
        </li>
        <li>
            The datasource will make an asynchronous call to the server asking for rows 0 to 19. Some time later
            the result will come back the datasource will call <i>params.setRowData(map)</i> where the map will
            have 20 entries, the keys will be the strings (a JavaScript object only allows strings as object keys,
            not numbers) 0 to 19 and the values will be the row data.
        </li>
        <li>
            The grid will refresh all the rows for 0 to 19 with the new data. At this point the current sequence
            is complete. The grid will remain static until either the user scrolls, or the datasource informs of
            a data change.
        </li>
        <li>
            For example, the user scrolls to position above repeats, the grid calls <i>datasource.setViewportRange(100,119)</i>,
            the datasource asynchronously responds with <i>params.setRowData(map)</i>.
        </li>
    </ol>
    </p>

    <h3>Updating Data</h3>

    <p>
        If your data changes, you should get a reference to the node by calling <i>params.getRowData(rowIndex)</i>
        and then call ONE of the following:
    <ul>
        <li>
            <i>rowNode.setData(newData)</i>: Call this to set the entire data into the node. The new data will be stored
            inside the rowNode replacing the old data. This will result in the grid
            ripping out the rendered row in the DOM and replacing with a new rendered row. If you have any custom cellRenderers, they
            will be destroyed and new ones created, so no way to achieve animation.
        </li>
        <li>
            <i>rowNode.setDataValue(colKey, newValue)</i>: Call this to set one value into the node. The new value will
            be stored inside the old data, leave the rest of the data untouched. This will result in the grid refreshing
            only the cell that was updated. If the cell has a component with a refresh method, the refresh method will be
            called thus allowing animation. If no refresh method is provided, the grid will remove the cell (and destroy
            the cellRenderer if it exists) and create the cell again from scratch.
        </li>
    </ul>
    </p>

    <h2>Example</h2>

    <p>
        The example below shows a viewport in action.
    </p>

    <p>
        Two built in cellRenderers are used: animateShowChange (bid, mid and ask columns) and animateSlide
        (volume column). You may find these useful, however they are provided to demonstrate how one could
        achieve a change animation. You will probably want to provide your own custom animation cellRenderer
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

    <show-example example="exampleViewport"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
