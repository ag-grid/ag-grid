<?php
$pageTitle = "Master Detail: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Master Detail. Use Master Detail to expand rows and have another grid with different columns inside. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail</h1>

<p class="lead">
    Master / Detail allows you to nest grids inside grids. The top level grid is referred to as the 'master grid'.
    The nested grid is referred to as the 'detail grid'. Typically the detail grid gives more information
    about the row in the master grid that was expanded to reveal the detail grid.
</p>

<note>
    Prior to ag-Grid v14.2, Master / Detail was not a feature of ag-Grid.
    Instead ag-Grid provided a feature called 'flower nodes' that could be used to implement
    Master / Detail which required a lot of complex configuration. Flower nodes are now deprecated.
    We will continue to support flower nodes for backwards compatibility, however we do not recommend
    them for any new development and have removed them from the documentation.
</note>

<p>
    To enable Master / Detail, you should set the following grid options:
</p>
    <ul class="content">
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


<h2>Example - Simple Master / Detail</h2>

<p>
    Below shows a simple Master / Detail setup. From the example you can notice the following:
</p>
    <ul class="content">
      <li><b>masterDetail</b> - is set to <code>true</code> in the master grid options.</li>
      <li><b>detailCellRendererParams</b> - specifies the <code>detailGridOptions</code> to use and <code>getDetailRowData</code>
    extracts the data for the detail row.</li>
    </ul>

