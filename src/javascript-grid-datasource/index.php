<?php
$key = "Datasource";
$pageTitle = "ag-Grid Datasource";
$pageDescription = "To do pagination or virtual paging, you need to set up a datasource. This page explains how to create an ag-Grid datasource.";
$pageKeyboards = "ag-Grid Datasource";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="datasource">Datasource</h2>

    <p>
        A datasource is used when using row models a) pagination and b) virtual paging. This section explains the
        datasource used in each fo these row models.
    </p>

    <h4 id="setting-up-a-datasource">Setting up a Datasource</h4>

    <p>
        The datasource is set either as a grid property or by calling setDatasource API method.
    </p>

    <pre><span class="codeComment">// before grid initialised</span>
gridOptions.datasource = myDatasource;

<span class="codeComment">// using the api</span>
gridOptions.api.setDatasource(myDatasource);</pre>

    <note>
        If you are getting the error: "TypeError: Cannot read property 'setDatasource' of undefined" - it's because
        you are trying to set the datasource through the setDatasource method, but the API has not been attached
        to the gridOptions yet by the grid. To get around this, set the datasource in the 'ready()' method.
    </note>

    <h4 id="changing-a-datasource">Changing a Datasource</h4>

    <p>
        Changing the datasource after the grid is initialised will reset the paging in the grid. This is useful if the context of your
        data changes, ie if you want to look at a different set of data.
    </p>

    <p>
        <b>Note:</b> If you call <i>setDatasource</i> the grid will act assuming
        it's a new datasource, resetting the paging. However you can pass in the same datasource instance.
        So your application, for example, might have one instance of a datasource that is aware of some
        external context (eg the business date selected for a report, or the 'bank ATM instance' data you are
        connecting to), and when the context changes, you want to reset, but still keep the same datasource
        instance. In this case, just call setDatasource() and pass the same datasource in again.
    </p>

    <h4 id="the-datasource-object">The Datasource Object</h4>

    <p>
        The datasource you provide should implement the following interface:
    </p>

    <pre><span class="codeComment">// Datasource used by both PaginationController and VirtualPageRowModel</span>
interface IDatasource {

    <span class="codeComment">// If you know up front how many rows are in the dataset, set it here. Otherwise leave blank.</span>
    rowCount?: number;

    <span class="codeComment">// Callback the grid calls that you implement to fetch rows from the server. See below for params.</span>
    getRows(params: IGetRowsParams): void;
}
</pre>

    <h4 id="row-count">Row Count</h4>
    <p>
        The total number of rows, if known, is set using the attribute rowCount. If it's unknown, do not set, or set to -1. This
        will put the grid into <i>infinite scrolling</i> mode until the last row is reached. The definition of infinite scrolling
        depends on whether you are doing pagination or virtual paging and is explained in each of those sections.
        <b>rowCount is only used when you set the datasource</b> - if you discover what the last row is after
        data comes back from the server, provide this info as the second parameter of the <i>successCallback</i>
    </p>

    <h3 id="function-get-rows">Function getRows()</h3>

    <p>
        getRows is called by the grid to load pages into the browser side cache of pages. It takes parameter, called
        params, which has the following interface:
    </p>

    <pre><span class="codeComment">// Params for the above IDatasource.getRows()</span>
interface IGetRowsParams {

    <span class="codeComment">// The first row index to get.</span>
    startRow: number;

    <span class="codeComment">// The first row index to NOT get.</span>
    endRow: number;

    <span class="codeComment">// Callback to call for the result when successful.</span>
    successCallback(rowsThisPage: any[], lastRow?: number): void;

    <span class="codeComment">// Callback to call for the result when successful.</span>
    failCallback(): void;

    <span class="codeComment">// If doing server side sorting, contains the sort model</span>
    sortModel: any,

    <span class="codeComment">// If doing server side filtering, contains the filter model</span>
    filterModel: any,

    <span class="codeComment">// The grid context object</span>
    context: any
}</pre>

    <p>
        <b>startRow</b> and <b>endRow</b> define the range expected for the call. For example, if page
        size is 100, the getRows function will be called with start = 0 and end = 100 and the
        grid will expect a result with rows 100 rows 0..99.
    </p>

    <p>
        <b>successCallback</b> and <b>failCallback</b> are provided to either give the grid
        data, or to let it know the call failed. This is designed to work with the promise pattern
        that Javascript HTTP calls use. The datasource must call one, and exactly one, of these
        methods, to ensure correct operation of the grid. Even if your server request fails, you must
        call 'failCallback'.
    </p>

    <p>
        <b>successCallback</b> expects the following parameters:<br/>
    <ul>
        <li><b>rowsThisPage:</b> An array of rows loaded for this page.</li>
        <li><b>lastRow:</b> The total number of rows, if known.</li>
    </ul>
    </p>

    <p>
        <b>failCallback</b> expects no parameters. It is up to your application to inform the
        user of the error. Informing the grid is necessary for the grid to internally clean up
        after the failure.<br/>
    </p>

    <p>
        <b>lastRow</b> is used to move the grid out of infinite scrolling. If the last row is known,
        then this should be the index of the last row. If the last row is unknown, then leave
        blank (undefined, null or -1). This attribute is only used when in infinite scrolling / paging.
        Once the total record count is known, the total numbers of rows is fixed and cannot be
        changed for this grid (unless a new datasource is provided).
    </p>

    <p>
        <b>context</b> is the grids context. Use this is you want to pass some context information
        that the datasource then has access to.
    </p>

    <h3 id="page-size">Page Size</h3>

    <p>
        The page size is set using the grid property <i>paginationPageSize</i>. This is how large the 'pages' should be.
        Each call to your datasource will be for one page. For simple pagination, one page is display
        to the user at a time. For virtual pagination, the page size is the size of the page in the
        grids page cache.
    </p>

    <h3 id="next-steps">Next Steps</h3>

    <p>
        Now that you can create a datasource, go onto the next sections to set up a datasource
        for pagination or virtual paging.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>