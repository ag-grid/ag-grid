<?php
$pageTitle = "Master Detail: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Master Detail. Use Master Detail to expand rows and have another grid with different columns inside. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail</h1>

<p class="lead">
    This section describes how to nest grids inside grids using a Master / Detail configuration.
</p>

<? enterprise_feature("Master Detail"); ?>

<?= videoSection("https://www.youtube.com/embed/8OeJn75or2w", "master-detail-video", "Master / Detail Video Tutorial") ?>

<p>
    With the Master Detail grid configuration, the top level grid is referred to as the 'master grid' and the nested grid
    is referred to as the 'detail grid'.
</p>

<p>
    With this configuration the detail grid can be used to display more information about the row in the master grid that was
    expanded to reveal the detail grid.
</p>

<note>
    It's important to mention that because the Master Detail is rendered in a different container, it will not be part of the
    selection when used in combination with <code>enableRangeSelection</code> or <code>enableCellTextSelection</code>.
</note>

<h2>Enabling Master Detail</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=7s", "00:07") ?>

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



<p>
    The example shows a simple Master / Detail setup. Note the following:
</p>

<ul class="content">
  <li><b>masterDetail</b> - is set to <code>true</code> in the master grid options.</li>
  <li><b>detailCellRendererParams</b> - specifies the <code>detailGridOptions</code> to use and <code>getDetailRowData</code>
extracts the data for the detail row.</li>
</ul>

