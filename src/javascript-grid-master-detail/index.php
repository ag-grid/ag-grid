<?php
$key = "Master Detail";
$pageTitle = "ag-Grid JavaScript Master Detail DataGrid";
$pageDescription = "ag-Grid allows to use one component to span the entire width of the grid. This can be used to achieve a master detail datagrid, or grids inside grids.";
$pageKeyboards = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1">Master Detail</h1>

<p>
    Master detail allows you to nest grids inside grids. The top level grid is referred to as the 'master grid'.
    The nested grid is referred to as the 'detail grid'. Typically the detail grid gives more information
    about the row in the master grid that was expanded to reveal the detail grid.
</p>

<p>
    To enable master detail, you should set the following grid options:
    <ul>
        <li>
            <b>masterDetail:</b> Set to true to inform the grid you want to allow
            expanding of rows to reveal detail grids.
        </li>
        <li>
            <b>detailGridOptions:</b> The grid options to set for the detail grid.
            The detail grid is a fully featured instance of ag-Grid, so any configuration
            can be set on the detail grid that you would set any other grid.
        </li>
        <li>
            <b>getDetailRowData:</b> A function you implement to provide the grid
            with rows for display in the detail grids.
        </li>
    </ul>
</p>

<p>
    These grid options are illustrated below:
</p>

<snippet>
var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,

    // enable master detail
    masterDetail: true,

    // specify params for default detail cell renderer
    detailCellRendererParams: {
        // provide detail grid options
        detailGridOptions: detailGridOptions,

        // extract and supply row data for detail
        getDetailRowData: function(params) {
            params.successCallback(params.data.childRecords);
        }
    }
}

var detailGridOptions = {
    columnDefs: detailColumnDefs
}</snippet>


<h3>Example - Simple Master Detail</h3>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
    <ul>
      <li><b>masterDetail</b> - is set to <code>true</code> in the master grid options.</li>
      <li><b>detailCellRendererParams</b> - specifies the <code>detailGridOptions</code> to use and <code>getDetailRowData</code>
    extracts the data for the detail row.</li>
    </ul>
</p>
<br/>
<?= example('Simple Example', 'simple', 'vanilla', array("enterprise" => 1)) ?>


<h1>Overriding the Default Detail Cell Renderer</h1>
    <p>
        The template used by default detail Cell Renderer can be overridden with a user defined template. This is a convenient
        way to provide custom layouts and styles to the detail rows.
    </p>

   <p>
        There are two ways to achieve this:

        <ul>
            <li><b>String Template</b> - statically overrides the template used by the grid.</li>
            <li><b>Template Callback</b> - can be dynamically modified based on row data.</li>
        </ul>

        Both methods require specifying the <code>detailCellRendererParams.template</code> property as shown below:
</p>

<snippet>
// override using string template
detailCellRendererParams: {
    template:
        '&lt;div style="background-color: #edf6ff; padding: 20px; box-sizing: border-box;">' +
        '  &lt;div style="height: 10%;">Call Details&lt;/div>' +
        '  &lt;div ref="eDetailGrid" style="height: 90%;">&lt;/div>' +
        '&lt;/div>'
    }
}

// override using template callback
detailCellRendererParams: {
    template: function (params) {
        var personName = params.data.name;
        return '&lt;div style="height: 100%; background-color: #EDF6FF; padding: 20px; box-sizing: border-box;">'
            + '  &lt;div style="height: 10%;">Name: ' + personName + '&lt;/div>'
            + '  &lt;div ref="eDetailGrid" style="height: 90%;">&lt;/div>'
            + '&lt;/div>';
    }
}
</snippet>

<p>
    To insert the detail grid user provided template it is important to use the reference <code>eDetailGrid</code> as
    shown above.
</p>

<p>
    The follow examples demonstrate both approaches.
</p>

<h3>Example - Customising via String Template</h3>
<p>
    This examples demonstrates a static string template which is supplied to the <code>detailCellRendererParams.template</code>
    property to customise the layout and background colour.
</p>

<?= example('Customising via String Template', 'string-template-customisation', 'vanilla', array("enterprise" => 1)) ?>

<h3>Example - Customising via Template Callback</h3>

<p>
    A template callback function is supplied to the <code>detailCellRendererParams.template</code> property to customise
    the layout and background colour. It additionally adds the name from the master row using the data supplied via callback parameters.
</p>

<?= example('Customising via Template Callback', 'template-callback-customisation', 'vanilla', array("enterprise" => 1)) ?>


