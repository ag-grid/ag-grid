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
        We recommend setting <code>alwaysShowBothConditions</code> to <code>true</code> for Provided Filters to reduce
        the amount of UI movement when a user changes which filter within the Multi Filter they are interacting
        with. We have therefore shown this enabled for all columns except the <strong>Athlete</strong> column, which
        shows the default behaviour.
    </li>
    <li>
        You can print the current filter state to the console and save/restore it using the buttons at the top of the
        grid.
    </li>
</ul>

<?= grid_example('Multi Filter', 'multi-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 700]) ?>

<h2>Combined Filtering</h2>

<p>
    By default, only one filter in the Multi Filter can be active at any time. If you apply any child filter, all other
    sibling filters will be reset.
</p>

<p>
    If you would like to allow multiple filters to be applied at the same time, you can set <code>combineFilters</code>
    in the <code>filterParams</code>:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    filter: 'agMultiColumnFilter',
    filterParams: {
        combineFilters: true,
    }
}
SNIPPET
) ?>

<p>
    In this case, when more than one filter is active, the floating filter will be hidden. The filters will be combined
    using AND in the same way that filters from different columns are combined.
</p>

<p>
    The following example demonstrates the different behaviour.
</p>

<ul class="content">
    <li>
        The <strong>Athlete</strong> column shows the default behaviour, where only one filter is allowed to be active
        at any time.
    </li>
    <li>
        The <strong>Country</strong> column is configured to combine filters instead.
    </li>
</ul>

<?= grid_example('Combined Filtering', 'combined-filtering', 'generated', ['enterprise' => true, 'exampleHeight' => 700, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu']]) ?>

<h2>Sub Menus</h2>

<p>
    By default, all filters are shown in the same view, so that the user has easy immediate access. However, you might
    wish to show some or all of the filters in sub-menus, to reduce the amount of space used for example. To do this,
    set <code>useSubMenu</code> to <code>true</code> for the child filters you would like to be inside a sub-menu:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    filter: 'agMultiColumnFilter',
    filterParams: {
        filters: [
            {
                filter: 'agTextColumnFilter',
                filterParams: {
                    useSubMenu: true,
                }
            },
            {
                filter: 'agSetColumnFilter',
            }
        ]
    }
}
SNIPPET
) ?>

<p>
    The following example demonstrates the different behaviour.
</p>

<ul class="content">
    <li>
        The <strong>Athlete</strong> column shows the default behaviour, where all filters are in the main view.
    </li>
    <li>
        The <strong>Country</strong> column demonstrates having the first filter inside a sub menu.
    </li>
</ul>

<?= grid_example('Sub Menus', 'sub-menus', 'generated', ['enterprise' => true, 'exampleHeight' => 700, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu']]) ?>

<h2>Custom Filters</h2>

<p>
    You can use your own <a href="../javascript-grid-filter-custom/">Custom Filters</a> with the Multi Filter.
</p>

<p>
    The example below shows a Custom Filter in use on the <strong>Year</strong> column, used alongside the grid-provided
    <a href="../javascript-grid-filter-number/">Number Filter</a>.
</p>

<?= grid_example('Custom Filters', 'custom-filter', 'vanilla', ['enterprise' => true, 'exampleHeight' => 700]) ?>

<h2>Interacting With Sibling Filters</h2>

<p>
    When any filter in the Multi Filter is applied, other sibling filters can respond to this by implementing the
    <code>onSiblingFilterChanged()</code> method. For example, when using the
    <a href="../javascript-grid-filter-set/">Set Filter</a> in the Multi Filter along with the
    <a href="../javascript-grid-client-side-model/">Client-Side Row Model</a>, when other filters in the Multi
    Filter are active, the Set Filter will update to show the same selection as if the user had manually chosen the
    matching items in the Set Filter instead. This allows a user to use the other filters as a starting point to create
    a set of values that can then be tweaked in the Set Filter.
</p>

<p>
    Each filter is in control of whether it responds to changes from sibling filters. In the Set Filter for example,
    you can prevent the Set Filter from responding to sibling filter changes by setting
    <code>suppressSyncOnSiblingFilterChange</code> as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    filter: 'agMultiColumnFilter',
    filterParams: {
        filters: [
            {
                filter: 'agTextColumnFilter',
            },
            {
                filter: 'agSetColumnFilter',
                filterParams: {
                    suppressSyncOnSiblingFilterChange: true,
                }
            }
        ]
    }
}
SNIPPET
) ?>

<p>
    The following example demonstrates this in action.
</p>

<ul class="content">
    <li>
        The <strong>Athlete</strong> column shows the default behaviour, where the selections in the Set Filter are
        kept in sync when the Text Filter is used.
    </li>
    <li>
        The <strong>Country</strong> column has <code>suppressSyncOnSiblingFilterChange = true</code>, so that the Set
        Filter does not respond to changes in the Text Filter.
    </li>
</ul>

<?= grid_example('Interacting With Sibling Filters', 'interacting-with-sibling-filters', 'generated', ['enterprise' => true, 'exampleHeight' => 700, 'modules' => ['clientside', 'multifilter', 'setfilter', 'menu']]) ?>

<h2>Multi Filter Parameters</h2>

<?php createDocumentationFromFile('multiFilterParams.json', 'filterParams') ?>

<?php include '../documentation-main/documentation_footer.php';?>
