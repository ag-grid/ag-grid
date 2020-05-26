<?php
$pageTitle = "Master Detail: Detail Panels";
$pageDescription = "How to configure Details Panels within the Master Detail feature of the grid";
$pageKeywords = "ag-grid javasript grid table master detail";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<style>
    .example-title {
        font-size: 20px;
        padding-top: 20px;
    }
</style>

<h1 class="heading-enterprise">Master / Detail - Detail Grids</h1>

<p class="lead">
    When a row in the Master Grid is expanded, a new Detail Grid appears underneath that row.
    This page describes configuration options relevant to the Detail Grid.
</p>

<p>
    The Detail Grid fits inside one row of the Master Grid without using any of the Master Grid's columns.
    It is the job of the Detail Cell Renderer to draw the Detail Grid into the provided detail row.
    This page explains how to configure the Detail Cell Renderer using the grid property
    <code>detailCellRendererParams</code> and how you can interact with the Detail Grids using the Master Grid's API.
</p>

<h2 id="detail-grid-options">Detail Grid Definition</h2>

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
    The example below shows configuring a Detail Grid with some additional Grid Options set. Note the following:
</p>
<ul>
    <li>
        The <code>detailGridOptions</code> is provided inside the <code>detailCellRendererParams</code>.
    </li>
    <li>
        The Detail Grid Options has the following properties set:
        <code>rowSelection=multiple</code>,
        <code>suppressRowClickSelection=true</code>,
        <code>enableRangeSelection=true</code>,
        <code>enableRangeSelection=true</code>,
        <code>pagination=true</code> and
        <code>paginationAutoPageSize=true</code>.
    </li>
    <li>
        The Detail Grid Options is provided with a Default Column Definition (<code>defaultColDef</code>) that
        makes all columns sortable and use Flex for sizing.
    </li>
    <li>
        The first Column Definition is configured to use Checkbox Selection.
    </li>
</ul>