<?= example('Simple Example', 'simple', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h2>Accessing Detail Grid API</h2>

<p>
    You can access the API of all detail grids via the master grid. The API for each detail grid
    is stored in a <code>DetailGridInfo</code> object that has the following properties:
</p>

<snippet>
interface DetailGridInfo {
    // id of the detail grid, the format is detail_&lt;row-id>
    // where row-id is the id of the parent row.
    id: string;

    // the grid API of the detail grid
    api: GridApi;

    // the column API of the detail grid
    columnApi: ColumnApi;
}
</snippet>

<p>
    The <code>DetailGridInfo</code> is accessed via the <code>GridApi</code> of the master
    <code>gridOptions</code>. You can either reference a particular detail grid API by ID,
    or loop through all the existing detail grid APIs.
</p>

<snippet>
// lookup a specific DetailGridInfo by id, and then call stopEditing() on it
var detailGridInfo = masterGridOptions.api.getDetailGridInfo('someDetailGridId');
detailGridInfo.api.stopEditing();

// iterate over all DetailGridInfo's, and call stopEditing() on each one
masterGridOptions.api.forEachDetailGridInfo(function(detailGridInfo) {
    console.log("detailGridInfo: ", detailGridInfo);
    // then e.g. call stopEditing() on that detail grid
    detailGridInfo.api.stopEditing();
});
</snippet>

<p>
    The <code>DetailGridInfo</code> contains a reference to the underlying <a href="../javascript-grid-api/">Grid API</a>
    and <a href="../javascript-grid-column-api/">Column API</a> for each detail grid. Methods invoked on these API's
    will only operate on the specific detail grid.
</p>

<h2>Example - Editing Cells with Master / Detail</h2>

<p>
    This example shows how to control cell editing when using Master / Detail. This examples demonstrates
    the following:

</p>

<ul class="content">
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

<?= example('Editing Cells with Master / Detail', 'cell-editing', 'generated', array("processVue" => true, "enterprise" => 1)) ?>



<h2>Overriding the Default Detail Cell Renderer</h2>

    <p>
        The template used by default detail Cell Renderer can be overridden with a user defined template. This is a convenient
        way to provide custom layouts and styles to the detail rows.
    </p>

    <p> There are two ways to achieve this: </p>
        <ul class="content">
            <li>
                <b>String Template</b> - statically overrides the template used by the grid.
                The same fixed template is used for each row.
            </li>
            <li>
                <b>Template Callback</b> - called each time a detail row is shown so can
                dynamically provide a template based on the data.
            </li>
        </ul>

<p> Both methods require specifying the <code>detailCellRendererParams.template</code>property as shown below: </p>

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
    The template <b>must</b> contain an element with attribute <code>ref="eDetailGrid"</code>.
    This element is used to host the detail grid instance.
</p>

<p>
    The following examples demonstrate both approaches.
</p>

<h2>Example - Customising via String Template</h2>

<p>
    This examples demonstrates a static string template which is supplied to the <code>detailCellRendererParams.template</code>
    property to customise the layout and background colour.
</p>

<?= example('Customising via String Template', 'string-template-customisation', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h2>Example - Customising via Template Callback</h2>

<p>
    A template callback function is supplied to the <code>detailCellRendererParams.template</code> property to customise
    the layout and background colour. It additionally adds the name from the master row using the data supplied via callback parameters.
</p>

<?= example('Customising via Template Callback', 'template-callback-customisation', 'generated', array("processVue" => true, "enterprise" => 1)) ?>


<h2>Providing a custom Detail Cell Renderer</h2>

<p>
    The previous section described how to override the detail template used in the default Cell Renderer, however it is also
    possible to provide a custom detail <a href="../javascript-grid-cell-rendering-components/">Cell Renderer Component</a>.
    This approach provides more flexibility but is more difficult to implement as you have to provide your
    own customer detail cell renderer. Use this approach if you want to add additional functionality to the
    detail panel that cannot be done by simply changing the template.
</p>

<p>
    To supply a custom detail Cell Renderer instead of using the default use: <code>gridOptions.detailCellRenderer</code>
</p>

<p>
    The following examples demonstrate custom Cell Renderer components for the detail row with and without a grid.
</p>

<h2>Example - Custom Detail Cell Renderer with a Grid</h2>

<p>
    By the very nature of a custom detail cell renderer it can contain zero or many grid instances. For this reason if
    you need the master grid to reference it's detail grids you will have to register them manually.
</p>

<p>
    When the detail grid is initialised, register it via <code>masterGridApi.addDetailGridInfo()</code> like so:
</p>

<snippet>
onGridReady(params) {
    var detailGridId = "detail_" + masterRowIndex;

    var detailGridInfo = {
        id: detailGridId,
        api: params.api,
        columnApi: params.columnApi
    };

    this.masterGridApi.addDetailGridInfo(detailGridId, detailGridInfo);
}
</snippet>

<p>
    And in a similar way unregister it when the detail cell renderer is destroyed using:
</p>

<snippet>
    var detailGridId = "detail_" + masterRowIndex;
    this.masterGridApi.removeDetailGridInfo(detailGridId);
</snippet>

<p>
    For details on how to access the detail grid api see:
    <a href="../javascript-grid-master-detail/#accessing-detail-grid-api/">Accessing Detail Grid API</a>.
</p>

<p>
    This example demonstrates how to embeds a grid into the detail row using a custom Cell Renderer component:
</p>

<?= example('Custom Detail Cell Renderer with Grid', 'custom-detail-with-grid', 'generated', array("processVue" => true, "enterprise" => 1)) ?>


<h2>Example - Custom Detail Cell Renderer with a Form</h2>

<p>
    This example demonstrates a custom Cell Renderer Component that uses a form rather than a grid:
</p>

<?= example('Custom Detail Cell Renderer with Form', 'custom-detail-with-form', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h2 id="grid-per-row">Configure Grid per Row</h2>

<p>
    The property <code>detailCellRendererParams</code> can be a function to allow providing
    different parameters for each row. This can be used to provide a differently configured grid
    for each row.
</p>

<p>
    The example below shows different grid configurations based on the data. Note the following:
    <ul>
        <li>
            Expanding rows 'Mila Smith' or 'Harper Johnson' will use a detail grid with the
            columns {Call ID, Number}.
        </li>
        <li>
            Expanding all other rows will use a detail grid with the columns {Call ID, Direction,
            Duration, Switch Code}.
        </li>
    </ul>
</p>

<?= example('Dynamic Params', 'dynamic-params', 'generated', array("processVue" => true, "enterprise" => 1)) ?>


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

<?= example('Dynamically Specify Master Nodes', 'dynamic-master-nodes', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h2>Nesting Master / Detail</h2>

<p>
    It is possible to nest Master / Detail grids. There are no special configurations required to achieve this,
    you just configure another detail grid inside the first detail grid.
</p>

<p>
    The following snippet illustrates how to achieve nesting via successive grid option configurations:
</p>

<snippet>
// Level 1 (master)
var gridOptionsLevel1Master = {
    ...
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel2Master,
        getDetailRowData: function (params) {
            params.successCallback(params.data.children);
        }
    }
}

// Level 2 (detail and master)
var gridOptionsLevel2Master = {
    ...
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel3Detail,
        getDetailRowData: function (params) {
            params.successCallback(params.data.children);
        }
    }
}

// Level 3 (detail only)
var gridOptionsLevel3Detail = {
    ...
    // no master / detail configuration
}
</snippet>


<h3>Example - Nesting Master / Detail</h3>
<p>
    Below shows a contrived master detail setup to help illustrate how nesting can be achieved.
    The example has very little data - this is on purpose to focus on the nesting.
</p>

<?= example('Nesting Master / Detail', 'nesting', 'generated', array("processVue" => true, "enterprise" => 1)) ?>


<h2>Detail Row Height</h2>

<p>
    The height of detail rows can be configured in one of the following two ways:
</p>
    <ol class="content">
        <li>
            Use property <code>detailRowHeight</code> to set a fixed height for each detail row.
        </li>
        <li>
            Use callback <code>getRowHeight()</code> to set height for each row individually.
            One extra complication here is that this method is called for every row in the grid
            including master rows.
        </li>
    </ol>

<p>
    The following snippet compares both approaches:
</p>


<snippet>
// option 1 - fixed detail row height, sets height for all details rows
masterGridOptions.detailRowHeight = 500;

// option 2 - dynamic detail row height, dynamically sets height for all rows
masterGridOptions.getRowHeight = function (params) {
    var isDetailRow = params.node.detail;
    if (isDetailRow) {
        var detailPanelHeight = params.data.children.length * 50;
        // dynamically calculate detail row height
        return detailPanelHeight;
    } else {
        // for all non-detail rows, return 25, the default row height
        return 25;
    }
}
</snippet>

<p>
    Note that the <code>detail</code> property can be used to identify detail rows.
</p>

<p>
    The following examples demonstrate both approaches:
</p>

<h3>Example - Fixed Detail Row Height</h3>
<p>
    The following demonstrates a fixed detail row height:
</p>

<?= example('Fixed Detail Row Height', 'fixed-detail-row-height', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h3>Example - Dynamic Detail Row Height</h3>
<p>
    The following example demonstrates dynamic detail row heights:
</p>

<?= example('Dynamic Detail Row Height', 'dynamic-detail-row-height', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h2>Filtering and Sorting</h2>
<p>
    There are no specific configurations for filtering and sorting with Master / Detail but as there are multiple grids
    each grid will filter and sort independently.
</p>

<h3>Example - Filtering with Sort</h3>

<p>
    Below shows a simple Master / Detail setup which has filtering and sorting enabled in both master and detail grids.
</p>

<?= example('Filtering with Sort', 'filtering-with-sort', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

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
    Below shows a simple Master / Detail setup which uses <code>setTimeout()</code> to simulate lazying loading of data
    in the detail rows:
</p>

<?= example('Lazy Load Detail Rows', 'lazy-load-rows', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

<h2>Supported Modes</h2>

<p>
    The Master / Detail feature organises the grid in a way which overlaps with other features.
    For example, Master / Detail expands rows, which is also the case with row grouping or enterprise
    row model. For this reason, Master / Detail does not work with certain grid configurations.
    These configurations are listed below.
</p>

<h3 id="row-models">Row Models</h3>

<p>
    The master grid (i.e. the top level grid) in Master / Detail can only be using the
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

<h3 id="tree-data">Tree Data</h3>

<p>
    Master / Detail is not supported with <a href="../javascript-grid-tree-data">Tree Data</a>.
    This is because the concept of tree data conflicts with Master / Detail, in that in tree
    data, any row can expand to show child rows, which would result in a clash when a row
    has child rows in addition to having Master / Detail at the same row.
</p>

<h3 id="layouts">Layouts</h3>

<p>
    It is not possible to mix <a href="../javascript-grid-width-and-height/#dom-layout">DOM layout</a>
    for master detail. This is because the layout is a CSS setting that would be inherited by all
    grids contained with the master grid. So if your master grid was 'for-print', then all child grids
    would pick up the 'for-print' layout.
</p>

<p>
    When using Master / Detail and <a href="../javascript-grid-for-print/">for-print</a>,
    then all detail grids need to use for-print.
</p>

<p>
    When using Master / Detail and <a href="../javascript-grid-width-and-height/#autoHeight">auto-height</a>,
    then all detail grids need to use auto-height.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
