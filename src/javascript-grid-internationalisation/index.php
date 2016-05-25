<?php
$key = "Internationalisation";
$pageTitle = "ag-Grid Internationalisation";
$pageDescription = "You can change text used in different parts of the grid for Internationalisation. This page explains how to change languages via the grid options.";
$pageKeyboards = "ag-Grid Internationalisation";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Internationalisation</h2>

    <p>
        You can change the text in the paging panels and the default filters by providing a <i>localeText</i> or
        a <i>localeTextFunc</i> to the <i>gridOptions</i>.</p>

    <h3>Using <i>localeText</i></h3>

    <p>
        The example below shows all the text that can be defined.
    </p>

    <pre>localeText = {
    // for filter panel
    page: 'daPage',
    more: 'daMore',
    to: 'daTo',
    of: 'daOf',
    next: 'daNexten',
    last: 'daLasten',
    first: 'daFirsten',
    previous: 'daPreviousen',
    loadingOoo: 'daLoading...',
    // for set filter
    selectAll: 'daSelect Allen',
    searchOoo: 'daSearch...',
    blanks: 'daBlanc',
    // for number filter and text filter
    filterOoo: 'daFilter...',
    applyFilter: 'daApplyFilter...',
    // for number filter
    equals: 'daEquals',
    lessThan: 'daLessThan',
    greaterThan: 'daGreaterThan',
    // for text filter
    contains: 'daContains',
    startsWith: 'daStarts dawith',
    endsWith: 'daEnds dawith',
    // the header of the default group column
    group: 'laGroup',
    // tool panel
    columns: 'laColumns',
    rowGroupColumns: 'laPivot Cols',
    rowGroupColumnsEmptyMessage: 'la please drag cols to here',
    valueColumns: 'laValue Cols',
    valueColumnsEmptyMessage: 'la please drag cols to here',
    // other
    noRowsToShow: 'la no rows',
    // enterprise menu
    toolPanel: 'laTool Panelo',
    pinColumn: 'laPin Column',
    valueAggregation: 'laValue Agg',
    autosizeThiscolumn: 'laAutosize Diz',
    autosizeAllColumns: 'laAutsoie em All',
    groupBy: 'laGroup by',
    ungroupBy: 'laUnGroup by',
    resetColumns: 'laReset Those Cols',
    expandAll: 'laOpen-em-up',
    collapseAll: 'laClose-em-up',
    // enterprise menu pinning
    pinLeft: 'laPin <<',
    pinRight: 'laPin >>',
    noPin: 'laDontPin <>',
    // enterprise menu aggregation and status panel
    sum: 'laSum',
    min: 'laMin',
    max: 'laMax',
    first: 'laFirst',
    last: 'laLast',
    none: 'laNone',
    count: 'laCount',
    average: 'laAverage',
    // standard menu
    copy: 'laCopy',
    ctrlC: 'ctrl n C',
    paste: 'laPaste',
    ctrlV: 'ctrl n C'
}</pre>

    <show-example example="internationalisation"></show-example>

    <h3>Using <i>localeTextFunc</i></h3>

    <p>
        The example above works great if all you are translating is ag-Grid. However what if you want
        to bind into your wider applications internationalisation? That can be done by providing your
        own <i>localeTextFunc</i>, which is an alternative to the above.
    </p>

    <p>
        The sample code below shows how such a function can used. The function takes the key from the grid
        and uses a translate function outside of the grid for doing the translation. If no match is found,
        then the default value should be returned (which is the English value for the grid, the grids
        default language).
    </p>

    <pre>var gridOptions = {
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    columnDefs: columnDefs,
    localeTextFunc: function(key, defaultValue) {
        // to avoid key clash with external keys, we add 'grid' to the start of each key.
        var gridKey = 'grid.' + key;
        // look the value up. here we use the AngularJS $filter service, however you can use whatever
        // service you want, AngularJS or otherwise.
        var value = $filter('translate')(gridKey);
        return value === gridKey ? defaultValue : value;
    }
};</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