<?= grid_example('Detail Grid Options', 'grid-options', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Providing Rows</h2>

<p>
    Row data is provided to the Detail Grid by implementing the <code>getDetailRowData</code> callback of the
    Detail Cell Renderer Params. The interface of this callback is as follows:
</p>
<snippet>
function getDetailRowData(params: GetDetailRowDataParams): void;

interface GetDetailRowDataParams {
    // details for the request,
    node: RowNode;
    data: any;

    // success callback, pass the rows back the grid asked for
    successCallback(rowData: any[]): void;
}
</snippet>

<p>
    The <code>successCallback</code> can be called synchronously immediately (typical if the data is already available) or
    asynchronously sometime in the future (typical if the data needs to be fetched remotely).
</p>

<p>
    The Master Grid in turn will call <code>api.setRowData()</code> on the Detail Grid with the data provided.
</p>

<p>
    All the previous examples on Master Detail provided the result synchronously and as such another specific example
    is not given here.
</p>

<p>
    The following snippet illustrates this using a simple <code>setTimeout()</code> function to delay supplying
    data to the detail row after a fixed timeout.
</p>

<p>
    Below shows an example using <code>setTimeout()</code> to simulate lazying loading of data
    in the detail.
</p>

<?= grid_example('Lazy Load Detail Rows', 'lazy-load-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="grid-per-row">Dynamic Definitions</h2>

<p>
    There will be many instances of Detail Grids within one Master Grid, as each time you expand a Master Row,
    a new instance of Detail Grid is created. It is possible to dynamically create Detail Cell Renderer Params
    so each Detail Grid gets it's own version of the params, allowing each Detail Grid to be configured differently.
    This is done by providing a function to <code>detailCellRendererParams</code> that in turn returns the params to
    use for that Detail Grid.
</p>

<p>
    Below shows an example of this, where the Detail Grids are configured with different columns. Note the following:
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


<h2>Changing the Template</h2>

<p>
    By default the Detail Cell Renderer does not include any other information around the Detail Grid. It is possible
    to change this to allow additional details, such as header information, around the Detail Grid. This is done
    by providing an alternative Detail Template.
</p>

<p>
    If providing an alternative template, you <b>must</b> contain an element with attribute
    <code>ref="eDetailGrid"</code>. This tells the grid where to place the Detail Grid.
</p>

<p>
    For comparison, the default template is as follows. It is simplistic, only intended for allowing
    spacing around the Detail Grid.
</p>
<snippet>
// for when fixed height (normal)
&lt;div class="ag-details-row ag-details-row-fixed-height">
    &lt;div ref="eDetailGrid" class="ag-details-grid ag-details-grid-fixed-height"/>
&lt;/div>

// for when auto-height (detailCellRendererParams.autoHeight=true)
&lt;div class="ag-details-row ag-details-row-auto-height">
    &lt;div ref="eDetailGrid" class="ag-details-grid ag-details-grid-auto-height"/>
&lt;/div>
</snippet>

<p>
    To change the Detail Template, set the <code>template</code> inside the Detail Cell Renderer Params.
    The Detail Template can be a String of Function depending on whether you want to provide the template
    statically or dynamically:
</p>

<ul class="content">
    <li>
        <b>String Template</b> - Statically overrides the template used by the grid.
        The same fixed template is used for each row. This is useful for styling
        or generic information.

        <snippet>
// example override using string template
detailCellRendererParams: {
    template:
        '&lt;div style="background-color: #edf6ff;">' +
        '  &lt;div style="height: 10%;">Call Details&lt;/div>' +
        '  &lt;div ref="eDetailGrid" style="height: 90%;">&lt;/div>' +
        '&lt;/div>'
    }
}
        </snippet>
    </li>
    <li>
        <b>Function Template</b> - Called each time a detail row is shown so can
        dynamically provide a template based on the data. Useful for displaying information
        specific to the Detail Grid dataset

        <snippet>
// override using template callback
detailCellRendererParams: {
    template: function (params) {
        var personName = params.data.name;
        return '&lt;div style="height: 100%; background-color: #EDF6FF;">'
            + '  &lt;div style="height: 10%;">Name: ' + personName + '&lt;/div>'
            + '  &lt;div ref="eDetailGrid" style="height: 90%;">&lt;/div>'
            + '&lt;/div>';
    }
}
        </snippet>
    </li>
</ul>

<p>
    The following two examples demonstrate both approaches.
</p>

<p class="example-title">Example Static Template</p>

<p>
    In this first example, the template is set statically. Note the following:
</p>

<ul>
    <li>All Detail Grid's have a spacing with blue background.</li>
    <li>All Detail Grid's have the same static title 'Call Details'.</li>
</ul>

<?= grid_example('Customising via String Template', 'string-template-customisation', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p class="example-title">Example Dynamic Template</p>

<p>
    In this second example, the template is set dynamically. Note the following:
</p>

<ul>
    <li>All Detail Grid's have a spacing with blue background.</li>
    <li>All Detail Grid's have the a different dynamic title including the persons name eg 'Mila Smith'.</li>
</ul>

<?= grid_example('Customising via Template Callback', 'template-callback-customisation', 'generated', ['enterprise' => true, 'exampleHeight' => 550, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Accessing Detail Grids</h2>

<p>
    The Master Grid manages all the Detail Grid instances. You can access the API of the underlying
    Detail Grids to call API methods directly on those grids. The Master Grid stores references to
    the Detail Grid API's in Detail Grid Info objects.
</p>

<p>
    The Detail Grid Info objects contain a reference to the underlying <a href="../javascript-grid-api/">Grid API</a>
    and <a href="../javascript-grid-column-api/">Column API</a> for each detail grid. The interface for Detail Grid
    Info is as follows:
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
    The Detail Grid Info objects are accessed via the Master Grid's API via the following
    methods:
</p>

<ul>
    <li>
        <p>
            <code>getDetailGridInfo(id)</code>: Returns back the Detail Grid Info for the Detail Grid
            with the provided ID.
        </p>

        <snippet>
// lookup a specific DetailGridInfo by id, and then call stopEditing() on it
var detailGridInfo = masterGridOptions.api.getDetailGridInfo('detail_someId');
detailGridInfo.api.flashCells();
        </snippet>

        <p>
            The grid generates ID's for detail grids by prefixing the parent row's ID with "detail_".
            For example if the ID of the expanded Master Row is "88", then the ID of the Detail Grid / row
            will be "detail_88".
        </p>
    </li>
    <li>
        <p>
            <code>forEachDetailGridInfo(callback)</code>: Calls the callback for each existing instance
            of a Detail Grid.
        </p>

        <snippet>
// iterate over all DetailGridInfo's, and call stopEditing() on each one
masterGridOptions.api.forEachDetailGridInfo(function(detailGridInfo) {
    detailGridInfo.api.flashCells();
});
        </snippet>

    </li>
</ul>

<p>
    This example shows flashing cells on the details grids by using the Grid API <code>flashCells()</code>.
    Note the following:
</p>

<ul class="content">
    <li>
        The example is made more compact by a) setting Detail Row Height to 200 pixels and
        b) setting CSS to reduce padding around the Detail Grid.
    </li>
    <li>
        The callback <code>getRowNodeId</code> is implemented in the Master Grid to give each row an
        ID. In this instance the <code>account</code> attribute is used.
    </li>
    <li>
        Button 'Flash Mila Smith' uses <code>getDetailGridInfo</code> to get access to the Grid API
        for the Mila Smith Detail Grid.
    </li>
    <li>
        Button 'Flash All' uses <code>forEachDetailGridInfo</code> to access all existing Detail Grid's.
    </li>
</ul>

<?= grid_example('Detail Grid API', 'detail-grid-api', 'generated', ['enterprise' => true, 'exampleHeight' => 535, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="keeping-row-details">Detail Grid Lifecycle</h2>

<p>
    When a Master Row is expanded a Detail Row is created. When the Master Row is collapsed, the Detail Row is
    destroyed. When the Master Row is expanded a second time, a Detail Row is created again from scratch. This can
    be undesirable behaviour if there was context in the Detail Row, e.g. if the user sorted or filtered data
    in the Detail Row, the sort or filter will be reset the second time the Retail Row is displayed.
</p>

<p>
    To prevent losing the context of Details Rows, the grid provides two properties to cache the Details Rows
    to be reused the next time the row is shows. The properties are as follows:
</p>

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'masterDetail', ['keepDetailRows', 'keepDetailRowsCount']) ?>

<p>
    The example below demonstrates keeping Detail Rows. Note the following:
</p>

<ul class="content">
    <li>
        The Master Grid has property <code>keepDetailRows=true</code> to turn on keeping Detail Rows.
    </li>
    <li>
        The Master Grid has property <code>keepDetailRowsCount=2</code> which sets the number of Details Rows
        to keep to 2.
    </li>
    <li>
        All the Detail Grids allow moving and sorting columns. If you change the state of a Detail Grid
        (e.g. by sorting a Detail Grid), that state will be kept if you close the Parent Row and then open
        the Parent Row again.
    </li>
    <li>
        The maximum number of Detail Rows kept is two. If you open three Detail Rows and apply sorting on
        each Detail Grid, then close all three Detail Rows (so none are showing) and then open all three again,
        only two of them will have the sort state kept.
    </li>
</ul>

<?= grid_example('Keep Detail Rows', 'keep-detail-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel', 'filterpanel', 'setfilter']]) ?>

<h2 id="detail-parameters">Detail Parameters</h2>

<p>
    The full list of Detail Cell Renderer Params are as follows:
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

<?php include '../documentation-main/documentation_footer.php';?>
