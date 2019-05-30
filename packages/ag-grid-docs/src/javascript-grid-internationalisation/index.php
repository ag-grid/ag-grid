<?php
$pageTitle = "Internationalisation: Styling & Appearance with our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Internationalisation. Support multiple languages with Internationalisation. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Internationalisation";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Internationalisation</h1>

    <p class="lead">
        You can change the text in the paging panels and the default filters by providing a <code>localeText</code> or
        a <code>localeTextFunc</code> to the <code>gridOptions</code>.</p>

    <h2>Using <code>localeText</code></h2>

    <p> The example below shows all the text that can be defined.  </p>

    <snippet>
localeText = {
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
        equals: 'daEquals',
        notEquals: 'daNotEqual',

        // for number filter
        lessThan: 'daLessThan',
        greaterThan: 'daGreaterThan',
        lessThanOrEqual: 'daLessThanOrEqual',
        greaterThanOrEqual: 'daGreaterThanOrEqual',
        inRange: 'daInRange',

        // for text filter
        contains: 'daContains',
        notContains: 'daNotContains',
        startsWith: 'daStarts dawith',
        endsWith: 'daEnds dawith',

        // filter conditions
        andCondition: 'daAND',
        orCondition: 'daOR',

        // the header of the default group column
        group: 'laGroup',

        // tool panel
        columns: 'laColumns',
        filters: 'laFilters',
        rowGroupColumns: 'laPivot Cols',
        rowGroupColumnsEmptyMessage: 'la drag cols to group',
        valueColumns: 'laValue Cols',
        pivotMode: 'laPivot-Mode',
        groups: 'laGroups',
        values: 'laValues',
        pivots: 'laPivots',
        valueColumnsEmptyMessage: 'la drag cols to aggregate',
        pivotColumnsEmptyMessage: 'la drag here to pivot',
        toolPanelButton: 'la tool panel',

        // other
        noRowsToShow: 'la no rows',

        // enterprise menu
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
        excelExport: 'la Excel Exporto (.xlsx)',
        excelXmlExport: 'la Excel Exporto (.xml)'

        // enterprise menu pinning
        pinLeft: 'laPin &lt;&lt;',
        pinRight: 'laPin &gt;&gt;',
        noPin: 'laDontPin &lt;&gt;',

        // enterprise menu aggregation and status bar
        sum: 'laSum',
        min: 'laMin',
        max: 'laMax',
        none: 'laNone',
        count: 'laCount',
        average: 'laAverage',
        filteredRows: 'laFiltered'
        selectedRows: 'laSelected'
        totalRows: 'laTotal Rows'
        totalAndFilteredRows: 'laRows'

        // standard menu
        copy: 'laCopy',
        copyWithHeaders: 'laCopy Wit hHeaders',
        ctrlC: 'ctrl n C',
        paste: 'laPaste',
        ctrlV: 'ctrl n V'
}</snippet>

    <?= example('Internationalisation', 'internationalisation', 'generated', array('enterprise' => true, "processVue" => true)) ?>

    <h2>Using <code>localeTextFunc</code></h2>

    <p>
        The example above works great if all you are translating is ag-Grid. However what if you want
        to bind into your wider applications internationalisation? That can be done by providing your
        own <code>localeTextFunc</code>, which is an alternative to the above.
    </p>

    <p>
        The sample code below shows how such a function can used. The function takes the key from the grid
        and uses a translate function outside of the grid for doing the translation. If no match is found,
        then the default value should be returned (which is the English value for the grid, the grids
        default language).
    </p>

    <snippet>
var gridOptions = {

    localeTextFunc: function(key, defaultValue) {

        // to avoid key clash with external keys, we add 'grid' to the start of each key.
        var gridKey = 'grid.' + key;

        // look the value up. here we use the AngularJS 1.x $filter service, however you can use whatever
        // service you want, AngularJS 1.x or otherwise.
        var value = $filter('translate')(gridKey);
        return value === gridKey ? defaultValue : value;
    }

    ...
};</snippet>


<?php include '../documentation-main/documentation_footer.php';?>
