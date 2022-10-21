import { ColumnApi } from './columns/columnApi';
import { ColDefUtil } from './components/colDefUtil';
import { ComponentUtil } from './components/componentUtil';
import { Constants } from './constants/constants';
import { Autowired, Bean, PostConstruct, PreDestroy, Qualifier } from './context/context';
import { Column } from './entities/column';
import { GridOptions, RowGroupingDisplayType, TreeDataDisplayType } from './entities/gridOptions';
import { GetGroupAggFilteringParams, GetGroupRowAggParams, GetLocaleTextParams, GetRowIdParams, InitialGroupOrderComparatorParams, IsFullWidthRowParams, PostSortRowsParams, RowHeightParams } from './entities/iCallbackParams';
import { RowNode } from './entities/rowNode';
import { SideBarDef, SideBarDefParser } from './entities/sideBar';
import { Environment, SASS_PROPERTIES } from './environment';
import { Events } from './eventKeys';
import { EventService } from './eventService';
import { GridApi } from './gridApi';
import { GridOptionsService, isTrue, PropertyChangedEvent } from './gridOptionsService';
import { CsvExportParams } from './interfaces/exportParams';
import { AgGridCommon, WithoutGridCommon } from './interfaces/iCommon';
import { ExcelExportParams } from './interfaces/iExcelCreator';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { PropertyKeys } from './propertyKeys';
import { getScrollbarWidth } from './utils/browser';
import { doOnce } from './utils/function';
import { fuzzyCheckStrings } from './utils/fuzzyMatch';
import { exists, missing, values } from './utils/generic';
import { isNumeric } from './utils/number';
import { iterateObject } from './utils/object';
import { capitalise } from './utils/string';

const DEFAULT_ROW_HEIGHT = 25;
const DEFAULT_DETAIL_ROW_HEIGHT = 300;
const DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
const DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
const DEFAULT_KEEP_DETAIL_ROW_COUNT = 10;

function zeroOrGreater(value: any, defaultValue: number): number {
    if (value >= 0) { return value; }

    // zero gets returned if number is missing or the wrong type
    return defaultValue;
}

function oneOrGreater(value: any, defaultValue?: number): number | undefined {
    const valueNumber = parseInt(value, 10);

    if (isNumeric(valueNumber) && valueNumber > 0) {
        return valueNumber;
    }

    return defaultValue;
}

@Bean('gridOptionsWrapper')
export class GridOptionsWrapper {
    private static MIN_COL_WIDTH = 10;

    public static PROP_HEADER_HEIGHT: 'headerHeight' = 'headerHeight';
    public static PROP_GROUP_REMOVE_SINGLE_CHILDREN: 'groupRemoveSingleChildren' = 'groupRemoveSingleChildren';
    public static PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN: 'groupRemoveLowestSingleChildren' = 'groupRemoveLowestSingleChildren';
    public static PROP_GROUP_DISPLAY_TYPE: 'groupDisplayType' = 'groupDisplayType';
    public static PROP_PIVOT_HEADER_HEIGHT: 'pivotHeaderHeight' = 'pivotHeaderHeight';
    public static PROP_SUPPRESS_CLIPBOARD_PASTE: 'suppressClipboardPaste' = 'suppressClipboardPaste';

    public static PROP_GROUP_HEADER_HEIGHT: 'groupHeaderHeight' = 'groupHeaderHeight';
    public static PROP_PIVOT_GROUP_HEADER_HEIGHT: 'pivotGroupHeaderHeight' = 'pivotGroupHeaderHeight';

    public static PROP_NAVIGATE_TO_NEXT_CELL: 'navigateToNextCell' = 'navigateToNextCell';
    public static PROP_TAB_TO_NEXT_CELL: 'tabToNextCell' = 'tabToNextCell';
    public static PROP_NAVIGATE_TO_NEXT_HEADER: 'navigateToNextHeader' = 'navigateToNextHeader';
    public static PROP_TAB_TO_NEXT_HEADER: 'tabToNextHeader' = 'tabToNextHeader';

    public static PROP_IS_EXTERNAL_FILTER_PRESENT: 'isExternalFilterPresent' = 'isExternalFilterPresent';
    public static PROP_DOES_EXTERNAL_FILTER_PASS: 'doesExternalFilterPass' = 'doesExternalFilterPass';

    public static PROP_FLOATING_FILTERS_HEIGHT: 'floatingFiltersHeight' = 'floatingFiltersHeight';

    public static PROP_SUPPRESS_ROW_CLICK_SELECTION: 'suppressRowClickSelection' = 'suppressRowClickSelection';
    public static PROP_SUPPRESS_ROW_DRAG: 'suppressRowDrag' = 'suppressRowDrag';
    public static PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG: 'suppressMoveWhenRowDragging' = 'suppressMoveWhenRowDragging';

    public static PROP_GET_ROW_CLASS: 'getRowClass' = 'getRowClass';
    public static PROP_GET_ROW_STYLE: 'getRowStyle' = 'getRowStyle';

    public static PROP_GET_ROW_HEIGHT: 'getRowHeight' = 'getRowHeight';

    public static PROP_POPUP_PARENT: 'popupParent' = 'popupParent';

    public static PROP_DOM_LAYOUT: 'domLayout' = 'domLayout';
    public static PROP_ROW_CLASS: 'rowClass' = 'rowClass';

    public static PROP_FILL_HANDLE_DIRECTION: 'fillHandleDirection' = 'fillHandleDirection';

    public static PROP_GROUP_ROW_AGG_NODES: 'groupRowAggNodes' = 'groupRowAggNodes';
    public static PROP_GET_GROUP_ROW_AGG: 'getGroupRowAgg' = 'getGroupRowAgg';
    public static PROP_GET_BUSINESS_KEY_FOR_NODE: 'getBusinessKeyForNode' = 'getBusinessKeyForNode';
    public static PROP_GET_CHILD_COUNT: 'getChildCount' = 'getChildCount';
    public static PROP_PROCESS_ROW_POST_CREATE: 'processRowPostCreate' = 'processRowPostCreate';
    public static PROP_GET_ROW_NODE_ID: 'getRowNodeId' = 'getRowNodeId';
    public static PROP_GET_ROW_ID: 'getRowId' = 'getRowId';
    public static PROP_IS_FULL_WIDTH_CELL: 'isFullWidthCell' = 'isFullWidthCell';
    public static PROP_IS_FULL_WIDTH_ROW: 'isFullWidthRow' = 'isFullWidthRow';
    public static PROP_IS_ROW_SELECTABLE: 'isRowSelectable' = 'isRowSelectable';
    public static PROP_IS_ROW_MASTER: 'isRowMaster' = 'isRowMaster';
    public static PROP_POST_SORT: 'postSort' = 'postSort';
    public static PROP_POST_SORT_ROWS: 'postSortRows' = 'postSortRows';
    public static PROP_GET_DOCUMENT: 'getDocument' = 'getDocument';
    public static PROP_POST_PROCESS_POPUP: 'postProcessPopup' = 'postProcessPopup';
    public static PROP_DEFAULT_GROUP_ORDER_COMPARATOR: 'defaultGroupOrderComparator' = 'defaultGroupOrderComparator';
    public static PROP_INITIAL_GROUP_ORDER_COMPARATOR: 'initialGroupOrderComparator' = 'initialGroupOrderComparator';
    public static PROP_PAGINATION_NUMBER_FORMATTER: 'paginationNumberFormatter' = 'paginationNumberFormatter';

