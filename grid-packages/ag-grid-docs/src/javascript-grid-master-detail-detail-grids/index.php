<?php
$pageTitle = "Master Detail: Detail Panels";
$pageDescription = "How to configure Details Panels within the Master Detail feature of the grid";
$pageKeywords = "ag-grid javasript grid table master detail";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail - Detail Grids</h1>

<p class="lead">
    When a row in the Master Grid is expanded, a new Detail Grid appears underneath that row.
    This page describes configuration options relevant to the Detail Grid.
</p>

<p>
    The Detail Grid fits inside one row of the Master Grid. The new child row doesn't use the columns
    of the Master Grid, instead it fills the entire row with one cell. When a row only has one cell and spans
    the full width of the grid, it is called a Full Width Row.
</p>
<p>
    It is the job of the Detail Cell Renderer to draw the Detail Grid into the provided Full Width cell.
    You tell the grid what Detail Cell Renderer to use via the grid property <code>detailCellRenderer</code>
    and you pass configuration details to it using the grid property <code>detailCellRendererParams</code>.
    If no Detail Cell Renderer is specified, the grid will use it's own default. The grid's default covers
    most scenarios required, thus most usages of Master / Detail will provide Detail Cell Renderer Params
    only and assume the default Detail Cell Renderer.
</p>

<p>
    This page outlines how to configure the grid's default Detail Cell Renderer.
    See <a href="../javascript-grid-master-detail-custom-detail/">Custom Detail</a> for details on how
    to configure a custom Detail Cell Renderer.
</p>

<p>
    The list of Detail Cell Renderer Params are as follows:
</p>

<?php createDocumentationFromFile('./properties.json', 'detailCellRenderer') ?>

<p>
    The pattern of setting components such as Cell Renderer's and providing parameters to those components
    is consistent across the grid and explained in <a href="../javascript-grid-components/">Grid Components</a>.
</p>

<p>
    As with all components, the parameters object (in this case <code>detailCellRendererParams</code>) can either
    be a JSON Object, or it can be a function that returns a JSON Object. The latter allows providing different
    parameters for each Detail Grid, allowing Detail Grids to be configured differently.
</p>


<h2 id="detail-grid-options">Detail Grid Options</h2>

<p>
    The Detail Grid is a fully fledged independent grid instance. This means that the Detail Grid has access to
    the full range of grid features.
</p>
<p>
    The instance of the grid is instantiated using native JavaScript and not any particular framework.
    This means properties are provided via a plain JavaScript object called Grid Options and not bound by any
    framework or HTML tags or bindings.
</p>
<p>
    The Grid Options JSON is provided to the Detail Grid using the parameter <code>detailGridOptions</code>.
</p>
<p>
    The <a href="../javascript-grid-master-detail/#example-simple">Simple Master / Detail Example</a>
    shows providing one Grid Options object for all details grids and as such the simple scenario is not repeated here.
</p>

<h2 id="grid-per-row">Different Detail Grids</h2>

<p>
    It is possible to have Detail Grids configured differently by utilising the function variant of the
    <code>detailCellRendererParams</code> property. The example below demonstrates this. Note the following:
</p>

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

<?= grid_example('Dynamic Params', 'dynamic-params', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<h2>Loading Detail Rows</h2>

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


<h2>Detail Template</h2>

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


<h2>Accessing Detail Grids</h2>

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


<h2>Refresh Detail Rows</h2>

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


<h2>Detail Grid Height</h2>

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


<h2 id="keeping-row-details">Detail Grid Lifecycle</h2>

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



<?php include '../documentation-main/documentation_footer.php';?>
