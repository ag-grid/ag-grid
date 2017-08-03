<?php
$key = "Internationalisation";
$pageTitle = "ag-Grid Internationalisation";
$pageDescription = "You can change text used in different parts of the grid for Internationalisation. This page explains how to change languages via the grid options.";
$pageKeyboards = "ag-Grid Internationalisation";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="internationalisation">Internationalisation</h2>

    <p>
        You can change the text in the paging panels and the default filters by providing a <i>localeText</i> or
        a <i>localeTextFunc</i> to the <i>gridOptions</i>.</p>

    <h3 id="using-locale-text">Using <i>localeText</i></h3>

    <p>
        The example below shows all the text that can be defined.
    </p>

    <pre>localeText = {

        <span class="codeComment">// for filter panel</span>
        page: 'daPage',
        more: 'daMore',
        to: 'daTo',
        of: 'daOf',
        next: 'daNexten',
        last: 'daLasten',
        first: 'daFirsten',
        previous: 'daPreviousen',
        loadingOoo: 'daLoading...',

        <span class="codeComment">// for set filter</span>
        selectAll: 'daSelect Allen',
        searchOoo: 'daSearch...',
        blanks: 'daBlanc',

        <span class="codeComment">// for number filter and text filter</span>
        filterOoo: 'daFilter...',
        applyFilter: 'daApplyFilter...',

        <span class="codeComment">// for number filter</span>
        equals: 'daEquals',
        lessThan: 'daLessThan',
        greaterThan: 'daGreaterThan',

        <span class="codeComment">// for text filter</span>
        contains: 'daContains',
        startsWith: 'daStarts dawith',
        endsWith: 'daEnds dawith',

        <span class="codeComment">// the header of the default group column</span>
        group: 'laGroup',

        <span class="codeComment">// tool panel</span>
        columns: 'laColumns',
        rowGroupColumns: 'laPivot Cols',
        rowGroupColumnsEmptyMessage: 'la drag cols to group',
        valueColumns: 'laValue Cols',
        pivotMode: 'laPivot-Mode',
        groups: 'laGroups',
        values: 'laValues',
        pivots: 'laPivots',
        valueColumnsEmptyMessage: 'la drag cols to aggregate',
        pivotColumnsEmptyMessage: 'la drag here to pivot',

        <span class="codeComment">// other</span>
        noRowsToShow: 'la no rows',

        <span class="codeComment">// enterprise menu</span>
        pinColumn: 'laPin Column',
        valueAggregation: 'laValue Agg',
        autosizeThiscolumn: 'laAutosize Diz',
        autosizeAllColumns: 'laAutsoie em All',
        groupBy: 'laGroup by',
        ungroupBy: 'laUnGroup by',
        resetColumns: 'laReset Those Cols',
        expandAll: 'laOpen-em-up',
        collapseAll: 'laClose-em-up',
        toolPanel: 'laTool Panelo',
        export: 'laExporto',
        csvExport: 'la CSV Exportp',
        excelExport: 'la Excel Exporto',

        <span class="codeComment">// enterprise menu pinning</span>
        pinLeft: 'laPin <<',
        pinRight: 'laPin >>',
        noPin: 'laDontPin <>',

        <span class="codeComment">// enterprise menu aggregation and status panel</span>
        sum: 'laSum',
        min: 'laMin',
        max: 'laMax',
        first: 'laFirst',
        last: 'laLast',
        none: 'laNone',
        count: 'laCount',
        average: 'laAverage',

        <span class="codeComment">// standard menu</span>
        copy: 'laCopy',
        copyWithHeaders: 'laCopy Wit hHeaders',
        ctrlC: 'ctrl n C',
        paste: 'laPaste',
        ctrlV: 'ctrl n C'
}</pre>

    <show-example example="internationalisation"></show-example>

    <h3 id="using-locale-text-func">Using <i>localeTextFunc</i></h3>

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

    <span class="codeComment">// standard grid settings, thrown in here to pad out the example</span>
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    columnDefs: columnDefs,

    localeTextFunc: function(key, defaultValue) {

        <span class="codeComment">// to avoid key clash with external keys, we add 'grid' to the start of each key.</span>
        var gridKey = 'grid.' + key;

        <span class="codeComment">// look the value up. here we use the AngularJS 1.x $filter service, however you can use whatever</span>
        <span class="codeComment">// service you want, AngularJS 1.x or otherwise.</span>
        var value = $filter('translate')(gridKey);
        return value === gridKey ? defaultValue : value;
    }
};</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
