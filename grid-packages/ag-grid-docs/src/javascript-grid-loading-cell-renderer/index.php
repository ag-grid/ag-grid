<?php
$pageTitle ="ag-Grid: Components - Loading Cell Renderer";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This covers how you can use custom loading cell renderers.";
$pageKeywords = "JavaScript Grid Custom Loading CellRenderer";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Loading Cell Renderer</h1>

<p class="lead">
    Loading cell renderers allow you to add your own loading renderers to ag-Grid. Use these when the provided
    loading renderers do not meet your requirements.
</p>

<h2>Loading Cell Renderer Interface</h2>

<p> Implement this interface to provide a custom loading cell renderer when loading rows.  </p>

<?= createSnippet(<<<SNIPPET
interface ILoadingCellRenderer {
    // mandatory methods

    // The init(params) method is called on the loading cell renderer once. See below for details on the parameters.
    init(params: ILoadingCellRendererParams): void;

    // Returns the DOM element for this loading cell renderer
    getGui(): HTMLElement;
}
SNIPPET
, 'ts') ?>

<?= createSnippet(<<<SNIPPET
interface ILoadingCellRendererParams {
    // an optional template for the loading cell renderer
    loadingMessage?: string

    // The grid API
    api: any;
}
SNIPPET
, 'ts') ?>

<h2>Registering Loading Cell Renderer Components</h2>

<p>
    See the section <a href="../javascript-grid-components/#registering-custom-components">registering custom components</a>
    for details on registering and using custom loading cell renderers.
</p>

<h2>Example: Custom Loading Cell Renderer</h2>

<p>
    The example below demonstrates how to provide custom loading cell renderer component to the grid. Notice the following:
</p>

<ul class="content">
    <li><b>Custom Loading Cell Renderer</b> is supplied by name via <code>gridOptions.loadingCellRenderer</code>.</li>
    <li><b>Custom Loading Cell Renderer Parameters</b> are supplied using <code>gridOptions.loadingCellRendererParams</code>.</li>
</ul>

<?= grid_example('Custom Loading Cell Renderer', 'custom-loading-cell-renderer', 'generated', ['enterprise' => true, 'extras' => ['fontawesome'], 'reactFunctional' => true] ) ?>

<?php include '../documentation-main/documentation_footer.php';?>
