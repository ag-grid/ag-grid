var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    { headerName: '#', cellRenderer: 'rowNodeIdRenderer' },
    { field: 'athlete', filterParams: { buttons: ['clear', 'reset', 'apply'] } },
    { field: 'age', filterParams: { buttons: ['apply', 'cancel'] }, enablePivot: true },
    { field: 'country', enableRowGroup: true },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'date' },
    {
        field: 'sport',
        filter: 'agMultiColumnFilter',
        filterParams: {
            filters: [
                {
                    filter: 'agTextColumnFilter',
                    display: 'accordion'
                },
                {
                    filter: 'agSetColumnFilter',
                    display: 'accordion'
                }
            ]
        }
    },
    { field: 'gold', enableValue: true },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
    { field: 'total', enableValue: true }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
    components: {
        rowNodeIdRenderer: function(params) {
            return params.node.id + 1;
        }
    },
    columnDefs: columnDefs,
    sideBar: true,
    pagination: true,
    rowGroupPanelShow: 'always',
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
            { statusPanel: 'agAggregationComponent' }
        ]
    },
    paginationPageSize: 500,
    enableRangeSelection: true,
    enableCharts: true,
    localeText: {
        // Set Filter
        selectAll: 'daSelect All',
        selectAllSearchResults: 'daSelect All Search Results',
        searchOoo: 'daSearch...',
        blanks: 'daBlanks',
        noMatches: 'daNo matches.',

        // Number Filter & Text Filter
        filterOoo: 'daFilter...',
        equals: 'daEquals',
        notEqual: 'daNot equal',

        // Number Filter
        lessThan: 'daLess than',
        greaterThan: 'daGreater than',
        lessThanOrEqual: 'daLess than or equal',
        greaterThanOrEqual: 'daGreater than or equal',
        inRange: 'daIn range',
        inRangeStart: 'daTo',
        inRangeEnd: 'daFrom',

        // Text Filter
        contains: 'daContains',
        notContains: 'daNot contains',
        startsWith: 'daStarts with',
        endsWith: 'daEnds with',

        // Date Filter
        dateFormatOoo: 'daYyyy-mm-dd',

        // Filter Conditions
        andCondition: 'daAND',
        orCondition: 'daOR',

        // Filter Buttons
        applyFilter: 'daApply',
        resetFilter: 'daReset',
        clearFilter: 'daClear',
        cancelFilter: 'daCancel',

        // Filter Titles
        textFilter: 'daText Filter',
        numberFilter: 'daNumber Filter',
        dateFilter: 'daDate Filter',
        setFilter: 'daSet Filter',

        // Side Bar
        columns: 'laColumns',
        filters: 'laFilters',

        // columns tool panel
        pivotMode: 'laPivot Mode',
        groups: 'laRow Groups',
        rowGroupColumnsEmptyMessage: 'laDrag here to set row groups',
        values: 'laValues',
        valueColumnsEmptyMessage: 'laDrag here to aggregate',
        pivots: 'laColumn Labels',
        pivotColumnsEmptyMessage: 'laDrag here to set column labels',

        // Header of the Default Group Column
        group: 'laGroup',

        // Other
        loadingOoo: 'daLoading...',
        noRowsToShow: 'laNo Rows To Show',
        enabled: 'laEnabled',

        // Menu
        pinColumn: 'laPin Column',
        pinLeft: 'laPin Left',
        pinRight: 'laPin Right',
        noPin: 'laNo Pin',
        valueAggregation: 'laValue Aggregation',
        autosizeThiscolumn: 'laAutosize This Column',
        autosizeAllColumns: 'laAutosize All Columns',
        groupBy: 'laGroup by',
        ungroupBy: 'laUn-Group by',
        resetColumns: 'laReset Columns',
        expandAll: 'laExpand All',
        collapseAll: 'laClose All',
        copy: 'laCopy',
        ctrlC: 'laCtrl+C',
        copyWithHeaders: 'laCopy With Headers',
        paste: 'laPaste',
        ctrlV: 'laCtrl+V',
        export: 'laExport',
        csvExport: 'laCSV Export',
        excelExport: 'laExcel Export (.xlsx)',
        excelXmlExport: 'laExcel Export (.xml)',

        // Enterprise Menu Aggregation and Status Bar
        sum: 'laSum',
        min: 'laMin',
        max: 'laMax',
        none: 'laNone',
        count: 'laCount',
        avg: 'laAverage',
        filteredRows: 'laFiltered',
        selectedRows: 'laSelected',
        totalRows: 'laTotal Rows',
        totalAndFilteredRows: 'laRows',
        page: 'daPage',
        more: 'daMore',
        to: 'daTo',
        of: 'daOf',
        next: 'daNext',
        last: 'daLast',
        first: 'daFirst',
        previous: 'daPrevious',

        // Enterprise Menu (Charts)
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

        histogramChart: 'laHistogram',

        // Charts
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
        height: 'laHeight',
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
        histogramBinCount: 'laBin Count',
        columnGroup: 'laColumn',
        barGroup: 'laBar',
        pieGroup: 'laPie',
        lineGroup: 'laLine',
        scatterGroup: 'laScatter',
        areaGroup: 'laArea',
        histogramGroup: 'laHistogram',
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
        histogramTooltip: 'laHistogram',
        noDataToChart: 'laNo data available to be charted.',
        pivotChartRequiresPivotMode: 'laPivot Chart requires Pivot Mode enabled.',
        navigator: 'laNavigator'
    }
};

function setDataSource(allOfTheData) {
    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        getRows: function(params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, and a timer is used to give the expereince of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout(function() {
                // take a chunk of the array, matching the start and finish times
                var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                var lastRow = -1;
                // see if we have come to the last page, and if so, return it
                if (allOfTheData.length <= params.endRow) {
                    lastRow = allOfTheData.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
    };
    gridOptions.api.setDatasource(dataSource);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
