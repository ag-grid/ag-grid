<?php
$pageTitle = "Localisation: Styling & Appearance with our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Localisation. Support your desired languages with Localisation. Version 23 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Internationalisation Internationalization i18n Localisation Localization l10n";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Localisation</h1>

<p class="lead">
    You can change the text in the paging panels and the default filters by providing a <code>localeText</code> or
    a <code>localeTextFunc</code> to the <code>gridOptions</code>.</p>

<h2>Using <code>localeText</code></h2>

<p> The example below shows all the text that can be defined.  </p>

<?= createSnippet(<<<SNIPPET
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
    equals: 'daEquals',
    notEqual: 'daNotEqual',

    // for the date filter
    dateFormatOoo: 'daYyyy-mm-dd',

    // for number filter
    lessThan: 'daLessThan',
    greaterThan: 'daGreaterThan',
    lessThanOrEqual: 'daLessThanOrEqual',
    greaterThanOrEqual: 'daGreaterThanOrEqual',
    inRange: 'daInRange',
    inRangeStart: 'daRangeStart',
    inRangeEnd: 'daRangeEnd',

    // for text filter
    contains: 'daContains',
    notContains: 'daNotContains',
    startsWith: 'daStarts dawith',
    endsWith: 'daEnds dawith',

    // filter conditions
    andCondition: 'daAND',
    orCondition: 'daOR',

    // filter buttons
    applyFilter: 'daApply',
    resetFilter: 'daReset',
    clearFilter: 'daClear',

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
    enabled: 'laEnabled',

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
    toolPanel: 'laTool Panel',
    export: 'laExporto',
    csvExport: 'laCSV Exportp',
    excelExport: 'laExcel Exporto (.xlsx)',
    excelXmlExport: 'laExcel Exporto (.xml)',

    // enterprise menu (charts)
    pivotChartAndPivotMode: 'laPivot Chart & Pivot Mode',
    pivotChart: 'laPivot Chart',
    chartRange: 'laChart Range',

    columnChart: 'laColumn',
    groupedColumn: 'laGrouped',
    stackedColumn: 'laStacked',
    normalizedColumn: 'la100% Stacked',

    barChart: 'laBar',
    groupedBar: 'laGrouped',
    stackedBar: 'laStacked',
    normalizedBar: 'la100% Stacked',

    pieChart: 'laPie',
    pie: 'laPie',
    doughnut: 'laDoughnut',

    line: 'laLine',

    xyChart: 'laX Y (Scatter)',
    scatter: 'laScatter',
    bubble: 'laBubble',

    areaChart: 'laArea',
    area: 'laArea',
    stackedArea: 'laStacked',
    normalizedArea: 'la100% Stacked',

    // enterprise menu pinning
    pinLeft: 'laPin <<',
    pinRight: 'laPin >>',
    noPin: 'laDontPin <>',

    // enterprise menu aggregation and status bar
    sum: 'laSum',
    min: 'laMin',
    max: 'laMax',
    none: 'laNone',
    count: 'laCount',
    avg: 'laAverage',
    filteredRows: 'laFiltered'
    selectedRows: 'laSelected'
    totalRows: 'laTotal Rows'
    totalAndFilteredRows: 'laRows'

    // standard menu
    copy: 'laCopy',
    copyWithHeaders: 'laCopy With Headers',
    ctrlC: 'laCtrl n C',
    paste: 'laPaste',
    ctrlV: 'laCtrl n V'

    // charts
    pivotChartTitle: 'laPivot Chart',
    rangeChartTitle: 'laRange Chart',
    settings: 'laSettings',
    data: 'laData',
    format: 'laFormat',
    categories: 'laCategories',
    defaultCategory: '(laNone)',
    series: 'laSeries',
    xyValues: 'laX Y Values',
    paired: 'laPaired Mode',
    axis: 'laAxis',
    color: 'laColor',
    thickness: 'laThickness',
    xType: 'laX Type',
    automatic: 'laAutomatic',
    category: 'laCategory',
    number: 'laNumber',
    time: 'laTime',
    xRotation: 'laX Rotation',
    yRotation: 'laY Rotation',
    ticks: 'laTicks',
    width: 'laWidth',
    length: 'laLength',
    padding: 'laPadding',
    chart: 'laChart',
    title: 'laTitle',
    background: 'laBackground',
    font: 'laFont',
    top: 'laTop',
    right: 'laRight',
    bottom: 'laBottom',
    left: 'laLeft',
    labels: 'laLabels',
    size: 'laSize',
    minSize: 'laMinimum Size',
    maxSize: 'laMaximum Size',
    legend: 'laLegend',
    position: 'laPosition',
    markerSize: 'laMarker Size',
    markerStroke: 'laMarker Stroke',
    markerPadding: 'laMarker Padding',
    itemPaddingX: 'laItem Padding X',
    itemPaddingY: 'laItem Padding Y',
    strokeWidth: 'laStroke Width',
    offset: 'laOffset',
    offsets: 'laOffsets',
    tooltips: 'laTooltips',
    callout: 'laCallout',
    markers: 'laMarkers',
    shadow: 'laShadow',
    blur: 'laBlur',
    xOffset: 'laX Offset',
    yOffset: 'laY Offset',
    lineWidth: 'laLine Width',
    normal: 'laNormal',
    bold: 'laBold',
    italic: 'laItalic',
    boldItalic: 'laBold Italic',
    predefined: 'laPredefined',
    fillOpacity: 'laFill Opacity',
    strokeOpacity: 'laLine Opacity',
    columnGroup: 'laColumn',
    barGroup: 'laBar',
    pieGroup: 'laPie',
    lineGroup: 'laLine',
    scatterGroup: 'laScatter',
    areaGroup: 'laArea',
    groupedColumnTooltip: 'laGrouped',
    stackedColumnTooltip: 'laStacked',
    normalizedColumnTooltip: 'la100% Stacked',
    groupedBarTooltip: 'laGrouped',
    stackedBarTooltip: 'laStacked',
    normalizedBarTooltip: 'la100% Stacked',
    pieTooltip: 'laPie',
    doughnutTooltip: 'laDoughnut',
    lineTooltip: 'laLine',
    groupedAreaTooltip: 'laGrouped',
    stackedAreaTooltip: 'laStacked',
    normalizedAreaTooltip: 'la100% Stacked',
    scatterTooltip: 'laScatter',
    bubbleTooltip: 'laBubble',
    noDataToChart: 'laNo data available to be charted.',
    pivotChartRequiresPivotMode: 'laPivot Chart requires Pivot Mode enabled.'
}
SNIPPET
) ?>

<?= grid_example('Localisation', 'localisation', 'generated', ['enterprise' => true, 'exampleHeight' => 650]) ?>

<h2>Using <code>localeTextFunc</code></h2>

<p>
    The example above works great if all you are translating is ag-Grid. However what if you want
    to bind localisation into your wider applications? That can be done by providing your
    own <code>localeTextFunc</code>, which is an alternative to the above.
</p>

<p>
    The sample code below shows how such a function can used. The function takes the key from the grid
    and uses a translate function outside of the grid for doing the translation. If no match is found,
    the default value should be returned (which is the English value for the grid, the grid's
    default language).
</p>

<?= createSnippet(<<<SNIPPET
var gridOptions = {

    localeTextFunc: function(key, defaultValue) {

        // to avoid key clash with external keys, we add 'grid' to the start of each key.
        var gridKey = 'grid.' + key;

        // look the value up. here we use the AngularJS 1.x $filter service, however you
        // can use whatever service you want, AngularJS 1.x or otherwise.
        var value = $filter('translate')(gridKey);
        return value === gridKey ? defaultValue : value;
    }

    ...
};
SNIPPET
) ?>

<?php include '../documentation-main/documentation_footer.php';?>
