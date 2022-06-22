import {
    _,
    Autowired,
    Bean,
    BeanStub,
    ChangedPath,
    ColumnApi,
    ColumnModel,
    Constants,
    Events,
    ExpandCollapseAllEvent,
    FilterChangedEvent,
    GridApi,
    GridOptionsWrapper,
    IClientSideRowModel,
    IRowNodeStage,
    ModelUpdatedEvent,
    Optional,
    PostConstruct,
    RefreshModelParams,
    ClientSideRowModelSteps,
    RowBounds,
    RowDataChangedEvent,
    RowDataTransaction,
    RowDataUpdatedEvent,
    RowNode,
    RowHighlightPosition,
    RowNodeTransaction,
    SelectionService,
    ValueCache,
    AsyncTransactionsFlushed,
    AnimationFrameService,
    Beans,
    FilterManager
} from "@ag-grid-community/core";
import { ClientSideNodeManager } from "./clientSideNodeManager";

enum RecursionType { Normal, AfterFilter, AfterFilterAndSort, PivotNodes }

export interface BatchTransactionItem {
    rowDataTransaction: RowDataTransaction;
    callback: ((res: RowNodeTransaction) => void) | undefined;
}

export interface RowNodeMap {
    [id: string]: RowNode;
}

@Bean('rowModel')
export class ClientSideRowModel extends BeanStub implements IClientSideRowModel {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('selectionService') private selectionService: SelectionService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('beans') private beans: Beans;

    // standard stages
    @Autowired('filterStage') private filterStage: IRowNodeStage;
    @Autowired('sortStage') private sortStage: IRowNodeStage;
    @Autowired('flattenStage') private flattenStage: IRowNodeStage;

    // enterprise stages
    @Optional('groupStage') private groupStage: IRowNodeStage;
    @Optional('aggregationStage') private aggregationStage: IRowNodeStage;
    @Optional('pivotStage') private pivotStage: IRowNodeStage;
    @Optional('filterAggregatesStage') private filterAggregatesStage: IRowNodeStage;

    // top most node of the tree. the children are the user provided data.
    private rootNode: RowNode;
    private rowsToDisplay: RowNode[] = []; // the rows mapped to rows to display
    private nodeManager: ClientSideNodeManager;
    private rowDataTransactionBatch: BatchTransactionItem[] | null;
    private lastHighlightedRow: RowNode | null;
    private applyAsyncTransactionsTimeout: number | undefined;