    public static PROP_GET_CONTEXT_MENU_ITEMS: 'getContextMenuItems' = 'getContextMenuItems';
    public static PROP_GET_MAIN_MENU_ITEMS: 'getMainMenuItems' = 'getMainMenuItems';

    public static PROP_PROCESS_CELL_FOR_CLIPBOARD: 'processCellForClipboard' = 'processCellForClipboard';
    public static PROP_PROCESS_CELL_FROM_CLIPBOARD: 'processCellFromClipboard' = 'processCellFromClipboard';
    public static PROP_SEND_TO_CLIPBOARD: 'sendToClipboard' = 'sendToClipboard';

    public static PROP_PROCESS_PIVOT_RESULT_COL_DEF: 'processPivotResultColDef' = 'processPivotResultColDef';
    public static PROP_PROCESS_PIVOT_RESULT_COL_GROUP_DEF: 'processPivotResultColGroupDef' = 'processPivotResultColGroupDef';

    public static PROP_GET_CHART_TOOLBAR_ITEMS: 'getChartToolbarItems' = 'getChartToolbarItems';

    public static PROP_GET_SERVER_SIDE_GROUP_PARAMS: 'getServerSideGroupLevelParams' = 'getServerSideGroupLevelParams';
    public static PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT: 'isServerSideGroupOpenByDefault' = 'isServerSideGroupOpenByDefault';
    public static PROP_IS_APPLY_SERVER_SIDE_TRANSACTION: 'isApplyServerSideTransaction' = 'isApplyServerSideTransaction';
    public static PROP_IS_SERVER_SIDE_GROUP: 'isServerSideGroup' = 'isServerSideGroup';
    public static PROP_GET_SERVER_SIDE_GROUP_KEY: 'getServerSideGroupKey' = 'getServerSideGroupKey';

    public static PROP_AUTO_GROUP_COLUMN_DEF: 'autoGroupColumnDef' = 'autoGroupColumnDef';
    public static PROP_DEFAULT_COL_DEF: 'defaultColDef' = 'defaultColDef';

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('gridOptionsService') private readonly gridOptionsService: GridOptionsService;
    @Autowired('eventService') private readonly eventService: EventService;
    @Autowired('environment') private readonly environment: Environment;
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private propertyEventService: EventService = new EventService();

    private domDataKey = '__AG_' + Math.random().toString();

    // we store this locally, so we are not calling getScrollWidth() multiple times as it's an expensive operation
    private scrollbarWidth: number;

    private destroyed = false;

    private agWire(@Qualifier('gridApi') gridApi: GridApi, @Qualifier('columnApi') columnApi: ColumnApi): void {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
        this.checkForDeprecated();
        this.checkForViolations();
    }

    @PreDestroy
    private destroy(): void {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;

        this.destroyed = true;
    }

    @PostConstruct
    public init(): void {
        if (this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkGridOptionsProperties();
            this.checkColumnDefProperties();
        }

        // parse side bar options into correct format
        if (this.gridOptions.sideBar != null) {
            this.gridOptions.sideBar = SideBarDefParser.parse(this.gridOptions.sideBar);
        }

        const async = this.useAsyncEvents();
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);

        if (this.gridOptionsService.is('groupSelectsChildren') && this.gridOptionsService.is('suppressParentsInRowNodes')) {
            console.warn("AG Grid: 'groupSelectsChildren' does not work with 'suppressParentsInRowNodes', this selection method needs the part in rowNode to work");
        }

        if (this.gridOptionsService.is('groupSelectsChildren')) {
            if (!this.isRowSelectionMulti()) {
                console.warn("AG Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense");
            }
            if (this.isRowModelServerSide()) {
                console.warn(
                    'AG Grid: group selects children is NOT support for Server Side Row Model. ' +
                    'This is because the rows are lazy loaded, so selecting a group is not possible as' +
                    'the grid has no way of knowing what the children are.'
                );
            }
        }

        if (this.gridOptionsService.is('groupRemoveSingleChildren') && this.gridOptionsService.is('groupHideOpenParents')) {
            console.warn(
                "AG Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don't ask us how to use these together on our support forum either, you will get the same answer!"
            );
        }

        if (this.isRowModelServerSide()) {
            const msg = (prop: string) => `AG Grid: '${prop}' is not supported on the Server-Side Row Model`;
            if (exists(this.gridOptions.groupDefaultExpanded)) {
                console.warn(msg('groupDefaultExpanded'));
            }
            if (exists(this.gridOptions.groupDefaultExpanded)) {
                console.warn(msg('groupIncludeFooter'));
            }
            if (exists(this.gridOptions.groupDefaultExpanded)) {
                console.warn(msg('groupIncludeTotalFooter'));
            }
        }

