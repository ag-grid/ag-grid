var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    { headerName: "#", cellRenderer: 'rowNodeIdRenderer' },
    { field: "athlete" },
    { field: "age", enablePivot: true },
    { field: "country", enableRowGroup: true },
    { field: "year", filter: 'agNumberColumnFilter' },
    { field: "date" },
    { field: "sport", filter: 'agTextColumnFilter' },
    { field: "gold", enableValue: true },
    { field: "silver", enableValue: true },
    { field: "bronze", enableValue: true },
    { field: "total", enableValue: true }
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
        toolPanel: 'laTool Panelo',
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
        pinLeft: 'laPin &lt;&lt;',
        pinRight: 'laPin &gt;&gt;',
        noPin: 'laDontPin &lt;&gt;',

        // enterprise menu aggregation and status bar
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

        // standard menu
        copy: 'laCopy',
        copyWithHeaders: 'laCopy With Headers',
        ctrlC: 'laCtrl n C',
        paste: 'laPaste',
        ctrlV: 'laCtrl n V',

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