    @PostConstruct
    public init(): void {
        const refreshEverythingFunc = this.refreshModel.bind(this, { step: ClientSideRowModelSteps.EVERYTHING });
        const animate = !this.gridOptionsWrapper.isSuppressAnimationFrame();
        const refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
                step: ClientSideRowModelSteps.EVERYTHING, // after cols change, row grouping (the first stage) could of changed
                afterColumnsChanged: true,
                keepRenderedRows: true, // we want animations cos sorting or filtering could be applied
                animate
            });

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: ClientSideRowModelSteps.PIVOT }));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);

        const refreshMapListener = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.MAP,
            keepRenderedRows: true,
            animate
        });

        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, refreshMapListener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, refreshMapListener);

        this.rootNode = new RowNode(this.beans);
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsWrapper,
            this.eventService, this.columnModel, this.gridApi, this.columnApi,
            this.selectionService, this.beans);
    }

    public start(): void {
        const rowData = this.gridOptionsWrapper.getRowData();
        if (rowData) {
            this.setRowData(rowData);
        }
    }

    public ensureRowHeightsValid(startPixel: number, endPixel: number, startLimitIndex: number, endLimitIndex: number): boolean {
        let atLeastOneChange: boolean;
        let res = false;

        // we do this multiple times as changing the row heights can also change the first and last rows,
        // so the first pass can make lots of rows smaller, which means the second pass we end up changing
        // more rows.
        do {
            atLeastOneChange = false;

            const rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
            const rowAtEndPixel = this.getRowIndexAtPixel(endPixel);

            // keep check to current page if doing pagination
            const firstRow = Math.max(rowAtStartPixel, startLimitIndex);
            const lastRow = Math.min(rowAtEndPixel, endLimitIndex);

            for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                const rowNode = this.getRow(rowIndex);
                if (rowNode.rowHeightEstimated) {
                    const rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
                    rowNode.setRowHeight(rowHeight.height);
                    atLeastOneChange = true;
                    res = true;
                }
            }

            if (atLeastOneChange) {
                this.setRowTopAndRowIndex();
            }

        } while (atLeastOneChange);

        return res;
    }

    private setRowTopAndRowIndex(): Set<string> {
        const defaultRowHeight = this.gridOptionsWrapper.getDefaultRowHeight();
        let nextRowTop = 0;

        // mapping displayed rows is not needed for this method, however it's used in
        // clearRowTopAndRowIndex(), and given we are looping through this.rowsToDisplay here,
        // we create the map here for performance reasons, so we don't loop a second time
        // in clearRowTopAndRowIndex()
        const displayedRowsMapped = new Set<string>();

        // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
        // with these two layouts.
        const allowEstimate = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;

        for (let i = 0; i < this.rowsToDisplay.length; i++) {

            const rowNode = this.rowsToDisplay[i];

            if (rowNode.id!=null) { 
                displayedRowsMapped.add(rowNode.id);
            }

            if (rowNode.rowHeight==null) {
                const rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }

            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight!;
        }

        return displayedRowsMapped;
    }

    private clearRowTopAndRowIndex(changedPath: ChangedPath, displayedRowsMapped: Set<string>): void {

        const changedPathActive = changedPath.isActive();

        const clearIfNotDisplayed = (rowNode: RowNode) => {
            if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
                rowNode.clearRowTopAndRowIndex();
            }
        };

        const recurse = (rowNode: RowNode) => {

            clearIfNotDisplayed(rowNode);
            clearIfNotDisplayed(rowNode.detailNode);
            clearIfNotDisplayed(rowNode.sibling);

            if (rowNode.hasChildren()) {
                if (rowNode.childrenAfterGroup) {

                    // if a changedPath is active, it means we are here because of a transaction update or
                    // a change detection. neither of these impacts the open/closed state of groups. so if
                    // a group is not open this time, it was not open last time. so we know all closed groups
                    // already have their top positions cleared. so there is no need to traverse all the way
                    // when changedPath is active and the rowNode is not expanded.
                    const isRootNode = rowNode.level == -1; // we need to give special consideration for root node,
                                                            // as expanded=undefined for root node
                    const skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
                    if (!skipChildren) {
                        rowNode.childrenAfterGroup.forEach(recurse);
                    }
                }
            }
        };

        recurse(this.rootNode);
    }

    // returns false if row was moved, otherwise true
    public ensureRowsAtPixel(rowNodes: RowNode[], pixel: number, increment: number = 0): boolean {
        const indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        const rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
        const animate = !this.gridOptionsWrapper.isSuppressAnimationFrame();

        if (rowNodeAtPixelNow === rowNodes[0]) {
            return false;
        }

        rowNodes.forEach(rowNode => {
            _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
        });

        rowNodes.forEach((rowNode, idx) => {
            _.insertIntoArray(this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
        });

        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        });

        return true;
    }

    public highlightRowAtPixel(rowNode: RowNode | null, pixel?: number): void {
        const indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
        const rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;

        if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
            if (this.lastHighlightedRow) {
                this.lastHighlightedRow.setHighlighted(null);
                this.lastHighlightedRow = null;
            }
            return;
        }

        const highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);

        if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
            this.lastHighlightedRow.setHighlighted(null);
            this.lastHighlightedRow = null;
        }

        rowNodeAtPixelNow.setHighlighted(highlight);
        this.lastHighlightedRow = rowNodeAtPixelNow;
    }

    public getHighlightPosition(pixel: number, rowNode?: RowNode): RowHighlightPosition {
        if (!rowNode) {
            const index = this.getRowIndexAtPixel(pixel);
            rowNode = this.getRow(index || 0);

            if (!rowNode) { return RowHighlightPosition.Below; }
        }

        const { rowTop, rowHeight } = rowNode;

        return pixel - rowTop! < rowHeight! / 2 ? RowHighlightPosition.Above : RowHighlightPosition.Below;
    }

    public getLastHighlightedRowNode(): RowNode | null {
        return this.lastHighlightedRow;
    }

    public isLastRowIndexKnown(): boolean {
        return true;
    }

    public getRowCount(): number {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }

        return 0;
    }

    public getTopLevelRowCount(): number {
        const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;

        if (showingRootNode) {
            return 1;
        }

        const filteredChildren = this.rootNode.childrenAfterAggFilter;
        return filteredChildren ? filteredChildren.length : 0;
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;

        if (showingRootNode) {
            return topLevelIndex;
        }

        let rowNode = this.rootNode.childrenAfterSort![topLevelIndex];

        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            // if hideOpenParents, and this row open, then this row is now displayed at this index, first child is
            while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
                rowNode = rowNode.childrenAfterSort[0];
            }
        }

        return rowNode.rowIndex!;
    }

    public getRowBounds(index: number): RowBounds | null {
        if (_.missing(this.rowsToDisplay)) {
            return null;
        }

        const rowNode = this.rowsToDisplay[index];

        if (rowNode) {
            return {
                rowTop: rowNode.rowTop!,
                rowHeight: rowNode.rowHeight!
            };
        }

        return null;
    }
    
    public onRowGroupOpened(): void {
        const animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate: animate });
    }

    private onFilterChanged(event: FilterChangedEvent): void {
        if (event.afterDataChange) { return; }
        const animate = this.gridOptionsWrapper.isAnimateRows();

        const primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some(col => col.isPrimary());
        const step: ClientSideRowModelSteps = primaryOrQuickFilterChanged ? ClientSideRowModelSteps.FILTER : ClientSideRowModelSteps.FILTER_AGGREGATES;
        this.refreshModel({ step: step, keepRenderedRows: true, animate: animate });
    }

    private onSortChanged(): void {
        const animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
    }

    private onValueChanged(): void {
        if (this.columnModel.isPivotActive()) {
            this.refreshModel({ step: ClientSideRowModelSteps.PIVOT });
        } else {
            this.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
        }
    }

    private createChangePath(rowNodeTransactions: (RowNodeTransaction | null)[] | undefined): ChangedPath {

        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueService twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.

        const noTransactions = _.missingOrEmpty(rowNodeTransactions);

        const changedPath = new ChangedPath(false, this.rootNode);

        if (noTransactions || this.gridOptionsWrapper.isTreeData()) {
            changedPath.setInactive();
        }

        return changedPath;
    }

    private isSuppressModelUpdateAfterUpdateTransaction(params: RefreshModelParams): boolean {
        if (!this.gridOptionsWrapper.isSuppressModelUpdateAfterUpdateTransaction()) { return false; }

        // return true if we are only doing update transactions
        if (params.rowNodeTransactions == null) { return false; }

        const transWithAddsOrDeletes = params.rowNodeTransactions.filter(tx =>
            (tx.add != null && tx.add.length > 0) || (tx.remove != null && tx.remove.length > 0)
        );

        const transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;

        return transactionsContainUpdatesOnly;
    }

    public refreshModel(params: RefreshModelParams): void {

        if (this.isSuppressModelUpdateAfterUpdateTransaction(params)) { return; }

        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.

        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        // let start: number;
        // console.log('======= start =======');

        const changedPath: ChangedPath = this.createChangePath(params.rowNodeTransactions);

        switch (params.step) {
            case ClientSideRowModelSteps.EVERYTHING:
                this.doRowGrouping(params.groupState, params.rowNodeTransactions, params.rowNodeOrder,
                    changedPath, !!params.afterColumnsChanged);
            case ClientSideRowModelSteps.FILTER:
                this.doFilter(changedPath);
            case ClientSideRowModelSteps.PIVOT:
                this.doPivot(changedPath);
            case ClientSideRowModelSteps.AGGREGATE: // depends on agg fields
                this.doAggregate(changedPath);
            case ClientSideRowModelSteps.FILTER_AGGREGATES:
                this.doFilterAggregates(changedPath);
            case ClientSideRowModelSteps.SORT:
                this.doSort(params.rowNodeTransactions, changedPath);
            case ClientSideRowModelSteps.MAP:
                this.doRowsToDisplay();
        }

        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        const displayedNodesMapped = this.setRowTopAndRowIndex();
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);

        const event: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false
        };
        this.eventService.dispatchEvent(event);
    }

    public isEmpty(): boolean {
        const rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        return _.missing(this.rootNode) || rowsMissing || !this.columnModel.isReady();
    }

    public isRowsToRender(): boolean {
        return _.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        // if lastSelectedNode is missing, we start at the first row
        let firstRowHit = !lastInRange;
        let lastRowHit = false;
        let lastRow: RowNode;

        const result: RowNode[] = [];

        const groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

        this.forEachNodeAfterFilterAndSort(rowNode => {
            const lookingForLastRow = firstRowHit && !lastRowHit;

            // check if we need to flip the select switch
            if (!firstRowHit) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    firstRowHit = true;
                }
            }

            const skipThisGroupNode = rowNode.group && groupsSelectChildren;
            if (!skipThisGroupNode) {
                const inRange = firstRowHit && !lastRowHit;
                const childOfLastRow = rowNode.isParentOfNode(lastRow);
                if (inRange || childOfLastRow) {
                    result.push(rowNode);
                }
            }

            if (lookingForLastRow) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    lastRowHit = true;
                    if (rowNode === lastInRange) {
                        lastRow = lastInRange;
                    } else {
                        lastRow = firstInRange;
                    }
                }
            }
        });

        return result;
    }

    public setDatasource(datasource: any): void {
        console.error('AG Grid: should never call setDatasource on clientSideRowController');
    }

    public getTopLevelNodes(): RowNode[] | null {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    }

    public getRootNode(): RowNode {
        return this.rootNode;
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    }

    public getRowIndexAtPixel(pixelToMatch: number): number {
        if (this.isEmpty() || this.rowsToDisplay.length === 0) {
            return -1;
        }

        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        let bottomPointer = 0;
        let topPointer = this.rowsToDisplay.length - 1;

        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch <= 0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        const lastNode = _.last(this.rowsToDisplay);
        if (lastNode.rowTop! <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }

        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = this.rowsToDisplay[midPointer];

            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            }

            if (currentRowNode.rowTop! < pixelToMatch) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowTop! > pixelToMatch) {
                topPointer = midPointer - 1;
            }
        }
    }

    private isRowInPixel(rowNode: RowNode, pixelToMatch: number): boolean {
        const topPixel = rowNode.rowTop;
        const bottomPixel = rowNode.rowTop! + rowNode.rowHeight!;
        const pixelInRow = topPixel! <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }

    public forEachLeafNode(callback: (node: RowNode, index: number) => void): void {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach((rowNode, index) => callback(rowNode, index));
        }
    }

    public forEachNode(callback: (node: RowNode, index: number) => void): void {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterGroup, callback, RecursionType.Normal, 0);
    }

    public forEachNodeAfterFilter(callback: (node: RowNode, index: number) => void): void {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterAggFilter, callback, RecursionType.AfterFilter, 0);
    }

    public forEachNodeAfterFilterAndSort(callback: (node: RowNode, index: number) => void): void {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
    }

    public forEachPivotNode(callback: (node: RowNode, index: number) => void): void {
        this.recursivelyWalkNodesAndCallback([this.rootNode], callback, RecursionType.PivotNodes, 0);
    }

    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    private recursivelyWalkNodesAndCallback(nodes: RowNode[] | null, callback: (node: RowNode, index: number) => void, recursionType: RecursionType, index: number) {
        if (!nodes) { return index; }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            callback(node, index++);
            // go to the next level if it is a group
            if (node.hasChildren()) {
                // depending on the recursion type, we pick a difference set of children
                let nodeChildren: RowNode[] | null = null;
                switch (recursionType) {
                    case RecursionType.Normal:
                        nodeChildren = node.childrenAfterGroup;
                        break;
                    case RecursionType.AfterFilter:
                        nodeChildren = node.childrenAfterAggFilter;
                        break;
                    case RecursionType.AfterFilterAndSort:
                        nodeChildren = node.childrenAfterSort;
                        break;
                    case RecursionType.PivotNodes:
                        // for pivot, we don't go below leafGroup levels
                        nodeChildren = !node.leafGroup ? node.childrenAfterSort : null;
                        break;
                }
                if (nodeChildren) {
                    index = this.recursivelyWalkNodesAndCallback(nodeChildren, callback, recursionType, index);
                }
            }
        }
        return index;
    }

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public doAggregate(changedPath?: ChangedPath): void {
        if (this.aggregationStage) {
            this.aggregationStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    }

    private doFilterAggregates(changedPath: ChangedPath): void {
        if (this.filterAggregatesStage) {
            this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        } else {
            // If filterAggregatesStage is undefined, then so is the grouping stage, so all children should be on the rootNode.
            this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
        }
    }

    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    public expandOrCollapseAll(expand: boolean): void {
        const usingTreeData = this.gridOptionsWrapper.isTreeData();
        const usingPivotMode = this.columnModel.isPivotActive();

        const recursiveExpandOrCollapse = (rowNodes: RowNode[] | null): void => {
            if (!rowNodes) { return; }
            rowNodes.forEach(rowNode => {
                const actionRow = () => {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };
    
                if (usingTreeData) {
                    const hasChildren = _.exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }

                if (usingPivotMode) {
                    const notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }

                const isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        }

        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }

        this.refreshModel({ step: ClientSideRowModelSteps.MAP });

        const eventSource = expand ? 'expandAll' : 'collapseAll';
        const event: ExpandCollapseAllEvent = {
            api: this.gridApi,
            columnApi: this.columnApi,
            type: Events.EVENT_EXPAND_COLLAPSE_ALL,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    }

    private doSort(rowNodeTransactions: RowNodeTransaction[] | undefined, changedPath: ChangedPath) {
        this.sortStage.execute({
            rowNode: this.rootNode,
            rowNodeTransactions: rowNodeTransactions,
            changedPath: changedPath
        });
    }

    private doRowGrouping(
        groupState: any,
        rowNodeTransactions: RowNodeTransaction[] | undefined,
        rowNodeOrder: { [id: string]: number; } | undefined,
        changedPath: ChangedPath,
        afterColumnsChanged: boolean
    ) {
        if (this.groupStage) {

            if (rowNodeTransactions) {
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    rowNodeTransactions: rowNodeTransactions,
                    rowNodeOrder: rowNodeOrder,
                    changedPath: changedPath
                });
            } else {
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    changedPath: changedPath,
                    afterColumnsChanged: afterColumnsChanged
                });
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }

            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionService.updateGroupsFromChildrenSelections(changedPath);
            }

        } else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
            if (this.rootNode.sibling) {
                this.rootNode.sibling.childrenAfterGroup = this.rootNode.childrenAfterGroup;
            }
            this.rootNode.updateHasChildren();
        }
    }

    private restoreGroupState(groupState: any): void {
        if (!groupState) { return; }

        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node: RowNode, key: string) => {
            // if the group was open last time, then open it this time. however
            // if was not open last time, then don't touch the group, so the 'groupDefaultExpanded'
            // setting will take effect.
            if (typeof groupState[key] === 'boolean') {
                node.expanded = groupState[key];
            }
        });
    }

    private doFilter(changedPath: ChangedPath) {
        this.filterStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
    }

    private doPivot(changedPath: ChangedPath) {
        if (this.pivotStage) {
            this.pivotStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    }

    private getGroupState(): any {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) { return null; }
        const result: any = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node: RowNode, key: string) => result[key] = node.expanded);
        return result;
    }

    public getCopyOfNodesMap(): { [id: string]: RowNode; } {
        return this.nodeManager.getCopyOfNodesMap();
    }

    public getRowNode(id: string): RowNode | undefined {
        // although id is typed a string, this could be called by the user, and they could have passed a number
        const idIsGroup = typeof id == 'string' && id.indexOf(RowNode.ID_PREFIX_ROW_GROUP) == 0;

        if (idIsGroup) {
            // only one users complained about getRowNode not working for groups, after years of
            // this working for normal rows. so have done quick implementation. if users complain
            // about performance, then GroupStage should store / manage created groups in a map,
            // which is a chunk of work.
            let res: RowNode | undefined = undefined;
            this.forEachNode(node => {
                if (node.id === id) {
                    res = node;
                }
            });
            return res;
        }

        return this.nodeManager.getRowNode(id);
    }

    // rows: the rows to put into the model
    public setRowData(rowData: any[]): void {

        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.

        // remember group state, so we can expand groups that should be expanded
        const groupState = this.getGroupState();

        this.nodeManager.setRowData(rowData);

        // - clears selection
        this.selectionService.reset();
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');

        // this event kicks off:
        // - shows 'no rows' overlay if needed
        const rowDataChangedEvent: RowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);

        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            groupState: groupState,
            newData: true
        });
    }

    public batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void {
        if (this.applyAsyncTransactionsTimeout == null) {
            this.rowDataTransactionBatch = [];
            const waitMillis = this.gridOptionsWrapper.getAsyncTransactionWaitMillis();
            this.applyAsyncTransactionsTimeout = window.setTimeout(() => {
                this.executeBatchUpdateRowData();
            }, waitMillis);
        }
        this.rowDataTransactionBatch!.push({ rowDataTransaction: rowDataTransaction, callback: callback });
    }

    public flushAsyncTransactions(): void {
        if (this.applyAsyncTransactionsTimeout != null) {
            clearTimeout(this.applyAsyncTransactionsTimeout);
            this.executeBatchUpdateRowData();
        }
    }

    private executeBatchUpdateRowData(): void {
        this.valueCache.onDataChanged();

        const callbackFuncsBound: Function[] = [];
        const rowNodeTrans: RowNodeTransaction[] = [];

        // The rowGroup stage uses rowNodeOrder if order was provided. if we didn't pass 'true' to
        // commonUpdateRowData, using addIndex would have no effect when grouping.
        let forceRowNodeOrder = false;

        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(tranItem => {
                const rowNodeTran = this.nodeManager.updateRowData(tranItem.rowDataTransaction, undefined);
                rowNodeTrans.push(rowNodeTran);
                if (tranItem.callback) {
                    callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
                }
                if (typeof tranItem.rowDataTransaction.addIndex === 'number') {
                    forceRowNodeOrder = true;
                }
            });
        }

        this.commonUpdateRowData(rowNodeTrans, undefined, forceRowNodeOrder);

        // do callbacks in next VM turn so it's async
        if (callbackFuncsBound.length > 0) {
            window.setTimeout(() => {
                callbackFuncsBound.forEach(func => func());
            }, 0);
        }

        if (rowNodeTrans.length > 0) {
            const event: AsyncTransactionsFlushed = {
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!,
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: rowNodeTrans
            };
            this.eventService.dispatchEvent(event);
        }

        this.rowDataTransactionBatch = null;
        this.applyAsyncTransactionsTimeout = undefined;
    }

    public updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: { [id: string]: number; }): RowNodeTransaction | null {

        this.valueCache.onDataChanged();

        const rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);

        // if doing immutableData, addIndex is never present. however if doing standard transaction, and user
        // provided addIndex, then this is used in updateRowData. However if doing Enterprise, then the rowGroup
        // stage also uses the
        const forceRowNodeOrder = typeof rowDataTran.addIndex === 'number';

        this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);

        return rowNodeTran;
    }

    private createRowNodeOrder(): { [id: string]: number; } | undefined {
        const suppressSortOrder = this.gridOptionsWrapper.isSuppressMaintainUnsortedOrder();
        if (suppressSortOrder) { return; }

        const orderMap: { [id: string]: number } = {};

        if (this.rootNode && this.rootNode.allLeafChildren) {
            for (let index = 0; index < this.rootNode.allLeafChildren.length; index++) {
                const node = this.rootNode.allLeafChildren[index];
                orderMap[node.id!] = index;
            }
        }

        return orderMap;
    }

    // common to updateRowData and batchUpdateRowData
    private commonUpdateRowData(
        rowNodeTrans: RowNodeTransaction[],
        rowNodeOrder: { [id: string]: number; } | undefined,
        forceRowNodeOrder: boolean
    ): void {
        const animate = !this.gridOptionsWrapper.isSuppressAnimationFrame();

        if (forceRowNodeOrder) {
            rowNodeOrder = this.createRowNodeOrder();
        }
        
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        });
        
        const event: RowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }
    
    private doRowsToDisplay() {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode }) as RowNode[];
    }

    public onRowHeightChanged(): void {
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true });
    }

    public resetRowHeights(): void {
        let atLeastOne = false;
        this.forEachNode(rowNode => {
            rowNode.setRowHeight(rowNode.rowHeight, true);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            const detailNode = rowNode.detailNode;
            if (detailNode) {
                detailNode.setRowHeight(detailNode.rowHeight, true);
            }
            atLeastOne = true;
        });

        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    }

}
