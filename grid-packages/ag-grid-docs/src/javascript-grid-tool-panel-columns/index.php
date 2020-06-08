<?php
$pageTitle = "Columns Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Columns Tool Panel</h1>

    <p class="lead">
        The columns tool panel provides functions for managing the grid's columns.
    </p>

    <h2>Simple Example</h2>

    <p>
        Below shows a simple example of the columns tool panel. The following can be noted:
        <ul>
            <li>Grid property <code>toolPanel='columns'</code> which shows only the columns tool panel.</li>
            <li>
                Grid property <code>defaultColDef</code> has <code>enableValue</code>, <code>enableRowGroup</code>
                and <code>enablePivot</code> set. This means all columns can be dragged to any of the
                Row Groups, Values and Column sections. Although each column can be dragged to these sections,
                it does not make sense to do so. For example, it does not make sense to aggregate the country column,
                but it does make sense to group rows by country.
            </li>
        </ul>
    </p>
    <p>
        Things to try:
        <ul>
            <li>
                Checking / unchecking columns will show / hide the columns.
            </li>
            <li>
                Drag a column (e.g. Country) to Row Groups to group rows.
            </li>
            <li>
                Drag a column (e.g. Gold) to Values to aggregate.
            </li>
            <li>
                Reset (refresh) the demo and do the following:
                <ul>
                    <li>Click 'Pivot Mode'.</li>
                    <li>Drag 'Country' to 'Row Groups'.</li>
                    <li>Drag 'Year' to 'Column Labels'.</li>
                    <li>Drag 'Gold' to 'Values'.</li>
                </ul>
                You will now have a pivot grid showing total gold medals for each country (rows showing countries)
                by year (columns showing years).
            </li>
        </ul>
    </p>

    <?= grid_example('Tool Panel Simple', 'simple', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'modules' => ['clientside', 'rowgrouping', 'menu', 'setfilter', 'columnpanel']]) ?>

    <note>
        Remember to mark the column definitions with <code>enableRowGroup</code> for grouping, <code>enablePivot</code>
        for pivoting and <code>enableValue</code> for aggregation, otherwise you won't be able to drag and drop the
        columns to the desired sections.
    </note>

    <h2>Selection Action</h2>

    <p>
        Selecting columns means different things depending on whether the grid is in pivot mode or not
        as follows:
    </p>

    <ul>
        <li><b>Pivot Mode Off</b>:
            When pivot mode is off, selecting a column toggles the visibility of the column. A selected column
            is visible and an unselected column is hidden. If you drag a column from the tool panel onto
            the grid it will make it visible.
        </li>
        <li><b>Pivot Mode On</b>:
            When pivot mode is on, selecting a column will trigger the column to be either aggregated, grouped
            or pivoted depending on what is allowed for that column.
        </li>
    </ul>

    <h2>Column Tool Panel Sections</h2>

    <p>
        The column tool panel is split into different sections as follows:

        <ul>
            <li>
                <b>Pivot Mode Section</b>: Check the 'Pivot Mode' checkbox to turn the grid into
                <a href="../javascript-grid-pivoting/">Pivot Mode</a>. Uncheck to take the grid out
                of pivot mode.
            </li>
            <li>
                <b>Expand / Collapse All</b>: Toggle to expand or collapse all column groups.
            </li>
            <li>
                <b>Columns Section</b>: Display all columns, grouped by column groups, that are
                available to be displayed in the grid. By default the order of the columns is kept in sync with
                the order they are shown in the grid, but this behaviour can be disabled.
            </li>
            <li>
                <b>Select / Un-select All</b>: Toggle to select or un-select all columns
                 in the columns section.
            </li>
            <li>
                <b>Select / Un-Select Column (or Group)</b>: Each column can be individually selected.
                What selection means depends on pivot mode and is explained below*.
            </li>
            <li>
                <b>Drag Handle</b>: Each column can be dragged either with the mouse or via touch on touch devices.
                The column can then be dragged to one of the following:
                <ol>
                    <li>Row Groups Section</li>
                    <li>Values (Pivot) Section</li>
                    <li>Column Labels Section</li>
                    <li>Onto the grid (<code>gridOptions.allowDragFromColumnsToolPanel=true</code>)</li>
                </ol>
            </li>
            <li>
                <b>Row Groups Section</b>: Columns here will form the grid's
                <a href="../javascript-grid-grouping/">Row Grouping</a>.
            </li>
            <li>
                <b>Values Section</b>: Columns here will form the grid's
                <a href="../javascript-grid-aggregation/">Aggregations</a>. The grid calls this function 'Aggregations',
                however for the UI we follow the Excel naming convention and call it 'Values'.
            </li>
            <li>
                <b>Column Labels (Pivot) Section</b>: Columns here will form the grid's
                <a href="../javascript-grid-pivoting/">Pivot</a>. The grid calls this function
                'Pivot', however for the UI we follow the Excel naming convention and call it 'Column Labels'.
            </li>
        </ul>
    </p>

    <p>
        <img src="./screenshot.png" alt="ag-Grid Tool Panel Section" />
    </p>

    <h2>Section Visibility</h2>

    <p>
        It is possible to remove items from the tool panel. Items are suppressed by setting one or more of the
        following <code>componentParams</code> to <code>true</code> whenever you are using the agColumnsToolPanel component properties:
    </p>

    <ul class="content">
        <li><code>suppressRowGroups</code>: to suppress Row Groups section.</li>
        <li><code>suppressValues</code>: to suppress Values section.</li>
        <li><code>suppressPivots</code>: to suppress Column Labels (Pivot) section.</li>
        <li><code>suppressPivotMode</code>: to suppress Pivot Mode section.</li>
        <li><code>suppressColumnFilter</code>: to suppress Column Filter section.</li>
        <li><code>suppressColumnSelectAll</code>: to suppress Select / Un-select all widget.</li>
        <li><code>suppressColumnExpandAll</code>: to suppress Expand / Collapse all widget.</li>
        <li><code>contractColumnSelection</code>: by default, column groups start expanded. Pass true to default to contracted groups.</li>
        <li><code>suppressSyncLayoutWithGrid</code>: to suppress updating the layout of columns in this panel as they are rearranged in the grid.</li>
    </ul>

    <p>
        To remove a particular column from the tool panel, set the column property <code>suppressColumnsToolPanel</code> to <code>true</code>.
        This is useful when you have a column working in the background, e.g. a column you want to group by,
        but not visible to the user.
    </p>

    <p>
        It is also possible to show and hide the sections of the Column Tool Panel using the following methods provided
        in the <code>IColumnToolPanel</code> interface:
    </p>

