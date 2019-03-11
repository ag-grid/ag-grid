<?php
$pageTitle ="ag-Grid: Components - Tooltip Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This covers how you can use custom tooltips to the grid columns.";
$pageKeyboards = "JavaScript Grid Custom Tooltip";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Tooltip Component</h1>

<p class="lead">
    Tooltip components allow you to add your own tooltips to ag-Grid's column header and cells. Use these when the provided 
    tooltip component or the default browser tooltip do not meet your requirements.
</p>

<h2>Tooltip Component Interface</h2>

<p>Implement this interface to provide a custom tooltip.</p>

<snippet>
interface ITooltipComp {

    // mandatory methods

    // The init(params) method is called on the tooltip component once. See below for details on the parameters.
    init(params: ITooltipParams): void;

    // Returns the GUI for this loading cell renderer. The GUI can be a) a string of html or b) a DOM element or node.
    getGui(): any;
}
</snippet>

<snippet>
interface ITooltipParams {
    // the grid api
    api: any;

    // the column api
    columnApi: any;

    // the grid colDef
    colDef: any;

    // the column bound to this tooltip
    column: any;

    // the grid context
    context: any;

    // the value to be rendered by the tooltip
    value?: any;

    // the formatted value
    valueFormatted?: any;

    /* Row and Cell Params (N/A with headerTooltips) */

    // the index of the row that contains the cell rendering the tooltip
    rowIndex?: number;

    // the row node
    node?: any;

    // th row node data
    data?: any;

    // the cell component scope
    $scope?: any;
}
</snippet>

<h2>Registering Custom Tooltip Components</h2>

<p>
    See the section <a href="../javascript-grid-components/#registering-custom-components">registering custom components</a>
    for details on registering and using custom loading cell renderers.
</p>

<h2>Default Browser Tooltip</h2>

<p>
    If you don't want to use Ag-Grid's tooltip component, you can use the <code>enableBrowserTooltips</code> config to use
    the browser's default tootip. 

    Note: That will use the element's title attribute to display the tooltip.
</p>

<h2>Example: Custom Tooltip</h2>

<p>
    The example below demonstrates how to provide custom tooltips to the grid. Notice the following:
</p>

<ul class="content">
    <li><b>Custom Tooltip Component</b> is supplied by name via <code>colDef.tooltipComponent</code>.</li>
    <li><b>Custom Tooltip Parameters</b> are supplied using <code>colDef.tooltipComponentParams</code>.</li>
</ul>

<?= example('Custom Tooltip Component', 'custom-tooltip-component', 'generated', array('processVue' => true) ) ?>

<h2>Example: Using Browser Tooltips</h2>

<p>
    The example below demonstrates how to use the default browser tooltips.
</p>

<?= example('Default Browser Tooltip', 'default-tooltip', 'vanilla', array('processVue' => true) ) ?>

<?php include '../documentation-main/documentation_footer.php';?>
