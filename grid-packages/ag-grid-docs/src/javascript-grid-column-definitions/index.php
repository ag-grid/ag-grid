<?php
$pageTitle = "ag-Grid - Core Grid Features: Column Definitions";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Column Definitions. Columns are configured in the grid by providing a list of Column Definitions. The attributes you set on the column definitions define how the columns behave e.g. title, width etc. Free and Commercial version available.";
$pageKeywords = "ag-Grid Column Definitions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Column Definitions</h1>

<p class="lead">
    Each column in the grid is defined using a column definition. Columns are positioned in the grid according to the order
    the <code>ColDefs</code> are specified in the grid options.
</p>

<p>
    The following example shows a simple grid with 3 columns defined:
</p>

<?= createSnippet(<<<SNIPPET
var gridOptions = {
    // define 3 columns
    columnDefs: [
        { headerName: 'Athlete', field: 'athlete' },
        { headerName: 'Sport', field: 'sport' },
        { headerName: 'Age', field: 'age' }
    ],

    // other grid options here...
}
SNIPPET
) ?>

<p>
    See <a href="../javascript-grid-column-properties/">Column Properties</a> for a
    list of all properties that can be applied to a column.
</p>

<p>
    If you want the columns to be grouped, then you include them as groups like
    the following:
</p>

<?= createSnippet(<<<SNIPPET
var gridOptions = {
    columnDefs: [
        // put the three columns into a group
        { headerName: 'Group A',
            children: [
                { headerName: 'Athlete', field: 'athlete' },
                { headerName: 'Sport', field: 'sport' },
                { headerName: 'Age', field: 'age' }
            ]
        }
    ],

    // other grid options here...
}
SNIPPET
) ?>

<p>
    Groups are explained in more detail in the section
    <a href="../javascript-grid-grouping-headers/">Column Groups</a>.
</p>

<h2 id="default-column-definitions">Custom Column Types</h2>

<p>
    In addition to the above, the grid provides additional ways to
    help simplify and avoid duplication of column definitions. This is done through the following:
</p>

<ul class="content">
    <li><b>defaultColDef:</b> contains column properties all columns will inherit.</li>
    <li><b>defaultColGroupDef:</b> contains column group properties all column groups will inherit.</li>
    <li><b>columnTypes:</b> specific column types containing properties that column definitions can inherit.</li>
</ul>

<p>
    Default columns and column types can specify any of the <a href="../javascript-grid-column-properties/">column properties</a> available on a column.
</p>

<note>
    Column Types are designed to work on Columns only, i.e. they won't be applied to Column Groups.
</note>

<p>
    The following code snippet shows these three properties configures:
</p>

<?= createSnippet(<<<SNIPPET
var gridOptions = {
    rowData: myRowData,

    // define columns
    columnDefs: [
        // uses the default column properties
        { headerName: 'Col A', field: 'a'},

        // overrides the default with a number filter
        { headerName: 'Col B', field: 'b', filter: 'agNumberColumnFilter' },

        // overrides the default using a column type
        { headerName: 'Col C', field: 'c', type: 'nonEditableColumn' },

        // overrides the default using a multiple column types
        { headerName: 'Col D', field: 'd', type: ['dateColumn', 'nonEditableColumn'] }
    ],

    // a default column definition with properties that get applied to every column
    defaultColDef: {
        // set every column width
        width: 100,
        // make every column editable
        editable: true,
        // make every column use 'text' filter by default
        filter: 'agTextColumnFilter'
    },

    // if we had column groups, we could provide default group items here
    defaultColGroupDef: {}

    // define a column type (you can define as many as you like)
    columnTypes: {
        'nonEditableColumn': { editable: false },
        'dateColumn': {
            filter: 'agDateColumnFilter',
            filterParams: { comparator: myDateComparator },
            suppressMenu: true
        }
    }

    // other grid options here...
}
SNIPPET
) ?>

<p>
    When the grid creates a column it starts with the default column, then adds in anything from the column
    type, then finally adds in items from the column definition.
</p>

<p>
    For example, the following is an outline of the steps used when creating 'Col C' shown above:
</p>

<?= createSnippet(<<<SNIPPET
// Step 1: the grid starts with an empty merged definition
{}

// Step 2: default column properties are merged in
{ width: 100, editable: true, filter: 'agTextColumnFilter' }

// Step 3: column type properties are merged in (using the 'type' property)
{ width: 100, editable: false, filter: 'agNumberColumnFilter' }

// Step 4: finally column definition properties are merged in
{ headerName: 'Col C', field: 'c', width: 100, editable: false, filter: 'agNumberColumnFilter' }
SNIPPET
) ?>

<p>
    The following examples demonstrates this configuration.
</p>

<?= grid_example('Column Definition Example', 'column-definition', 'generated', ['grid' => ['height' => '100%'], 'reactFunctional' => true]) ?>

<h2>Provided Column Types</h2>

<h3>Right Aligned and Numeric Columns</h3>

<p>
    The grid provides a handy shortcut for aligning columns to the right.
    Setting the column definition type to <code>rightAligned</code> aligns the column header and contents to the right,
    which makes the scanning of the data easier for the user.
</p>

<note>
    Because right alignment is used for numbers, we also provided an alias <code>numericColumn</code>
    that can be used to align the header and cell text to the right.
</note>

<?= createSnippet(<<<SNIPPET
var gridOptions = {
    columnDefs: [
        { headerName: 'Column A', field: 'a' },
        { headerName: 'Column B', field: 'b', type: 'rightAligned' },
        { headerName: 'Column C', field: 'c', type: 'numericColumn' }
    ]
}
SNIPPET
) ?>

<h2 id="column-ids">Column IDs</h2>

<p>
    Each column generated by the grid is given a unique ID. Parts of the Grid API use Column IDs (column identifiers).
</p>

<p>
    If you are using the API and the columns IDs are a little complex (e.g. if two columns have the same
    <code>field</code>, or if you are using <code>valueGetter</code> instead of <code>field</code>) then it is useful to
    understand how columns IDs are decided.
</p>

<p>
    If the user provides <code>colId</code> in the column definition, then this is used, otherwise the <code>field</code>
    is used. If both <code>colId</code> and <code>field</code> then <code>colId</code> gets preference. If neither
    <code>colId</code> or <code>field</code> then numeric is provided. Then finally the ID ensured to be unique by
    appending <code>'_n'</code> where <code>n</code> is the first positive number that allows uniqueness.
</p>

<p>
    In the example below, columns are set up to demonstrate the different ways IDs are generated.
    Open the example in a new tab and observe the output in the dev console. Note the following:
</p>

<ul>
    <li>
        Col 1 and Col 2 both use <code>colId</code>. The grid appends <code>'_1'</code> to Col 2 to make the ID unique.
    </li>
    <li>
        Col 3 and Col 4 both use <code>field</code>. The grid appends <code>'_1'</code> to Col 4 to make the ID unique.
    </li>
    <li>
        Col 5 and Col 6 have neither <code>colId</code> or <code>field</code> so the grid generates column IDs.
    </li>
</ul>

<?= grid_example('Column IDs', 'column-ids', 'generated', ['reactFunctional' => true]) ?>



<?php include '../documentation-main/documentation_footer.php';?>
