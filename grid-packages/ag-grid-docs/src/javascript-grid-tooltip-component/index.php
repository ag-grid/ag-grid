<?php
$pageTitle ="ag-Grid: Components - Tooltip Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This covers how you can use custom tooltips to the grid columns.";
$pageKeywords = "JavaScript Grid Custom Tooltip";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Tooltip Component</h1>

<p class="lead">
    Tooltip components allow you to add your own tooltips to the grid's column headers and cells. Use these when the
    provided tooltip component or the default browser tooltip do not meet your requirements.
</p>

<h2>Tooltip Component Interface</h2>

<p>Implement this interface to provide a custom tooltip.</p>

<?= createSnippet(<<<SNIPPET
interface ITooltipComp {
    // The init(params) method is called on the tooltip component once. See below for details on the parameters.
    init(params: ITooltipParams): void;

    // Returns the DOM element for this tooltip
    getGui(): HTMLElement;
}
SNIPPET
, 'ts') ?>

<?= createSnippet(<<<SNIPPET
interface ITooltipParams {
    location: string; // what part of the application is showing the tooltip, e.g. 'cell', 'header', 'menuItem' etc
    api: any; // the grid API
    columnApi: any; // the column API
    colDef: any; // the grid colDef
    column: any; // the column bound to this tooltip
    context: any; // the grid context
    value?: any; // the value to be rendered by the tooltip
    valueFormatted?: any; // the formatted value to be rendered by the tooltip

    /* Row and Cell Params (N/A with headerTooltips) */

    rowIndex?: number; // the index of the row containing the cell rendering the tooltip
    node?: any; // the row node
    data?: any; // the row node data
}
SNIPPET
, 'ts') ?>

<h2>Registering Custom Tooltip Components</h2>

<p>
    See the <a href="../javascript-grid-components/#registering-custom-components">registering custom components</a> section
    for details on registering and using custom tooltip components.
</p>

<h2>Default Browser Tooltip</h2>

<p>
    If you don't want to use the grid's tooltip component, you can use the <code>enableBrowserTooltips</code> config to use
    the browser's default tooltip. The grid will simply set an element's title attribute to display the tooltip.
</p>

<h2>Tooltip Show Delay</h2>

<p>
    By default, when you hover on an item, it will take 2 seconds for the tooltip to be displayed. If you need to change
    this delay, the <code>tooltipShowDelay</code> config should be used, which is set in milliseconds.
</p>

<note>The show delay will have no effect if you are using browser tooltips, as they are controlled entirely by the browser.</note>

<h2>Example: Custom Tooltip</h2>

<p>
    The example below demonstrates how to provide custom tooltips to the grid. Notice the following:
</p>

<ul class="content">
    <li>The <b>Custom Tooltip Component</b> is supplied by name via <code>colDef.tooltipComponent</code>.</li>
    <li>The <b>Custom Tooltip Parameters</b> are supplied using <code>colDef.tooltipComponentParams</code>.</li>
    <li>Tooltips are displayed instantly by setting <code>tooltipShowDelay</code> to <code>0</code>.</li>
</ul>

<?= grid_example('Custom Tooltip Component', 'custom-tooltip-component', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2>Showing Blank Values</h2>

<p>
    The grid will not show a tooltip if there is no value to show. This is the default behaviour as the
    simplest form of tooltip will show the value it is provided without any additional information.
    In this case, it would be strange to show the tooltip with no value as that would show as a blank box.
</p>

<p>
    This can be a problem if you wish a tooltip to display for blank values. For example, you might want to
    display a tooltip saying "This cell has no value" instead. To achieve this, you should utilise
    <code>tooltipValueGetter</code> to return something different when the value is blank.
</p>

<p>
    The example below shows both displaying and not displaying the tooltip for blank values. Note the following:
</p>

<ul>
    <li>
        The first three rows have athlete values of <code>undefined</code>, <code>null</code> and <code>''</code> (empty string).
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

<?= grid_example('Blank Values', 'blank-values', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2>Header Tooltip with Custom Tooltip</h2>

<p>
    When we want to display a header tooltip, we set the <code>headerTooltip</code> config as a <code>string</code>,
    and that string will be displayed as the tooltip. However, when working with custom tooltips we set
    <code>colDef.tooltipComponent</code> to assign the column's tooltip component and the
    <code>headerTooltip</code> value will passed to the <code>params</code> object.
</p>

<note>
    If <code>headerTooltip</code> is not present, the tooltip will not be rendered.
</note>

<p>
    The example below shows how to set a custom tooltip to a header and to a grouped header. Note the following:
</p>

<ul>
    <li>
        The column <b>Athlete Col 1</b> does not have a <code>tooltipComponent</code> so it will render the value
        set in its <code>headerTooltip</code> config.
    </li>
    <li>
        The column <b>Athlete Col 2</b> uses <code>tooltipComponent</code> so the the value in <code>headerTooltip</code>
        is passed to the tooltipComponent </code>params</code> to be used.
    </li>
    <li>
        The <code>tooltipComponent</code> detects that it's being rendered by a header because the <code>params</code>
        object does not contain a <code>rowIndex</code> value.
    </li>
</ul>

<?= grid_example('Header Custom Tooltip', 'header-tooltip', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2>Example: Tooltips With Row Groups</h2>

<p>
    The example below shows how to use the default tooltip component with group columns. Because the group column has
    no real field assigned to it, the <code>tooltipValueGetter</code> function must be used.
</p>

<?= grid_example('Row Group Tooltip', 'rowgroups-tooltip', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'rowgrouping', 'menu', 'setfilter', 'columnpanel'], 'reactFunctional' => true]) ?>

<h2>Mouse Tracking</h2>

<p>
    The example below enables mouse tracking to demonstrate a scenario where tooltips need to follow the cursor.
    To enable this feature, set the <code>tooltipMouseTrack</code> to true in the gridOptions.
</p>

<?= grid_example('Tooltip Mouse Tracking', 'tooltip-mouse-tracking', 'generated', ['extras' => ['bootstrap'], 'modules' => true, 'reactFunctional' => true]) ?>

<h2>Example: Using Browser Tooltips</h2>

<p>
    The example below demonstrates how to use the default browser tooltips.
</p>

<?= grid_example('Default Browser Tooltip', 'default-tooltip', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
