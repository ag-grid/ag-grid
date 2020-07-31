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
    By default the Multi Filter will show a <a href="../javascript-grid-filter-text/">Text Filter</a> and
    <a href="../javascript-grid-filter-set/">Set Filter</a>, but you can specify which filters you would like to use in
    the <code>filters</code> array. The filters will be displayed in the same order as they are specified.
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
</ul>

<?= grid_example('Multi Filter', 'multi-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 602, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu', 'clipboard', 'filterpanel'], 'reactFunctional' => true]) ?>

<h2>Floating Filters</h2>

<p>
    When <a href="../javascript-grid-floating-filters/">Floating Filters</a> are used, the Floating Filter shown is for
    the child filter in the Multi Filter that was most recently applied and is still active. If no child filters are
    active, the Floating Filter for the first child filter in the Multi Filter is shown instead.
</p>

<p>
    The example below shows Floating Filters enabled for all columns. Note how the Floating Filters change when you
    apply different child filters from the Multi Filter.
</p>

<?= grid_example('Floating Filters', 'floating-filters', 'generated', ['enterprise' => true, 'exampleHeight' => 635, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu', 'clipboard'], 'reactFunctional' => true]) ?>

<h2>Display Style</h2>

<p>
    By default, all filters in the Multi Filter are shown inline in the same view, so that the user has easy, immediate
    access. However, you can change how filters are presented, by either using sub-menus or accordions to wrap each
    filter. To do this, you can set <code>display</code> to the style of how you would like a particular filter to be
    displayed:
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

<p>Please note that sub-menus will be shown as accordions in the Tool Panel.</p>

<p>
    You can also provide a title that will be used in the menu item or accordion title by using the <code>title</code>
    property.
</p>

<p>
    The following example demonstrates the different display styles.
</p>

<ul class="content">
    <li>
        The <strong>Athlete</strong> column demonstrates having the first filter inside a sub-menu.
    </li>
    <li>
        The sub-menu for the <strong>Athlete</strong> filter is shown as an accordion inside the Tool Panel.
    </li>
    <li>
        The <strong>Country</strong> column demonstrates having both filters as accordions.
    </li>
    <li>
        A custom title is used for the first filter in the <strong>Country</strong> column.
    </li>
    <li>
        The <strong>Sport</strong> column shows the default behaviour, where all filters are inline.
    </li>
</ul>

<?= grid_example('Display Style', 'display-style', 'generated', ['enterprise' => true, 'exampleHeight' => 629, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu', 'clipboard', 'filterpanel'], 'reactFunctional' => true]) ?>

<h2>Custom Filters</h2>

<p>
    You can use your own <a href="../javascript-grid-filter-custom/">Custom Filters</a> with the Multi Filter.
</p>

<p>
    The example below shows a Custom Filter in use on the <strong>Year</strong> column, used alongside the grid-provided
    <a href="../javascript-grid-filter-number/">Number Filter</a>.
</p>

<?= grid_example('Custom Filters', 'custom-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 635, 'reactFunctional' => true]) ?>

<h2>Multi Filter Model</h2>

<p>
    The model for the Multi Filter wraps the models for all the child filters inside it. It has the following interface:
</p>

<?= createSnippet(<<<SNIPPET
interface IMultiFilterModel {
    filterType: string;
    filterModels: any[];
}
SNIPPET
, 'ts') ?>

<p>
    The <code>filterType</code> will always be set to <code>'multi'</code>. The models array is the same length as the
    number of child filters, containing the models for the child filters in the same order as the filters were specified
    in the <code>filterParams</code>. Each array entry will either be set to <code>null</code> if the corresponding child
    filter is not active, or to the current model for the child filter if it is active.
</p>

<p>
    For example, if the Multi Filter has the default Text Filter and Set Filter, and the Set Filter is active, the Multi
    Filter model might look something like this:
</p>

<?= createSnippet(<<<SNIPPET
{
    filterType: 'multi'
    filterModels: [
        null,
        { filterType: 'set', values: ['A', 'B', 'C'] }
    ]
}
SNIPPET
) ?>

<p>
    The example below allows you to see the Multi Filter Model in use. You can print the current filter state to the
    console and save/restore it using the buttons at the top of the grid
</p>

<?= grid_example('Multi Filter Model', 'multi-filter-model', 'generated', ['enterprise' => true, 'exampleHeight' => 639, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu', 'clipboard'], 'reactFunctional' => true]) ?>

<h2>Accessing Child Filters</h2>

<p>
    The Multi Filter acts as a wrapper around a list of child filters inside it. The order of the filters is the same order
    as they are specified in the <code>filters</code> array in the <code>filterParams</code>. If you want to interact
    with the individual child filters, you can retrieve a particular child filter instance from the Multi Filter by calling
    <code>getChildFilterInstance(index)</code>,  where <code>index</code> is the same as the index in the
    <code>filters</code> array. You can then call any API methods that are available on that particular child filter
    instance.
</p>

<p>
    The example below shows how you can access child filter instances and call methods on them:
</p>

<ul class="content">
    <li>
        Clicking the <strong>Print Text Filter model</strong> button will access the Text Filter inside the Multi Filter
        and print the model for the current UI to the console.
    </li>
    <li>
        Clicking the <strong>Print Set Filter search text</strong> button will access the Set Filter inside the Multi Filter
        and print the current search text to the console.
    </li>
</ul>

<?= grid_example('Accessing Child Filters', 'accessing-child-filters', 'generated', ['enterprise' => true, 'exampleHeight' => 624, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu', 'clipboard'], 'reactFunctional' => true]) ?>

<h2>Multi Filter Parameters</h2>

<?php createDocumentationFromFile('multiFilter.json', 'filterParams') ?>

<h2>Multi Filter API</h2>

<?php createDocumentationFromFiles(['../javascript-grid-filter-api/filterApi.json', 'multiFilter.json'], 'api') ?>

<?php include '../documentation-main/documentation_footer.php';?>