<snippet>
interface IColumnToolPanel {
    setPivotModeSectionVisible(visible: boolean): void;
    setRowGroupsSectionVisible(visible: boolean): void;
    setValuesSectionVisible(visible: boolean): void;
    setPivotSectionVisible(visible: boolean): void;
    ... // other methods
}
</snippet>

    <p>
        The example below demonstrates the suppress options / methods described above. Note the following:
        <ul>
            <li>
                The following sections are not present in the tool panel: Row Groups, Values, Column Labels,
                Pivot Mode, Side Buttons, Column Filter, Select / Un-select All, Expand / Collapse All.
            </li>
            <li>
                The date column is hidden from the tool panel using: <code>colDef.suppressColumnsToolPanel=true</code>.
            </li>
            <li>Clicking <b>Show Pivot Mode Section</b> invokes <code>setPivotModeSectionVisible(true)</code>
                on the column tool panel instance.</li>
            <li>Clicking <b>Show Row Groups Section</b> invokes <code>showRowGroupsSection(true)</code>
                on the column tool panel instance.</li>
            <li>Clicking <b>Show Values Section</b> invokes <code>showValuesSection(true)</code>
                on the column tool panel instance.</li>
            <li>Clicking <b>Show Pivot Section</b> invokes <code>showPivotSection(true)</code>
                on the column tool panel instance.</li>
        </ul>
    </p>

    <?= grid_example('Section Visibility', 'section-visibility', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'modules' => ['clientside', 'menu', 'columnpanel']]) ?>

    <h2>Styling Columns</h2>

    <p>
        You can add a CSS class to the columns in the tool panel by specifying <code>toolPanelHeaderClass</code>
        in the column definition as follows:
        <snippet>
