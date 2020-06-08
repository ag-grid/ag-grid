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

<p> The example below shows all the locale keys with default values:</p>

<?= createSnippet(<<<SNIPPET
localeText: {     
    // Set Filter
    selectAll: 'Select All',
    selectAllSearchResults: 'Select All Search Results',
    searchOoo: 'Search...',
    blanks: 'Blanks',
    noMatches: 'No matches.',

    // Number Filter & Text Filter
    filterOoo: 'Filter...',
    equals: 'Equals',
    notEqual: 'Not equal',

    // Number Filter
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    lessThanOrEqual: 'Less than or equal',
    greaterThanOrEqual: 'Greater than or equal',
    inRange: 'In range',
    inRangeStart: 'To',
    inRangeEnd: 'From',

    // Text Filter
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',

    // Date Filter
    dateFormatOoo: 'Yyyy-mm-dd',

    // Filter Conditions
    andCondition: 'AND',
    orCondition: 'OR',

    // Filter Buttons
    applyFilter: 'Apply',
    resetFilter: 'Reset',
    clearFilter: 'Clear',
    cancelFilter: 'Cancel',    
   
    // Side Bar
    columns: 'Columns',
    filters: 'Filters',
    
    // columns tool panel
    pivotMode: 'Pivot Mode',    
    groups: 'Row Groups',
    rowGroupColumnsEmptyMessage: 'Drag here to set row groups',    
    values: 'Values',    
    valueColumnsEmptyMessage: 'Drag here to aggregate',   
    pivots: 'Column Labels',
    pivotColumnsEmptyMessage: 'Drag here to set column labels',    

    // Header of the Default Group Column
    group: 'Group',
    
    // Other
    loadingOoo: 'Loading...',
    noRowsToShow: 'No Rows To Show',
    enabled: 'Enabled',

    // Menu
    pinColumn: 'Pin Column',
    pinLeft: 'Pin Left',
    pinRight: 'Pin Right',
    noPin: 'No Pin',
    valueAggregation: 'Value Aggregation',
    autosizeThiscolumn: 'Autosize This Column',
    autosizeAllColumns: 'Autosize All Columns',
    groupBy: 'Group by',
    ungroupBy: 'Un-Group by',
    resetColumns: 'Reset Columns',
    expandAll: 'Expand All',
    collapseAll: 'Close All',
    copy: 'Copy',
    ctrlC: 'Ctrl+C',
    copyWithHeaders: 'Copy With Headers',    
    paste: 'Paste',
    ctrlV: 'Ctrl+V',
    export: 'Export',
    csvExport: 'CSV Export',
    excelExport: 'Excel Export (.xlsx)',
    excelXmlExport: 'Excel Export (.xml)',

    // Enterprise Menu Aggregation and Status Bar
    sum: 'Sum',
    min: 'Min',
    max: 'Max',
    none: 'None',
    count: 'Count',
    avg: 'Average',
    filteredRows: 'Filtered',
    selectedRows: 'Selected',
    totalRows: 'Total Rows',
    totalAndFilteredRows: 'Rows',
    page: 'Page',
    more: 'More',
    to: 'To',
    of: 'Of',
    next: 'Next',
    last: 'Last',
    first: 'First',
    previous: 'Previous', 

    // Enterprise Menu (Charts)
    pivotChartAndPivotMode: 'Pivot Chart & Pivot Mode',
    pivotChart: 'Pivot Chart',
    chartRange: 'Chart Range',     

    columnChart: 'Column',
    groupedColumn: 'Grouped',
    stackedColumn: 'Stacked',
    normalizedColumn: '100% Stacked',

    barChart: 'Bar',
    groupedBar: 'Grouped',
    stackedBar: 'Stacked',
    normalizedBar: '100% Stacked',

    pieChart: 'Pie',
    pie: 'Pie',
    doughnut: 'Doughnut',

    line: 'Line',

    xyChart: 'X Y (Scatter)',
    scatter: 'Scatter',
    bubble: 'Bubble',

    areaChart: 'Area',
    area: 'Area',
    stackedArea: 'Stacked',
    normalizedArea: '100% Stacked',

    histogramChart: 'Histogram',

    // Charts
    pivotChartTitle: 'Pivot Chart',
    rangeChartTitle: 'Range Chart',
    settings: 'Settings',
    data: 'Data',
    format: 'Format',
    categories: 'Categories',
    defaultCategory: '(None)',
    series: 'Series',
    xyValues: 'X Y Values',
    paired: 'Paired Mode',
    axis: 'Axis',
    navigator: 'Navigator',
    color: 'Color',
    thickness: 'Thickness',
    xType: 'X Type',
    automatic: 'Automatic',
    category: 'Category',
    number: 'Number',
    time: 'Time',
    xRotation: 'X Rotation',
    yRotation: 'Y Rotation',
    ticks: 'Ticks',
    width: 'Width',
    height: 'Height',
    length: 'Length',
    padding: 'Padding',
    spacing: 'Spacing',
    chart: 'Chart',
    title: 'Title',
    titlePlaceholder: 'Chart title - double click to edit',
    background: 'Background',
    font: 'Font',
    top: 'Top',
    right: 'Right',
    bottom: 'Bottom',
    left: 'Left',
    labels: 'Labels',
    size: 'Size',
    minSize: 'Minimum Size',
    maxSize: 'Maximum Size',
    legend: 'Legend',
    position: 'Position',
    markerSize: 'Marker Size',
    markerStroke: 'Marker Stroke',
    markerPadding: 'Marker Padding',
    itemSpacing: 'Item Spacing',
    itemPaddingX: 'Item Padding X',
    itemPaddingY: 'Item Padding Y',
    layoutHorizontalSpacing: 'Horizontal Spacing',
    layoutVerticalSpacing: 'Vertical Spacing',
    strokeWidth: 'Stroke Width',
    offset: 'Offset',
    offsets: 'Offsets',
    tooltips: 'Tooltips',
    callout: 'Callout',
    markers: 'Markers',
    shadow: 'Shadow',
    blur: 'Blur',
    xOffset: 'X Offset',
    yOffset: 'Y Offset',
    lineWidth: 'Line Width',
    normal: 'Normal',
    bold: 'Bold',
    italic: 'Italic',
    boldItalic: 'Bold Italic',
    predefined: 'Predefined',
    fillOpacity: 'Fill Opacity',
    strokeOpacity: 'Line Opacity',
    histogramBinCount: 'Bin count',
    columnGroup: 'Column',
    barGroup: 'Bar',
    pieGroup: 'Pie',
    lineGroup: 'Line',
    scatterGroup: 'X Y (Scatter)',
    areaGroup: 'Area',
    histogramGroup: 'Histogram',
    groupedColumnTooltip: 'Grouped',
    stackedColumnTooltip: 'Stacked',
    normalizedColumnTooltip: '100% Stacked',
    groupedBarTooltip: 'Grouped',
    stackedBarTooltip: 'Stacked',
    normalizedBarTooltip: '100% Stacked',
    pieTooltip: 'Pie',
    doughnutTooltip: 'Doughnut',
    lineTooltip: 'Line',
    groupedAreaTooltip: 'Area',
    stackedAreaTooltip: 'Stacked',
    normalizedAreaTooltip: '100% Stacked',
    scatterTooltip: 'Scatter',
    bubbleTooltip: 'Bubble',
    histogramTooltip: 'Histogram',
    noDataToChart: 'No data available to be charted.',
    pivotChartRequiresPivotMode: 'Pivot Chart requires Pivot Mode enabled.',
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

        // look the value up. here we use the AngularJS 1.x \$filter service, however you
        // can use whatever service you want, AngularJS 1.x or otherwise.
        var value = \$filter('translate')(gridKey);
        return value === gridKey ? defaultValue : value;
    }
    ...
};
SNIPPET
) ?>

<?php include '../documentation-main/documentation_footer.php';?>
