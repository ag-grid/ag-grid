import {Utils as _} from "../../utils";
import {Constants as constants, Constants} from "../../constants";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ColumnController} from "../../columnController/columnController";
import {FilterManager} from "../../filter/filterManager";
import {RowNode} from "../../entities/rowNode";
import {EventService} from "../../eventService";
import {Events, ModelUpdatedEvent} from "../../events";
import {Autowired, Bean, Context, Optional, PostConstruct} from "../../context/context";
import {SelectionController} from "../../selectionController";
import {IRowNodeStage} from "../../interfaces/iRowNodeStage";
import {InMemoryNodeManager} from "./inMemoryNodeManager";
import {ChangedPath} from "./changedPath";
import {ValueService} from "../../valueService/valueService";
import {ValueCache} from "../../valueService/valueCache";
import {RowBounds} from "../../interfaces/iRowModel";

enum RecursionType {Normal, AfterFilter, AfterFilterAndSort, PivotNodes};

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
    rowNodeTransaction?: RowNodeTransaction;
    // true user called setRowData() (or a new page in pagination). the grid scrolls
    // back to the top when this is true.
    newData?: boolean;
}

export interface RowDataTransaction {
    addIndex?: number,
    add?: any[];
    remove?: any[];
    update?: any[];
}

export interface RowNodeTransaction {
    add: RowNode[];
    remove: RowNode[];
    update: RowNode[];
}

@Bean('rowModel')
export class InMemoryRowModel {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$scope') private $scope: any;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('valueCache') private valueCache: ValueCache;

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

    private nodeManager: InMemoryNodeManager;