colDefs = {
    // set as string
    { headerName: 'Gold', field: 'gold', toolPanelClass: 'tp-gold' },

    // set as array of strings
    { headerName: 'Silver', field: 'silver', toolPanelClass: ['tp-silver']},

    // set as function returning string or array of strings
    {
        headerName: 'Bronze',
        field: 'bronze',
        toolPanelClass: function(params) {
            return 'tp-bronze';
        },
    }
}</snippet>
    </p>

    <h2>Column Tool Panel Example</h2>

    <p>
        The example below demonstrates the column tool panel using a mixture of items explained above. Note the following:
    </p>

    <ul class="content">
        <li>
            The <code>country</code>, <code>year</code>, <code>date</code> and <code>sport</code> columns all have <code>enableRowGroup=true</code>
            and <code>enablePivot=true</code>. This means you can drag the columns to the group
            and pivot sections, but you cannot drag them to the values sections.
        </li>
        <li>
            The <code>gold</code>, <code>silver</code> and <code>bronze</code> columns all have <code>enableValue=true</code>. This means
            you can drag the columns to the values section, but you cannot drag them to the group
            or pivot sections.
        </li>
        <li>
            The <code>gold</code>, <code>silver</code> and <code>bronze</code> columns have style applied using <code>toolPanelClass</code>.
        </li>
        <li>The country column uses a <code>headerValueGetter</code> to give the column a slightly different
        name dependent on where it appears using the <code>location</code> parameter.</li>
    </ul>

    <?= grid_example('Tool Panel Styling', 'styling', 'generated', ['enterprise' => true, 'exampleHeight' => 610, 'modules' => ['clientside', 'menu', 'setfilter', 'columnpanel']]) ?>

    <h2>Read Only Functions</h2>

    <p>
        By setting the property <code>functionsReadOnly=true</code>, the grid will prevent changes to group, pivot or
        values through the GUI. This is useful if you want to show the user the group, pivot and values panel,
        so they can see which columns are used, but prevent them from making changes to the selection.
    </p>

    <?= grid_example('Read Only Example', 'read-only', 'generated', ['enterprise' => true, 'exampleHeight' => 670, 'modules' => ['clientside', 'menu', 'columnpanel']]) ?>

<h2>Expand / Collapse Column Groups</h2>

<p>
    It is possible to expand and collapse the column groups in the Columns Tool Panel by invoking methods
    on the Columns Tool Panel Instance. These methods are shown below:
</p>

<snippet>
interface IColumnToolPanel {
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    ... // other methods
}
</snippet>

<p>
    The code snippet below shows how to expand and collapse column groups using the Columns Tool Panel instance:
</p>

<snippet>
    // lookup Columns Tool Panel instance by id
    var columnsToolPanelId = 'columns'; // default columns instance id
    var columnsToolPanel = gridOptions.api.getToolPanelInstance(columnsToolPanelId);

    // expands all column groups in the Columns Tool Panel
    columnsToolPanel.expandColumnGroups();

    // collapses all column groups in the Columns Tool Panel
    columnsToolPanel.collapseColumnGroups();

    // expands the 'Athlete' and 'Competition' column groups in the Columns Tool Panel
    columnsToolPanel.expandColumnGroups(['athleteGroupId', 'competitionGroupId']);

    // collapses the 'Competition' column group in the Columns Tool Panel
    columnsToolPanel.collapseFilters(['age', 'sport']);
