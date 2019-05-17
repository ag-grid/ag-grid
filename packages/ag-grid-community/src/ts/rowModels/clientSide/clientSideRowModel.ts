import { Constants as constants, Constants } from "../../constants";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ColumnApi } from "../../columnController/columnApi";
import { ColumnController } from "../../columnController/columnController";
import { FilterManager } from "../../filter/filterManager";
import { RowNode } from "../../entities/rowNode";
import { EventService } from "../../eventService";
import {
    Events,
    ExpandCollapseAllEvent,
    ModelUpdatedEvent,
    RowDataChangedEvent,
    RowDataUpdatedEvent
} from "../../events";
import { Autowired, Bean, Context, Optional, PostConstruct } from "../../context/context";
import { SelectionController } from "../../selectionController";
import { IRowNodeStage } from "../../interfaces/iRowNodeStage";
import { ClientSideNodeManager } from "./clientSideNodeManager";
import { ChangedPath } from "./changedPath";
import { ValueService } from "../../valueService/valueService";
import { ValueCache } from "../../valueService/valueCache";
import { RowBounds } from "../../interfaces/iRowModel";
import { GridApi } from "../../gridApi";
import { _ } from "../../utils";

enum RecursionType {Normal, AfterFilter, AfterFilterAndSort, PivotNodes}

export interface RefreshModelParams {
    // how much of the pipeline to execute
    step: number;
    // what state to reset the groups back to after the refresh
    groupState?: any;
    // if NOT new data, then this flag tells grid to check if rows already
    // exist for the nodes (matching by node id) and reuses the row if it does.
    keepRenderedRows?: boolean;
    // if true, rows that are kept are animated to the new position
    animate?: boolean;
    // if true, then rows we are editing will be kept
    keepEditingRows?: boolean;
    // if doing delta updates, this has the changes that were done
    rowNodeTransactions?: (RowNodeTransaction | null)[];
    // if doing delta updates, this has the order of the nodes
    rowNodeOrder?: { [id: string]: number };
    // true user called setRowData() (or a new page in pagination). the grid scrolls
    // back to the top when this is true.
    newData?: boolean;
    // true if this update is due to columns changing, ie no rows were changed
    afterColumnsChanged?: boolean;
}

export interface RowDataTransaction {
    addIndex?: number;
    add?: any[];
    remove?: any[];
    update?: any[];
}

export interface RowNodeTransaction {
    add: RowNode[];
    remove: RowNode[];
    update: RowNode[];
}

export interface BatchTransactionItem {
    rowDataTransaction: RowDataTransaction;
    callback: ((res: RowNodeTransaction) => void) | undefined;
}

export interface RowNodeMap { [id: string]: RowNode; }

@Bean('rowModel')
export class ClientSideRowModel {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$scope') private $scope: any;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    // standard stages
    @Autowired('filterStage') private filterStage: IRowNodeStage;
    @Autowired('sortStage') private sortStage: IRowNodeStage;
    @Autowired('flattenStage') private flattenStage: IRowNodeStage;

    // enterprise stages
    @Optional('groupStage') private groupStage: IRowNodeStage;
    @Optional('aggregationStage') private aggregationStage: IRowNodeStage;
    @Optional('pivotStage') private pivotStage: IRowNodeStage;

    // top most node of the tree. the children are the user provided data.
    private rootNode: RowNode;

    private rowsToDisplay: RowNode[]; // the rows mapped to rows to display

    private nodeManager: ClientSideNodeManager;

    private rowDataTransactionBatch: BatchTransactionItem[] | null;

