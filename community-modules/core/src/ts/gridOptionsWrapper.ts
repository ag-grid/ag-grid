import { ColumnApi } from './columns/columnApi';
import { ColDefUtil } from './components/colDefUtil';
import { ComponentUtil } from './components/componentUtil';
import { Constants } from './constants/constants';
import { Autowired, Bean, PostConstruct, PreDestroy, Qualifier } from './context/context';
import { ColDef, ColGroupDef, IAggFunc, SuppressKeyboardEventParams } from './entities/colDef';
import { GridOptions, RowGroupingDisplayType, TreeDataDisplayType } from './entities/gridOptions';
import { GetGroupAggFilteringParams, GetGroupRowAggParams, GetLocaleTextParams, GetRowIdParams, InitialGroupOrderComparatorParams, IsFullWidthRowParams, PostSortRowsParams, RowHeightParams } from './entities/iCallbackParams';
import { RowNode } from './entities/rowNode';
import { SideBarDef, SideBarDefParser } from './entities/sideBar';
import { Environment, SASS_PROPERTIES } from './environment';
import { Events } from './eventKeys';
import { AgEvent } from './events';
import { EventService } from './eventService';
import { GridApi } from './gridApi';
import { CsvExportParams } from './interfaces/exportParams';
import { AgChartTheme, AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { AgGridCommon, WithoutGridCommon } from './interfaces/iCommon';
import { IDatasource } from './interfaces/iDatasource';
import { ExcelExportParams } from './interfaces/iExcelCreator';
import { IServerSideDatasource } from './interfaces/iServerSideDatasource';
import { IViewportDatasource } from './interfaces/iViewportDatasource';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { PropertyKeys } from './propertyKeys';
import { _ } from './utils';
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

function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

function toNumber(value: any): number | undefined {
    if (typeof value == 'number') {
        return value;
    }

    if (typeof value == 'string') {
        return parseInt(value, 10);
    }
}

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

export interface PropertyChangedEvent extends AgEvent {
    currentValue: any;
    previousValue: any;
}

@Bean('gridOptionsWrapper')
export class GridOptionsWrapper {
    private static MIN_COL_WIDTH = 10;

    public static PROP_HEADER_HEIGHT = 'headerHeight';
    public static PROP_GROUP_REMOVE_SINGLE_CHILDREN = 'groupRemoveSingleChildren';
    public static PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN = 'groupRemoveLowestSingleChildren';
    public static PROP_PIVOT_HEADER_HEIGHT = 'pivotHeaderHeight';
    public static PROP_SUPPRESS_CLIPBOARD_PASTE = 'suppressClipboardPaste';

    public static PROP_GROUP_HEADER_HEIGHT = 'groupHeaderHeight';
    public static PROP_PIVOT_GROUP_HEADER_HEIGHT = 'pivotGroupHeaderHeight';

    public static PROP_NAVIGATE_TO_NEXT_CELL = 'navigateToNextCell';
    public static PROP_TAB_TO_NEXT_CELL = 'tabToNextCell';
    public static PROP_NAVIGATE_TO_NEXT_HEADER = 'navigateToNextHeader';
    public static PROP_TAB_TO_NEXT_HEADER = 'tabToNextHeader';

    public static PROP_IS_EXTERNAL_FILTER_PRESENT = 'isExternalFilterPresent';
    public static PROP_DOES_EXTERNAL_FILTER_PASS = 'doesExternalFilterPass';

    public static PROP_FLOATING_FILTERS_HEIGHT = 'floatingFiltersHeight';

    public static PROP_SUPPRESS_ROW_CLICK_SELECTION = 'suppressRowClickSelection';
    public static PROP_SUPPRESS_ROW_DRAG = 'suppressRowDrag';
    public static PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG = 'suppressMoveWhenRowDragging';

    public static PROP_GET_ROW_CLASS = 'getRowClass';
    public static PROP_GET_ROW_STYLE = 'getRowStyle';

    public static PROP_GET_ROW_HEIGHT = 'getRowHeight';

    public static PROP_POPUP_PARENT = 'popupParent';

    public static PROP_DOM_LAYOUT = 'domLayout';
    public static PROP_ROW_CLASS = 'rowClass';

    public static PROP_FILL_HANDLE_DIRECTION = 'fillHandleDirection';

    public static PROP_GROUP_ROW_AGG_NODES = 'groupRowAggNodes';
    public static PROP_GET_GROUP_ROW_AGG = 'getGroupRowAgg';
    public static PROP_GET_BUSINESS_KEY_FOR_NODE = 'getBusinessKeyForNode';
    public static PROP_GET_CHILD_COUNT = 'getChildCount';
    public static PROP_PROCESS_ROW_POST_CREATE = 'processRowPostCreate';
    public static PROP_GET_ROW_NODE_ID = 'getRowNodeId';
    public static PROP_GET_ROW_ID = 'getRowId';
    public static PROP_IS_FULL_WIDTH_CELL = 'isFullWidthCell';
    public static PROP_IS_FULL_WIDTH_ROW = 'isFullWidthRow';
    public static PROP_IS_ROW_SELECTABLE = 'isRowSelectable';
    public static PROP_IS_ROW_MASTER = 'isRowMaster';
    public static PROP_POST_SORT = 'postSort';
    public static PROP_POST_SORT_ROWS = 'postSortRows';
    public static PROP_GET_DOCUMENT = 'getDocument';
    public static PROP_POST_PROCESS_POPUP = 'postProcessPopup';
    public static PROP_DEFAULT_GROUP_ORDER_COMPARATOR = 'defaultGroupOrderComparator';
    public static PROP_INITIAL_GROUP_ORDER_COMPARATOR = 'initialGroupOrderComparator';
    public static PROP_PAGINATION_NUMBER_FORMATTER = 'paginationNumberFormatter';

    public static PROP_GET_CONTEXT_MENU_ITEMS = 'getContextMenuItems';
    public static PROP_GET_MAIN_MENU_ITEMS = 'getMainMenuItems';

    public static PROP_PROCESS_CELL_FOR_CLIPBOARD = 'processCellForClipboard';
    public static PROP_PROCESS_CELL_FROM_CLIPBOARD = 'processCellFromClipboard';
    public static PROP_SEND_TO_CLIPBOARD = 'sendToClipboard';

    public static PROP_PROCESS_PIVOT_RESULT_COL_DEF = 'processPivotResultColDef';
    public static PROP_PROCESS_PIVOT_RESULT_COL_GROUP_DEF = 'processPivotResultColGroupDef';

    public static PROP_GET_CHART_TOOLBAR_ITEMS = 'getChartToolbarItems';

    public static PROP_GET_SERVER_SIDE_GROUP_PARAMS = 'getServerSideGroupLevelParams';
    public static PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT = 'isServerSideGroupOpenByDefault';
    public static PROP_IS_APPLY_SERVER_SIDE_TRANSACTION = 'isApplyServerSideTransaction';
    public static PROP_IS_SERVER_SIDE_GROUP = 'isServerSideGroup';
    public static PROP_GET_SERVER_SIDE_GROUP_KEY = 'getServerSideGroupKey';

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
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

        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn("AG Grid: 'groupSelectsChildren' does not work with 'suppressParentsInRowNodes', this selection method needs the part in rowNode to work");
        }

        if (this.isGroupSelectsChildren()) {
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

        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
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

        if (this.isEnableRangeSelection()) {
            ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'enableRangeSelection');
        }

        if (!this.isEnableRangeSelection() && (this.isEnableRangeHandle() || this.isEnableFillHandle())) {
            console.warn("AG Grid: 'enableRangeHandle' and 'enableFillHandle' will not work unless 'enableRangeSelection' is set to true");
        }

        if (this.isGroupRowsSticky() && this.isGroupHideOpenParents()) {
            console.warn(
                "AG Grid: groupRowsSticky and groupHideOpenParents do not work with each other, you need to pick one."
            );
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
    private mergeGridCommonParams<P extends AgGridCommon, T>(callback: ((params: P) => T) | undefined):
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

    public isSuppressRowDeselection() {
        return isTrue(this.gridOptions.suppressRowDeselection);
    }

    public isRowSelectionMulti() {
        return this.gridOptions.rowSelection === 'multiple';
    }

    public isRowMultiSelectWithClick() {
        return isTrue(this.gridOptions.rowMultiSelectWithClick);
    }

    public getContext() {
        return this.gridOptions.context;
    }

    public isPivotMode() {
        return isTrue(this.gridOptions.pivotMode);
    }

    public isSuppressExpandablePivotGroups() {
        return isTrue(this.gridOptions.suppressExpandablePivotGroups);
    }

    public getPivotColumnGroupTotals() {
        return this.gridOptions.pivotColumnGroupTotals;
    }

    public getPivotRowTotals() {
        return this.gridOptions.pivotRowTotals;
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

    public isSuppressFocusAfterRefresh() {
        return isTrue(this.gridOptions.suppressFocusAfterRefresh);
    }

    public isSuppressBrowserResizeObserver() {
        return isTrue(this.gridOptions.suppressBrowserResizeObserver);
    }

    public isSuppressMaintainUnsortedOrder() {
        return isTrue(this.gridOptions.suppressMaintainUnsortedOrder);
    }

    public isSuppressClearOnFillReduction() {
        return isTrue(this.gridOptions.suppressClearOnFillReduction);
    }

    public isShowToolPanel() {
        return isTrue(this.gridOptions.sideBar && Array.isArray(this.getSideBar().toolPanels));
    }

    public getSideBar(): SideBarDef {
        return this.gridOptions.sideBar as SideBarDef;
    }

    public isSuppressTouch() {
        return isTrue(this.gridOptions.suppressTouch);
    }

    public isMaintainColumnOrder() {
        return isTrue(this.gridOptions.maintainColumnOrder);
    }

    public isSuppressRowTransform() {
        return isTrue(this.gridOptions.suppressRowTransform);
    }

    public isSuppressColumnStateEvents() {
        return isTrue(this.gridOptions.suppressColumnStateEvents);
    }

    public isAllowDragFromColumnsToolPanel() {
        return isTrue(this.gridOptions.allowDragFromColumnsToolPanel);
    }

    public useAsyncEvents() {
        return !isTrue(this.gridOptions.suppressAsyncEvents);
    }

    public isEnableCellChangeFlash() {
        return isTrue(this.gridOptions.enableCellChangeFlash);
    }

    public getCellFlashDelay(): number {
        return this.gridOptions.cellFlashDelay || 500;
    }

    public getCellFadeDelay(): number {
        return this.gridOptions.cellFadeDelay || 1000;
    }

    public isGroupSelectsChildren() {
        return isTrue(this.gridOptions.groupSelectsChildren);
    }

    public isSuppressRowHoverHighlight() {
        return isTrue(this.gridOptions.suppressRowHoverHighlight);
    }

    public isColumnHoverHighlight() {
        return isTrue(this.gridOptions.columnHoverHighlight);
    }

    public isGroupSelectsFiltered() {
        return isTrue(this.gridOptions.groupSelectsFiltered);
    }

    public isGroupHideOpenParents() {
        return isTrue(this.gridOptions.groupHideOpenParents);
    }

    public isGroupMaintainOrder() {
        return isTrue(this.gridOptions.groupMaintainOrder);
    }

    public getAutoGroupColumnDef(): ColDef | undefined {
        return this.gridOptions.autoGroupColumnDef;
    }

    public isGroupMultiAutoColumn() {
        if (this.gridOptions.groupDisplayType) {
            return this.matchesGroupDisplayType('multipleColumns', this.gridOptions.groupDisplayType);
        }
        // if we are doing hideOpenParents we also show multiple columns, otherwise hideOpenParents would not work
        return isTrue(this.gridOptions.groupHideOpenParents);
    }

    public isGroupUseEntireRow(pivotMode: boolean): boolean {
        // we never allow groupUseEntireRow if in pivot mode, otherwise we won't see the pivot values.
        if (pivotMode) { return false; }

        return this.gridOptions.groupDisplayType ?
            this.matchesGroupDisplayType('groupRows', this.gridOptions.groupDisplayType) : false;
    }

    public isGroupRowsSticky(): boolean {
        return isTrue(this.gridOptions.groupRowsSticky);
    }

    public isGroupSuppressAutoColumn() {
        const isCustomRowGroups = this.gridOptions.groupDisplayType ?
            this.matchesGroupDisplayType('custom', this.gridOptions.groupDisplayType) : false;

        if (isCustomRowGroups) { return true; }

        return this.gridOptions.treeDataDisplayType ?
            this.matchesTreeDataDisplayType('custom', this.gridOptions.treeDataDisplayType) : false;
    }

    public isGroupRemoveSingleChildren() {
        return isTrue(this.gridOptions.groupRemoveSingleChildren);
    }

    public isGroupRemoveLowestSingleChildren() {
        return isTrue(this.gridOptions.groupRemoveLowestSingleChildren);
    }

    public isGroupIncludeFooter() {
        return isTrue(this.gridOptions.groupIncludeFooter);
    }

    public isGroupIncludeTotalFooter() {
        return isTrue(this.gridOptions.groupIncludeTotalFooter);
    }

    public isGroupSuppressBlankHeader() {
        return isTrue(this.gridOptions.groupSuppressBlankHeader);
    }

    public isSuppressRowClickSelection() {
        return isTrue(this.gridOptions.suppressRowClickSelection);
    }

    public isSuppressCellFocus() {
        return isTrue(this.gridOptions.suppressCellFocus);
    }

    public isSuppressMultiSort() {
        return isTrue(this.gridOptions.suppressMultiSort);
    }

    public isAlwaysMultiSort() {
        return isTrue(this.gridOptions.alwaysMultiSort);
    }

    public isMultiSortKeyCtrl() {
        return this.gridOptions.multiSortKey === 'ctrl';
    }

    public isPivotSuppressAutoColumn() {
        return isTrue(this.gridOptions.pivotSuppressAutoColumn);
    }

    public isSuppressDragLeaveHidesColumns() {
        return isTrue(this.gridOptions.suppressDragLeaveHidesColumns);
    }

    public isSuppressRowGroupHidesColumns() {
        return isTrue(this.gridOptions.suppressRowGroupHidesColumns);
    }

    public isSuppressScrollOnNewData() {
        return isTrue(this.gridOptions.suppressScrollOnNewData);
    }

    public isSuppressScrollWhenPopupsAreOpen() {
        return isTrue(this.gridOptions.suppressScrollWhenPopupsAreOpen);
    }

    public isRowDragEntireRow() {
        return isTrue(this.gridOptions.rowDragEntireRow);
    }

    public isSuppressRowDrag() {
        return isTrue(this.gridOptions.suppressRowDrag);
    }

    public isRowDragManaged() {
        return isTrue(this.gridOptions.rowDragManaged);
    }

    public isSuppressMoveWhenRowDragging() {
        return isTrue(this.gridOptions.suppressMoveWhenRowDragging);
    }

    public isRowDragMultiRow() {
        return isTrue(this.gridOptions.rowDragMultiRow);
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

    public isSuppressHorizontalScroll() {
        return isTrue(this.gridOptions.suppressHorizontalScroll);
    }

    public isSuppressMaxRenderedRowRestriction() {
        return isTrue(this.gridOptions.suppressMaxRenderedRowRestriction);
    }

    public isExcludeChildrenWhenTreeDataFiltering() {
        return isTrue(this.gridOptions.excludeChildrenWhenTreeDataFiltering);
    }

    public isAlwaysShowHorizontalScroll() {
        return isTrue(this.gridOptions.alwaysShowHorizontalScroll);
    }

    public isAlwaysShowVerticalScroll() {
        return isTrue(this.gridOptions.alwaysShowVerticalScroll);
    }

    public isDebounceVerticalScrollbar() {
        return isTrue(this.gridOptions.debounceVerticalScrollbar);
    }

    public isSuppressLoadingOverlay() {
        return isTrue(this.gridOptions.suppressLoadingOverlay);
    }

    public isSuppressNoRowsOverlay() {
        return isTrue(this.gridOptions.suppressNoRowsOverlay);
    }

    public isSuppressFieldDotNotation() {
        return isTrue(this.gridOptions.suppressFieldDotNotation);
    }

    public getPinnedTopRowData(): any[] | undefined {
        return this.gridOptions.pinnedTopRowData;
    }

    public getPinnedBottomRowData(): any[] | undefined {
        return this.gridOptions.pinnedBottomRowData;
    }

    public isFunctionsPassive() {
        return isTrue(this.gridOptions.functionsPassive);
    }

    public isSuppressChangeDetection() {
        return isTrue(this.gridOptions.suppressChangeDetection);
    }

    public isSuppressAnimationFrame() {
        return isTrue(this.gridOptions.suppressAnimationFrame);
    }

    public getQuickFilterText(): string | undefined {
        return this.gridOptions.quickFilterText;
    }

    public isCacheQuickFilter() {
        return isTrue(this.gridOptions.cacheQuickFilter);
    }

    public isUnSortIcon() {
        return isTrue(this.gridOptions.unSortIcon);
    }

    public isSuppressMenuHide() {
        return isTrue(this.gridOptions.suppressMenuHide);
    }

    public isEnterMovesDownAfterEdit() {
        return isTrue(this.gridOptions.enterMovesDownAfterEdit);
    }

    public isEnterMovesDown() {
        return isTrue(this.gridOptions.enterMovesDown);
    }

    public isUndoRedoCellEditing() {
        return isTrue(this.gridOptions.undoRedoCellEditing);
    }

    public getUndoRedoCellEditingLimit(): number | undefined {
        return toNumber(this.gridOptions.undoRedoCellEditingLimit);
    }

    public getRowStyle() {
        return this.gridOptions.rowStyle;
    }

    public getRowClass() {
        return this.gridOptions.rowClass;
    }

    public getRowStyleFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getRowStyle);
    }

    public getRowClassFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getRowClass);
    }

    public rowClassRules() {
        return this.gridOptions.rowClassRules;
    }

    public isServerSideInfiniteScroll(): boolean {
        return isTrue(this.gridOptions.serverSideInfiniteScroll);
    }

    public getServerSideGroupLevelParamsFunc() {
        return this.mergeGridCommonParams(this.gridOptions.getServerSideGroupLevelParams);
    }

    public getCreateChartContainerFunc() {
        return this.mergeGridCommonParams(this.gridOptions.createChartContainer);
    }

    public getPopupParent() {
        return this.gridOptions.popupParent;
    }

    public getBlockLoadDebounceMillis() {
        return this.gridOptions.blockLoadDebounceMillis;
    }

    public getPostProcessPopupFunc() {
        return this.mergeGridCommonParams(this.gridOptions.postProcessPopup);
    }

    public getPaginationNumberFormatterFunc() {
        return this.mergeGridCommonParams(this.gridOptions.paginationNumberFormatter);
    }

    public getChildCountFunc() {
        return this.gridOptions.getChildCount;
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

    public getFullWidthCellRendererParams() {
        return this.gridOptions.fullWidthCellRendererParams;
    }

    public isEmbedFullWidthRows() {
        return isTrue(this.gridOptions.embedFullWidthRows) || isTrue(this.gridOptions.deprecatedEmbedFullWidthRows);
    }

    public isDetailRowAutoHeight() {
        return isTrue(this.gridOptions.detailRowAutoHeight);
    }

    public getSuppressKeyboardEventFunc(): ((params: SuppressKeyboardEventParams) => boolean) | undefined {
        return this.gridOptions.suppressKeyboardEvent;
    }

    public getBusinessKeyForNodeFunc() {
        return this.gridOptions.getBusinessKeyForNode;
    }

    public getApi(): GridApi | undefined | null {
        return this.gridOptions.api;
    }

    public getColumnApi(): ColumnApi | undefined | null {
        return this.gridOptions.columnApi;
    }

    public isReadOnlyEdit(): boolean {
        return isTrue(this.gridOptions.readOnlyEdit);
    }

    public isImmutableData() {
        // we used to have a property immutableData for this. however this was deprecated
        // in favour of having Immutable Data on by default when getRowId is provided
        const getRowIdProvided = this.gridOptions.getRowId != null;
        const immutableData = isTrue(this.gridOptions.immutableData);
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row ID's but NOT Immutable Data.
        const resetRowDataOnUpdate = isTrue(this.gridOptions.resetRowDataOnUpdate);

        if (resetRowDataOnUpdate) { return false; }
        return getRowIdProvided || immutableData;
    }

    public isEnsureDomOrder() {
        return isTrue(this.gridOptions.ensureDomOrder);
    }

    public isEnableCharts() {
        if (isTrue(this.gridOptions.enableCharts)) {
            return ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'enableCharts');
        }
        return false;
    }

    public getColResizeDefault() {
        return this.gridOptions.colResizeDefault;
    }

    public isSingleClickEdit() {
        return isTrue(this.gridOptions.singleClickEdit);
    }

    public isSuppressClickEdit() {
        return isTrue(this.gridOptions.suppressClickEdit);
    }

    public isStopEditingWhenCellsLoseFocus() {
        return isTrue(this.gridOptions.stopEditingWhenCellsLoseFocus);
    }

    public getGroupDefaultExpanded(): number | undefined {
        return this.gridOptions.groupDefaultExpanded;
    }

    public getMaxConcurrentDatasourceRequests(): number | undefined {
        const res = toNumber(this.gridOptions.maxConcurrentDatasourceRequests);
        if (res == null) { return 2; } // 2 is the default
        if (res <= 0) { return; } // negative number, eg -1, means no max restriction
        return res;
    }

    public getMaxBlocksInCache(): number | undefined {
        return this.gridOptions.maxBlocksInCache;
    }

    public getCacheOverflowSize(): number | undefined {
        return this.gridOptions.cacheOverflowSize;
    }

    public getPaginationPageSize(): number | undefined {
        return toNumber(this.gridOptions.paginationPageSize);
    }

    public isPaginateChildRows(): boolean {
        const shouldPaginate = this.isGroupRemoveSingleChildren() || this.isGroupRemoveLowestSingleChildren();
        if (shouldPaginate) { return true; }
        return isTrue(this.gridOptions.paginateChildRows);
    }

    public getCacheBlockSize(): number | undefined {
        return oneOrGreater(this.gridOptions.cacheBlockSize);
    }

    public getInfiniteInitialRowCount(): number | undefined {
        return this.gridOptions.infiniteInitialRowCount;
    }

    public isPurgeClosedRowNodes() {
        return isTrue(this.gridOptions.purgeClosedRowNodes);
    }

    public isSuppressPaginationPanel() {
        return isTrue(this.gridOptions.suppressPaginationPanel);
    }

    public getRowData(): any[] | undefined | null {
        return this.gridOptions.rowData;
    }

    public isEnableRtl() {
        return isTrue(this.gridOptions.enableRtl);
    }

    public getRowGroupPanelShow() {
        return this.gridOptions.rowGroupPanelShow;
    }

    public getPivotPanelShow() {
        return this.gridOptions.pivotPanelShow;
    }

    public isAngularCompileRows() {
        return isTrue(this.gridOptions.angularCompileRows);
    }

    public isAngularCompileFilters() {
        return isTrue(this.gridOptions.angularCompileFilters);
    }

    public isDebug() {
        return isTrue(this.gridOptions.debug);
    }

    public getColumnDefs() {
        return this.gridOptions.columnDefs;
    }

    public getColumnTypes(): { [key: string]: ColDef; } | undefined {
        return this.gridOptions.columnTypes;
    }

    public getDatasource(): IDatasource | undefined {
        return this.gridOptions.datasource;
    }

    public getViewportDatasource(): IViewportDatasource | undefined {
        return this.gridOptions.viewportDatasource;
    }

    public getServerSideDatasource(): IServerSideDatasource | undefined {
        return this.gridOptions.serverSideDatasource;
    }

    public isAccentedSort() {
        return isTrue(this.gridOptions.accentedSort);
    }

    public isEnableBrowserTooltips() {
        return isTrue(this.gridOptions.enableBrowserTooltips);
    }

    public isEnableCellExpressions() {
        return isTrue(this.gridOptions.enableCellExpressions);
    }

    public isEnableGroupEdit() {
        return isTrue(this.gridOptions.enableGroupEdit);
    }

    public isSuppressMiddleClickScrolls() {
        return isTrue(this.gridOptions.suppressMiddleClickScrolls);
    }

    public isPreventDefaultOnContextMenu() {
        return isTrue(this.gridOptions.preventDefaultOnContextMenu);
    }

    public isSuppressPreventDefaultOnMouseWheel() {
        return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel);
    }

    public isSuppressColumnVirtualisation() {
        return isTrue(this.gridOptions.suppressColumnVirtualisation);
    }

    public isSuppressRowVirtualisation() {
        return isTrue(this.gridOptions.suppressRowVirtualisation);
    }

    public isSuppressContextMenu() {
        return isTrue(this.gridOptions.suppressContextMenu);
    }

    public isAllowContextMenuWithControlKey() {
        return isTrue(this.gridOptions.allowContextMenuWithControlKey);
    }

    public isSuppressCopyRowsToClipboard() {
        return isTrue(this.gridOptions.suppressCopyRowsToClipboard);
    }

    public isSuppressCopySingleCellRanges() {
        return isTrue(this.gridOptions.suppressCopySingleCellRanges);
    }

    public isCopyHeadersToClipboard() {
        return isTrue(this.gridOptions.copyHeadersToClipboard);
    }

    public isCopyGroupHeadersToClipboard() {
        return isTrue(this.gridOptions.copyGroupHeadersToClipboard);
    }

    public isSuppressClipboardPaste() {
        return isTrue(this.gridOptions.suppressClipboardPaste);
    }

    public isSuppressLastEmptyLineOnPaste() {
        return isTrue(this.gridOptions.suppressLastEmptyLineOnPaste);
    }

    public isPagination() {
        return isTrue(this.gridOptions.pagination);
    }

    public isSuppressEnterpriseResetOnNewColumns() {
        return isTrue(this.gridOptions.suppressEnterpriseResetOnNewColumns);
    }

    public getProcessDataFromClipboardFunc() {
        return this.mergeGridCommonParams(this.gridOptions.processDataFromClipboard);
    }

    public getAsyncTransactionWaitMillis(): number | undefined {
        return exists(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : Constants.BATCH_WAIT_MILLIS;
    }

    public isSuppressMovableColumns() {
        return isTrue(this.gridOptions.suppressMovableColumns);
    }

    public isAnimateRows() {
        // never allow animating if enforcing the row order
        if (this.isEnsureDomOrder()) { return false; }

        return isTrue(this.gridOptions.animateRows);
    }

    public isSuppressColumnMoveAnimation() {
        return isTrue(this.gridOptions.suppressColumnMoveAnimation);
    }

    public isSuppressAggFuncInHeader() {
        return isTrue(this.gridOptions.suppressAggFuncInHeader);
    }

    public isSuppressAggAtRootLevel() {
        return isTrue(this.gridOptions.suppressAggAtRootLevel);
    }

    public isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = this.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || isTrue(this.gridOptions.suppressAggFilteredOnly);
    }

    public isRemovePivotHeaderRowWhenSingleValueColumn() {
        return isTrue(this.gridOptions.removePivotHeaderRowWhenSingleValueColumn);
    }

    public isShowOpenedGroup() {
        return isTrue(this.gridOptions.showOpenedGroup);
    }

    public isReactUi() {
        return isTrue(this.gridOptions.reactUi);
    }

    public isSuppressReactUi() {
        return isTrue(this.gridOptions.suppressReactUi);
    }

    public isEnableRangeSelection(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule) && isTrue(this.gridOptions.enableRangeSelection);
    }

    public isEnableRangeHandle(): boolean {
        return isTrue(this.gridOptions.enableRangeHandle);
    }

    public isEnableFillHandle(): boolean {
        return isTrue(this.gridOptions.enableFillHandle);
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

    public isSuppressMultiRangeSelection(): boolean {
        return isTrue(this.gridOptions.suppressMultiRangeSelection);
    }

    public isPaginationAutoPageSize(): boolean {
        return isTrue(this.gridOptions.paginationAutoPageSize);
    }

    public isRememberGroupStateWhenNewData(): boolean {
        return isTrue(this.gridOptions.rememberGroupStateWhenNewData);
    }

    public getIcons() {
        return this.gridOptions.icons;
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

    public getAggFuncs(): { [key: string]: IAggFunc; } | undefined {
        return this.gridOptions.aggFuncs;
    }

    public getSortingOrder(): ('asc' | 'desc' | null)[] | undefined {
        return this.gridOptions.sortingOrder;
    }

    public getAlignedGrids(): { api?: GridApi | null, columnApi?: ColumnApi | null }[] | undefined {
        return this.gridOptions.alignedGrids;
    }

    public isMasterDetail() {
        const masterDetail = isTrue(this.gridOptions.masterDetail);

        if (masterDetail) {
            return ModuleRegistry.assertRegistered(ModuleNames.MasterDetailModule, 'masterDetail');
        } else {
            return false;
        }
    }

    public isKeepDetailRows(): boolean {
        return isTrue(this.gridOptions.keepDetailRows);
    }

    public getKeepDetailRowsCount(): number | undefined {
        const keepDetailRowsCount = this.gridOptions.keepDetailRowsCount;
        if (exists(keepDetailRowsCount) && keepDetailRowsCount > 0) {
            return this.gridOptions.keepDetailRowsCount;
        }

        return DEFAULT_KEEP_DETAIL_ROW_COUNT;
    }

    public getIsRowMasterFunc() {
        return this.gridOptions.isRowMaster;
    }

    public getIsRowSelectableFunc() {
        return this.gridOptions.isRowSelectable;
    }

    public getGroupRowRendererParams() {
        return this.gridOptions.groupRowRendererParams;
    }

    public getOverlayLoadingTemplate() {
        return this.gridOptions.overlayLoadingTemplate;
    }

    public getOverlayNoRowsTemplate() {
        return this.gridOptions.overlayNoRowsTemplate;
    }

    public isSuppressAutoSize() {
        return isTrue(this.gridOptions.suppressAutoSize);
    }

    public isEnableCellTextSelection() {
        return isTrue(this.gridOptions.enableCellTextSelection);
    }

    public isSuppressParentsInRowNodes() {
        return isTrue(this.gridOptions.suppressParentsInRowNodes);
    }

    public isSuppressClipboardApi() {
        return isTrue(this.gridOptions.suppressClipboardApi);
    }

    public isFunctionsReadOnly() {
        return isTrue(this.gridOptions.functionsReadOnly);
    }

    public isEnableCellTextSelect(): boolean {
        return isTrue(this.gridOptions.enableCellTextSelection);
    }

    public getDefaultColDef(): ColDef | undefined {
        return this.gridOptions.defaultColDef;
    }

    public getDefaultColGroupDef(): Partial<ColGroupDef> | undefined {
        return this.gridOptions.defaultColGroupDef;
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

    public isSuppressCsvExport() {
        return isTrue(this.gridOptions.suppressCsvExport);
    }

    public isAllowShowChangeAfterFilter() {
        return isTrue(this.gridOptions.allowShowChangeAfterFilter);
    }

    public isSuppressExcelExport() {
        return isTrue(this.gridOptions.suppressExcelExport);
    }

    public isSuppressMakeColumnVisibleAfterUnGroup() {
        return isTrue(this.gridOptions.suppressMakeColumnVisibleAfterUnGroup);
    }

    public getDataPathFunc(): ((dataItem: any) => string[]) | undefined {
        return this.gridOptions.getDataPath;
    }

    public getIsServerSideGroupFunc(): ((dataItem: any) => boolean) | undefined {
        return this.gridOptions.isServerSideGroup;
    }

    public getIsServerSideGroupOpenByDefaultFunc() {
        return this.mergeGridCommonParams(this.gridOptions.isServerSideGroupOpenByDefault);
    }

    public getIsGroupOpenByDefaultFunc() {
        return this.mergeGridCommonParams(this.gridOptions.isGroupOpenByDefault);
    }

    public getServerSideGroupKeyFunc(): ((dataItem: any) => string) | undefined {
        return this.gridOptions.getServerSideGroupKey;
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

    public isTreeData(): boolean {
        const usingTreeData = isTrue(this.gridOptions.treeData);

        if (usingTreeData) {
            return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Tree Data');
        }

        return false;
    }

    public isValueCache(): boolean {
        return isTrue(this.gridOptions.valueCache);
    }

    public isValueCacheNeverExpires(): boolean {
        return isTrue(this.gridOptions.valueCacheNeverExpires);
    }

    public isDeltaSort(): boolean {
        return isTrue(this.gridOptions.deltaSort);
    }

    public isAggregateOnlyChangedColumns(): boolean {
        return isTrue(this.gridOptions.aggregateOnlyChangedColumns);
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

        if (this.isTreeData() && isEnabled) {
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

        if (this.isTreeData() && isEnabled) {
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

    public getChartThemeOverrides(): AgChartThemeOverrides | undefined {
        return this.gridOptions.chartThemeOverrides;
    }

    public getCustomChartThemes(): { [name: string]: AgChartTheme; } | undefined {
        return this.gridOptions.customChartThemes;
    }

    public getChartThemes(): string[] {
        // return default themes if user hasn't supplied any
        return this.gridOptions.chartThemes || ['ag-default', 'ag-material', 'ag-pastel', 'ag-vivid', 'ag-solar'];
    }

    public getClipboardDelimiter() {
        return exists(this.gridOptions.clipboardDelimiter) ? this.gridOptions.clipboardDelimiter : '\t';
    }

    public setProperty(key: string, value: any, force = false): void {
        const gridOptionsNoType = this.gridOptions as any;
        const previousValue = gridOptionsNoType[key];

        if (force || previousValue !== value) {
            gridOptionsNoType[key] = value;
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

    public isSkipHeaderOnAutoSize(): boolean {
        return !!this.gridOptions.skipHeaderOnAutoSize;
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

    public isTooltipMouseTrack() {
        return isTrue(this.gridOptions.tooltipMouseTrack);
    }

    public isSuppressModelUpdateAfterUpdateTransaction(): boolean {
        return isTrue(this.gridOptions.suppressModelUpdateAfterUpdateTransaction);
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
        if (this.isTreeData()) { this.treeDataViolations(); }
    }

    private treeDataViolations() {
        if (this.isRowModelDefault()) {
            if (missing(this.getDataPathFunc())) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=clientSide, but you did not ' +
                    'provide getDataPath function, please provide getDataPath function if using tree data.'
                );
            }
        }
        if (this.isRowModelServerSide()) {
            if (missing(this.getIsServerSideGroupFunc())) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide isServerSideGroup function, please provide isServerSideGroup function if using tree data.'
                );
            }
            if (missing(this.getServerSideGroupKeyFunc())) {
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

        if (rowNode.detail && this.isMasterDetail()) {
            // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
            // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
            // (due to auto height) which looks bad, especially if doing row animation.
            if (this.isDetailRowAutoHeight()) {
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