</snippet>

    <p>
        Notice in the snippet above that it's possible to target individual column groups by supplying <code>groupId</code>s.
    </p>

    <p>
        The example below demonstrates these methods in action. Note the following:
    </p>

    <ul class="content">
        <li>When the grid is initialised, <code>collapseColumnGroups()</code> is invoked using the
            <code>onGridReady</code> callback to collapse all column groups in the tool panel.</li>
        <li>Clicking <b>Expand All</b> expands all column groups using <code>expandColumnGroups()</code>.</li>
        <li>Clicking <b>Collapse All</b> collapses all column groups using <code>collapseColumnGroups()</code>.</li>
        <li>Clicking <b>Expand Athlete & Competition</b> expands only the 'Athlete' and 'Competition' column groups
            using <code>expandColumnGroups(['athleteGroupId', 'competitionGroupId'])</code>.</li>
        <li>Clicking <b>Collapse Competition</b> collapses only the 'Competition' column group
            using <code>collapseColumnGroups(['competitionGroupId'])</code>.</li>
    </ul>

    <?= grid_example('Expand / Collapse Column Groups', 'expand-collapse', 'generated', ['enterprise' => true, 'exampleHeight' => 640, 'modules' => ['clientside', 'menu', 'setfilter', 'columnpanel']]) ?>

    <h2>Custom Column Layout</h2>

    <p>
        The order of columns in the Columns Tool Panel is derived from the <code>columnDefs</code> supplied in the
        grid options, and is kept in sync with the grid when columns are moved by default. However custom column layouts
        can also be defined by invoking the following method on the Columns Tool Panel Instance:
    </p>

<snippet>
interface IColumnToolPanel {
    setColumnLayout(colDefs: ColDef[]): void;
    ... // other methods
}
</snippet>

    <p>
        Notice that the same <a href="../javascript-grid-column-definitions/">Column Definitions</a>
        that are supplied in the grid options are also passed to <code>setColumnLayout(colDefs)</code>.
    </p>

    <p>
        The code snippet below shows how to set custom column layouts using the Columns Tool Panel instance:
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

// lookup Columns Tool Panel instance by id
var columnsToolPanelId = 'columns'; // default columns instance id
var columnsToolPanel = gridOptions.api.getToolPanelInstance(columnsToolPanelId);

// set custom Columns Tool Panel layout
columnsToolPanel.setColumnLayout(customToolPanelColumnDefs);

</snippet>

    <p>
        Notice from the snippet above that it's possible to define column groups in the tool panel that don't exist
        in the grid. Also note that columns can be omitted or positioned in a different order but all
        referenced columns must already exist in the grid.
    </p>

    <note>
        When providing a custom layout it is recommend to enable <code>suppressSyncLayoutWithGrid</code> in the
        tool panel params to prevent users changing the layout when moving columns in the grid.
    </note>

    <p>
        The example below shows two custom layouts for the Columns Tool Panel. Note the following:
    </p>

    <ul class="content">
        <li>When the grid is initialised the column layout in the Columns Tool Panel matches what is supplied to the
            grid in <code>gridOptions.columnDefs</code>.
        </li>
        <li>Clicking <b>Custom Sort Layout</b> invokes <code>setColumnLayout(colDefs)</code> with a list of column
            definitions arranged in ascending order.
        </li>
        <li>Clicking <b>Custom Group Layout</b> invokes <code>setColumnLayout(colDefs)</code> with a list of column
            definitions containing groups that don't appear in the grid.
        </li>
        <li>Moving columns in the grid won't affect the custom layouts as <code>suppressSyncLayoutWithGrid</code> is enabled.
        </li>
    </ul>

    <?= grid_example('Custom Column Layout', 'custom-layout', 'generated', ['enterprise' => true, 'exampleHeight' => 640]) ?>

    <h2>Next Up</h2>

    <p>
        Now that we covered the Columns Tool Panel, continue to the next section to learn about the <a href="../javascript-grid-tool-panel-filters/">Filters Tool Panel</a>.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