    @PostConstruct
    public init(): void {

        const refreshEverythingFunc = this.refreshModel.bind(this, {step: Constants.STEP_EVERYTHING});
        const refreshEverythingAfterColsChangedFunc
            = this.refreshModel.bind(this, {step: Constants.STEP_EVERYTHING, afterColumnsChanged: true});

        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, refreshEverythingAfterColsChangedFunc);
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_PIVOT}));

        this.eventService.addModalPriorityEventListener(Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);

        const refreshMapFunc = this.refreshModel.bind(this, {
            step: Constants.STEP_MAP,
            keepRenderedRows: true,
            animate: true
        });
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, refreshMapFunc);
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, refreshMapFunc);

        this.rootNode = new RowNode();
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsWrapper,
            this.context, this.eventService, this.columnController, this.gridApi, this.columnApi,
            this.selectionController);

        this.context.wireBean(this.rootNode);
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
                this.setRowTops();
            }

        } while (atLeastOneChange);

        return res;
    }

    private setRowTops(): void {
        let nextRowTop = 0;
        for (let i = 0; i < this.rowsToDisplay.length; i++) {

            // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
            // with these two layouts.
            const allowEstimate = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;

            const rowNode = this.rowsToDisplay[i];
            if (_.missing(rowNode.rowHeight)) {
                const rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode, allowEstimate);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }

            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
    }

    private resetRowTops(rowNode: RowNode, changedPath: ChangedPath): void {
        rowNode.clearRowTop();
        if (rowNode.hasChildren()) {
            if (rowNode.childrenAfterGroup) {

                // if a changedPath is active, it means we are here because of a transaction update or
                // a change detection. neither of these impacts the open/closed state of groups. so if
                // a group is not open this time, it was not open last time. so we know all closed groups
                // already have their top positions cleared. so there is no need to traverse all the way
                // when changedPath is active and the rowNode is not expanded.
                const skipChildren = changedPath.isActive() && !rowNode.expanded;
                if (!skipChildren) {
                    for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        this.resetRowTops(rowNode.childrenAfterGroup[i], changedPath);
                    }
                }
            }
            if (rowNode.sibling) {
                rowNode.sibling.clearRowTop();
            }
        }
        if (rowNode.detailNode) {
            rowNode.detailNode.clearRowTop();
        }
    }

    // returns false if row was moved, otherwise true
    public ensureRowAtPixel(rowNode: RowNode, pixel: number): boolean {
        const indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        const rowNodeAtPixelNow = this.getRow(indexAtPixelNow);

        if (rowNodeAtPixelNow === rowNode) {
            return false;
        }

        _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
        _.insertIntoArray(this.rootNode.allLeafChildren, rowNode, indexAtPixelNow);

        this.refreshModel({
            step: Constants.STEP_EVERYTHING,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });

        return true;
    }

    public isLastRowFound(): boolean {
        return true;
    }

    public getRowCount(): number {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        } else {
            return 0;
        }
    }

    public getRowBounds(index: number): RowBounds | null {
        if (_.missing(this.rowsToDisplay)) {
            return null;
        }
        const rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            };
        } else {
            return null;
        }
    }

    private onRowGroupOpened(): void {
        const animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_MAP, keepRenderedRows: true, animate: animate});
    }

    private onFilterChanged(): void {
        const animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_FILTER, keepRenderedRows: true, animate: animate});
    }

    private onSortChanged(): void {
        const animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true});
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
    }

    private onValueChanged(): void {
        if (this.columnController.isPivotActive()) {
            this.refreshModel({step: Constants.STEP_PIVOT});
        } else {
            this.refreshModel({step: Constants.STEP_AGGREGATE});
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

    public refreshModel(params: RefreshModelParams): void {

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
            case constants.STEP_EVERYTHING:
                // start = new Date().getTime();
                this.doRowGrouping(params.groupState, params.rowNodeTransactions, params.rowNodeOrder,
                    changedPath, params.afterColumnsChanged);
            // console.log('rowGrouping = ' + (new Date().getTime() - start));
            case constants.STEP_FILTER:
                // start = new Date().getTime();
                this.doFilter(changedPath);
            // console.log('filter = ' + (new Date().getTime() - start));
            case constants.STEP_PIVOT:
                this.doPivot(changedPath);
            case constants.STEP_AGGREGATE: // depends on agg fields
                // start = new Date().getTime();
                this.doAggregate(changedPath);
            // console.log('aggregation = ' + (new Date().getTime() - start));
            case constants.STEP_SORT:
                // start = new Date().getTime();
                this.doSort(params.rowNodeTransactions, changedPath);
            // console.log('sort = ' + (new Date().getTime() - start));
            case constants.STEP_MAP:
                // start = new Date().getTime();
                this.doRowsToDisplay();
            // console.log('rowsToDisplay = ' + (new Date().getTime() - start));
        }

        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        this.resetRowTops(this.rootNode, changedPath);
        this.setRowTops();

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

        if (this.$scope) {
            window.setTimeout(() => {
                this.$scope.$apply();
            }, 0);
        }
    }

    public isEmpty(): boolean {
        let rowsMissing: boolean;

        const doingLegacyTreeData = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (doingLegacyTreeData) {
            rowsMissing = _.missing(this.rootNode.childrenAfterGroup) || this.rootNode.childrenAfterGroup.length === 0;
        } else {
            rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        }

        const empty = _.missing(this.rootNode) || rowsMissing || !this.columnController.isReady();

        return empty;
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

        this.forEachNodeAfterFilterAndSort((rowNode: RowNode) => {

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
        console.error('ag-Grid: should never call setDatasource on clientSideRowController');
    }

    public getTopLevelNodes() {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    }

    public getRootNode() {
        return this.rootNode;
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    }

    public getVirtualRowCount(): number {
        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
        return this.getPageLastRow();
    }

    public getPageFirstRow(): number {
        return 0;
    }

    public getPageLastRow(): number {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length - 1;
        } else {
            return 0;
        }
    }

    public getRowIndexAtPixel(pixelToMatch: number): number {
        if (this.isEmpty()) {
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
        if (lastNode.rowTop <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }

        while (true) {

            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = this.rowsToDisplay[midPointer];

            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            } else if (currentRowNode.rowTop < pixelToMatch) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowTop > pixelToMatch) {
                topPointer = midPointer - 1;
            }

        }
    }

    private isRowInPixel(rowNode: RowNode, pixelToMatch: number): boolean {
        const topPixel = rowNode.rowTop;
        const bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        const pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }

    public getCurrentPageHeight(): number {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            const lastRow = _.last(this.rowsToDisplay);
            const lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        } else {
            return 0;
        }
    }

    public forEachLeafNode(callback: Function): void {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach((rowNode, index) => callback(rowNode, index));
        }
    }

    public forEachNode(callback: Function): void {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterGroup, callback, RecursionType.Normal, 0);
    }

    public forEachNodeAfterFilter(callback: Function): void {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterFilter, callback, RecursionType.AfterFilter, 0);
    }

    public forEachNodeAfterFilterAndSort(callback: Function): void {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
    }

    public forEachPivotNode(callback: Function): void {
        this.recursivelyWalkNodesAndCallback([this.rootNode], callback, RecursionType.PivotNodes, 0);
    }

    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    private recursivelyWalkNodesAndCallback(nodes: RowNode[], callback: Function, recursionType: RecursionType, index: number) {
        if (nodes) {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                callback(node, index++);
                // go to the next level if it is a group
                if (node.hasChildren()) {
                    // depending on the recursion type, we pick a difference set of children
                    let nodeChildren: RowNode[] | null = null;
                    switch (recursionType) {
                        case RecursionType.Normal :
                            nodeChildren = node.childrenAfterGroup;
                            break;
                        case RecursionType.AfterFilter :
                            nodeChildren = node.childrenAfterFilter;
                            break;
                        case RecursionType.AfterFilterAndSort :
                            nodeChildren = node.childrenAfterSort;
                            break;
                        case RecursionType.PivotNodes :
                            // for pivot, we don't go below leafGroup levels
                            nodeChildren = !node.leafGroup ? node.childrenAfterSort : null;
                            break;
                    }
                    if (nodeChildren) {
                        index = this.recursivelyWalkNodesAndCallback(nodeChildren, callback, recursionType, index);
                    }
                }
            }
        }
        return index;
    }

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public doAggregate(changedPath?: ChangedPath) {
        if (this.aggregationStage) {
            this.aggregationStage.execute({rowNode: this.rootNode, changedPath: changedPath});
        }
    }

    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    public expandOrCollapseAll(expand: boolean): void {
        const usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }

        function recursiveExpandOrCollapse(rowNodes: RowNode[]): void {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach((rowNode: RowNode) => {
                const shouldExpandOrCollapse = usingTreeData ? _.exists(rowNode.childrenAfterGroup) : rowNode.group;
                if (shouldExpandOrCollapse) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                }
            });
        }

        this.refreshModel({step: Constants.STEP_MAP});

        const eventSource = expand ? 'expandAll' : 'collapseAll';
        const event: ExpandCollapseAllEvent = {
            api: this.gridApi,
            columnApi: this.columnApi,
            type: Events.EVENT_EXPAND_COLLAPSE_ALL,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    }

    private doSort(rowNodeTransactions: RowNodeTransaction[], changedPath: ChangedPath) {
        this.sortStage.execute({
            rowNode: this.rootNode,
            rowNodeTransactions: rowNodeTransactions,
            changedPath: changedPath
        });
    }

    private doRowGrouping(groupState: any,
                          rowNodeTransactions: (RowNodeTransaction | null)[] | undefined,
                          rowNodeOrder: { [id: string]: number } | undefined,
                          changedPath: ChangedPath,
                          afterColumnsChanged: boolean) {

        // grouping is enterprise only, so if service missing, skip the step
        const doingLegacyTreeData = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (doingLegacyTreeData) {
            return;
        }

        if (this.groupStage) {

            if (rowNodeTransactions && _.exists(rowNodeTransactions)) {
                rowNodeTransactions.forEach(tran => {
                    this.groupStage.execute({
                        rowNode: this.rootNode,
                        rowNodeTransaction: tran,
                        rowNodeOrder: rowNodeOrder,
                        changedPath: changedPath
                    });
                });
            } else {
                // groups are about to get disposed, so need to deselect any that are selected
                this.selectionController.removeGroupsFromSelection();
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    changedPath: changedPath,
                    afterColumnsChanged: afterColumnsChanged
                });
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }

            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionController.updateGroupsFromChildrenSelections(changedPath);
            }

        } else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
        }
    }

    private restoreGroupState(groupState: any): void {
        if (!groupState) {
            return;
        }

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
        this.filterStage.execute({rowNode: this.rootNode, changedPath: changedPath});
    }

    private doPivot(changedPath: ChangedPath) {
        if (this.pivotStage) {
            this.pivotStage.execute({rowNode: this.rootNode, changedPath: changedPath});
        }
    }

    private getGroupState(): any {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
            return null;
        }
        const result: any = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node: RowNode, key: string) => result[key] = node.expanded);
        return result;
    }

    public getCopyOfNodesMap(): { [id: string]: RowNode } {
        return this.nodeManager.getCopyOfNodesMap();
    }

    public getRowNode(id: string): RowNode {
        return this.nodeManager.getRowNode(id);
    }

    // rows: the rows to put into the model
    public setRowData(rowData: any[]) {

        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.

        // remember group state, so we can expand groups that should be expanded
        const groupState = this.getGroupState();

        this.nodeManager.setRowData(rowData);

        // this event kicks off:
        // - clears selection
        // - updates filters
        // - shows 'no rows' overlay if needed
        const rowDataChangedEvent: RowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);

        this.refreshModel({
            step: Constants.STEP_EVERYTHING,
            groupState: groupState,
            newData: true
        });
    }

    public batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void {
        if (!this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch = [];
            const waitMillis = this.gridOptionsWrapper.getBatchUpdateWaitMillis();
            window.setTimeout(() => {
                this.executeBatchUpdateRowData();
                this.rowDataTransactionBatch = null;
            }, waitMillis);
        }
        this.rowDataTransactionBatch.push({rowDataTransaction: rowDataTransaction, callback: callback});
    }

    private executeBatchUpdateRowData(): void {
        this.valueCache.onDataChanged();

        const callbackFuncsBound: Function[] = [];
        const rowNodeTrans: (RowNodeTransaction | null)[] = [];

        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(tranItem => {
                const rowNodeTran = this.nodeManager.updateRowData(tranItem.rowDataTransaction, null);
                rowNodeTrans.push(rowNodeTran);
                if (tranItem.callback) {
                    callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
                }
            });
        }

        this.commonUpdateRowData(rowNodeTrans);

        // do callbacks in next VM turn so it's async
        if (callbackFuncsBound.length > 0) {
            window.setTimeout(() => {
                callbackFuncsBound.forEach(func => func());
            }, 0);
        }
    }

    public updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder?: { [id: string]: number }): RowNodeTransaction | null {

        this.valueCache.onDataChanged();

        const rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);

        this.commonUpdateRowData([rowNodeTran], rowNodeOrder);

        return rowNodeTran;
    }

    // common to updateRowData and batchUpdateRowData
    private commonUpdateRowData(rowNodeTrans: (RowNodeTransaction | null)[], rowNodeOrder?: { [id: string]: number }): void {
        this.refreshModel({
            step: Constants.STEP_EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });

        const event: RowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    private doRowsToDisplay() {
        this.rowsToDisplay = this.flattenStage.execute({rowNode: this.rootNode}) as RowNode[];
    }

    public onRowHeightChanged(): void {
        this.refreshModel({step: Constants.STEP_MAP, keepRenderedRows: true, keepEditingRows: true});
    }

    public resetRowHeights(): void {
        this.forEachNode((rowNode: RowNode) => rowNode.setRowHeight(null));
        this.onRowHeightChanged();
    }

}
