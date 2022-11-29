import { Autowired, Bean, PostConstruct } from './context/context';
import { DomLayoutType, GridOptions, RowGroupingDisplayType, TreeDataDisplayType } from './entities/gridOptions';
import { GetGroupAggFilteringParams, GetGroupRowAggParams, GetRowIdParams, InitialGroupOrderComparatorParams } from './entities/iCallbackParams';
import { Events } from './eventKeys';
import { EventService } from './eventService';
import { GridOptionsService } from './gridOptionsService';
import { WithoutGridCommon } from './interfaces/iCommon';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { getScrollbarWidth } from './utils/browser';
import { doOnce } from './utils/function';
import { exists, missing } from './utils/generic';


function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

@Bean('gridOptionsWrapper')
export class GridOptionsWrapper {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('gridOptionsService') private readonly gridOptionsService: GridOptionsService;
    @Autowired('eventService') private readonly eventService: EventService;
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private domDataKey = '__AG_' + Math.random().toString();

    // we store this locally, so we are not calling getScrollWidth() multiple times as it's an expensive operation
    private scrollbarWidth: number;

    @PostConstruct
    public init(): void {
        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();
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

    public useAsyncEvents() {
        return !this.gridOptionsService.is('suppressAsyncEvents');
    }

    public isColumnsSortingCoupledToGroup(): boolean {
        const autoGroupColumnDef = this.gridOptionsService.get('autoGroupColumnDef');
        const isClientSideRowModel = this.gridOptionsService.isRowModelType('clientSide');
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
        // we never allow groupDisplayType = 'groupRows' if in pivot mode, otherwise we won't see the pivot values.
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

    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    public getDomLayout(): DomLayoutType {
        const domLayout: DomLayoutType = this.gridOptions.domLayout || 'normal';
        const validLayouts: DomLayoutType[] = ['normal', 'print', 'autoHeight'];

        if (validLayouts.indexOf(domLayout) === -1) {
            doOnce(
                () =>
                    console.warn(
                        `AG Grid: ${domLayout} is not valid for DOM Layout, valid values are 'normal', 'autoHeight', 'print'.`
                    ),
                'warn about dom layout values'
            );
            return 'normal';
        }

        return domLayout;
    }

    public isServerSideInfiniteScroll(): boolean {
        return isTrue(this.gridOptions.serverSideInfiniteScroll) || this.gridOptions.serverSideInfiniteScroll === 'legacy';
    }

    public isServerSideNewInfiniteScroll(): boolean {
        return isTrue(this.gridOptions.serverSideInfiniteScroll);
    }

    public getInitialGroupOrderComparator() {
        const initialGroupOrderComparator = this.gridOptionsService.getCallback('initialGroupOrderComparator');
        if (initialGroupOrderComparator) {
            return initialGroupOrderComparator;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const defaultGroupOrderComparator = this.gridOptionsService.get('defaultGroupOrderComparator');
        if (defaultGroupOrderComparator) {
            return (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => defaultGroupOrderComparator(params.nodeA, params.nodeB);
        }
    }

    public getServerSideInitialRowCount(): number {
        const rowCount = this.gridOptions.serverSideInitialRowCount;
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    }

    public getAsyncTransactionWaitMillis(): number | undefined {
        return exists(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : 50;
    }

    public isAnimateRows() {
        // never allow animating if enforcing the row order
        if (this.gridOptionsService.is('ensureDomOrder')) { return false; }

        return this.gridOptionsService.is('animateRows');
    }

    public isEnableRangeSelection(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule) && this.gridOptionsService.is('enableRangeSelection');
    }

    public getGroupAggFiltering(): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined {
        const userValue = this.gridOptions.groupAggFiltering;

        if (typeof userValue === 'function') {
            this.gridOptionsService.getCallback('groupAggFiltering' as any)
        }

        if (isTrue(userValue)) {
            return () => true;
        }

        return undefined;
    }

    public isMasterDetail() {
        return this.gridOptionsService.is('masterDetail') && ModuleRegistry.assertRegistered(ModuleNames.MasterDetailModule, 'masterDetail');
    }

    public getGroupRowAggFunc() {
        const getGroupRowAgg = this.gridOptionsService.getCallback('getGroupRowAgg');
        if (getGroupRowAgg) {
            return getGroupRowAgg;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const groupRowAggNodes = this.gridOptionsService.get('groupRowAggNodes');
        if (groupRowAggNodes) {
            return (params: WithoutGridCommon<GetGroupRowAggParams>) => groupRowAggNodes(params.nodes);
        }
    }

    public getRowIdFunc() {
        const getRowId = this.gridOptionsService.getCallback('getRowId');
        if (getRowId) {
            return getRowId;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const getRowNodeId = this.gridOptionsService.get('getRowNodeId');
        if (getRowNodeId) {
            return (params: WithoutGridCommon<GetRowIdParams>) => getRowNodeId(params.data);
        }
    }

    public isTreeData(): boolean {
        return this.gridOptionsService.is('treeData') && ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Tree Data');
    }

    private assertRowModelIsServerSide(key: keyof GridOptions) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            doOnce(() => console.warn(`AG Grid: The '${key}' property can only be used with the Server Side Row Model.`), key);
            return false;
        }
        return true;
    }
    private assertNotTreeData(key: keyof GridOptions) {
        if (this.gridOptionsService.is('treeData')) {
            doOnce(() => console.warn(`AG Grid: The '${key}' property cannot be used while using tree data.`), key + '_TreeData');
            return false;
        }
        return true;
    }

    public isServerSideSortAllLevels() {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    }
    public isServerSideFilterAllLevels() {
        return this.gridOptionsService.is('serverSideFilterAllLevels') && this.assertRowModelIsServerSide('serverSideFilterAllLevels');
    }
    public isServerSideSortOnServer() {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    }
    public isServerSideFilterOnServer() {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    }

    public getChartThemes(): string[] {
        // return default themes if user hasn't supplied any
        return this.gridOptions.chartThemes || ['ag-default', 'ag-material', 'ag-pastel', 'ag-vivid', 'ag-solar'];
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

    public getRowBuffer(): number {
        let rowBuffer = this.gridOptions.rowBuffer;

        if (typeof rowBuffer === 'number') {
            if (rowBuffer < 0) {
                doOnce(() => console.warn(`AG Grid: rowBuffer should not be negative`), 'warn rowBuffer negative');
                this.gridOptions.rowBuffer = rowBuffer = 0;
            }
        } else {
            rowBuffer = 10;
        }

        return rowBuffer;
    }

    public getRowBufferInPixels() {
        const rowsToBuffer = this.getRowBuffer();
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();

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