<h1>Providing a custom Detail Cell Renderer</h1>

<p>
    The previous section described how to override the detail template used in the default Cell Renderer, however it is also
    possible to provide a custom detail <a href="../javascript-grid-cell-rendering-components/">Cell Renderer Component</a>.
    This approach provides more flexibility but is less convenient.
</p>

<p>
    To supply a custom detail Cell Renderer instead of using the default use: <code>gridOptions.detailCellRenderer</code>
</p>

<p>
    The following examples demonstrate custom Cell Renderer components for the detail row with and without a grid.
</p>


<h3>Example - Custom Detail Cell Renderer with a Grid</h3>

<p>
    This example demonstrates how to embeds a grid into the detail row using a custom Cell Renderer component:
</p>

<?= example('Custom Detail Cell Renderer with Grid', 'custom-detail-with-grid', 'vanilla', array("enterprise" => 1)) ?>


<h3>Example - Custom Detail Cell Renderer with a Form</h3>

<p>
    This example demonstrates a custom Cell Renderer Component that uses a form rather than a grid:
</p>

<?= example('Custom Detail Cell Renderer with Form', 'custom-detail-with-form', 'vanilla', array("enterprise" => 1)) ?>


<h1>Accessing Detail Grid via Grid API</h1>

<p>
    In order to access a detail grid the <code>DetailGridInfo</code> exists with the following properties:
</p>

<snippet>
interface DetailGridInfo {
    id: string;
    api: GridApi;
    columnApi: ColumnApi;
}
</snippet>

<p>
    The <code>DetailGridInfo</code> is accessed via the <code>GridApi</code> of the master <code>gridOptions</code> as
    shown below:
</p>

<snippet>
// lookup a specific DetailGridInfo by id
var detailGridInfo = masterGridOptions.api.getDetailGridInfo('someDetailGridId');

// iterate over all DetailGridInfo's
masterGridOptions.api.forEachDetailGridInfo(function(detailGridInfo) {
    console.log("detailGridInfo: ", detailGridInfo);
});</snippet>

<p>
    The <code>DetailGridInfo</code> contains a reference to the underlying <a href="../javascript-grid-api/">Grid API</a>
    and <a href="../javascript-grid-column-api/">Column API</a> for each detail grid. Methods invoked on these API's
    will only operate on the specific detail grid.
</p>

<h3>Example - Editing Cells with Master Detail</h3>

<p>
    This example shows how to control cell editing when using master / detail. This examples demonstrates
    the following:

    <ul>
        <li><b>Edit Master</b> - performs editing on a master cell using the master grid options:
                                 <code>masterGridOptions.api.startEditingCell()</code>
        </li>
        <li><b>Stop Edit Master</b> - iterates over each master row node using <code>masterGridOptions.api.forEachNode</code>
                                      and then calls <code>masterGridOptions.api.stopEditing()</code> on each node.
        </li>
        <li><b>Edit Detail</b> - looks up the corresponding <code>DetailGridInfo</code> using <code>masterGridOptions.api.getDetailGridInfo()</code>
                                 and then uses the grid api on that detail grid start editing: <code>detailGrid.api.startEditingCell()</code>
        </li>
        <li><b>Stop Edit Detail</b> - iterates over each detail grid using <code>masterGridOptions.api.forEachDetailGridInfo()</code>
                                      and then calls <code>detailGridApi.api.stopEditing()</code> on each detail grid.
        </li>
    </ul>
</p>
<br/>

<?= example('Editing Cells with Master Detail', 'cell-editing', 'vanilla', array("enterprise" => 1)) ?>


<h2>Dynamically Specify Master Nodes</h2>

<p>
    It certain cases it may be required to not treat all top level rows as a master rows. For instance if a master has
    no child records it may not be desirable to expand the master row to an empty detail.
</p>

<p>
   In order to prevent this the following callback can be used on the master grid options:
</p>

<snippet>
masterGridOptions.isRowMaster = function (dataItem) {
    // return true when row data has children, false otherwise
    return dataItem ? dataItem.children.length > 0 : false;
}
</snippet>

<p>
    As shown above our callback function will return <code>true</code> when there are detail (i.e. children) records,
    otherwise it will return <code>false</code>.
</p>

<h3>Example - Dynamically Specify Master Nodes</h3>
<p>
    The following example only shows detail rows when there are corresponding child records.
</p>

<?= example('Dynamically Specify Master Nodes', 'dynamic-master-nodes', 'vanilla', array("enterprise" => 1)) ?>

