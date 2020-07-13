<?php
$pageTitle = "Multi Filter";
$pageDescription = "The Multi Filter is an Enterprise feature of ag-Grid supporting Angular, React, Javascript and more, allowing developers to combine the Set Filter with other filters.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Multi Filter</h1>

<p class="lead">
    The Multi Filter allows multiple <a href="../javascript-grid-filter-provided/">Provided Filters</a> or
    <a href="../javascript-grid-filter-component/">Custom Filters</a> to be used on the same column. This
    provides greater flexibility when filtering data in the grid.
</p>

<p>
    <img src="multi-filter.png" alt="Multi Filter"/>
</p>

<h2>Enabling the Multi Filter</h2>

<p>
    To use a Multi Filter, specify the following in your Column Definition:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    filter: 'agMultiColumnFilter'
}
SNIPPET
) ?>

<p>
    By default the Multi Filter will show a <a href="../javascript-grid-filter-text/">Text Filter</a>
    and <a href="../javascript-grid-filter-set/">Set Filter</a>, but you can specify which filters
    you would like to use in the <code>filters</code> array.
</p>

<p>
    The example below shows the Multi Filter in action. Note the following:
</p>

<ul class="content">
    <li>The <strong>Athlete</strong> has a Multi Filter with default behaviour.</li>
    <li>
        The <strong>Country</strong>, <strong>Gold</strong> and <strong>Date</strong> columns have Multi Filters with
        the child filters configured explicitly, using the
        <a href="../javascript-grid-filter-text/">Text</a>,
        <a href="../javascript-grid-filter-number/">Number</a> and
        <a href="../javascript-grid-filter-date/">Date</a> Simple Filters respectively.
    </li>
    <li>
        Different <code>filterParams</code> can be supplied to each child filter.
    </li>
    <li>
        Floating filters are enabled for all columns. The floating filter reflects the active filter for that column,
        so changing which child filter you are using within a Multi Filter will change which floating filter is shown.
    </li>
    <li>
        You can print the current filter state to the console and save/restore it using the buttons at the top of the
        grid.
    </li>
</ul>

<?= grid_example('Multi Filter', 'multi-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 700]) ?>

<h2>Display Style</h2>

<p>
    By default, all filters in the Multi Filter are shown inline in the same view, so that the user has easy, immediate
    access. However, you can change how filters are presented, by either using sub-menus or groups to wrap each filter.
    To do this, you can set <code>display</code> to the style of how you would like a particular filter to be displayed:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    filter: 'agMultiColumnFilter',
    filterParams: {
        filters: [
            {
                filter: 'agTextColumnFilter',
                display: 'subMenu',
            },
            {
                filter: 'agSetColumnFilter',
            }
        ]
    }
}
SNIPPET
) ?>

<p>The options for <code>display</code> are <code>'inline'</code>, <code>'subMenu'</code> or <code>'accordion'</code>.</p>

<p>Please note that sub-menus will be shown as accordions in the tool panel.</p>

<p>
    You can also provide a title that will be used in the menu item or accordion title by using the <code>title</code>
    property.
</p>

<p>
    The following example demonstrates the different styles.
</p>

<ul class="content">
    <li>
        The <strong>Athlete</strong> column shows the default behaviour, where all filters are inline.
    </li>
    <li>
        The <strong>Country</strong> column demonstrates having the first filter inside a sub menu.
    </li>
    <li>
        The sub-menu for the <strong>Country</strong> is shown as an accordion inside the Tool Panel.
    </li>
    <li>
        The <strong>Sport</strong> column demonstrates having both filters as accordions.
    </li>
    <li>
        A custom title is used for the first filter in the <strong>Sport</strong> column.
    </li>
</ul>

<?= grid_example('Display Style', 'display-style', 'generated', ['enterprise' => true, 'exampleHeight' => 700, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu']]) ?>

<h2>Custom Filters</h2>

<p>
    You can use your own <a href="../javascript-grid-filter-custom/">Custom Filters</a> with the Multi Filter.
</p>

<p>
    The example below shows a Custom Filter in use on the <strong>Year</strong> column, used alongside the grid-provided
    <a href="../javascript-grid-filter-number/">Number Filter</a>.
</p>

<?= grid_example('Custom Filters', 'custom-filter', 'vanilla', ['enterprise' => true, 'exampleHeight' => 700]) ?>

<h2>Multi Filter Parameters</h2>

<?php createDocumentationFromFile('multiFilterParams.json', 'filterParams') ?>

<?php include '../documentation-main/documentation_footer.php';?>