    @PostConstruct
    public init(): void {

        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_EVERYTHING} ));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_EVERYTHING} ));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_PIVOT} ));

        this.eventService.addModalPriorityEventListener(Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.refreshModel.bind(this, {step: Constants.STEP_PIVOT} ));

        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, this.refreshModel.bind(this, {step: Constants.STEP_MAP, keepRenderedRows: true, animate: true} ));

        this.rootNode = new RowNode();
        this.nodeManager = new InMemoryNodeManager(this.rootNode, this.gridOptionsWrapper,
            this.context, this.eventService, this.columnController);

        this.context.wireBean(this.rootNode);
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

    public getRowBounds(index: number): RowBounds {
        if (_.missing(this.rowsToDisplay)) { return null; }
        let rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            }
        } else {
            return null;
        }
    }

    private onRowGroupOpened(): void {
        let animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_MAP, keepRenderedRows: true, animate: animate});
    }

    private onFilterChanged(): void {
        let animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_FILTER, keepRenderedRows: true, animate: animate});
    }

    private onSortChanged(): void {
        // we only act on the sort event here if the user is doing in grid sorting.
        // we ignore it if the sorting is happening on the server side.
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) { return; }

        let animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({step: Constants.STEP_SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true});
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_IN_MEMORY;
    }

    private onValueChanged(): void {
        if (this.columnController.isPivotActive()) {
            this.refreshModel({step: Constants.STEP_PIVOT});
        } else {
            this.refreshModel({step: Constants.STEP_AGGREGATE});
        }
    }

    private createChangePath(transaction: RowNodeTransaction): ChangedPath {

        if (!transaction) { return null; }

        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueService twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.
        let valueColumns = this.columnController.getValueColumns();

        if (!valueColumns || valueColumns.length === 0) { return null; }

        let changedPath = new ChangedPath(false);

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

        let changedPath: ChangedPath = this.createChangePath(params.rowNodeTransaction);

        switch (params.step) {
            case constants.STEP_EVERYTHING:
                // start = new Date().getTime();
                this.doRowGrouping(params.groupState, params.rowNodeTransaction, changedPath);
                // console.log('rowGrouping = ' + (new Date().getTime() - start));
            case constants.STEP_FILTER:
                // start = new Date().getTime();
                this.doFilter();
                // console.log('filter = ' + (new Date().getTime() - start));
            case constants.STEP_PIVOT:
                this.doPivot();
            case constants.STEP_AGGREGATE: // depends on agg fields
                // start = new Date().getTime();
                this.doAggregate(changedPath);
                // console.log('aggregation = ' + (new Date().getTime() - start));
            case constants.STEP_SORT:
                // start = new Date().getTime();
                this.doSort();
                // console.log('sort = ' + (new Date().getTime() - start));
            case constants.STEP_MAP:
                // start = new Date().getTime();
                this.doRowsToDisplay();
                // console.log('rowsToDisplay = ' + (new Date().getTime() - start));
        }

        let event: ModelUpdatedEvent = {
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false};
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, event);

        if (this.$scope) {
            setTimeout( () => {
                this.$scope.$apply();
            }, 0);
        }
    }

    public isEmpty(): boolean {
        let rowsMissing: boolean;

        let rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            rowsMissing = _.missing(this.rootNode.childrenAfterGroup) || this.rootNode.childrenAfterGroup.length === 0
        } else {
            rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        }

        let empty = _.missing(this.rootNode) || rowsMissing  || !this.columnController.isReady();

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

        let result: RowNode[] = [];

        let groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

        this.forEachNodeAfterFilterAndSort((rowNode: RowNode) => {

            let lookingForLastRow = firstRowHit && !lastRowHit;

            // check if we need to flip the select switch
            if (!firstRowHit) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    firstRowHit = true;
                }
            }

            let skipThisGroupNode = rowNode.group && groupsSelectChildren;
            if (!skipThisGroupNode) {
                let inRange = firstRowHit && !lastRowHit;
                let childOfLastRow = rowNode.isParentOfNode(lastRow);
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
        console.error('ag-Grid: should never call setDatasource on inMemoryRowController');
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
        if (pixelToMatch<=0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        let lastNode = this.rowsToDisplay[this.rowsToDisplay.length-1];
        if (lastNode.rowTop<=pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }

        while (true) {

            let midPointer = Math.floor((bottomPointer + topPointer) / 2);
            let currentRowNode = this.rowsToDisplay[midPointer];

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
        let topPixel = rowNode.rowTop;
        let bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        let pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }

    public getCurrentPageHeight(): number {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            let lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
            let lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        } else {
            return 0;
        }
    }

    public forEachLeafNode(callback: Function): void {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach( (rowNode, index) => callback(rowNode, index) );
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
    // index - works similar to the index in forEach in javascripts array function
    private recursivelyWalkNodesAndCallback(nodes: RowNode[], callback: Function, recursionType: RecursionType, index: number) {
        if (nodes) {
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                callback(node, index++);
                // go to the next level if it is a group
                if (node.group) {
                    // depending on the recursion type, we pick a difference set of children
                    let nodeChildren: RowNode[];
                    switch (recursionType) {
                        case RecursionType.Normal : nodeChildren = node.childrenAfterGroup; break;
                        case RecursionType.AfterFilter : nodeChildren = node.childrenAfterFilter; break;
                        case RecursionType.AfterFilterAndSort : nodeChildren = node.childrenAfterSort; break;
                        case RecursionType.PivotNodes :
                            // for pivot, we don't go below leafGroup levels
                            nodeChildren = !node.leafGroup ? node.childrenAfterSort : null; break;
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

        if (this.rootNode){
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }

        function recursiveExpandOrCollapse(rowNodes: RowNode[]): void {
            if (!rowNodes) { return; }
            rowNodes.forEach( (rowNode: RowNode) => {
                if (rowNode.group) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                }
            });
        }
        this.refreshModel({step: Constants.STEP_MAP});
    }

    private doSort() {
        this.sortStage.execute({rowNode: this.rootNode});
    }

    private doRowGrouping(groupState: any, rowNodeTransaction: RowNodeTransaction, changedPath: ChangedPath) {

        // grouping is enterprise only, so if service missing, skip the step
        let rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) { return; }

        if (this.groupStage) {

            if (rowNodeTransaction) {
                this.groupStage.execute({rowNode: this.rootNode,
                    rowNodeTransaction: rowNodeTransaction,
                    changedPath: changedPath});
            } else {
                // groups are about to get disposed, so need to deselect any that are selected
                this.selectionController.removeGroupsFromSelection();
                this.groupStage.execute({rowNode: this.rootNode});
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }

            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionController.updateGroupsFromChildrenSelections();
            }

        } else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
        }
    }

    private restoreGroupState(groupState: any): void {
        if (!groupState) { return; }

        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node: RowNode, key: string)=> {
            // if the group was open last time, then open it this time. however
            // if was not open last time, then don't touch the group, so the 'groupDefaultExpanded'
            // setting will take effect.
            if (typeof groupState[key] === 'boolean') {
                node.expanded = groupState[key];
            }
        });
    }

    private doFilter() {
        this.filterStage.execute({rowNode: this.rootNode});
    }

    private doPivot() {
        if (this.pivotStage) {
            this.pivotStage.execute({rowNode: this.rootNode});
        }
    }

    private getGroupState(): any {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
            return null;
        }
        let result: any = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node: RowNode, key: string)=> result[key] = node.expanded );
        return result;
    }

    public getCopyOfNodesMap(): {[id:string]: RowNode} {
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
        let groupState = this.getGroupState();

        this.nodeManager.setRowData(rowData);

        // this event kicks off:
        // - clears selection
        // - updates filters
        // - shows 'no rows' overlay if needed
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);

        this.refreshModel({
            step: Constants.STEP_EVERYTHING,
            groupState: groupState,
            newData: true});
    }

    public updateRowData(rowDataTran: RowDataTransaction): RowNodeTransaction {

        this.valueCache.onDataChanged();

        let rowNodeTran = this.nodeManager.updateRowData(rowDataTran);

        this.refreshModel({
            step: Constants.STEP_EVERYTHING,
            rowNodeTransaction: rowNodeTran,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });

        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_UPDATED);

        return rowNodeTran;
    }

    private doRowsToDisplay() {
        this.rowsToDisplay = <RowNode[]> this.flattenStage.execute({rowNode: this.rootNode});
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {
        // remember group state, so we can expand groups that should be expanded
        let groupState = this.getGroupState();
        let newNodes = this.nodeManager.insertItemsAtIndex(index, items);
        if (!skipRefresh) {
            this.refreshAndFireEvent(Events.EVENT_ITEMS_ADDED, newNodes, groupState);
        }
    }

    public onRowHeightChanged(): void {
        this.refreshModel({step: Constants.STEP_MAP, keepRenderedRows: true, keepEditingRows: true});
    }

    public resetRowHeights(): void {
        this.forEachNode( (rowNode: RowNode) => rowNode.setRowHeight(null) );
        this.onRowHeightChanged();
    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {
        let groupState = this.getGroupState();
        let removedNodes = this.nodeManager.removeItems(rowNodes);
        if (!skipRefresh) {
            this.refreshAndFireEvent(Events.EVENT_ITEMS_REMOVED, removedNodes, groupState);
        }
    }

    public addItems(items: any[], skipRefresh: boolean): void {
        let groupState = this.getGroupState();
        let newNodes = this.nodeManager.addItems(items);

        if (!skipRefresh) {
            this.refreshAndFireEvent(Events.EVENT_ITEMS_ADDED, newNodes, groupState);
        }

        // if (newNodes) {
        //     this.refreshModel({step: Constants.STEP_EVERYTHING, groupState: groupState, newRowNodes: newNodes});
        //     this.eventService.dispatchEvent(Events.EVENT_ITEMS_ADDED, {rowNodes: newNodes})
        // }
    }

    private refreshAndFireEvent(eventName: string, rowNodes: RowNode[], groupState: any): void {
        if (rowNodes) {
            this.refreshModel({step: Constants.STEP_EVERYTHING, groupState: groupState});
            this.eventService.dispatchEvent(eventName, {rowNodes: rowNodes})
        }
    }

}
