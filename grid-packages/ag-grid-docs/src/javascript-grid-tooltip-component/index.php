<?php
$pageTitle ="ag-Grid: Components - Tooltip Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This covers how you can use custom tooltips to the grid columns.";
$pageKeywords = "JavaScript Grid Custom Tooltip";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Tooltip Component</h1>

<p class="lead">
    Tooltip components allow you to add your own tooltips to the grids column header and cells. Use these when the provided
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
    If you don't want to use the grid's tooltip component, you can use the <code>enableBrowserTooltips</code> config to use
    the browser's default tooltip.

    Note: That will use the element's title attribute to display the tooltip.
</p>

<h2>Tooltip Show Delay</h2>
<p>
    By default, once you hover an item, it will take <code>2000ms</code> for the tooltip to be displayed. If you need to change this
    delay, the <code>tooltipShowDelay</code> config should be used.

<h2>Example: Custom Tooltip</h2>

<p>
    The example below demonstrates how to provide custom tooltips to the grid. Notice the following:
</p>

<ul class="content">
    <li><b>Custom Tooltip Component</b> is supplied by name via <code>colDef.tooltipComponent</code>.</li>
    <li><b>Custom Tooltip Parameters</b> are supplied using <code>colDef.tooltipComponentParams</code>.</li>
    <li>Tooltips are displayed instantly by setting <code>tooltipShowDelay</code> to 0.</li>
</ul>

<?= grid_example('Custom Tooltip Component', 'custom-tooltip-component', 'generated') ?>

<h2>Showing Blank Values</h2>

<p>
    The grid will not show a tooltip if there is no value to show. This is the default behaviour as the
    simplest form of tooltip will show the value it is provided without any additional information.
    In the simplest case, it would be wrong to show the tooltip with no value as that would result
    in a tooltip as a blank box.
</p>

<p>
    This can be a problem if you wish a tooltip to display for blank values. For example you might want to
    display the tooltip "This cell has no value".
</p>

<p>
    To get around this, you should utilise <code>tooltipValueGetter</code> to return something else when the value
    is blank. This is displayed in the example below.
</p>

<p>
    The example below shows both displaying and not displaying the tooltip for blank values. Note the following:
</p>

<ul>
    <li>
        The first three rows have athlete values of <code>undefined</code>, <code>null</code> and '' (empty string).
    </li>
    <li>
        The column <b>Athlete Col 1</b> uses <code>tooltipField</code> for the tooltip field. When there is no value
        (the first three rows) no tooltip is displayed.
    </li>
    <li>
        The column <b>Athlete Col 2</b> uses <code>tooltipValueGetter</code> for the tooltip field. The value getter
        will return a value (an object) regardless of whether the value to display is empty or not. This ensures
        the tooltip gets displayed even when no cell value is present.
    </li>
</ul>

<?= grid_example('Blank Values', 'blank-values', 'generated') ?>

<h2>Header Tooltip with Custom Tooltip</h2>

<p>
    When we want to display a header tooltip, we set the headerTooltip config as a string,
    and that string will be displayed as the tooltip. But when working with custom tooltips we set
    use <code>colDef.tooltipComponent</code> to assign the column's tooltip component and the
    <code>headerTooltip</code> value will passed to the <code>params</code> object. <br>
    Note: If <code>headerTooltip</code> or <code>tooltipValueGetter</code> are not present, the
    tooltip will not be rendered.
</p>

<p>
    The example below shows how to set a custom tooltip to a header and to a grouped header. Note the following:
</p>

<ul>
    <li>
        The column <b>Athlete Col 1</b> does not have a <code>tooltipComponent</code> so it will render the value
        set in it's <code>headerTooltip</code> config.
    </li>
    <li>
        The column <b>Athlete Col 2</b> uses <code>tooltipComponent</code> so the the value in <code>headerTooltip</code>
        is passed to the tooltipComponent </code>params</code> to be used.
    </li>
    <li>The <code>tooltipComponent</code> detect that it's being rendered by a header because the <code>params</code> object
    does not contain a <code>rowIndex</code> value.
</ul>

<?= grid_example('Header Custom Tooltip', 'header-tooltip', 'generated') ?>

<h2>Example: Tooltips with RowGroups</h2>

<p>
    The example below shows how to use the default Tooltip component with Group Columns.
</p>

<ul>
    <li>
        Because the group column has no real field assigned to it, the <code>tooltipValueGetter</code> function
        must be used.
    </li>
</ul>

<?= grid_example('RowGroup Tooltip', 'rowgroups-tooltip', 'generated', ['enterprise' => true]) ?>

<h2>Example: Using Browser Tooltips</h2>

<p>
    The example below demonstrates how to use the default browser tooltips.
</p>

<?= grid_example('Default Browser Tooltip', 'default-tooltip', 'vanilla') ?>

<?php include '../documentation-main/documentation_footer.php';?>
