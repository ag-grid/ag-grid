<?php
$pageTitle = "Filters Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Filters Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Filters Tool Panel</h1>

    <p class="lead">
        The <b>Filters Tool Panel</b> allows accessing the grids filters without needing to open up the column menu.
    </p>

    <p>
        The example below shows the filters tool panel. The following can be noted:
        <ul>
            <li>
                Columns Athlete, Age, Country, Year and Date appear in the filter tool panel as they have filters.
            </li>
            <li>
                Columns Gold, Silver, Bronze and Total do not appear in the filter tool panel as they have no filters.
            </li>
            <li>
                Clicking on a column in the filter tool panel will show the filter below the column name.
                Clicking a second time will hide the filter again.
            </li>
            <li>
                Columns with filters active will have the filter icon appear beside the filter name in the tool panel.
            </li>
        </ul>
    </p>

    <?= example('Filter Tool Panel', 'simple', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Filter Instances</h2>

    <p>
        The filters provided in the tool panel are the same instances as the filter in the column menu.
        This has the following implications:
    </p>
    <ul>
        <li>
            Configuration relating to filters equally applies when the filters appear in the tool panel.
        </li>
        <li>
            The filter behaves exactly as when it appears in the column menu. E.g. the Apply button
            will have the same meaning when used in the tool panel. Also the relationship with the Floating
            Filter (if active) will be the same.
        </li>
        <li>
            If the filter is open on the tool panel and then the user subsequently opens the column menu,
            the tool panel filter will be closed. Because the filter is the same filter instance,
            it will only appear at one location at any given time.
        </li>
    </ul>


    <h2>Expand / Collapse Filter Groups</h2>

    <p>
        It is possible to expand and collapse filter groups in the Filters Tool Panel by invoking methods
        on the Filters Tool Panel Instance. These methods are shown below:
    </p>

<snippet>
interface IFiltersToolPanel {
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    ... // other methods
}
</snippet>

<p>
    The code snippet below shows how to expand and collapse filter groups using the Filters Tool Panel instance:
</p>

<snippet>
    // lookup Filters Tool Panel instance by id
    var filterToolPanelId = 'filters'; // default filter instance id
    var filtersToolPanel = gridOptions.api.getToolPanelInstance(filterToolPanelId);

    // expands all filter groups in the Filters Tool Panel
    filtersToolPanel.expandFilterGroups();

    // collapses all filter groups in the Filters Tool Panel
    filtersToolPanel.collapseFilterGroups();

    // expands the 'athlete' and 'competition' filter groups in the Filters Tool Panel
    filtersToolPanel.expandFilterGroups(['athleteGroupId', 'competitionGroupId']);

    // collapses the 'competition' filter group in the Filters Tool Panel
    filtersToolPanel.collapseFilters(['competitionGroupId']);
</snippet>

    <p>
        Notice in the snippet above that it's possible to target individual filter groups by supplying <code>groupId's</code>.
    </p>

    <p>
        The example below demonstrates these methods in action. Note the following:
    </p>

    <ul class="content">
        <li>When the grid is initialised, <code>collapseFilterGroups()</code> is invoked in the <code>onGridReady</code>
            callback to collapse all filter groups in the tool panel.</li>
        <li>Clicking <b>Expand Athlete & Competition</b> just expands the 'Athlete' and 'Competition' filter groups
            using: <code>expandFilterGroups(['athleteGroupId', 'competitionGroupId'])</code>.
        </li>
        <li>Clicking <b>Collapse Competition</b> just collapses the 'Competition' filter group using:
            <code>collapseFilterGroups(['competitionGroupId'])</code>.
        </li>
        <li>Clicking <b>Expand All</b> expands all filter groups using: <code>expandFilterGroups()</code>. Note that
            'Sport' is not expanded as it is not a filter group.
        </li>
        <li>Clicking <b>Collapse All</b> collapses all filter groups using: <code>collapseFilterGroups()</code>.</li>
    </ul>

    <?= example('Expand / Collapse Groups', 'expand-collapse-groups', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Expand / Collapse Filters</h2>

    <p>
        It is possible to expand and collapse the filters in the Filters Tool Panel by invoking methods
        on the Filters Tool Panel Instance. These methods are shown below:
    </p>

<snippet>
interface IFiltersToolPanel {
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    ... // other methods
}
</snippet>

    <p>
        The code snippet below shows how to expand and collapse filters using the Filters Tool Panel instance:
    </p>

<snippet>
    // lookup Filters Tool Panel instance by id
    var filterToolPanelId = 'filters'; // default filter instance id
    var filtersToolPanel = gridOptions.api.getToolPanelInstance(filterToolPanelId);

    // expands all filters in the Filters Tool Panel
    filtersToolPanel.expandFilters();

    // collapses all filters in the Filters Tool Panel
    filtersToolPanel.collapseFilters();

    // expands 'year' and 'sport' filters in the Filters Tool Panel
    filtersToolPanel.expandFilters(['year', 'sport']);

    // collapses the 'year' filter in the Filters Tool Panel
    filtersToolPanel.expandFilters(['year']);
</snippet>

    <p>
        Notice in the snippet above that it's possible to target individual filters by supplying <code>colId's</code>.
    </p>

    <p>
        The example below demonstrates these methods in action. Note the following:
    </p>

    <ul class="content">
        <li>When the grid is initialised all filters are collapsed by default</li>
        <li>Clicking <b>Expand Year & Sport</b> just expands the 'year' and 'sport' filters by invoking:
            <code>expandFilters(['year', 'sport'])</code>.
        </li>
        <li>Clicking <b>Collapse Year</b> just collapses the 'year' filter using: <code>collapseFilters(['year'])</code>.
        </li>
        <li>Clicking <b>Expand All</b> expands all filters using: <code>expandFilters()</code>.</li>
        <li>Clicking <b>Collapse All</b> collapses all filters using: <code>collapseFilters()</code>.</li>
    </ul>

    <?= example('Expand / Collapse Filters', 'expand-collapse-filters', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Custom Filters Layout</h2>

    <p>
        The order of columns in the Filters Tool Panel is derived from the <code>columnDefs</code> supplied in the
        grid options, and is kept in sync with the grid when columns are moved by default. However custom filter layouts
        can also be defined by invoking the following method on the Filters Tool Panel Instance:
    </p>

<snippet>
interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    ... // other methods
}
</snippet>

    <p>
        Notice that the same <a href="../javascript-grid-column-definitions/#column-definitions">Column Definitions</a>
        that are supplied in the grid options are also passed to <code>setFilterLayout(colDefs)</code>.
    </p>

    <p>
        The code snippet below shows how to set custom filter layouts using the Filters Tool Panel instance:
    </p>

<snippet>

// original column definitions supplied to the grid
gridOptions.columnDefs = [
    { field: "a" },
    { field: "b" },
    { field: "c" }
];

// custom tool panel column definitions
var customToolPanelColumnDefs = [
    {
        headerName: 'Group 1', // group doesn't appear in grid
        children: [
            { field: "c" }, // custom column order with column "b" omitted
            { field: "a" }
        ]
    }
];

// lookup Filters Tool Panel instance by id
var filterToolPanelId = 'filters'; // default filter instance id
var filtersToolPanel = gridOptions.api.getToolPanelInstance(filterToolPanelId);

// set custom Filters Tool Panel layout
filtersToolPanel.setFilterLayout(customToolPanelColumnDefs);

</snippet>

    <p>
        Notice from the snippet above that it's possible to define groups in the tool panel that don't exist
        in the grid. Also note that filters can be omitted or positioned in a different order however note that all
        referenced columns (that contain filters) must already exist in the grid.
    </p>

    <note>
        When providing a custom layout it is recommend to enable <code>suppressSyncLayoutWithGrid</code> in the
        tool panel params to prevent users changing the layout when moving columns in the grid.
    </note>

    <p>
        The example below shows two custom layouts for the Filters Tool Panel. Note the following:
    </p>

    <ul class="content">
        <li>When the grid is initialised the filter layout in the Filters Tool Panel matches what is supplied to the
            grid in <code>gridOptions.columnDefs</code>.
        </li>
        <li>Clicking <b>Custom Sort Layout</b> invokes <code>setFilterLayout(colDefs)</code> with a list of column
            definitions arranged in ascending order.
        </li>
        <li>Clicking <b>Custom Group Layout</b> invokes <code>setFilterLayout(colDefs)</code> with a list of column
            definitions containing groups that don't appear in the grid.
        </li>
        <li>Moving columns in the grid won't affect the custom layouts as <code>suppressSyncLayoutWithGrid</code> is enabled.
        </li>
    </ul>

    <?= example('Custom Filters Layout', 'custom-layout', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Next Up</h2>

    <p>
        Now that we covered the provided Tool Panels, learn how to create
        <a href="../javascript-grid-tool-panel-component/">Custom Tool Panel Components</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>