<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-side Row Model </h1>

<p class="lead">
    The Server-side Row Model is arguably the most powerful of the row models in ag-Grid
    and presents the ultimate 'big data' user experience, allowing the user to
    navigate through very large data sets using a mixture of Server-side grouping and aggregation
    while using infinite scrolling to bring the data back in blocks to the client.
</p>

<h2>Server-side Row Model Features</h2>

<p>
    The best way to learn what the Server-side Row Model does is to break it down into the core features.
    You may benefit from the combination of all these
    features or just be interested in a subset. The features of the
    Server-side Row Model are:
</p>

    <ul class="content">
        <li>
            <b>Lazy Loading of Groups:</b> The grid will load the top level rows only. Children
            of groups are only loaded when the user expands the group. Some applications may use
            the Server-side Row Model for this one feature alone e.g. you might have a managers database table,
            you can display a list of all managers, then click 'expand' on the manager and the grid
            will then request to get the 'employees' for that manager.
        </li>
        <li>
            <b>Server-side Grouping, Pivot and Aggregation:</b> Because the data is coming back from the server one group
            level at a time, this allows you to do aggregation on the server, returning back the aggregated
            results for the top level parent rows. For example you could include 'employee count' as an attribute
            on the returned manager record, to say how many employees a manager manages.
        </li>
        <li>
            <b>Infinite Scrolling:</b> Rows are read back from the server in blocks to provide the experience
            of infinite scrolling. This happens at each grouping level
            (ie the top level rows are brought back in blocks, then when you expand a group, the children
            of that group are also loaded in blocks). This allows viewing very large datasets in the browser by
            only bringing back data one block at a time. This feature reuses the logic from the
            <a href="../javascript-grid-infinite-scrolling/">Infinite Scrolling</a> row model, so understanding
            how that row model works will help you in understanding this part of the Server-side Row Model.
        </li>
        <li>
            <b>Slice and Dice:</b> Assuming your server-side can build the data query, you can allow the user
            to use the ag-Grid UI to drag columns around to select what columns you want to group by and aggregate
            on. What the user selects will then be forwarded to your datasource as part of the request. This feature
            is advanced and will require some difficult server-side coding from you, however if done correctly then
            your users will have an experience of slicing and dicing large data in real time, something previously
            only available in expensive reporting tools, now you can embed it into your JavaScript application.
        </li>
    </ul>

<h2>Server-side Datasource</h2>

<p>
    Similar to the <a href="../javascript-grid-infinite-scrolling/">Infinite Scrolling</a> and
    <a href="../javascript-grid-viewport/">Viewport</a> row models, you provide the grid with a datasource.
    The interface for the datasource is as follows:
</p>

<snippet>
// datasource for Server-side Row Model
interface IServerSideDatasource {

    // grid calls this to get rows
    getRows(params: IServerSideGetRowsParams): void;

    // optional destroy method, if your datasource has state it needs to clean up
    destroy?(): void;
}</snippet>

<p>
    Each time the grid requires more rows, it will call the <code>getRows()</code> method.
    The method is passed a <code>params</code> object that contains two callbacks (one for
    success and one for failure) and a request object with details what row the grid
    is looking for. The interface for the <code>params</code> is as follows:
</p>

<snippet>
interface IServerSideGetRowsParams {

    // details for the request, simple object, can be converted to JSON
    request: IServerSideGetRowsRequest;

    // the parent row node. is the RootNode (level -1) if request is top level.
    // this is NOT part fo the request as it cannot be serialised to JSON (a rowNode has methods)
    parentNode: RowNode;

    // success callback, pass the rows back the grid asked for.
    // if the total row count is known, provide it via lastRow, so the
    // grid can adjust the scrollbar accordingly.
    successCallback(rowsThisPage: any[], lastRow: number): void;

    // fail callback, tell the grid the call failed so it can adjust its state
    failCallback(): void;
}</snippet>

<p>
    The request gives details on what the grid is looking for. The success and failure callbacks are not included
    inside the request object to keep the request object simple data (ie simple data types, no functions). This
    allows the request object to be serialised (eg via JSON) and sent to your server. The request has the following interface:
</p>

<snippet>
interface IServerSideGetRowsRequest {

    // row group columns
    rowGroupCols: ColumnVO[];

    // value columns
    valueCols: ColumnVO[];

    // pivot columns
    pivotCols: ColumnVO[];


    // true if pivot mode is one, otherwise false
    pivotMode: boolean;

    // what groups the user is viewing
    groupKeys: string[];

    // if filtering, what the filter model is
    filterModel: any;

    // if sorting, what the sort model is
    sortModel: any;
}

// we pass a VO (Value Object) of the column and not the column itself,
// so the data can be converted to a JSON string and passed to server-side
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}</snippet>

<p>
    To see how the above interfaces are implemented, continue to the next section: <a href="../javascript-grid-server-side-model-infinite/">Infinite Scroll</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>