<?= grid_example('Simple Example', 'simple', 'generated', ['enterprise' => true, 'exampleHeight' => 535, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Accessing Detail Grid API</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=132s", "02:12") ?>

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

<p>
    This example shows how to control cell editing when using Master / Detail. Note the following:
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

<?= grid_example('Editing Cells with Master / Detail', 'cell-editing', 'generated', ['enterprise' => true, 'exampleHeight' => 535, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Syncing Detail Scrolling with Master</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=249s", "04:09") ?>

<p>
    By default, detail grids scroll independently to the master grid. This happens because the Master Detail is
    rendered inside the <a href="/javascript-grid-full-width-rows"> Full Width Row</a> (an element that spans across
    the Grid Viewport).
</p>

<p>
    To force this full width row to fill the Grid scrollable area, it is necessary to enable the
    <code>embedFullWidthRows</code> property.
</p>

<p>
    In the example below, notice that horizontal scrolling from within the detail grid also scrolls the master:
</p>

<?= grid_example('Detail scrolls with Master', 'detail-scrolls-with-master', 'generated', ['enterprise' => true, 'exampleHeight' => 525, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Overriding the Default Detail Cell Renderer</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=273s", "04:33") ?>

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

<p> Both methods require specifying the <code>detailCellRendererParams.template</code> property as shown below: </p>

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

<note>
    The element containing <code>ref="eDetailGrid"</code> must be wrapped inside a div with the height set appropriately.
</note>

<p>
    The following examples demonstrate both approaches.
</p>

<p>
    This examples demonstrates a static string template which is supplied to the <code>detailCellRendererParams.template</code>
    property to customise the layout and background colour.
</p>

<?= grid_example('Customising via String Template', 'string-template-customisation', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    A template callback function is supplied to the <code>detailCellRendererParams.template</code> property to customise
    the layout and background colour. It additionally adds the name from the master row using the data supplied via callback parameters.
</p>

<?= grid_example('Customising via Template Callback', 'template-callback-customisation', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<h2>Providing a Custom Detail Cell Renderer</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=358s", "05:58") ?>

<p>
    The previous section described how to override the detail template used in the default Cell Renderer, however it is also
    possible to provide a custom detail <a href="../javascript-grid-cell-rendering-components/">Cell Renderer Component</a>.
    This approach provides more flexibility but is more difficult to implement as you have to provide your
    own custom detail cell renderer. Use this approach if you want to add additional functionality to the
    detail panel that cannot be done by simply changing the template.
</p>

<p>
    To supply a custom detail Cell Renderer instead of using the default use: <code>gridOptions.detailCellRenderer</code>
</p>

<p>
    The following examples demonstrate custom Cell Renderer components for the detail row with and without a grid.
</p>

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
    <a href="../javascript-grid-master-detail/#accessing-detail-grid-api">Accessing Detail Grid API</a>.
</p>

<p>
    This example demonstrates how to embed a grid into the detail row using a custom Cell Renderer component:
</p>

<?= grid_example('Custom Detail Cell Renderer with Grid', 'custom-detail-with-grid', 'generated', ['enterprise' => true, 'exampleHeight' => 545, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=560s", "09:20") ?>

<p>
    This example demonstrates a custom Cell Renderer Component that uses a form rather than a grid:
</p>

<?= grid_example('Custom Detail Cell Renderer with Form', 'custom-detail-with-form', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="grid-per-row">Configure Grid per Row</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=626s", "10:26") ?>

<p>
    The property <code>detailCellRendererParams</code> can be a function to allow providing
    different parameters for each row. This can be used to provide a differently configured grid
    for each row.
</p>

<p>
    The example below shows different grid configurations based on the data. Note the following:
    <ul class="content">
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

<?= grid_example('Dynamic Params', 'dynamic-params', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=702s", "11:42") ?>

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

<p>
    The following example only shows detail rows when there are corresponding child records.
</p>

<?= grid_example('Dynamically Specify Master Nodes', 'dynamic-master-nodes', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Nesting Master / Detail</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=770s", "12:50") ?>

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

<p>
    Below shows a contrived master detail setup to help illustrate how nesting can be achieved.
    The example has very little data - this is on purpose to focus on the nesting.
</p>

<?= grid_example('Nesting Master / Detail', 'nesting', 'generated', ['enterprise' => true, 'exampleHeight' => 425, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<h2>Detail Row Height</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=840s", "14:00") ?>

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
    The following demonstrates a fixed detail row height:
</p>

<?= grid_example('Fixed Detail Row Height', 'fixed-detail-row-height', 'generated', ['enterprise' => true, 'exampleHeight' => 575, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    The following example demonstrates dynamic detail row heights:
</p>

<?= grid_example('Dynamic Detail Row Height', 'dynamic-detail-row-height', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Filtering and Sorting</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=941s", "15:41") ?>

<p>
    There are no specific configurations for filtering and sorting with Master / Detail but as there are multiple grids
    each grid will filter and sort independently.
</p>

<p>
    Below shows a simple Master / Detail setup which has filtering and sorting enabled in both master and detail grids.
</p>

<?= grid_example('Filtering with Sort', 'filtering-with-sort', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'setfilter', 'columnpanel', 'filterpanel']]) ?>

<h2>Lazy Load Detail Rows</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=970s", "16:10") ?>

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

<p>
    Below shows a simple Master / Detail setup which uses <code>setTimeout()</code> to simulate lazying loading of data
    in the detail rows:
</p>

<?= grid_example('Lazy Load Detail Rows', 'lazy-load-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="keeping-row-details">Keeping Detail Rows</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=1017s", "16:57") ?>

<p>
    When a master row is expanded a detail row is created. When the master row is collapsed, the detail row is
    destroyed. When the master row is expanded a second time, a detail rows is created again from scratch. This can
    be undesirable behaviour if there was context in the detail row, e.g. if the user sorted or filtered data
    in the detail row, the sort or filter will be reset the second time the detail row is displayed.
</p>

<p>
    To prevent losing the context of details rows, the grid provides two properties to cache the details rows
    to be reused the next time the row is shows. The properties are as follows:
</p>

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'masterDetail', ['keepDetailRows', 'keepDetailRowsCount']) ?>

<p>
    The example below demonstrates keeping detail rows. Note the following:
</p>

<ul class="content">
    <li>
        The detail grid has property <code>keepDetailRows=true</code> to turn on keeping detail rows.
    </li>
    <li>
        The detail grid has property <code>keepDetailRowsCount=2</code> which sets the number of details rows
        to keep to 2.
    </li>
    <li>
        All the detail grids allow moving and sorting columns. If you change the state of a detail grid
        (e.g. by sorting a detail grid), that state will be kept if you close the parent row and then open
        the parent row again.
    </li>
    <li>
        The maximum number of detail rows kept is two. If you open three detail grids and apply sorting on
        each grid, then close all three detail grids (so none are showing) and then open the three grids
        again, only two of the grids will have the sort state kept.
    </li>
</ul>

<?= grid_example('Keep Detail Rows', 'keep-detail-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel', 'filterpanel', 'setfilter']]) ?>

<h2>Changing Data & Refresh</h2>

<p>
    It is desirable for the Detail Grid to refresh when fresh data is available for it. The grid will attempt
    to refresh the data in the Detail Grid when the parent Master Grid row is updated by any of the following:
</p>
<ul>
    <li>
        A <a href="../javascript-grid-data-update-transactions/">Transaction Update</a> updates the parent row.
    </li>
    <li>
        The grid is in <a href="../javascript-grid-immutable-data/">Immutable Data</a> mode and new row data is
        set which updates the Master Grid row.
    </li>
    <li>
        The method <code>rowNode.setRowData()</code> is called on the parent row's
        <a href="../javascript-grid-row-node/">Row Node</a>.
    </li>
</ul>

<p>
    How the refresh occurs depends on the Refresh Strategy set on the Detail Cell Renderer.
    There are three Refresh Strategies which are as follows:
</p>

<ol>
    <li>
        <b>Refresh Rows</b>
        - The detail panel calls <code>getDetailRowData()</code> again and sets the
        row data in the Detail Grid by using it's <code>setRowData</code> grid API.
        This will keep the Detail Grid instance thus any changes in the Detail
        Grid (scrolling, column positions etc) will be kept. If the Detail Grid is configured to use
        <a href="../javascript-grid-immutable-data/">Immutable Data</a> then more grid context will be
        kept such as row selection etc (see the documentation on
        <a href="../javascript-grid-immutable-data/">Immutable Data</a> for how this impacts keeping grid context).
    </li>
    <li>
        <b>Refresh Everything</b>
        - The Detail Panel will get destroyed and a fresh Detail Panel will be redrawn.
        This will result in <code>getDetailRowData()</code> getting called again. The Detail Grid
        will be a new instance and any changes in the Detail Grid (scrolling, column position, row selection etc)
        will be lost. If the Detail Panel is using a custom template, then the template will be re-created.
        Use this option if you want to update the template or you want a fresh detail grid instance.
    </li>
    <li>
        <b>Do Nothing</b>
        - The Detail Panel will do nothing. The method <code>getDetailRowData()</code> will not be called.
        If any refresh is required within the detail grid, this will need to be handled independently by
        the application. Use this if your refresh requirements are not catered for by the other two options.
    </li>
</ol>

<p>
    The strategy is set via the <code>refreshStrategy</code> parameter of the Detail Cell Renderer params.
    Valid values are <code>rows</code> for Refresh Rows, <code>everything</code> for Refresh Everything
    and <code>nothing</code> for Refresh Nothing. The default strategy is Refresh Rows.
</p>

<p>
    Below are different examples to demonstrate each of the refresh strategies. Each example is identical with the
    exception of the refresh strategy used. Note the following about each example:
</p>

<ul>
    <li>
        Each Detail Grid has a title with the record's name and call count eg 'Nora Thomas 24 calls'.
        This is set by providing a custom Detail Cell Renderer template. Only the detail strategy Refresh Everything
        will get this updated.
    </li>
    <li>
        The grid refreshes the first master row every two seconds as follows:
        <ul>
            <li>The call count is incremented.</li>
            <li>Half of the call records (displayed in the detail grid) have their durations updated.</li>
        </ul>
        All refresh strategies will have the Master Grid updated (as the strategy applies to the Detail Grid only),
        however each strategy will have the Detail Grid updated differently.
    </li>
</ul>

<p style="font-size: 20px; padding-top: 20px;">Example - Strategy Refresh Rows</p>

<p>
    This example shows the Refresh Rows strategy. Note the following:
</p>

<ul class="constant">
    <li>
        The Detail Cell Renderer params has <code>refreshStrategy='rows'</code>.
    </li>
    <li>
        The Detail Grid is <b>not</b> recreated.
        The callback <code>getDetailRowData()</code> is called.
        The row data in the Detail Grid is updated to reflect the new values.
        The grid's context (column position, vertical scroll) is kept. Try interacting with the Detail Grid
        for the first row (move columns, vertical scroll) and observe the grid is kept intact.
    </li>
    <li>
        Because the Detail Grid is configured with <a href="../javascript-grid-immutable-data/">Immutable Data</a>
        the data rows are updated rather than replaced. This allows context such maintaining Row Selection and
        flashing cells on data changes.
    </li>
    <li>
        The Detail Grid title 'Nora Thomas 24 calls' doesn't change as the template is only set once for the detail panel.
    </li>
</ul>

<?= grid_example('Refresh Rows', 'refresh-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p style="font-size: 20px; padding-top: 20px;">Example - Strategy Refresh Everything</p>

<p>
    This example shows the Refresh Everything strategy. Note the following:
</p>

<ul class="constant">
    <li>
        The Detail Cell Renderer params has <code>refreshStrategy='everything'</code>.
    </li>
    <li>
        The callback <code>getDetailRowData()</code> is called.
        The Detail Grid is recreated and contains the most recent data.
        The grid's context (column position, vertical scroll) is kept. Try interacting with the detail grid
        for the first row (move columns, vertical scroll) and observe the grid is kept intact.
    </li>
    <li>
        The Detail Grid setting <a href="../javascript-grid-immutable-data/">Immutable Data</a>
        is irrelevant as the Detail Grid is recreated.
    </li>
    <li>
        The detail grid title 'Nora Thomas 24 calls' updates with the new call count, as the refresh results in the
        template getting reset.
    </li>
</ul>

<?= grid_example('Refresh Everything', 'refresh-everything', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p style="font-size: 20px; padding-top: 20px;">Example - Strategy Refresh Nothing</p>

<p>
    This example shows the Refresh Nothing strategy. Note the following:
</p>

<ul class="constant">
    <li>
        The Detail Cell Renderer params has <code>refreshStrategy='nothing'</code>.
    </li>
    <li>
        No refresh is attempted.
    </li>
    <li>
        The callback <code>getDetailRowData()</code> is <b>not</b> called.
    </li>
    <li>
        The Detail Grid shows old data and the Detail Grid's title remains unchanged.
    </li>
</ul>

<?= grid_example('Refresh Nothing', 'refresh-nothing', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<h2>Exporting Master / Detail Data</h2>

<?= videoLink("https://www.youtube.com/watch?v=8OeJn75or2w&t=1183s", "19:43") ?>

<p>
    By default, exporting the master grid will just export the master rows. If you want to export detail rows, you can
    configure the <code>getCustomContentBelowRow</code> callback to generate a representation of the detail row that will
    be inserted below the master rows in the in the export. See the
    <a href="../javascript-grid-export/">export documentation</a> for more details.
</p>

<p>
    There is an important difference between rendering and exporting Master / Detail content. When you expand a master
    row in the UI, a new instance of the Grid is created to render the detail, meaning that you have the full power of
    the Grid to sort, filter and format the detail data.
</p>
<p>
    When exporting, the original data object representing
    the row is passed to <code>getCustomContentBelowRow</code> which returns styled content to be inserted into the
    export. No instance of the Grid is created. This means that export performance is good even with large Master /
    Detail data sets. However, if your <code>detailGridOptions</code> contains value getters, value formatters,
    sorting, filtering etc, and you want these to appear in the export, they must be applied by
    <code>getCustomContentBelowRow</code>.
</p>

<note>
    Since detail grids are full Grid instances, triggering an export through the right-click context menu on
    a detail grid will do a normal export for the detail grid only. If this is not appropriate for your application
    you can disable the export item in the context menu, or replace it with a custom item that triggers an export on
    the master grid.
</note>

<p>
    The example below demonstrate how both master and detail data can be exported.
</p>

<?= grid_example('Exporting Master / Detail Data', 'exporting', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel', 'clipboard', 'excel']]) ?>

<h2>Supported Modes</h2>

<p>
    The Master / Detail feature organises the grid in a way which overlaps with other features.
    For example, Master / Detail expands rows, which is also the case with row grouping. For this reason,
    Master / Detail does not work with certain grid configurations. These configurations are listed below:
</p>

<h3 id="row-models">Row Models</h3>

<p>
    The master grid (i.e. the top level grid) in Master / Detail can be used in the
    <a href="../javascript-grid-client-side-model/">Client-Side</a> and
    <a href="../javascript-grid-server-side-model-master-detail/">Server-Side</a> Row Models.
    However it is not supported with the <a href="../javascript-grid-viewport">Viewport</a> or
    <a href="../javascript-grid-infinite-scrolling">Infinite</a> Row Models.
</p>

<p>
    The detail grid (i.e. the child grid) can use any Row Model, as long as the
    master grid uses the <a href="../javascript-grid-client-side-model/">Client-Side</a> or
    <a href="../javascript-grid-server-side-model-master-detail/">Server-Side</a> Row Models, then the detail
    grid can use any of the other row models.
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
    When using Master / Detail and <a href="../javascript-grid-width-and-height/#auto-height">auto-height</a>,
    then all detail grids need to use auto-height.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
