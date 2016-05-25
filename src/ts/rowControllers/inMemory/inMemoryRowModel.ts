import {Utils as _} from "../../utils";
import {Constants as constants, Constants} from "../../constants";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ColumnController} from "../../columnController/columnController";
import {FilterManager} from "../../filter/filterManager";
import {RowNode} from "../../entities/rowNode";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {Bean, Context, Autowired, PostConstruct, Optional} from "../../context/context";
import {SelectionController} from "../../selectionController";
import {IRowNodeStage} from "../../interfaces/iRowNodeStage";
import {IInMemoryRowModel} from "../../interfaces/iInMemoryRowModel";
import {PivotService} from "../../columnController/pivotService";

enum RecursionType {Normal, AfterFilter, AfterFilterAndSort};

@Bean('rowModel')
export class InMemoryRowModel implements IInMemoryRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$scope') private $scope: any;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    // need to refactor this out, should it be a stage?
    @Autowired('pivotService') private pivotService: PivotService;

    // standard stages
    @Autowired('filterStage') private filterStage: IRowNodeStage;
    @Autowired('sortStage') private sortStage: IRowNodeStage;
    @Autowired('flattenStage') private flattenStage: IRowNodeStage;

    // enterprise stages
    @Optional('groupStage') private groupStage: IRowNodeStage;
    @Optional('aggregationStage') private aggregationStage: IRowNodeStage;

    // // the rows go through a pipeline of steps, each array below is the result
    // // after a certain step.
    // private allRows: RowNode[] = []; // the rows, in a list, as provided by the user, but wrapped in RowNode objects
    //
    // private rowsAfterGroup: RowNode[]; // rows in group form, stored in a tree (the parent / child bits of RowNode are used)
    // private rowsAfterFilter: RowNode[]; // after filtering
    // private rowsAfterSort: RowNode[]; // after sorting

    // top most node of the tree. the children are the user provided data.
    private rootNode: RowNode;

    private rowsToDisplay: RowNode[]; // the rows mapped to rows to display

    @PostConstruct
    public init(): void {

        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshModel.bind(this, Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshModel.bind(this, Constants.STEP_AGGREGATE));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, Constants.STEP_PIVOT));

        this.eventService.addModalPriorityEventListener(Events.EVENT_FILTER_CHANGED, this.refreshModel.bind(this, constants.STEP_FILTER));
        this.eventService.addModalPriorityEventListener(Events.EVENT_SORT_CHANGED, this.refreshModel.bind(this, constants.STEP_SORT));

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.allLeafChildren = [];
        this.context.wireBean(this.rootNode);

        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.setRowData(this.gridOptionsWrapper.getRowData(), this.columnController.isReady());
        }

    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_NORMAL;
    }
    
    public refreshModel(step: number, fromIndex?: any, groupState?: any): void {

        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.

        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        switch (step) {
            case constants.STEP_EVERYTHING:
                this.doRowGrouping(groupState);
            case constants.STEP_FILTER:
                this.doFilter();
            // case constants.STEP_PIVOT:
            //     this.doPivot();
            case constants.STEP_AGGREGATE: // depends on agg fields
                this.doAggregate();
            case constants.STEP_SORT:
                this.doSort();
            case constants.STEP_MAP:
                this.doRowsToDisplay();
        }

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, {fromIndex: fromIndex});

        if (this.$scope) {
            setTimeout( () => {
                this.$scope.$apply();
            }, 0);
        }
    }

    public isEmpty(): boolean {
        return _.missing(this.rootNode) || _.missing(this.rootNode.allLeafChildren)
            || this.rootNode.allLeafChildren.length === 0 || !this.columnController.isReady();
    }

    public isRowsToRender(): boolean {
        return _.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    }

    public setDatasource(datasource: any): void {
        console.error('ag-Grid: should never call setDatasource on inMemoryRowController');
    }

    public getTopLevelNodes() {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public getVirtualRowCount(): number {
        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
        return this.getRowCount();
    }

    public getRowCount(): number {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
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
        var bottomPointer = 0;
        var topPointer = this.rowsToDisplay.length - 1;

        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch<=0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        var lastNode = this.rowsToDisplay[this.rowsToDisplay.length-1];
        if (lastNode.rowTop<=pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }

        while (true) {

            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = this.rowsToDisplay[midPointer];

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
        var topPixel = rowNode.rowTop;
        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }

    public getRowCombinedHeight(): number {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            var lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
            var lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        } else {
            return 0;
        }
    }

    public forEachNode(callback: Function) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterGroup, callback, RecursionType.Normal, 0);
    }

    public forEachNodeAfterFilter(callback: Function) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterFilter, callback, RecursionType.AfterFilter, 0);
    }

    public forEachNodeAfterFilterAndSort(callback: Function) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
    }

    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascripts array function
    private recursivelyWalkNodesAndCallback(nodes: RowNode[], callback: Function, recursionType: RecursionType, index: number) {
        if (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                callback(node, index++);
                // go to the next level if it is a group
                if (node.group) {
                    // depending on the recursion type, we pick a difference set of children
                    var nodeChildren: RowNode[];
                    switch (recursionType) {
                        case RecursionType.Normal : nodeChildren = node.childrenAfterGroup; break;
                        case RecursionType.AfterFilter : nodeChildren = node.childrenAfterFilter; break;
                        case RecursionType.AfterFilterAndSort : nodeChildren = node.childrenAfterSort; break;
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
    public doAggregate() {
        if (this.aggregationStage) {
            this.aggregationStage.execute(this.rootNode);
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

        this.refreshModel(Constants.STEP_MAP);
    }

    private doSort() {
        this.sortStage.execute(this.rootNode);
    }

    private doRowGrouping(groupState: any) {

        // grouping is enterprise only, so if service missing, skip the step
        // var rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());

        if (this.groupStage) {

            // remove old groups from the selection model, as we are about to replace them
            // with new groups
            this.selectionController.removeGroupsFromSelection();

            this.groupStage.execute(this.rootNode);

            this.restoreGroupState(groupState);

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
        this.filterStage.execute(this.rootNode);
    }

    private doPivot() {
        this.pivotService.execute(this.rootNode);

        // fire event here???
        // pivotService.createPivotColumns()
        // do pivot - create pivot columns?
    }

    // rows: the rows to put into the model
    // firstId: the first id to use, used for paging, where we are not on the first page
    public setRowData(rowData: any[], refresh: boolean, firstId?: number) {

        // remember group state, so we can expand groups that should be expanded
        var groupState = this.getGroupState();

        // place each row into a wrapper
        this.rootNode.allLeafChildren = this.createRowNodesFromData(rowData, firstId);
        this.rootNode.childrenAfterFilter = null;
        this.rootNode.childrenAfterGroup = null;
        this.rootNode.childrenAfterSort = null;
        this.rootNode.childrenMapped = null;

        // this event kicks off:
        // - clears selection
        // - creates new pivot columns ??
        // - updates filters
        // - shows 'row rows' overlay if needed
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);

        if (refresh) {
            this.refreshModel(Constants.STEP_EVERYTHING, null, groupState);
        }
    }

    private getGroupState(): any {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
            return null;
        }
        var result: any = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node: RowNode, key: string)=> result[key] = node.expanded );
        return result;
    }

    private createRowNodesFromData(rowData: any[], firstId?: number): RowNode[] {
        var that = this;
        if (!rowData) {
            return [];
        }

        var rowNodeId = _.exists(firstId) ? firstId : 0;

        // func below doesn't have 'this' pointer, so need to pull out these bits
        var nodeChildDetailsFunc = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        var suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();

        // kick off recursion
        var result = recursiveFunction(rowData, null, 0);
        return result;

        function recursiveFunction(rowData: any[], parent: RowNode, level: number): RowNode[] {
            var rowNodes: RowNode[] = [];
            rowData.forEach( (dataItem)=> {
                var node = new RowNode();
                that.context.wireBean(node);
                var nodeChildDetails = nodeChildDetailsFunc ? nodeChildDetailsFunc(dataItem) : null;
                if (nodeChildDetails && nodeChildDetails.group) {
                    node.group = true;
                    node.childrenAfterGroup = recursiveFunction(nodeChildDetails.children, node, level + 1);
                    node.expanded = nodeChildDetails.expanded === true;
                    node.field = nodeChildDetails.field;
                    node.key = nodeChildDetails.key;
                }

                if (parent && !suppressParentsInRowNodes) {
                    node.parent = parent;
                }
                node.level = level;
                node.id = rowNodeId++;
                node.data = dataItem;

                rowNodes.push(node);
            });
            return rowNodes;
        }

    }

    private doRowsToDisplay() {
        // this.rowsToDisplay = this.flattenStage.execute(this.rowsAfterSort);
        this.rowsToDisplay = <RowNode[]> this.flattenStage.execute(this.rootNode);
    }
}
