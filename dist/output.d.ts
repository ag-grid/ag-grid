declare module awk.grid {
    class Utils {
        static iterateObject(object: any, callback: any): void;
        static map(array: any, callback: any): any;
        static forEach(array: any, callback: any): void;
        static getFunctionParameters(func: any): any;
        static find(collection: any, predicate: any, value: any): any;
        static toStrings(array: any): any;
        static iterateArray(array: any, callback: any): void;
        static getValue(expressionService: any, data: any, colDef: any, node?: any, api?: any, context?: any): any;
        static isNode(o: any): boolean;
        static isElement(o: any): boolean;
        static isNodeOrElement(o: any): boolean;
        static addChangeListener(element: any, listener: any): void;
        static makeNull(value: any): any;
        static removeAllChildren(node: any): void;
        static isVisible(element: any): boolean;
        static loadTemplate(template: any): Node;
        static querySelectorAll_addCssClass(eParent: any, selector: any, cssClass: any): void;
        static querySelectorAll_removeCssClass(eParent: any, selector: any, cssClass: any): void;
        static querySelectorAll_replaceCssClass(eParent: any, selector: any, cssClassToRemove: any, cssClassToAdd: any): void;
        static addOrRemoveCssClass(element: any, className: any, addOrRemove: any): void;
        static addCssClass(element: any, className: any): void;
        static offsetHeight(element: any): any;
        static offsetWidth(element: any): any;
        static removeCssClass(element: any, className: any): void;
        static removeFromArray(array: any, object: any): void;
        static defaultComparator(valueA: any, valueB: any): number;
        static formatWidth(width: any): any;
        static useRenderer(eParent: any, eRenderer: any, params: any): void;
        static createIcon(iconName: any, gridOptionsWrapper: any, colDefWrapper: any, svgFactoryFunc: any): HTMLSpanElement;
        static addStylesToElement(eElement: any, styles: any): void;
        static getScrollbarWidth(): number;
        static isKeyPressed(event: any, keyToCheck: any): boolean;
        static setVisible(element: any, visible: any): void;
    }
}
declare module awk.grid {
    class Constants {
        static STEP_EVERYTHING: number;
        static STEP_FILTER: number;
        static STEP_SORT: number;
        static STEP_MAP: number;
        static ASC: string;
        static DESC: string;
        static ROW_BUFFER_SIZE: number;
        static MIN_COL_WIDTH: number;
        static SUM: string;
        static MIN: string;
        static MAX: string;
        static KEY_TAB: number;
        static KEY_ENTER: number;
        static KEY_SPACE: number;
        static KEY_DOWN: number;
        static KEY_UP: number;
        static KEY_LEFT: number;
        static KEY_RIGHT: number;
    }
}
declare module awk.grid {
    class ColumnController {
        gridOptionsWrapper: any;
        angularGrid: any;
        selectionRendererFactory: any;
        expressionService: any;
        listeners: any;
        model: any;
        allColumns: any;
        displayedColumns: any;
        pivotColumns: any;
        valueColumns: any;
        visibleColumns: any;
        headerGroups: any;
        constructor();
        init(angularGrid: any, selectionRendererFactory: any, gridOptionsWrapper: any, expressionService: any): void;
        createModel(): void;
        getState(): any;
        setState(columnState: any): void;
        getColumn(key: any): any;
        getDisplayNameForCol(column: any): any;
        addListener(listener: any): void;
        fireColumnsChanged(): void;
        getModel(): any;
        setColumns(columnDefs: any): void;
        checkForDeprecatedItems(columnDefs: any): void;
        headerGroupOpened(group: any): void;
        onColumnStateChanged(): void;
        hideColumns(colIds: any, hide: any): void;
        updateModel(): void;
        private updateDisplayedColumns();
        sizeColumnsToFit(gridWidth: any): void;
        private buildGroups();
        private updateGroups();
        private updateVisibleColumns();
        private updatePinnedColumns();
        private createColumns(columnDefs);
        private createPivotColumns();
        private createValueColumns();
        private createDummyColumn(field);
        private calculateColInitialWidth(colDef);
        getTotalColWidth(includePinned: any): number;
    }
}
declare module awk.grid {
    class ExpressionService {
        expressionToFunctionCache: any;
        evaluate(expression: any, params: any): any;
        createExpressionFunction(expression: any): any;
        createFunctionBody(expression: any): any;
    }
}
declare module awk.grid {
    class GridOptionsWrapper {
        gridOptions: GridOptions;
        constructor(gridOptions: GridOptions);
        isRowSelection(): boolean;
        isRowDeselection(): boolean;
        isRowSelectionMulti(): boolean;
        getContext(): any;
        isVirtualPaging(): boolean;
        isShowToolPanel(): boolean;
        isToolPanelSuppressPivot(): boolean;
        isToolPanelSuppressValues(): boolean;
        isRowsAlreadyGrouped(): boolean;
        isGroupSelectsChildren(): boolean;
        isGroupHidePivotColumns(): boolean;
        isGroupIncludeFooter(): boolean;
        isSuppressRowClickSelection(): boolean;
        isSuppressCellSelection(): boolean;
        isSuppressUnSort(): boolean;
        isSuppressMultiSort(): boolean;
        isGroupSuppressAutoColumn(): boolean;
        isGroupHeaders(): boolean;
        isDontUseScrolls(): boolean;
        isSuppressDescSort(): boolean;
        isUnSortIcon(): boolean;
        getRowStyle(): any;
        getRowClass(): any;
        getHeaderCellRenderer(): any;
        getApi(): any;
        isEnableColResize(): boolean;
        getGroupDefaultExpanded(): any;
        getGroupKeys(): string[];
        getGroupAggFunction(): (nodes: any[]) => any;
        getGroupAggFields(): string[];
        getAllRows(): any[];
        isGroupUseEntireRow(): boolean;
        getGroupColumnDef(): any;
        isAngularCompileRows(): boolean;
        isAngularCompileFilters(): boolean;
        isAngularCompileHeaders(): boolean;
        getColumnDefs(): any[];
        getRowHeight(): number;
        getModelUpdated(): () => void;
        getCellClicked(): (params: any) => void;
        getCellDoubleClicked(): (params: any) => void;
        getCellValueChanged(): (params: any) => void;
        getCellFocused(): (params: any) => void;
        getRowSelected(): (rowIndex: number, selected: boolean) => void;
        getSelectionChanged(): () => void;
        getVirtualRowRemoved(): (row: any, rowIndex: number) => void;
        getDatasource(): any;
        getReady(): (api: any) => void;
        getRowBuffer(): number;
        isEnableSorting(): boolean;
        isEnableServerSideSorting(): boolean;
        isEnableFilter(): boolean;
        isEnableServerSideFilter(): boolean;
        setSelectedRows(newSelectedRows: any): any;
        setSelectedNodesById(newSelectedNodes: any): any;
        getIcons(): any;
        getGroupRowInnerRenderer(): (params: any) => void;
        getColWidth(): number;
        getHeaderHeight(): number;
        setupDefaults(): void;
        getPinnedColCount(): number;
        getLocaleTextFunc(): (key: any, defaultValue: any) => any;
    }
}
declare module awk.grid {
    class TextFilter {
        filterParams: any;
        filterChangedCallback: any;
        localeTextFunc: any;
        valueGetter: any;
        filterText: any;
        filterType: any;
        api: any;
        eGui: any;
        eFilterTextField: any;
        eTypeSelect: any;
        constructor(params: any);
        onNewRowsLoaded(): void;
        afterGuiAttached(): void;
        doesFilterPass(node: any): boolean;
        getGui(): any;
        isFilterActive(): boolean;
        createTemplate(): string;
        createGui(): void;
        onTypeChanged(): void;
        onFilterChanged(): void;
        createApi(): void;
        getApi(): any;
    }
}
declare module awk.grid {
    class NumberFilter {
        filterParams: any;
        filterChangedCallback: any;
        localeTextFunc: any;
        valueGetter: any;
        filterNumber: any;
        filterType: any;
        api: any;
        eGui: any;
        eFilterTextField: any;
        eTypeSelect: any;
        constructor(params: any);
        onNewRowsLoaded(): void;
        afterGuiAttached(): void;
        doesFilterPass(node: any): boolean;
        getGui(): any;
        isFilterActive(): boolean;
        createTemplate(): string;
        createGui(): void;
        onTypeChanged(): void;
        onFilterChanged(): void;
        createApi(): void;
        getApi(): any;
    }
}
declare module awk.grid {
    class SetFilterModel {
        selectedValuesMap: any;
        colDef: any;
        rowModel: any;
        valueGetter: any;
        displayedValues: any;
        uniqueValues: any;
        miniFilter: any;
        selectedValuesCount: any;
        constructor(colDef: any, rowModel: any, valueGetter: any);
        refreshUniqueValues(keepSelection: any): void;
        createUniqueValues(): void;
        iterateThroughNodesForValues(): any;
        setMiniFilter(newMiniFilter: any): boolean;
        getMiniFilter(): any;
        filterDisplayedValues(): void;
        getDisplayedValueCount(): any;
        getDisplayedValue(index: any): any;
        selectEverything(): void;
        isFilterActive(): boolean;
        selectNothing(): void;
        getUniqueValueCount(): any;
        getUniqueValue(index: any): any;
        unselectValue(value: any): void;
        selectValue(value: any): void;
        isValueSelected(value: any): boolean;
        isEverythingSelected(): boolean;
        isNothingSelected(): boolean;
        getModel(): any;
        setModel(model: any): void;
    }
}
declare module awk.grid {
    class SetFilter {
        eGui: any;
        filterParams: any;
        rowHeight: any;
        model: any;
        filterChangedCallback: any;
        valueGetter: any;
        rowsInBodyContainer: any;
        colDef: any;
        localeTextFunc: any;
        cellRenderer: any;
        eListContainer: any;
        eFilterValueTemplate: any;
        eSelectAll: any;
        eListViewport: any;
        eMiniFilter: any;
        api: any;
        constructor(params: any);
        afterGuiAttached(): void;
        isFilterActive(): any;
        doesFilterPass(node: any): any;
        getGui(): any;
        onNewRowsLoaded(): void;
        createTemplate(): string;
        createGui(): void;
        setContainerHeight(): void;
        drawVirtualRows(): void;
        ensureRowsRendered(start: any, finish: any): void;
        removeVirtualRows(rowsToRemove: any): void;
        insertRow(value: any, rowIndex: any): void;
        onCheckboxClicked(eCheckbox: any, value: any): void;
        onMiniFilterChanged(): void;
        refreshVirtualRows(): void;
        clearVirtualRows(): void;
        onSelectAll(): void;
        updateAllCheckboxes(checked: any): void;
        addScrollListener(): void;
        getApi(): any;
        createApi(): void;
    }
}
declare module awk.grid {
    class PopupService {
        static theInstance: PopupService;
        static getInstance(): PopupService;
        ePopupParent: any;
        init(ePopupParent: any): void;
        positionPopup(eventSource: any, ePopup: any, minWidth: any): void;
        addAsModalPopup(eChild: any): (event: any) => void;
    }
}
declare module awk.grid {
    class FilterManager {
        $compile: any;
        $scope: any;
        gridOptionsWrapper: any;
        grid: any;
        allFilters: any;
        expressionService: any;
        columnModel: any;
        rowModel: any;
        init(grid: any, gridOptionsWrapper: any, $compile: any, $scope: any, expressionService: any, columnModel: any): void;
        setFilterModel(model: any): void;
        setModelOnFilterWrapper(filter: any, newModel: any): void;
        getFilterModel(): any;
        setRowModel(rowModel: any): void;
        isFilterPresent(): boolean;
        isFilterPresentForCol(colId: any): any;
        doesFilterPass(node: any): boolean;
        onNewRowsLoaded(): void;
        createValueGetter(colDef: any): (node: any) => any;
        getFilterApi(column: any): any;
        getOrCreateFilterWrapper(column: any): any;
        createFilterWrapper(column: any): {
            column: any;
            filter: any;
            scope: any;
            gui: any;
        };
        showFilter(column: any, eventSource: any): void;
    }
}
declare module awk.grid {
    class SelectionController {
        eRowsParent: any;
        angularGrid: any;
        gridOptionsWrapper: any;
        $scope: any;
        rowRenderer: any;
        selectedRows: any;
        selectedNodesById: any;
        rowModel: any;
        init(angularGrid: any, gridPanel: any, gridOptionsWrapper: any, $scope: any, rowRenderer: any): void;
        initSelectedNodesById(): void;
        getSelectedNodes(): any;
        getBestCostNodeSelection(): any;
        setRowModel(rowModel: any): void;
        deselectAll(): void;
        selectAll(): void;
        selectNode(node: any, tryMulti: any, suppressEvents: any): void;
        recursivelySelectAllChildren(node: any, suppressEvents?: any): boolean;
        recursivelyDeselectAllChildren(node: any): void;
        doWorkOfSelectNode(node: any, suppressEvents: any): boolean;
        addCssClassForNode_andInformVirtualRowListener(node: any): void;
        doWorkOfDeselectAllNodes(nodeToKeepSelected?: any): any;
        deselectRealNode(node: any): void;
        removeCssClassForNode(node: any): void;
        deselectIndex(rowIndex: any): void;
        deselectNode(node: any): void;
        selectIndex(index: any, tryMulti: any, suppressEvents: any): void;
        syncSelectedRowsAndCallListener(suppressEvents?: any): void;
        recursivelyCheckIfSelected(node: any): number;
        isNodeSelected(node: any): boolean;
        updateGroupParentsIfNeeded(): void;
    }
}
declare module awk.grid {
    class SelectionRendererFactory {
        angularGrid: any;
        selectionController: any;
        init(angularGrid: any, selectionController: any): void;
        createCheckboxColDef(): {
            width: number;
            suppressMenu: boolean;
            suppressSorting: boolean;
            headerCellRenderer: () => HTMLInputElement;
            cellRenderer: (params: any) => HTMLInputElement;
        };
        createCheckboxRenderer(): (params: any) => HTMLInputElement;
        createSelectionCheckbox(node: any, rowIndex: any): HTMLInputElement;
    }
}
declare module awk.grid {
    class SvgFactory {
        static theInstance: SvgFactory;
        static getInstance(): SvgFactory;
        createFilterSvg(): Element;
        createColumnShowingSvg(): Element;
        createColumnHiddenSvg(): Element;
        createMenuSvg(): Element;
        createArrowUpSvg(): Element;
        createArrowLeftSvg(): Element;
        createArrowDownSvg(): Element;
        createArrowRightSvg(): Element;
        createSmallArrowDownSvg(): Element;
        createArrowUpDownSvg(): Element;
    }
}
declare module awk.grid {
    function groupCellRendererFactory(gridOptionsWrapper: any, selectionRendererFactory: any): (params: any) => HTMLSpanElement;
}
declare module awk.grid {
    class RowRenderer {
        gridOptions: any;
        columnModel: any;
        gridOptionsWrapper: any;
        angularGrid: any;
        selectionRendererFactory: any;
        gridPanel: any;
        $compile: any;
        $scope: any;
        selectionController: any;
        expressionService: any;
        templateService: any;
        cellRendererMap: any;
        renderedRows: any;
        renderedRowStartEditingListeners: any;
        editingCell: any;
        rowModel: any;
        eBodyContainer: any;
        eBodyViewport: any;
        ePinnedColsContainer: any;
        eParentOfRows: any;
        firstVirtualRenderedRow: any;
        lastVirtualRenderedRow: any;
        focusedCell: any;
        init(gridOptions: any, columnModel: any, gridOptionsWrapper: any, gridPanel: any, angularGrid: any, selectionRendererFactory: any, $compile: any, $scope: any, selectionController: any, expressionService: any, templateService: any): void;
        setRowModel(rowModel: any): void;
        setMainRowWidths(): void;
        findAllElements(gridPanel: any): void;
        refreshView(refreshFromIndex: any): void;
        softRefreshView(): void;
        softRefreshCell(eGridCell: any, isFirstColumn: any, node: any, column: any, scope: any, rowIndex: any): void;
        rowDataChanged(rows: any): void;
        refreshAllVirtualRows(fromIndex: any): void;
        refreshGroupRows(): void;
        removeVirtualRows(rowsToRemove: any, fromIndex?: any): void;
        removeVirtualRow(indexToRemove: any): void;
        drawVirtualRows(): void;
        getFirstVirtualRenderedRow(): any;
        getLastVirtualRenderedRow(): any;
        ensureRowsRendered(): void;
        insertRow(node: any, rowIndex: any, mainRowWidth: any): void;
        getDataForNode(node: any): any;
        createValueGetter(data: any, colDef: any, node: any): () => any;
        createChildScopeOrNull(data: any): any;
        compileAndAdd(container: any, rowIndex: any, element: any, scope: any): any;
        createCellFromColDef(isFirstColumn: any, column: any, valueGetter: any, node: any, rowIndex: any, eMainRow: any, ePinnedRow: any, $childScope: any, renderedRow: any): void;
        addClassesToRow(rowIndex: any, node: any, eRow: any): void;
        createRowContainer(rowIndex: any, node: any, groupRow: any, $scope: any): HTMLDivElement;
        getIndexOfRenderedNode(node: any): any;
        createGroupElement(node: any, rowIndex: any, padding: any): any;
        putDataIntoCell(column: any, value: any, valueGetter: any, node: any, $childScope: any, eSpanWithValue: any, eGridCell: any, rowIndex: any, refreshCellFunction: any): void;
        useCellRenderer(column: any, value: any, node: any, $childScope: any, eSpanWithValue: any, rowIndex: any, refreshCellFunction: any, valueGetter: any, eGridCell: any): void;
        addStylesFromCollDef(column: any, value: any, node: any, $childScope: any, eGridCell: any): void;
        addClassesFromCollDef(colDef: any, value: any, node: any, $childScope: any, eGridCell: any): void;
        addClassesToCell(column: any, node: any, eGridCell: any): void;
        addClassesFromRules(colDef: any, eGridCell: any, value: any, node: any, rowIndex: any): void;
        createCell(isFirstColumn: any, column: any, valueGetter: any, node: any, rowIndex: any, $childScope: any): HTMLDivElement;
        addCellNavigationHandler(eGridCell: any, rowIndex: any, column: any, node: any): void;
        navigateToNextCell(key: any, rowIndex: any, column: any): void;
        getNextCellToFocus(key: any, lastCellToFocus: any): {
            rowIndex: any;
            column: any;
        };
        focusCell(eCell: any, rowIndex: any, colIndex: any, forceBrowserFocus: any): void;
        getFocusedCell(): any;
        setFocusedCell(rowIndex: any, colIndex: any): void;
        populateAndStyleGridCell(valueGetter: any, value: any, eGridCell: any, isFirstColumn: any, node: any, column: any, rowIndex: any, $childScope: any): void;
        populateGridCell(eGridCell: any, isFirstColumn: any, node: any, column: any, rowIndex: any, value: any, valueGetter: any, $childScope: any): void;
        addCellDoubleClickedHandler(eGridCell: any, node: any, column: any, value: any, rowIndex: any, $childScope: any, isFirstColumn: any, valueGetter: any): void;
        addCellClickedHandler(eGridCell: any, node: any, column: any, value: any, rowIndex: any): void;
        isCellEditable(colDef: any, node: any): any;
        stopEditing(eGridCell: any, column: any, node: any, $childScope: any, eInput: any, blurListener: any, rowIndex: any, isFirstColumn: any, valueGetter: any): void;
        startEditing(eGridCell: any, column: any, node: any, $childScope: any, rowIndex: any, isFirstColumn: any, valueGetter: any): void;
        startEditingNextCell(rowIndex: any, column: any, shiftKey: any): void;
    }
}
declare module awk.grid {
    class HeaderRenderer {
        expressionService: any;
        gridOptionsWrapper: any;
        columnModel: any;
        columnController: any;
        angularGrid: any;
        filterManager: any;
        $scope: any;
        $compile: any;
        ePinnedHeader: any;
        eHeaderContainer: any;
        eHeader: any;
        eRoot: any;
        childScopes: any;
        dragStartX: any;
        init(gridOptionsWrapper: any, columnController: any, columnModel: any, gridPanel: any, angularGrid: any, filterManager: any, $scope: any, $compile: any, expressionService: any): void;
        findAllElements(gridPanel: any): void;
        refreshHeader(): void;
        insertHeadersWithGrouping(): void;
        createGroupedHeaderCell(group: any): HTMLDivElement;
        addGroupExpandIcon(group: any, eHeaderGroup: any, expanded: any): void;
        addDragHandler(eDraggableElement: any, dragCallback: any): void;
        setWidthOfGroupHeaderCell(headerGroup: any): void;
        insertHeadersWithoutGrouping(): void;
        createHeaderCell(column: any, grouped: any, headerGroup?: any): HTMLDivElement;
        addHeaderClassesFromCollDef(colDef: any, $childScope: any, eHeaderCell: any): void;
        getNextSortDirection(direction: any): string;
        addSortHandling(headerCellLabel: any, column: any): void;
        updateSortIcons(): void;
        groupDragCallbackFactory(currentGroup: any): {
            onDragStart: () => void;
            onDragging: (dragChange: any) => void;
        };
        adjustColumnWidth(newWidth: any, column: any, eHeaderCell: any): void;
        headerDragCallbackFactory(headerCell: any, column: any, headerGroup: any): {
            onDragStart: () => void;
            onDragging: (dragChange: any) => void;
        };
        stopDragging(listenersToRemove: any): void;
        updateFilterIcons(): void;
    }
}
declare module awk.grid {
    class GroupCreator {
        static theInstance: GroupCreator;
        static getInstance(): GroupCreator;
        group(rowNodes: any, groupedCols: any, expandByDefault: any): any;
        isExpanded(expandByDefault: any, level: any): boolean;
    }
}
declare module awk.grid {
    class InMemoryRowController {
        gridOptionsWrapper: any;
        columnModel: any;
        angularGrid: any;
        filterManager: any;
        $scope: any;
        expressionService: any;
        allRows: any;
        rowsAfterGroup: any;
        rowsAfterFilter: any;
        rowsAfterSort: any;
        rowsAfterMap: any;
        model: any;
        constructor();
        init(gridOptionsWrapper: any, columnModel: any, angularGrid: any, filterManager: any, $scope: any, expressionService: any): void;
        createModel(): void;
        getModel(): any;
        forEachInMemory(callback: any): void;
        updateModel(step: any): void;
        defaultGroupAggFunctionFactory(valueColumns: any, valueKeys: any): (rows: any) => any;
        getValue(data: any, colDef: any, node: any): any;
        doAggregate(): void;
        expandOrCollapseAll(expand: any, rowNodes: any): void;
        recursivelyClearAggData(nodes: any): void;
        recursivelyCreateAggData(nodes: any, groupAggFunction: any): void;
        doSort(): void;
        recursivelyResetSort(rowNodes: any): void;
        sortList(nodes: any, sortOptions: any): void;
        doGrouping(): void;
        doFilter(): void;
        filterItems(rowNodes: any, quickFilterPresent: any, advancedFilterPresent: any): any;
        recursivelyResetFilter(nodes: any): void;
        setAllRows(rows: any, firstId: any): void;
        recursivelyAddIdToNodes(nodes: any, index: any): any;
        recursivelyCheckUserProvidedNodes(nodes: any, parent: any, level: any): void;
        getTotalChildCount(rowNodes: any): number;
        doGroupMapping(): void;
        addToMap(mappedData: any, originalNodes: any): void;
        createFooterNode(groupNode: any): any;
        doesRowPassFilter(node: any, quickFilterPresent: any, advancedFilterPresent: any): boolean;
        aggregateRowForQuickFilter(node: any): void;
    }
}
declare module awk.grid {
    class VirtualPageRowController {
        rowRenderer: any;
        datasourceVersion: any;
        gridOptionsWrapper: any;
        angularGrid: any;
        datasource: any;
        virtualRowCount: any;
        foundMaxRow: any;
        pageCache: any;
        pageCacheSize: any;
        pageLoadsInProgress: any;
        pageLoadsQueued: any;
        pageAccessTimes: any;
        accessTime: any;
        maxConcurrentDatasourceRequests: any;
        maxPagesInCache: any;
        pageSize: any;
        overflowSize: any;
        init(rowRenderer: any, gridOptionsWrapper: any, angularGrid: any): void;
        setDatasource(datasource: any): void;
        reset(): void;
        createNodesFromRows(pageNumber: any, rows: any): any;
        removeFromLoading(pageNumber: any): void;
        pageLoadFailed(pageNumber: any): void;
        pageLoaded(pageNumber: any, rows: any, lastRow: any): void;
        putPageIntoCacheAndPurge(pageNumber: any, rows: any): void;
        checkMaxRowAndInformRowRenderer(pageNumber: any, lastRow: any): void;
        isPageAlreadyLoading(pageNumber: any): boolean;
        doLoadOrQueue(pageNumber: any): void;
        addToQueueAndPurgeQueue(pageNumber: any): void;
        findLeastRecentlyAccessedPage(pageIndexes: any): number;
        checkQueueForNextLoad(): void;
        loadPage(pageNumber: any): void;
        requestIsDaemon(datasourceVersionCopy: any): boolean;
        getVirtualRow(rowIndex: any): any;
        forEachInMemory(callback: any): void;
        getModel(): {
            getVirtualRow: (index: any) => any;
            getVirtualRowCount: () => any;
            forEachInMemory: (callback: any) => void;
        };
    }
}
declare module awk.grid {
    class PaginationController {
        eGui: any;
        btNext: any;
        btPrevious: any;
        btFirst: any;
        btLast: any;
        lbCurrent: any;
        lbTotal: any;
        lbRecordCount: any;
        lbFirstRowOnPage: any;
        lbLastRowOnPage: any;
        ePageRowSummaryPanel: any;
        angularGrid: any;
        callVersion: any;
        gridOptionsWrapper: any;
        datasource: any;
        pageSize: any;
        rowCount: any;
        foundMaxRow: any;
        totalPages: any;
        currentPage: any;
        init(angularGrid: any, gridOptionsWrapper: any): void;
        setDatasource(datasource: any): void;
        reset(): void;
        setTotalLabels(): void;
        calculateTotalPages(): void;
        pageLoaded(rows: any, lastRowIndex: any): void;
        updateRowLabels(): void;
        loadPage(): void;
        isCallDaemon(versionCopy: any): boolean;
        onBtNext(): void;
        onBtPrevious(): void;
        onBtFirst(): void;
        onBtLast(): void;
        isZeroPagesToDisplay(): boolean;
        enableOrDisableButtons(): void;
        createTemplate(): string;
        getGui(): any;
        setupComponents(): void;
    }
}
declare module awk.grid {
    class TemplateService {
        templateCache: any;
        waitingCallbacks: any;
        $scope: any;
        init($scope: any): void;
        getTemplate(url: any, callback: any): any;
        handleHttpResult(httpResult: any, url: any): void;
    }
}
declare module awk.grid {
    class BorderLayout {
        eNorthWrapper: any;
        eSouthWrapper: any;
        eEastWrapper: any;
        eWestWrapper: any;
        eCenterWrapper: any;
        eOverlayWrapper: any;
        eCenterRow: any;
        eNorthChildLayout: any;
        eSouthChildLayout: any;
        eEastChildLayout: any;
        eWestChildLayout: any;
        eCenterChildLayout: any;
        isLayoutPanel: any;
        fullHeight: any;
        layoutActive: any;
        eGui: any;
        id: any;
        childPanels: any;
        centerHeightLastTime: any;
        constructor(params: any);
        setupPanels(params: any): void;
        setupPanel(content: any, ePanel: any): any;
        getGui(): any;
        doLayout(): boolean;
        layoutChild(childPanel: any): any;
        layoutHeight(): boolean;
        layoutWidth(): void;
        setEastVisible(visible: any): void;
        setOverlayVisible(visible: any): void;
        setSouthVisible(visible: any): void;
    }
}
declare module awk.grid {
    class GridPanel {
        gridOptionsWrapper: any;
        forPrint: any;
        scrollWidth: any;
        eRoot: any;
        layout: any;
        rowModel: any;
        eBodyViewport: any;
        columnModel: any;
        eBody: any;
        rowRenderer: any;
        eBodyContainer: any;
        ePinnedColsContainer: any;
        eHeaderContainer: any;
        ePinnedHeader: any;
        eHeader: any;
        eParentOfRows: any;
        eBodyViewportWrapper: any;
        ePinnedColsViewport: any;
        constructor(gridOptionsWrapper: any);
        setupComponents(): void;
        ensureIndexVisible(index: any): void;
        ensureColIndexVisible(index: any): void;
        showLoading(loading: any): void;
        getWidthForSizeColsToFit(): any;
        init(columnModel: any, rowRenderer: any): void;
        setRowModel(rowModel: any): void;
        getBodyContainer(): any;
        getBodyViewport(): any;
        getPinnedColsContainer(): any;
        getHeaderContainer(): any;
        getRoot(): any;
        getPinnedHeader(): any;
        getHeader(): any;
        getRowsParent(): any;
        findElements(): void;
        setBodyContainerWidth(): void;
        setPinnedColContainerWidth(): void;
        showPinnedColContainersIfNeeded(): void;
        setHeaderHeight(): void;
        setPinnedColHeight(): void;
        addScrollListener(): void;
        scrollHeader(bodyLeftPosition: any): void;
        scrollPinned(bodyTopPosition: any): void;
    }
}
declare module awk.grid {
    class DragAndDropService {
        static theInstance: DragAndDropService;
        static getInstance(): DragAndDropService;
        dragItem: any;
        constructor();
        stopDragging(): void;
        setDragCssClasses(eListItem: any, dragging: any): void;
        addDragSource(eDragSource: any, dragSourceCallback: any): void;
        onMouseDownDragSource(eDragSource: any, dragSourceCallback: any): void;
        addDropTarget(eDropTarget: any, dropTargetCallback: any): void;
    }
}
declare function require(name: string): any;
declare module awk.grid {
    class AgList {
        eGui: any;
        uniqueId: any;
        modelChangedListeners: any;
        itemSelectedListeners: any;
        beforeDropListeners: any;
        dragSources: any;
        emptyMessage: any;
        eFilterValueTemplate: any;
        eListParent: any;
        model: any;
        cellRenderer: any;
        constructor();
        setEmptyMessage(emptyMessage: any): void;
        getUniqueId(): any;
        addStyles(styles: any): void;
        addCssClass(cssClass: any): void;
        addDragSource(dragSource: any): void;
        addModelChangedListener(listener: any): void;
        addItemSelectedListener(listener: any): void;
        addBeforeDropListener(listener: any): void;
        fireModelChanged(): void;
        fireItemSelected(item: any): void;
        fireBeforeDrop(item: any): void;
        setupComponents(): void;
        setModel(model: any): void;
        getModel(): any;
        setCellRenderer(cellRenderer: any): void;
        refreshView(): void;
        insertRows(): void;
        insertBlankMessage(): void;
        setupAsDropTarget(): void;
        externalAcceptDrag(dragEvent: any): boolean;
        externalDrop(dragEvent: any): void;
        externalNoDrop(): void;
        addItemToList(newItem: any): void;
        addDragAndDropToListItem(eListItem: any, item: any): void;
        internalAcceptDrag(targetColumn: any, dragItem: any, eListItem: any): boolean;
        internalDrop(targetColumn: any, draggedColumn: any): void;
        internalNoDrop(eListItem: any): void;
        dragAfterThisItem(targetColumn: any, draggedColumn: any): boolean;
        setDropCssClasses(eListItem: any, state: any): void;
        getGui(): any;
    }
}
declare module awk.grid {
    class ColumnSelectionPanel {
        gridOptionsWrapper: any;
        columnController: any;
        cColumnList: any;
        layout: any;
        eRootPanel: any;
        constructor(columnController: any, gridOptionsWrapper: any);
        columnsChanged(newColumns: any): void;
        getDragSource(): any;
        columnCellRenderer(params: any): HTMLSpanElement;
        setupComponents(): void;
        setSelected(column: any, selected: any): void;
        getGui(): any;
    }
}
declare module awk.grid {
    class GroupSelectionPanel {
        gridOptionsWrapper: any;
        columnController: any;
        inMemoryRowController: any;
        cColumnList: any;
        layout: any;
        constructor(columnController: any, inMemoryRowController: any, gridOptionsWrapper: any);
        columnsChanged(newColumns: any, newGroupedColumns: any): void;
        addDragSource(dragSource: any): void;
        columnCellRenderer(params: any): HTMLSpanElement;
        setupComponents(): void;
        onGroupingChanged(): void;
    }
}
declare module awk.grid {
    class AgDropdownList {
        itemSelectedListeners: any;
        eValue: any;
        agList: any;
        eGui: any;
        hidePopupCallback: any;
        selectedItem: any;
        cellRenderer: any;
        constructor();
        setWidth(width: any): void;
        addItemSelectedListener(listener: any): void;
        fireItemSelected(item: any): void;
        setupComponents(): void;
        itemSelected(item: any): void;
        onClick(): void;
        getGui(): any;
        setSelected(item: any): void;
        setCellRenderer(cellRenderer: any): void;
        refreshView(): void;
        setModel(model: any): void;
    }
}
declare module awk.grid {
    class ValuesSelectionPanel {
        gridOptionsWrapper: any;
        columnController: any;
        api: any;
        cColumnList: any;
        layout: any;
        constructor(columnController: any, gridOptionsWrapper: any, api: any);
        columnsChanged(newColumns: any, newGroupedColumns: any, newValuesColumns: any): void;
        addDragSource(dragSource: any): void;
        cellRenderer(params: any): HTMLSpanElement;
        setupComponents(): void;
        beforeDropListener(newItem: any): void;
        onValuesChanged(): void;
    }
}
declare module awk.grid {
    class VerticalStack {
        isLayoutPanel: any;
        childPanels: any;
        eGui: any;
        constructor();
        addPanel(panel: any, height: any): void;
        getGui(): any;
        doLayout(): void;
    }
}
declare module awk.grid {
    class ToolPanel {
        layout: any;
        constructor();
        init(columnController: any, inMemoryRowController: any, gridOptionsWrapper: any, api: any): void;
    }
}
declare module awk.grid {
    interface GridOptions {
        rowSelection?: string;
        rowDeselection?: boolean;
        context?: any;
        virtualPaging?: boolean;
        showToolPanel?: boolean;
        toolPanelSuppressPivot?: boolean;
        toolPanelSuppressValues?: boolean;
        rowsAlreadyGrouped?: boolean;
        groupSelectsChildren?: boolean;
        groupHidePivotColumns?: boolean;
        groupIncludeFooter?: boolean;
        suppressRowClickSelection?: boolean;
        suppressCellSelection?: boolean;
        suppressUnSort?: boolean;
        suppressMultiSort?: boolean;
        groupSuppressAutoColumn?: boolean;
        groupHeaders?: boolean;
        dontUseScrolls?: boolean;
        suppressDescSort?: boolean;
        unSortIcon?: boolean;
        rowStyle?: any;
        rowClass?: any;
        headerCellRenderer?: any;
        api?: any;
        enableColResize?: boolean;
        groupDefaultExpanded?: any;
        groupKeys?: string[];
        groupAggFunction?(nodes: any[]): any;
        groupAggFields?: string[];
        rowData?: any[];
        groupUseEntireRow?: boolean;
        groupColumnDef?: any;
        angularCompileRows?: boolean;
        angularCompileFilters?: boolean;
        angularCompileHeaders?: boolean;
        columnDefs?: any[];
        rowHeight?: number;
        modelUpdated?(): void;
        cellClicked?(params: any): void;
        cellDoubleClicked?(params: any): void;
        cellValueChanged?(params: any): void;
        cellFocused?(params: any): void;
        rowSelected?(rowIndex: number, selected: boolean): void;
        selectionChanged?(): void;
        virtualRowRemoved?(row: any, rowIndex: number): void;
        rowClicked?(params: any): void;
        datasource?: any;
        ready?(api: any): void;
        rowBuffer?: number;
        enableSorting?: boolean;
        enableServerSideSorting?: boolean;
        enableFilter?: boolean;
        enableServerSideFilter?: boolean;
        selectedRows?: any[];
        selectedNodesById?: {
            [email: number]: any;
        };
        icons?: any;
        groupInnerRenderer?(params: any): void;
        groupRowInnerRenderer?(params: any): void;
        colWidth?: number;
        headerHeight?: number;
        pinnedColumnCount?: number;
        localeText?: any;
    }
}
declare module awk.grid {
    class Grid {
        virtualRowCallbacks: any;
        gridOptions: GridOptions;
        gridOptionsWrapper: any;
        quickFilter: any;
        scrollWidth: any;
        inMemoryRowController: any;
        doingVirtualPaging: any;
        paginationController: any;
        virtualPageRowController: any;
        rowModel: any;
        finished: any;
        selectionController: any;
        columnController: any;
        columnModel: any;
        rowRenderer: any;
        headerRenderer: any;
        filterManager: any;
        eToolPanel: any;
        gridPanel: any;
        eRootPanel: any;
        toolPanelShowing: any;
        doingPagination: any;
        constructor(eGridDiv: any, gridOptions: any, $scope: any, $compile: any, quickFilterOnScope: any);
        periodicallyDoLayout(): void;
        setupComponents($scope: any, $compile: any, eUserProvidedDiv: any): void;
        showToolPanel(show: any): void;
        isToolPanelShowing(): any;
        setDatasource(datasource?: any): void;
        refreshHeaderAndBody(): void;
        setFinished(): void;
        getQuickFilter(): any;
        onQuickFilterChanged(newFilter: any): void;
        onFilterChanged(): void;
        onRowClicked(event: any, rowIndex: any, node: any): void;
        showLoadingPanel(show: any): void;
        setupColumns(): void;
        updateModelAndRefresh(step: any, refreshFromIndex?: any): void;
        setRows(rows?: any, firstId?: any): void;
        ensureNodeVisible(comparator: any): void;
        getFilterModel(): any;
        addApi(): void;
        setFocusedCell(rowIndex: any, colIndex: any): void;
        getSortModel(): any;
        setSortModel(sortModel: any): void;
        onSortingChanged(): void;
        addVirtualRowListener(rowIndex: any, callback: any): void;
        onVirtualRowSelected(rowIndex: any, selected: any): void;
        onVirtualRowRemoved(rowIndex: any): void;
        onNewCols(): void;
        updateBodyContainerWidthAfterColResize(): void;
        updatePinnedColContainerWidthAfterColResize(): void;
        doLayout(): void;
    }
}
declare var angular: any;
declare var exports: any;
declare var module: any;
