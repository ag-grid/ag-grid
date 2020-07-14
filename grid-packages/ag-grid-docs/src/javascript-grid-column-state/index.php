<?php
$pageTitle = "Updating Columns";
$pageDescription = "Columns can be change by the grid, eg column width. This stateful parts of the column can be modified.";
$pageKeywords = "Javascript Grid Column State";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Column State</h1>

<p class="lead">
    Column State refers to the properties of a Column that can change. This section goes through how to query for
    and subsequently set the Column State.
</p>

<p>
    The full list of Column stateful attributes are: Column Width, Column Flex, Column Pinned, Column Sort,
    Column Visibility, Column Row Group, Column Pivot, Column Agg Func, Column Order.
</p>

<h2 id="save-and-apply">Save and Apply State</h2>

<p>
    There are two API methods provided for getting and setting Column State.
    <code>columnApi.getColumnState()</code> gets the current column state and
    <code>columnApi.setColumnState()</code> sets the column state.
</p>

<?= createSnippet(<<<SNIPPET
// save the columns state
let savedState = columnApi.getColumnState();

// restore the column state
columnApi.setColumnsState({state: savedState});

SNIPPET
) ?>

<p>
    The example below demonstrates saving and restoring column state. Try the following:
</p>
<ol>
    <li>Click 'Save State' to save the Column State.</li>
    <li>Change some column state e.g. resize columns, move columns around, apply column sorting or row grouping e.t.c.</li>
    <li>Click 'Restore State' and the columns state is set back to where it was when you clicked 'Save State'.</li>
    <li>Click 'Reset State' and the state will go back to what was defined in the Column Definitions.</li>
</ol>

<?= grid_example('Save and Apply State', 'save-apply-state', 'generated', ['enterprise' => true, 'reactFunctional' => true]) ?>

<h2>State vs Non-State Items</h2>

<p>
    <a href="../javascript-grid-column-definitions/">Column Definitions</a> contain both stateful and non-stateful
    items. Stateful items can have their properties changed by the grid (eg width, sort etc). Non-stateful items
    do not change from what is set in the Column Definition. For example once the Header Name is set as
    part of a Column Definition, it will remain the same unless the application updates the Column Definition.
</p>

<h2>Column State Interface</h2>

<p>
    The structure of a Column State is as follows:
</p>

<?= createSnippet(<<<SNIPPET

// Getting Column State
function getColumnState(): ColumnState[]

interface ColumnState {
    colId?: string; // ID of the column
    width?: number; // width of column in pixels
    flex?: number; // column's flex if flex is set
    hide?: boolean; // true if column is hidden
    sort?: string; // sort applied to the columns
    sortedAt?: number; // the order of the sort, if sorting by many columns
    aggFunc?: string | IAggFunc; // the aggregation function applied
    pivot?: boolean; // true if pivot active
    pivotIndex?: number; // the order of the pivot, if pivoting by many columns
    pinned?: string | 'left' | 'right'; // set if column is pinned
    rowGroup?: boolean; // true if row group active
    rowGroupIndex?: number | null; // ther order of the row group, if row rouping by many columns
}

// Applying Column State
function applyColumnState(params: ApplyColumnStateParams): boolean

interface ApplyColumnStateParams {
    state?: ColumnState[], // the state from getColumnState
    applyOrder?: boolean, // whether column order should be applied
    defaultState?: ColumnState // state to apply to columns where state is missing for those columns
}

SNIPPET
) ?>

<h2>Fine Grained State Control</h2>

<p>
    So far consideration has only been given to saving the entire state or restoring the entire state.
    It is possible to only focus on particular columns and / or particular fields. The following rules
    enable this.
</p>

<ul>
    <li>
        When state is applied and there are additional columns in the grid that do not appear in the provided
        state, then the <code>params.defaultState</code> is applied to those additional columns.
    </li>
    <li>
        If <code>params.defaultState</code> is not provided, then any additional columns in the grid will not
        be updated.
    </li>
    <li>
        If a particular state item is missing attributes, or the attribute is provided as <code>undefined</code>,
        then that attribute is not updated.
    </li>
</ul>

<p>
    Combining these rules together leaves for flexible fine grained state control. Take the following code
    snippets as examples:
</p>

<?= createSnippet(<<<SNIPPET

// Sort Athlete column ascending
columnApi.applyColumnState({
    state: [
        {
            colId: 'athlete',
            sort: 'asc'
        }
    ]
});

// Sort Athlete column ascending and clear sort on all other columns
columnApi.applyColumnState({
    state: [
        {
            colId: 'athlete',
            sort: 'asc'
        }
    ],
    defaultState: [
        {
            // important to say 'null' as undefined means 'do nothing'
            sort: null
        }
    ]
});

// Clear sorting on all columns, leave all other attributes untouched
columnApi.applyColumnState({
    defaultState: [
        {
            // important to say 'null' as undefined means 'do nothing'
            sort: null
        }
    ]
});

// Clear sorting, row group, pivot and pinned on all columns, leave all other attributes untouched
columnApi.applyColumnState({
    defaultState: [
        {
            // important to say 'null' as undefined means 'do nothing'
            sort: null,
            rowGroup: null,
            pivot: null,
            pinned: null
        }
    ]
});

// Order columns, but do nothing else
columnApi.applyColumnState({
    defaultState: [
        { colId: 'athlete' },
        { colId: 'country' },
        { colId: 'age' },
        { colId: 'sport' }
    ],
    applyOrder: true
});

SNIPPET
) ?>

<p>
    The example below shows some fine grained access to Column State.
</p>

<?= grid_example('Fine Grained State', 'fine-grained-state', 'generated', ['enterprise' => true, 'reactFunctional' => true]) ?>

<h2>Column Events</h2>

<p>
    (work in progress)
</p>

<note>
    To suppress events raised when invoking <code>columnApi.setColumnState(state)</code>, and also
    <code>columnApi.resetColumnState()</code>, use: <code>gridOptions.suppressSetColumnStateEvents = true</code>.
</note>

<h2>State vs ColDef Comparison</h2>

<p>
    (work in progress)
</p>

<ul>
    <li>State can modify auto cols.</li>
    <li>State better for storing, as don't have noise.</li>
    <li>State doesn't bother with column groups.</li>
    <li>Col Defs adds/removes columns, state only applies to current columns.</li>
    <li>Events</li>
</ul>

<h2>Column Group State</h2>

<p>
    (work in progress)
</p>

<?= grid_example('Column Group State', 'column-group-state', 'generated', ['enterprise' => true, 'reactFunctional' => true]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