        if (this.gridOptionsService.is('enableRangeSelection')) {
            ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'enableRangeSelection');
        } else if (this.gridOptionsService.is('enableRangeHandle') || this.gridOptionsService.is('enableFillHandle')) {
            console.warn("AG Grid: 'enableRangeHandle' or 'enableFillHandle' will not work unless 'enableRangeSelection' is set to true");
        }

        if (this.gridOptionsService.is('groupRowsSticky')) {
            if (this.gridOptionsService.is('groupHideOpenParents')) {
                console.warn(
                    "AG Grid: groupRowsSticky and groupHideOpenParents do not work with each other, you need to pick one."
                );
            }

            if (this.gridOptionsService.is('masterDetail')) {
                console.warn(
                    "AG Grid: groupRowsSticky and masterDetail do not work with each other, you need to pick one."
                );
            }

            if (this.gridOptionsService.is('pagination')) {
                console.warn(
                    "AG Grid: groupRowsSticky and pagination do not work with each other, you need to pick one."
                );
            }
        }

        const warnOfDeprecaredIcon = (name: string) => {
            if (this.gridOptions.icons && this.gridOptions.icons[name]) {
                console.warn(`gridOptions.icons.${name} is no longer supported. For information on how to style checkboxes and radio buttons, see https://www.ag-grid.com/javascript-grid-icons/`);
            }
        };
        warnOfDeprecaredIcon('radioButtonOff');
        warnOfDeprecaredIcon('radioButtonOn');
        warnOfDeprecaredIcon('checkboxChecked');
        warnOfDeprecaredIcon('checkboxUnchecked');
        warnOfDeprecaredIcon('checkboxIndeterminate');

        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();
    }

    private checkColumnDefProperties() {
        if (this.gridOptions.columnDefs == null) { return; }

        this.gridOptions.columnDefs.forEach(colDef => {
            const userProperties: string[] = Object.getOwnPropertyNames(colDef);
            const validProperties: string[] = [...ColDefUtil.ALL_PROPERTIES, ...ColDefUtil.FRAMEWORK_PROPERTIES];

            this.checkProperties(
                userProperties,
                validProperties,
                validProperties,
                'colDef',
                'https://www.ag-grid.com/javascript-grid-column-properties/'
            );
        });
    }

    private checkGridOptionsProperties() {
        const userProperties: string[] = Object.getOwnPropertyNames(this.gridOptions);
        const validProperties: string[] = [
            ...PropertyKeys.ALL_PROPERTIES,
            ...PropertyKeys.FRAMEWORK_PROPERTIES,
            ...values<any>(Events).map(event => ComponentUtil.getCallbackForEvent(event))
        ];

        const validPropertiesAndExceptions: string[] = [...validProperties, 'api', 'columnApi'];

        this.checkProperties(
            userProperties,
            validPropertiesAndExceptions,
            validProperties,
            'gridOptions',
            'https://www.ag-grid.com/javascript-data-grid/grid-options/'
        );
    }

    private checkProperties(
        userProperties: string[],
        validPropertiesAndExceptions: string[],
        validProperties: string[],
        containerName: string,
        docsUrl: string
    ) {
        const invalidProperties: { [p: string]: string[]; } = fuzzyCheckStrings(
            userProperties,
            validPropertiesAndExceptions,
            validProperties
        );

        iterateObject<any>(invalidProperties, (key, value) => {
            console.warn(`ag-grid: invalid ${containerName} property '${key}' did you mean any of these: ${value.slice(0, 8).join(", ")}`);
        });

        if (Object.keys(invalidProperties).length > 0) {
            console.warn(`ag-grid: to see all the valid ${containerName} properties please check: ${docsUrl}`);
        }
    }

    /**
    * Wrap the user callback and attach the api, columnApi and context to the params object on the way through.
    * @param callback User provided callback
    * @returns Wrapped callback where the params object not require api, columnApi and context
    */
    private mergeGridCommonParams<P extends AgGridCommon<any>, T>(callback: ((params: P) => T) | undefined):
        ((params: WithoutGridCommon<P>) => T) | undefined {
        if (callback) {
            const wrapped = (callbackParams: WithoutGridCommon<P>): T => {
                const mergedParams = { ...callbackParams, api: this.getApi()!, columnApi: this.getColumnApi()!, context: this.getContext() } as P;
                return callback(mergedParams);
            };
            return wrapped;
        }
        return callback;
    }

    public getDomDataKey(): string {
        return this.domDataKey;
    }

    // returns the dom data, or undefined if not found
    public getDomData(element: Node | null, key: string): any {
        const domData = (element as any)[this.getDomDataKey()];

        return domData ? domData[key] : undefined;
    }

    public setDomData(element: Element, key: string, value: any): any {
        const domDataKey = this.getDomDataKey();
        let domData = (element as any)[domDataKey];

        if (missing(domData)) {
            domData = {};
            (element as any)[domDataKey] = domData;
        }
        domData[key] = value;
    }

    public isRowSelection() {
        return this.gridOptions.rowSelection === 'single' || this.gridOptions.rowSelection === 'multiple';
    }

    public isRowSelectionMulti() {
        return this.gridOptions.rowSelection === 'multiple';
    }

    public getContext() {
        return this.gridOptions.context;
    }

    public isRowModelInfinite() {
        return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_INFINITE;
    }

    public isRowModelViewport() {
        return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT;
    }

    public isRowModelServerSide() {
        return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    }

    public isRowModelDefault() {
        return (missing(this.gridOptions.rowModelType) ||
            this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE);
    }

    public isFullRowEdit() {
        return this.gridOptions.editType === 'fullRow';
    }

    public isShowToolPanel() {
        return isTrue(this.gridOptions.sideBar && Array.isArray(this.getSideBar().toolPanels));
    }

    public getSideBar(): SideBarDef {
        return this.gridOptions.sideBar as SideBarDef;
    }

    public useAsyncEvents() {
        return !isTrue(this.gridOptions.suppressAsyncEvents);
    }

    public isColumnsSortingCoupledToGroup(): boolean {
        const autoGroupColumnDef = this.gridOptionsService.get('autoGroupColumnDef');
        const isClientSideRowModel = this.isRowModelDefault();
        return isClientSideRowModel && !autoGroupColumnDef?.comparator;
    }

    public isGroupMultiAutoColumn() {
        if (this.gridOptions.groupDisplayType) {
            return this.matchesGroupDisplayType('multipleColumns', this.gridOptions.groupDisplayType);
        }
        // if we are doing hideOpenParents we also show multiple columns, otherwise hideOpenParents would not work
        return this.gridOptionsService.is('groupHideOpenParents');
    }

    public isGroupUseEntireRow(pivotMode: boolean): boolean {
        // we never allow groupUseEntireRow if in pivot mode, otherwise we won't see the pivot values.
        if (pivotMode) { return false; }

        return this.gridOptions.groupDisplayType ?
            this.matchesGroupDisplayType('groupRows', this.gridOptions.groupDisplayType) : false;
    }

    public isGroupSuppressAutoColumn() {
        const isCustomRowGroups = this.gridOptions.groupDisplayType ?
            this.matchesGroupDisplayType('custom', this.gridOptions.groupDisplayType) : false;

        if (isCustomRowGroups) { return true; }

        return this.gridOptions.treeDataDisplayType ?
            this.matchesTreeDataDisplayType('custom', this.gridOptions.treeDataDisplayType) : false;
    }

    public isMultiSortKeyCtrl() {
        return this.gridOptions.multiSortKey === 'ctrl';
    }

    public getRowDragText(column?: Column) {
        if (column) {
            const colDef = column.getColDef();
            if (colDef.rowDragText) {
                return colDef.rowDragText;
            }
        }
        return this.gridOptions.rowDragText;
    }

    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    public getDomLayout(): string {
        const domLayout = this.gridOptions.domLayout || Constants.DOM_LAYOUT_NORMAL;
        const validLayouts = [
            Constants.DOM_LAYOUT_PRINT,
            Constants.DOM_LAYOUT_AUTO_HEIGHT,
            Constants.DOM_LAYOUT_NORMAL
        ];

        if (validLayouts.indexOf(domLayout) === -1) {
            doOnce(
                () =>
                    console.warn(
                        `AG Grid: ${domLayout} is not valid for DOM Layout, valid values are ${Constants.DOM_LAYOUT_NORMAL}, ${Constants.DOM_LAYOUT_AUTO_HEIGHT} and ${Constants.DOM_LAYOUT_PRINT}`
                    ),
                'warn about dom layout values'
            );
            return Constants.DOM_LAYOUT_NORMAL;
        }

        return domLayout;
    }

    public getRowStyleFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getRowStyle);
    }

    public getRowClassFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getRowClass);
    }

    public getServerSideGroupLevelParamsFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getServerSideGroupLevelParams);
    }

    public getCreateChartContainerFunc() {
        return this.mergeGridCommonParams(this.gridOptions.createChartContainer);
    }

    public getPostProcessPopupFunc() {
        return this.mergeGridCommonParams(this.gridOptions.postProcessPopup);
    }

    public getPaginationNumberFormatterFunc() {
        return this.mergeGridCommonParams(this.gridOptions.paginationNumberFormatter);
    }

    public getIsApplyServerSideTransactionFunc() {
        return this.mergeGridCommonParams(this.gridOptions.isApplyServerSideTransaction);
    }

    public getInitialGroupOrderComparator() {
        const { initialGroupOrderComparator, defaultGroupOrderComparator } = this.gridOptions;
        if (initialGroupOrderComparator) {
            return this.mergeGridCommonParams(initialGroupOrderComparator);
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        if (defaultGroupOrderComparator) {
            return (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => defaultGroupOrderComparator(params.nodeA, params.nodeB);
        }
    }

    public getIsFullWidthCellFunc() {
        const { isFullWidthRow, isFullWidthCell } = this.gridOptions;
        if (isFullWidthRow) {
            return this.mergeGridCommonParams(isFullWidthRow);
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        if (isFullWidthCell) {
            return (params: WithoutGridCommon<IsFullWidthRowParams>) => isFullWidthCell(params.rowNode);
        }
    }

    public getApi(): GridApi | undefined | null {
        return this.gridOptions.api;
    }

    public getColumnApi(): ColumnApi | undefined | null {
        return this.gridOptions.columnApi;
    }

    public getCacheBlockSize(): number | undefined {
        return oneOrGreater(this.gridOptions.cacheBlockSize);
    }

    public getServerSideInitialRowCount(): number {
        const rowCount = this.gridOptions.serverSideInitialRowCount;
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    }

    public getProcessDataFromClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processDataFromClipboard);
    }

    public getAsyncTransactionWaitMillis(): number | undefined {
        return exists(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : Constants.BATCH_WAIT_MILLIS;
    }

    public isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = this.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || isTrue(this.gridOptions.suppressAggFilteredOnly);
    }

    public isEnableRangeSelection(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule) && this.gridOptionsService.is('enableRangeSelection');
    }

    public getFillHandleDirection(): 'x' | 'y' | 'xy' {
        const direction = this.gridOptions.fillHandleDirection;

        if (!direction) { return 'xy'; }

        if (direction !== 'x' && direction !== 'y' && direction !== 'xy') {
            doOnce(() => console.warn(`AG Grid: valid values for fillHandleDirection are 'x', 'y' and 'xy'. Default to 'xy'.`), 'warn invalid fill direction');
            return 'xy';
        }

        return direction;
    }

    public getFillOperation() {
        return this.mergeGridCommonParams(this.gridOptions.fillOperation);
    }

    public getGroupAggFiltering(): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined {
        const userValue = this.gridOptions.groupAggFiltering;

        if (typeof userValue === 'function') {
            return this.mergeGridCommonParams(userValue);
        }

        if (isTrue(userValue)) {
            return () => true;
        }

        return undefined;
    }


    public getKeepDetailRowsCount(): number | undefined {
        const keepDetailRowsCount = this.gridOptions.keepDetailRowsCount;
        if (exists(keepDetailRowsCount) && keepDetailRowsCount > 0) {
            return this.gridOptions.keepDetailRowsCount;
        }

        return DEFAULT_KEEP_DETAIL_ROW_COUNT;
    }

    public getDefaultExportParams(type: 'csv'): CsvExportParams | undefined;
    public getDefaultExportParams(type: 'excel'): ExcelExportParams | undefined;
    public getDefaultExportParams(type: 'csv' | 'excel'): CsvExportParams | ExcelExportParams | undefined {
        if (this.gridOptions.defaultExportParams) {
            console.warn(`AG Grid: Since v25.2 \`defaultExportParams\`  has been replaced by \`default${capitalise(type)}ExportParams\`'`);
            if (type === 'csv') {
                return this.gridOptions.defaultExportParams as CsvExportParams;
            }
            return this.gridOptions.defaultExportParams as ExcelExportParams;
        }

        if (type === 'csv' && this.gridOptions.defaultCsvExportParams) {
            return this.gridOptions.defaultCsvExportParams;
        }

        if (type === 'excel' && this.gridOptions.defaultExcelExportParams) {
            return this.gridOptions.defaultExcelExportParams;
        }
    }

    public getIsServerSideGroupOpenByDefaultFunc() {
        return this.mergeGridCommonParams(this.gridOptions.isServerSideGroupOpenByDefault);
    }

    public getIsGroupOpenByDefaultFunc() {
        return this.mergeGridCommonParams(this.gridOptions.isGroupOpenByDefault);
    }

    public getGroupRowAggFunc() {

        const { getGroupRowAgg, groupRowAggNodes } = this.gridOptions;
        if (getGroupRowAgg) {
            return this.mergeGridCommonParams(getGroupRowAgg);
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        if (groupRowAggNodes) {
            return (params: WithoutGridCommon<GetGroupRowAggParams>) => groupRowAggNodes(params.nodes);
        }
    }

    public getContextMenuItemsFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getContextMenuItems);
    }

    public getMainMenuItemsFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getMainMenuItems);
    }

    public getRowIdFunc() {
        const { getRowId, getRowNodeId } = this.gridOptions;
        if (getRowId) {
            return this.mergeGridCommonParams(getRowId);
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        if (getRowNodeId) {
            return (params: WithoutGridCommon<GetRowIdParams>) => getRowNodeId(params.data);
        }
    }

    public getNavigateToNextHeaderFunc() {
        return this.mergeGridCommonParams(this.gridOptions.navigateToNextHeader);
    }

    public getTabToNextHeaderFunc() {
        return this.mergeGridCommonParams(this.gridOptions.tabToNextHeader);
    }

    public getNavigateToNextCellFunc() {
        return this.mergeGridCommonParams(this.gridOptions.navigateToNextCell);
    }

    public getTabToNextCellFunc() {
        return this.mergeGridCommonParams(this.gridOptions.tabToNextCell);
    }

    public getGridTabIndex(): string {
        return (this.gridOptions.tabIndex || 0).toString();
    }

    public reeData(): boolean {
        const usingTreeData = isTrue(this.gridOptions.treeData);

        if (usingTreeData) {
            return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Tree Data');
        }

        return false;
    }

    public getProcessPivotResultColDefFunc() {
        return this.gridOptions.processPivotResultColDef || this.gridOptions.processSecondaryColDef;
    }

    public getProcessPivotResultColGroupDefFunc() {
        return this.gridOptions.processPivotResultColGroupDef || this.gridOptions.processSecondaryColGroupDef;
    }

    public getSendToClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.sendToClipboard);
    }

    public getProcessRowPostCreateFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processRowPostCreate);
    }

    public getProcessCellForClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processCellForClipboard);
    }

    public getProcessHeaderForClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processHeaderForClipboard);
    }

    public getProcessGroupHeaderForClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processGroupHeaderForClipboard);
    }

    public getProcessCellFromClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processCellFromClipboard);
    }

    public getViewportRowModelPageSize(): number | undefined {
        return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE);
    }

    public getViewportRowModelBufferSize(): number {
        return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE);
    }

    public isServerSideSortAllLevels() {
        const isEnabled = isTrue(this.gridOptions.serverSideSortAllLevels);
        if (!this.isRowModelServerSide() && isEnabled) {
            doOnce(() => console.warn('AG Grid: The `serverSideSortAllLevels` property can only be used with the server side row model.'), 'serverSideSortAllLevels');
            return false;
        }
        return isEnabled;
    }

    public isServerSideFilterAllLevels() {
        const isEnabled = isTrue(this.gridOptions.serverSideFilterAllLevels);
        if (!this.isRowModelServerSide() && isEnabled) {
            doOnce(() => console.warn('AG Grid: The `serverSideFilterAllLevels` property can only be used with the server side row model.'), 'serverSideFilterAllLevels');
            return false;
        }
        return isEnabled;
    }

    public isServerSideSortOnServer() {
        const isEnabled = isTrue(this.gridOptions.serverSideSortOnServer);

        if (!this.isRowModelServerSide() && isEnabled) {
            doOnce(() => console.warn('AG Grid: The `serverSideSortOnServer` property can only be used with the server side row model.'), 'serverSideSortOnServerRowModel');
            return false;
        }

        if (this.gridOptionsService.is('treeData') && isEnabled) {
            doOnce(() => console.warn('AG Grid: The `serverSideSortOnServer` property cannot be used while using tree data.'), 'serverSideSortOnServerTreeData');
            return false;
        }

        return isEnabled;
    }

    public isServerSideFilterOnServer() {
        const isEnabled = isTrue(this.gridOptions.serverSideFilterOnServer);

        if (!this.isRowModelServerSide() && isEnabled) {
            doOnce(() => console.warn('AG Grid: The `serverSideFilterOnServer` property can only be used with the server side row model.'), 'serverSideFilterOnServerRowModel');
            return false;
        }

        if (this.gridOptionsService.is('treeData') && isEnabled) {
            doOnce(() => console.warn('AG Grid: The `serverSideFilterOnServer` property cannot be used while using tree data.'), 'serverSideFilterOnServerTreeData');
            return false;
        }

        return isEnabled;
    }
    public getPostSortFunc() {
        const { postSortRows, postSort } = this.gridOptions;
        if (postSortRows) {
            return this.mergeGridCommonParams(postSortRows);
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        if (postSort) {
            return (params: WithoutGridCommon<PostSortRowsParams>) => postSort(params.nodes);
        }
    }

    public getChartToolbarItemsFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getChartToolbarItems);
    }

    public getChartThemes(): string[] {
        // return default themes if user hasn't supplied any
        return this.gridOptions.chartThemes || ['ag-default', 'ag-material', 'ag-pastel', 'ag-vivid', 'ag-solar'];
    }


    public getClipboardDelimiter() {
        return exists(this.gridOptions.clipboardDelimiter) ? this.gridOptions.clipboardDelimiter : '\t';
    }

    public setProperty<K extends keyof GridOptions>(key: K, value: GridOptions[K], force = false): void {
        const previousValue = this.gridOptions[key];

        if (force || previousValue !== value) {
            this.gridOptions[key] = value;
            const event: PropertyChangedEvent = {
                type: key,
                currentValue: value,
                previousValue: previousValue
            };
            this.propertyEventService.dispatchEvent(event);
        }
    }

    public addEventListener(key: string, listener: Function): void {
        this.propertyEventService.addEventListener(key, listener);
    }

    public removeEventListener(key: string, listener: Function): void {
        this.propertyEventService.removeEventListener(key, listener);
    }

    public getAutoSizePadding(): number {
        const value = this.gridOptions.autoSizePadding;
        return value != null && value >= 0 ? value : 20;
    }

    // properties
    public getHeaderHeight(): number | null | undefined {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        }

        return this.getFromTheme(25, 'headerHeight');
    }

    public getFloatingFiltersHeight(): number | null | undefined {
        if (typeof this.gridOptions.floatingFiltersHeight === 'number') {
            return this.gridOptions.floatingFiltersHeight;
        }

        return this.getFromTheme(25, 'headerHeight');
    }

    public getGroupHeaderHeight(): number | null | undefined {
        if (typeof this.gridOptions.groupHeaderHeight === 'number') {
            return this.gridOptions.groupHeaderHeight;
        }

        return this.getHeaderHeight();
    }

    public getPivotHeaderHeight(): number | null | undefined {
        if (typeof this.gridOptions.pivotHeaderHeight === 'number') {
            return this.gridOptions.pivotHeaderHeight;
        }

        return this.getHeaderHeight();
    }

    public getPivotGroupHeaderHeight(): number | null | undefined {
        if (typeof this.gridOptions.pivotGroupHeaderHeight === 'number') {
            return this.gridOptions.pivotGroupHeaderHeight;
        }

        return this.getGroupHeaderHeight();
    }

    // Maybe should move to the FilterManager class?
    public isExternalFilterPresent() {
        if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
            return this.gridOptions.isExternalFilterPresent({ api: this.getApi()!, columnApi: this.getColumnApi()!, context: this.getContext() });
        }
        return false;
    }
    public doesExternalFilterPass(node: RowNode) {
        if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
            return this.gridOptions.doesExternalFilterPass(node);
        }
        return false;
    }

    public getTooltipDelay(type: 'show' | 'hide'): number | null {
        const { tooltipShowDelay, tooltipHideDelay } = this.gridOptions;
        const delay = type === 'show' ? tooltipShowDelay : tooltipHideDelay;
        const capitalisedType = capitalise(type);

        if (exists(delay)) {
            if (delay < 0) {
                doOnce(() => console.warn(`ag-grid: tooltip${capitalisedType}Delay should not be lower than 0`), `tooltip${capitalisedType}DelayWarn`);
            }

            return Math.max(200, delay);
        }

        return null;
    }

    public getDocument(): Document {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        let result: Document | null = null;
        if (this.gridOptions.getDocument && exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        } else if (this.eGridDiv) {
            result = this.eGridDiv.ownerDocument;
        }

        if (result && exists(result)) {
            return result;
        }

        return document;
    }

    public getMinColWidth(): number {
        const minColWidth = this.gridOptions.minColWidth;

        if (exists(minColWidth) && minColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
            return this.gridOptions.minColWidth!;
        }

        const measuredMin = this.getFromTheme(null, 'headerCellMinWidth');
        return exists(measuredMin) ? Math.max(measuredMin, GridOptionsWrapper.MIN_COL_WIDTH) : GridOptionsWrapper.MIN_COL_WIDTH;
    }

    public getMaxColWidth() {
        if (this.gridOptions.maxColWidth && this.gridOptions.maxColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
            return this.gridOptions.maxColWidth;
        }

        return null;
    }

    public getColWidth() {
        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper.MIN_COL_WIDTH) {
            return 200;
        }

        return this.gridOptions.colWidth;
    }

    public getRowBuffer(): number {
        let rowBuffer = this.gridOptions.rowBuffer;

        if (typeof rowBuffer === 'number') {
            if (rowBuffer < 0) {
                doOnce(() => console.warn(`AG Grid: rowBuffer should not be negative`), 'warn rowBuffer negative');
                this.gridOptions.rowBuffer = rowBuffer = 0;
            }
        } else {
            rowBuffer = Constants.ROW_BUFFER_SIZE;
        }

        return rowBuffer;
    }

    public getRowBufferInPixels() {
        const rowsToBuffer = this.getRowBuffer();
        const defaultRowHeight = this.getRowHeightAsNumber();

        return rowsToBuffer * defaultRowHeight;
    }

    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    public getScrollbarWidth() {
        if (this.scrollbarWidth == null) {
            const useGridOptions = typeof this.gridOptions.scrollbarWidth === 'number' && this.gridOptions.scrollbarWidth >= 0;
            const scrollbarWidth = useGridOptions ? this.gridOptions.scrollbarWidth : getScrollbarWidth();

            if (scrollbarWidth != null) {
                this.scrollbarWidth = scrollbarWidth;

                this.eventService.dispatchEvent({
                    type: Events.EVENT_SCROLLBAR_WIDTH_CHANGED
                });
            }
        }

        return this.scrollbarWidth;
    }

    private checkForDeprecated() {
        // casting to generic object, so typescript compiles even though
        // we are looking for attributes that don't exist
        const options: any = this.gridOptions;

        if (options.deprecatedEmbedFullWidthRows) {
            console.warn(`AG Grid: since v21.2, deprecatedEmbedFullWidthRows has been replaced with embedFullWidthRows.`);
        }

        if (options.rowDeselection) {
            console.warn(
                'AG Grid: since v24.x, rowDeselection is deprecated and the behaviour is true by default. Please use `suppressRowDeselection` to prevent rows from being deselected.'
            );
        }

        if (options.enableMultiRowDragging) {
            options.rowDragMultiRow = true;
            delete options.enableMultiRowDragging;
            console.warn(
                'AG Grid: since v26.1, `enableMultiRowDragging` is deprecated. Please use `rowDragMultiRow`.'
            );
        }

        const checkRenamedProperty = (oldProp: string, newProp: string, version: string) => {
            if (options[oldProp] != null) {
                console.warn(`AG Grid: since version ${version}, '${oldProp}' is deprecated / renamed, please use the new property name '${newProp}' instead.`);
                if (options[newProp] == null) {
                    options[newProp] = options[oldProp];
                }
            }
        };

        checkRenamedProperty('batchUpdateWaitMillis', 'asyncTransactionWaitMillis', '23.1.x');
        checkRenamedProperty('deltaRowDataMode', 'immutableData', '23.1.x');

        checkRenamedProperty('serverSideFilteringAlwaysResets', 'serverSideFilterAllLevels', '28.0.0');
        checkRenamedProperty('serverSideSortingAlwaysResets', 'serverSideSortAllLevels', '28.0.0');

        if (options.immutableColumns || options.deltaColumnMode) {
            console.warn(
                'AG Grid: since v24.0, immutableColumns and deltaColumnMode properties are gone. The grid now works like this as default. To keep column order maintained, set grid property applyColumnDefOrder=true'
            );
        }

        checkRenamedProperty('suppressSetColumnStateEvents', 'suppressColumnStateEvents', '24.0.x');

        if (options.groupRowInnerRenderer || options.groupRowInnerRendererParams || options.groupRowInnerRendererFramework) {
            console.warn('AG Grid: since v24.0, grid properties groupRowInnerRenderer, groupRowInnerRendererFramework and groupRowInnerRendererParams are no longer used.');
            console.warn('  Instead use the grid properties groupRowRendererParams.innerRenderer, groupRowRendererParams.innerRendererFramework and groupRowRendererParams.innerRendererParams.');
            console.warn('  For example instead of this:');
            console.warn('    groupRowInnerRenderer: "myRenderer"');
            console.warn('    groupRowInnerRendererParams: {x: a}');
            console.warn('  Replace with this:');
            console.warn('    groupRowRendererParams: {');
            console.warn('      innerRenderer: "myRenderer",');
            console.warn('      innerRendererParams: {x: a}');
            console.warn('    }');
            console.warn('  We have copied the properties over for you. However to stop this error message, please change your application code.');
            if (!options.groupRowRendererParams) {
                options.groupRowRendererParams = {};
            }
            const params = options.groupRowRendererParams;
            if (options.groupRowInnerRenderer) {
                params.innerRenderer = options.groupRowInnerRenderer;
            }
            if (options.groupRowInnerRendererParams) {
                params.innerRendererParams = options.groupRowInnerRendererParams;
            }
            if (options.groupRowInnerRendererFramework) {
                params.innerRendererFramework = options.groupRowInnerRendererFramework;
            }
        }

        if (options.rememberGroupStateWhenNewData) {
            console.warn('AG Grid: since v24.0, grid property rememberGroupStateWhenNewData is deprecated. This feature was provided before Transaction Updates worked (which keep group state). Now that transaction updates are possible and they keep group state, this feature is no longer needed.');
        }

        if (options.detailCellRendererParams && options.detailCellRendererParams.autoHeight) {
            console.warn('AG Grid: since v24.1, grid property detailCellRendererParams.autoHeight is replaced with grid property detailRowAutoHeight. This allows this feature to work when you provide a custom DetailCellRenderer');
            options.detailRowAutoHeight = true;
        }

        if (options.suppressKeyboardEvent) {
            console.warn(
                `AG Grid: since v24.1 suppressKeyboardEvent in the gridOptions has been deprecated and will be removed in
                 future versions of AG Grid. If you need this to be set for every column use the defaultColDef property.`
            );
        }

        if (options.suppressEnterpriseResetOnNewColumns) {
            console.warn('AG Grid: since v25, grid property suppressEnterpriseResetOnNewColumns is deprecated. This was a temporary property to allow changing columns in Server Side Row Model without triggering a reload. Now that it is possible to dynamically change columns in the grid, this is no longer needed.');
        }

        if (options.suppressColumnStateEvents) {
            console.warn('AG Grid: since v25, grid property suppressColumnStateEvents no longer works due to a refactor that we did. It should be possible to achieve similar using event.source, which would be "api" if the event was due to setting column state via the API');
        }

        if (options.defaultExportParams) {
            console.warn('AG Grid: since v25.2, the grid property `defaultExportParams` has been replaced by `defaultCsvExportParams` and `defaultExcelExportParams`.');
        }

        if (options.stopEditingWhenGridLosesFocus) {
            console.warn('AG Grid: since v25.2.2, the grid property `stopEditingWhenGridLosesFocus` has been replaced by `stopEditingWhenCellsLoseFocus`.');
            options.stopEditingWhenCellsLoseFocus = true;
        }

        if (options.applyColumnDefOrder) {
            console.warn('AG Grid: since v26.0, the grid property `applyColumnDefOrder` is no longer needed, as this is the default behaviour. To turn this behaviour off, set maintainColumnOrder=true');
        }

        if (options.groupMultiAutoColumn) {
            console.warn("AG Grid: since v26.0, the grid property `groupMultiAutoColumn` has been replaced by `groupDisplayType = 'multipleColumns'`");
            options.groupDisplayType = 'multipleColumns';
        }

        if (options.groupUseEntireRow) {
            console.warn("AG Grid: since v26.0, the grid property `groupUseEntireRow` has been replaced by `groupDisplayType = 'groupRows'`");
            options.groupDisplayType = 'groupRows';
        }

        if (options.groupSuppressAutoColumn) {
            const propName = options.treeData ? 'treeDataDisplayType' : 'groupDisplayType';
            console.warn(`AG Grid: since v26.0, the grid property \`groupSuppressAutoColumn\` has been replaced by \`${propName} = 'custom'\``);
            options.groupDisplayType = 'custom';
        }

        if (options.defaultGroupOrderComparator) {
            console.warn("AG Grid: since v27.2, the grid property `defaultGroupOrderComparator` is deprecated and has been replaced by `initialGroupOrderComparator` and now receives a single params object.");
        }
        if (options.defaultGroupSortComparator) {
            console.warn("AG Grid: since v26.0, the grid property `defaultGroupSortComparator` has been replaced by `initialGroupOrderComparator`");
            options.defaultGroupOrderComparator = options.defaultGroupSortComparator;
        }

        if (options.groupRowAggNodes) {
            console.warn("AG Grid: since v27.2, the grid property `groupRowAggNodes` is deprecated and has been replaced by `getGroupRowAgg` and now receives a single params object.");
        }
        if (options.postSort) {
            console.warn("AG Grid: since v27.2, the grid property `postSort` is deprecated and has been replaced by `postSortRows` and now receives a single params object.");
        }
        if (options.isFullWidthCell) {
            console.warn("AG Grid: since v27.2, the grid property `isFullWidthCell` is deprecated and has been replaced by `isFullWidthRow` and now receives a single params object.");
        }
        if (options.localeTextFunc) {
            console.warn("AG Grid: since v27.2, the grid property `localeTextFunc` is deprecated and has been replaced by `getLocaleText` and now receives a single params object.");
        }

        if (options.colWidth) {
            console.warn('AG Grid: since v26.1, the grid property `colWidth` is deprecated and should be set via `defaultColDef.width`.');
        }
        if (options.minColWidth) {
            console.warn('AG Grid: since v26.1, the grid property `minColWidth` is deprecated and should be set via `defaultColDef.minWidth`.');
        }
        if (options.maxColWidth) {
            console.warn('AG Grid: since v26.1, the grid property `maxColWidth` is deprecated and should be set via `defaultColDef.maxWidth`.');
        }
        if (options.reactUi) {
            console.warn('AG Grid: since v27.0, React UI is on by default, so no need for reactUi=true. To turn it off, set suppressReactUi=true.');
        }
        if (options.suppressReactUi) {
            console.warn('AG Grid: The legacy React rendering engine is deprecated and will be removed in the next major version of the grid.');
        }
        if (options.suppressCellSelection) {
            console.warn('AG Grid: since v27.0, `suppressCellSelection` has been replaced by `suppressCellFocus`.');
            options.suppressCellFocus = options.suppressCellSelection;
        }

        if (options.getRowNodeId) {
            console.warn('AG Grid: since v27.1, `getRowNodeId` is deprecated and has been replaced by `getRowId`. The difference: if getRowId() is implemented then immutable data is enabled by default.');
        }
        if (options.immutableData) {
            if (options.getRowId) {
                console.warn('AG Grid: since v27.1, `immutableData` is deprecated. With the `getRowId` callback implemented, immutable data is enabled by default so you can remove `immutableData=true`.');
            } else {
                console.warn('AG Grid: since v27.1, `immutableData` is deprecated. To enable immutable data you must implement the `getRowId()` callback.');
            }
        }
        if (options.clipboardDeliminator) {
            console.warn('AG Grid: since v27.1, `clipboardDeliminator` has been replaced by `clipboardDelimiter`.');
            options.clipboardDelimiter = options.clipboardDeliminator;
        }

        checkRenamedProperty('processSecondaryColDef', 'processPivotResultColDef', '28.0.x');
        checkRenamedProperty('processSecondaryColGroupDef', 'processPivotResultColGroupDef', '28.0.x');

        if (options.serverSideStoreType) {
            console.warn('AG Grid: since v28.0, `serverSideStoreType` has been replaced by `serverSideInfiniteScroll`. Set to true to use Partial Store, and false to use Full Store.');
            options.serverSideInfiniteScroll = options.serverSideStoreType === 'partial';
        }

        checkRenamedProperty('getServerSideStoreParams', 'getServerSideGroupLevelParams', '28.0.x');
    }

    private checkForViolations() {
        if (this.gridOptionsService.is('treeData')) { this.treeDataViolations(); }
    }

    private treeDataViolations() {
        if (this.isRowModelDefault()) {
            if (missing(this.gridOptionsService.get('getDataPath'))) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=clientSide, but you did not ' +
                    'provide getDataPath function, please provide getDataPath function if using tree data.'
                );
            }
        }
        if (this.isRowModelServerSide()) {
            if (missing(this.gridOptionsService.get('isServerSideGroup'))) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide isServerSideGroup function, please provide isServerSideGroup function if using tree data.'
                );
            }
            if (missing(this.gridOptionsService.get('getServerSideGroupKey'))) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide getServerSideGroupKey function, please provide getServerSideGroupKey function if using tree data.'
                );
            }
        }
    }

    public getLocaleTextFunc(): (key: string, defaultValue: string, variableValues?: string[]) => string {
        const { localeText, getLocaleText, localeTextFunc } = this.gridOptions;

        if (getLocaleText) {
            //key: string, defaultValue: string, variableValues?: string[]
            return (key: string, defaultValue: string, variableValues?: string[]) => {
                const params: GetLocaleTextParams = {
                    key,
                    defaultValue,
                    variableValues,
                    api: this.getApi()!,
                    columnApi: this.getColumnApi()!,
                    context: this.getContext()
                };
                return getLocaleText(params);
            };
        }

        if (localeTextFunc) {
            return localeTextFunc;
        }

        return (key: string, defaultValue: string, variableValues?: string[]) => {
            let localisedText = localeText && localeText[key];

            if (localisedText && variableValues && variableValues.length) {
                let found = 0;
                while (true) {
                    if (found >= variableValues.length) { break; }
                    const idx = localisedText.indexOf('${variable}');
                    if (idx === -1) { break; }

                    localisedText = localisedText.replace('${variable}', variableValues[found++]);
                }
            }

            return localisedText ?? defaultValue;
        };
    }

    // responsible for calling the onXXX functions on gridOptions
    public globalEventHandler(eventName: string, event?: any): void {
        // prevent events from being fired _after_ the grid has been destroyed
        if (this.destroyed) {
            return;
        }

        const callbackMethodName = ComponentUtil.getCallbackForEvent(eventName);
        if (typeof (this.gridOptions as any)[callbackMethodName] === 'function') {
            (this.gridOptions as any)[callbackMethodName](event);
        }
    }

    private setRowHeightVariable(height: number): void {
        const oldRowHeight = this.eGridDiv.style.getPropertyValue('--ag-line-height').trim();
        const newRowHeight = `${height}px`;

        if (oldRowHeight != newRowHeight) {
            this.eGridDiv.style.setProperty('--ag-line-height', newRowHeight);
        }
    }

    // we don't allow dynamic row height for virtual paging
    public getRowHeightAsNumber(): number {
        if (!this.gridOptions.rowHeight || missing(this.gridOptions.rowHeight)) {
            return this.getDefaultRowHeight();
        }

        const rowHeight = this.gridOptions.rowHeight;

        if (rowHeight && this.isNumeric(rowHeight)) {
            this.setRowHeightVariable(rowHeight);
            return rowHeight;
        }

        console.warn('AG Grid row height must be a number if not using standard row model');
        return this.getDefaultRowHeight();
    }

    public isGetRowHeightFunction(): boolean {
        return typeof this.gridOptions.getRowHeight === 'function';
    }

    public getRowHeightForNode(rowNode: RowNode, allowEstimate = false, defaultRowHeight?: number): { height: number; estimated: boolean; } {
        if (defaultRowHeight == null) {
            defaultRowHeight = this.getDefaultRowHeight();
        }

        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.

        if (this.isGetRowHeightFunction()) {
            if (allowEstimate) {
                return { height: defaultRowHeight, estimated: true };
            }

            const params: WithoutGridCommon<RowHeightParams> = {
                node: rowNode,
                data: rowNode.data
            };

            const height = this.mergeGridCommonParams(this.gridOptions.getRowHeight)!(params);

            if (this.isNumeric(height)) {
                if (height === 0) {
                    doOnce(() => console.warn('AG Grid: The return of `getRowHeight` cannot be zero. If the intention is to hide rows, use a filter instead.'), 'invalidRowHeight');
                }
                return { height: Math.max(1, height), estimated: false };
            }
        }

        if (rowNode.detail && this.gridOptionsService.is('masterDetail')) {
            // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
            // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
            // (due to auto height) which looks bad, especially if doing row animation.
            if (this.gridOptionsService.is('detailRowAutoHeight')) {
                return { height: 1, estimated: false };
            }

            if (this.isNumeric(this.gridOptions.detailRowHeight)) {
                return { height: this.gridOptions.detailRowHeight, estimated: false };
            }

            return { height: DEFAULT_DETAIL_ROW_HEIGHT, estimated: false };
        }

        const rowHeight = this.gridOptions.rowHeight && this.isNumeric(this.gridOptions.rowHeight) ? this.gridOptions.rowHeight : defaultRowHeight;

        return { height: rowHeight, estimated: false };
    }

    public isDynamicRowHeight(): boolean {
        return typeof this.gridOptions.getRowHeight === 'function';
    }

    public getListItemHeight() {
        return this.getFromTheme(20, 'listItemHeight');

    }

    public chartMenuPanelWidth() {
        return this.environment.chartMenuPanelWidth();
    }

    private isNumeric(value: any): value is number {
        return !isNaN(value) && typeof value === 'number' && isFinite(value);
    }

    // Material data table has strict guidelines about whitespace, and these values are different than the ones
    // ag-grid uses by default. We override the default ones for the sake of making it better out of the box
    private getFromTheme(defaultValue: number, sassVariableName: SASS_PROPERTIES): number;
    private getFromTheme(defaultValue: null, sassVariableName: SASS_PROPERTIES): number | null | undefined;
    private getFromTheme(defaultValue: any, sassVariableName: SASS_PROPERTIES): any {
        const { theme } = this.environment.getTheme();
        if (theme && theme.indexOf('ag-theme') === 0) {
            return this.environment.getSassVariable(theme, sassVariableName);
        }
        return defaultValue;
    }

    public getDefaultRowHeight(): number {
        return this.getFromTheme(DEFAULT_ROW_HEIGHT, 'rowHeight');
    }

    private matchesGroupDisplayType(toMatch: RowGroupingDisplayType, supplied?: string): boolean {
        const groupDisplayTypeValues: RowGroupingDisplayType[] = ['groupRows', 'multipleColumns', 'custom', 'singleColumn'];
        if ((groupDisplayTypeValues as (string | undefined)[]).indexOf(supplied) < 0) {
            console.warn(`AG Grid: '${supplied}' is not a valid groupDisplayType value - possible values are: '${groupDisplayTypeValues.join("', '")}'`);
            return false;
        }
        return supplied === toMatch;
    }

    private matchesTreeDataDisplayType(toMatch: TreeDataDisplayType, supplied?: string): boolean {
        const treeDataDisplayTypeValues: TreeDataDisplayType[] = ['auto', 'custom'];
        if ((treeDataDisplayTypeValues as (string | undefined)[]).indexOf(supplied) < 0) {
            console.warn(`AG Grid: '${supplied}' is not a valid treeDataDisplayType value - possible values are: '${treeDataDisplayTypeValues.join("', '")}'`);
            return false;
        }
        return supplied === toMatch;
    }
}