<h2>Filtering and Sorting</h2>
<p>
    There are no specific configurations for filtering and sorting with Master Detail but as there are multiple grids
    each grid will filter and sort independently.
</p>

<h3>Example - Filtering with Sort</h3>

<p>
    Below shows a simple master detail setup which has filtering and sorting enabled in both Master and Detail grids.
</p>

<?= example('Filtering with Sort', 'filtering-with-sort', 'vanilla', array("enterprise" => 1)) ?>

<h2>Lazy Load Detail Rows</h2>
<p>
    It is possible to lazy load detail row data as it becomes available. For instance an asynchronous request could be
    sent when expanding a master row to fetch detail records.
</p>

<p>
    The following snippet illustrates this using a simple <code>setTimeout()</code> function to delay supplying
    data to the detail row after a fixed timeout.
</p>

<snippet>
var masterGridOptions = {
    detailCellRendererParams: {
        getDetailRowData: function (params) {
            // simulate delayed supply of data to the detail pane
            setTimeout(function () {
                params.successCallback(params.data.childRecords);
            }, 1000);
        }
    }
};
</snippet>

<p>
    Note that the key to this approach is the <code>params.successCallback(data)</code> function provided via the params, which can
    be invoked later or asynchronously once the data for the detail row is available.
</p>

<h3>Example - Lazy Load Detail Rows</h3>

<p>
    Below shows a simple master detail setup which uses <code>setTimeout()</code> to simulate lazying loading of data
    in the detail rows:
</p>

<?= example('Lazy Load Detail Rows', 'lazy-load-rows', 'vanilla', array("enterprise" => 1)) ?>

<h3>Example - Multiple Levels of Master Detail</h3>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Multiple Levels of Master Detail', 'multiple-levels', 'vanilla', array("enterprise" => 1)) ?>

<h2>Example - Detail Row Height</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Detail Row Height', 'detail-row-height', 'vanilla', array("enterprise" => 1)) ?>

<h2>Example - Dynamic Height</h2>

<p>
    Below shows a simple master / detail setup. From the example you can notice the following:
<ul>
    <li></li>
</ul>
</p>

<?= example('Dynamic Height', 'dynamic-row-height', 'vanilla', array("enterprise" => 1)) ?>


<h2>Supported Modes</h2>

<p>
    The master / detail feature organises the grid in a way which overlaps with other features.
    For example, master / detail expands rows, which is also the case with row grouping or enterprise
    row model. For this reason, master / detail does not work with certain grid configurations.
    These configurations are listed below.
</p>

<h3>Row Models</h3>

<p>
    The master grid (i.e. the top level grid) in master / detail can only be using the
    <a href="../javascript-grid-in-memory/">In Memory</a> row model.
    It is not supported with <a href="../javascript-grid-enterprise-model/">Enterprise</a>,
    <a href="../javascript-grid-viewport">Viewport</a> or
    <a href="../javascript-grid-infinite-scrolling">Infinite</a> row models. This is because
    all of these row models have their own unique way of loading data which would clash with
    the workings on master detail.
</p>

<p>
    The detail grid (i.e. the child grid) can use any of the row models. Thus as long as the
    master grid uses <a href="../javascript-grid-in-memory/">In Memory</a>, then the detail
    grid can use any of the other row models.
</p>

<p>
    The reason for this is that the row expand and collapse is either not support (viewport and
    infinite row models) or has a different meaning (enterprise row model loads more rows when
    you expand).
</p>

<h3>Tree Data</h3>

<p>
    Master detail is not supported with <a href="../javascript-grid-tree-data">Tree Data</a>.
    This is because the concept of tree data conflicts with master / detail, in that in tree
    data, any row can expand to show child rows, which would result in a clash when a row
    has child rows in addition to having master / detail at the same row.
</p>

<h3>Layouts</h3>

<p>
    It is not possible to mix <a href="../javascript-grid-width-and-height/#dom-layout">DOM layout</a>
    for master detail. This is because the layout is a CSS setting that would be inherited by all
    grids contained with the master grid. So if your master grid was 'for-print', then all child grids
    would pick up the 'for-print' layout.
</p>

<p>
    When using master detail and <a href="../javascript-grid-for-print/">for-print</a>,
    then all detail grids need to use for-print.
</p>

<p>
    When using master / detail and <a href="../javascript-grid-width-and-height/#autoHeight">auto-height</a>,
    then all detail grids need to use auto-height.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
