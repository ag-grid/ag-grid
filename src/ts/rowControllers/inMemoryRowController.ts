import _ from '../utils';
import constants from '../constants';
import GridOptionsWrapper from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {Grid} from "../grid";
import FilterManager from "../filter/filterManager";
import {RowNode} from "../entities/rowNode";
import ValueService from "../valueService";
import GroupCreator from "../groupCreator";
import EventService from "../eventService";
import {Events} from "../events";
import Column from "../entities/column";
import {ColDef} from "../entities/colDef";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {GridCore} from "../gridCore";
import SelectionController from "../selectionController";
import {Autowired} from "../context/context";
import {IRowModel} from "./iRowModel";
import Constants from "../constants";
import {SortController} from "../sortController";
import {PostConstruct} from "../context/context";
import {NodeChildDetails} from "../entities/gridOptions";

enum RecursionType {Normal, AfterFilter, AfterFilterAndSort};

@Bean('rowModel')
export default class InMemoryRowController implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('$scope') private $scope: any;
    @Autowired('selectionController') private selectionController: SelectionController;

    @Autowired('groupCreator') private groupCreator: GroupCreator;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;

    // the rows go through a pipeline of steps, each array below is the result
    // after a certain step.
    private allRows: RowNode[] = []; // the rows, in a list, as provided by the user, but wrapped in RowNode objects
    private rowsAfterGroup: RowNode[]; // rows in group form, stored in a tree (the parent / child bits of RowNode are used)
    private rowsAfterFilter: RowNode[]; // after filtering
    private rowsAfterSort: RowNode[]; // after sorting
    private rowsToDisplay: RowNode[]; // the rows mapped to rows to display
    private nextRowTop: number;

    @PostConstruct
    public init(): void {

        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshModel.bind(this, Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, this.refreshModel.bind(this, Constants.STEP_AGGREGATE));

        this.eventService.addModalPriorityEventListener(Events.EVENT_FILTER_CHANGED, this.refreshModel.bind(this, constants.STEP_FILTER));
        this.eventService.addModalPriorityEventListener(Events.EVENT_SORT_CHANGED, this.refreshModel.bind(this, constants.STEP_SORT));

        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.setRowData(this.gridOptionsWrapper.getRowData(), this.columnController.isReady());
        }

    }

    public refreshModel(step: number): void {

        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        switch (step) {
            case constants.STEP_EVERYTHING:
                this.doRowGrouping();
            case constants.STEP_FILTER:
                this.doFilter();
            case constants.STEP_AGGREGATE:
                this.doAggregate();
            case constants.STEP_SORT:
                this.doSort();
            case constants.STEP_MAP:
                this.doRowsToDisplay();
        }

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);

        if (this.$scope) {
            setTimeout( () => {
                this.$scope.$apply();
            }, 0);
        }
    }

    public isEmpty(): boolean {
        return this.allRows === null || this.allRows.length === 0 || !this.columnController.isReady();
    }

    public setDatasource(datasource: any): void {
        console.error('ag-Grid: should never call setDatasource on inMemoryRowController');
    }

    public getTopLevelNodes() {
        return this.rowsAfterGroup;
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public getRowCount(): number {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        } else {
            return 0;
        }
    }

    public getRowAtPixel(pixelToMatch: number): number {
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

    public forEachInMemory(callback: Function) {
        console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, just renamed, forEachInMemory is deprecated');
        this.forEachNode(callback);
    }

    public forEachNode(callback: Function) {
        this.recursivelyWalkNodesAndCallback(this.rowsAfterGroup, callback, RecursionType.Normal, 0);
    }

    public forEachNodeAfterFilter(callback: Function) {
        this.recursivelyWalkNodesAndCallback(this.rowsAfterFilter, callback, RecursionType.AfterFilter, 0);
    }

    public forEachNodeAfterFilterAndSort(callback: Function) {
        this.recursivelyWalkNodesAndCallback(this.rowsAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
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
                        case RecursionType.Normal : nodeChildren = node.children; break;
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

    private defaultGroupAggFunctionFactory(valueColumns: Column[]) {

        // make closure of variable, so is available for methods below
        var _valueService = this.valueService;

        return function groupAggFunction(rows: any) {

            var result = <any>{};

            for (var j = 0; j < valueColumns.length; j++) {
                var valueColumn = valueColumns[j];
                var colKey = valueColumn.getColDef().field;
                if (!colKey) {
                    console.log('ag-Grid: you need to provide a field for all value columns so that ' +
                        'the grid knows what field to store the result in. so even if using a valueGetter, ' +
                        'the result will not be stored in a value getter.');
                }
                // at this point, if no values were numbers, the result is null (not zero)
                result[colKey] = aggregateColumn(rows, valueColumn.getAggFunc(), colKey, valueColumn.getColDef());
            }

            return result;
        };

        // if colDef is passed in, we are working off a column value, if it is not passed in, we are
        // working off colKeys passed in to the gridOptions
        function aggregateColumn(rowNodes: RowNode[], aggFunc: string, colKey: string, colDef: ColDef) {
            var resultForColumn: any = null;
            for (var i = 0; i < rowNodes.length; i++) {
                var rowNode = rowNodes[i];
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                var thisColumnValue: any;
                if (colDef && !rowNode.group) {
                    thisColumnValue = _valueService.getValue(colDef, rowNode.data, rowNode);
                } else {
                    thisColumnValue = rowNode.data[colKey];
                }
                // only include if the value is a number
                if (typeof thisColumnValue === 'number') {

                    switch (aggFunc) {
                        case Column.AGG_SUM :
                            resultForColumn += thisColumnValue;
                            break;
                        case Column.AGG_MIN :
                            if (resultForColumn === null) {
                                resultForColumn = thisColumnValue;
                            } else if (resultForColumn > thisColumnValue) {
                                resultForColumn = thisColumnValue;
                            }
                            break;
                        case Column.AGG_MAX :
                            if (resultForColumn === null) {
                                resultForColumn = thisColumnValue;
                            } else if (resultForColumn < thisColumnValue) {
                                resultForColumn = thisColumnValue;
                            }
                            break;
                    }

                }
            }
            return resultForColumn;
        }
    }

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public doAggregate() {

        var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
        if (typeof groupAggFunction === 'function') {
            this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction, 0);
            return;
        }

        var valueColumns = this.columnController.getValueColumns();
        if (valueColumns && valueColumns.length > 0) {
            var defaultAggFunction = this.defaultGroupAggFunctionFactory(valueColumns);
            this.recursivelyCreateAggData(this.rowsAfterFilter, defaultAggFunction, 0);
        } else {
            // if no agg data, need to clear out any previous items, when can be left behind
            // if use is creating / removing columns using the tool panel.
            // one exception - don't do this if already grouped, as this breaks the File Explorer example!!
            // to fix another day - how to we reset when the user provided the data??
            if (_.missing(this.gridOptionsWrapper.getNodeChildDetailsFunc())) {
                this.recursivelyClearAggData(this.rowsAfterFilter);
            }
        }
    }

    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    public expandOrCollapseAll(expand: boolean): void {

        recursiveExpandOrCollapse(this.rowsAfterGroup);

        function recursiveExpandOrCollapse(rowNodes: RowNode[]): void {
            if (!rowNodes) { return; }
            rowNodes.forEach( rowNode => {
                if (rowNode.group) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.children);
                }
            });
        }

        this.refreshModel(Constants.STEP_MAP);
    }

    private recursivelyClearAggData(nodes: RowNode[]) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyClearAggData(node.childrenAfterFilter);
                node.data = null;
            }
        }
    }

    private recursivelyCreateAggData(nodes: RowNode[], groupAggFunction: any, level: number) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyCreateAggData(node.childrenAfterFilter, groupAggFunction, level++);
                // after traversal, we can now do the agg at this level
                var data = groupAggFunction(node.childrenAfterFilter, level);
                node.data = data;
                // if we are grouping, then it's possible there is a sibling footer
                // to the group, so update the data here also if there is one
                if (node.sibling) {
                    node.sibling.data = data;
                }
            }
        }
    }

    private doSort() {
        var sorting: any;

        // if the sorting is already done by the server, then we should not do it here
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sorting = false;
        } else {
            //see if there is a col we are sorting by
            var sortingOptions = this.sortController.getSortForRowController();
            sorting = sortingOptions.length > 0;
        }

        var rowNodesReadyForSorting = this.rowsAfterFilter ? this.rowsAfterFilter.slice(0) : null;

        if (sorting) {
            this.sortList(rowNodesReadyForSorting, sortingOptions);
        } else {
            // if no sorting, set all group children after sort to the original list.
            // note: it is important to do this, even if doing server side sorting,
            // to allow the rows to pass to the next stage (ie set the node value
            // childrenAfterSort)
            this.recursivelyResetSort(rowNodesReadyForSorting);
        }

        this.rowsAfterSort = rowNodesReadyForSorting;
    }

    private recursivelyResetSort(rowNodes: RowNode[]) {
        if (!rowNodes) {
            return;
        }
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group && item.children) {
                item.childrenAfterSort = item.childrenAfterFilter;
                this.recursivelyResetSort(item.children);
            }
        }

        this.updateChildIndexes(rowNodes);
    }

    private sortList(nodes: RowNode[], sortOptions: any) {

        // sort any groups recursively
        for (var i = 0, l = nodes.length; i < l; i++) { // critical section, no functional programming
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterSort = node.childrenAfterFilter.slice(0);
                this.sortList(node.childrenAfterSort, sortOptions);
            }
        }

        var that = this;

        function compare(nodeA: RowNode, nodeB: RowNode, column:Column, isInverted: boolean) {
            var valueA = that.valueService.getValue(column.getColDef(), nodeA.data, nodeA);
            var valueB = that.valueService.getValue(column.getColDef(), nodeB.data, nodeB);
            if (column.getColDef().comparator) {
                //if comparator provided, use it
                return column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            } else {
                //otherwise do our own comparison
                return _.defaultComparator(valueA, valueB);
            }
        }

        nodes.sort(function (nodeA: RowNode, nodeB: RowNode) {
            // Iterate columns, return the first that doesn't match
            for (var i = 0, len = sortOptions.length; i < len; i++) {
                var sortOption = sortOptions[i];
                var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
                if (compared !== 0) {
                    return compared * sortOption.inverter;
                }
            }
            // All matched, these are identical as far as the sort is concerned:
            return 0;
        });

        this.updateChildIndexes(nodes);
    }

    private updateChildIndexes(nodes: RowNode[]) {
        for (var j = 0; j<nodes.length; j++) {
            var node = nodes[j];
            node.firstChild = j === 0;
            node.lastChild = j === nodes.length - 1;
            node.childIndex = j;
        }
    }

    private doRowGrouping() {
        var rowsAfterGroup: any;
        var groupedCols = this.columnController.getRowGroupColumns();
        var rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());

        var doingGrouping = !rowsAlreadyGrouped && groupedCols.length > 0;

        // remove old groups from the selection model, as we are about to replace them
        // with new groups
        this.selectionController.removeGroupsFromSelection();

        if (doingGrouping) {
            var expandByDefault: number;
            if (this.gridOptionsWrapper.isGroupSuppressRow()) {
                // 99999 means 'expand everything'
                expandByDefault = -1;
            } else {
                expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
            }
            rowsAfterGroup = this.groupCreator.group(this.allRows, groupedCols, expandByDefault);
        } else {
            rowsAfterGroup = this.allRows;
        }
        this.rowsAfterGroup = rowsAfterGroup;

        if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
            this.selectionController.updateGroupsFromChildrenSelections();
        }
    }

    private doFilter() {
        var doingFilter: boolean;

        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            doingFilter = false;
        } else {
            doingFilter = this.filterManager.isAnyFilterPresent();
        }

        var rowsAfterFilter: RowNode[];
        if (doingFilter) {
            rowsAfterFilter = this.filterItems(this.rowsAfterGroup);
        } else {
            // do it here
            rowsAfterFilter = this.rowsAfterGroup;
            this.recursivelyResetFilter(this.rowsAfterGroup);
        }

        this.rowsAfterFilter = rowsAfterFilter;
    }

    private filterItems(rowNodes: RowNode[]) {
        var result: RowNode[] = [];

        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var node = rowNodes[i];

            if (node.group) {
                // deal with group
                node.childrenAfterFilter = this.filterItems(node.children);
                if (node.childrenAfterFilter.length > 0) {
                    node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                    result.push(node);
                }
            } else {
                if (this.filterManager.doesRowPassFilter(node)) {
                    result.push(node);
                }
            }
        }

        return result;
    }

    private recursivelyResetFilter(nodes: RowNode[]) {
        if (!nodes) {
            return;
        }
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterFilter = node.children;
                this.recursivelyResetFilter(node.children);
                node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
            }
        }
    }

    // rows: the rows to put into the model
    // firstId: the first id to use, used for paging, where we are not on the first page
    public setRowData(rowData: any[], refresh: boolean, firstId?: number) {

        // place each row into a wrapper
        this.allRows = this.createRowNodesFromData(rowData, firstId);

        // if firstId provided, use it, otherwise start at 0
        //this.recursivelyAddIdToNodes(this.allRows, firstIdToUse);

        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);

        if (refresh) {
            this.refreshModel(Constants.STEP_EVERYTHING);
        }
    }

    private createRowNodesFromData(rowData: any[], firstId?: number): RowNode[] {
        if (!rowData) {
            return [];
        }

        var rowNodeId = _.exists(firstId) ? firstId : 0;

        // func below doesn't have 'this' pointer, so need to pull out these bits
        var nodeChildDetailsFunc = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        var suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        var eventService = this.eventService;
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var selectionController = this.selectionController;

        // kick off recursion
        var result = recursiveFunction(rowData, null, 0);
        return result;

        function recursiveFunction(rowData: any[], parent: RowNode, level: number): RowNode[] {
            var rowNodes: RowNode[] = [];
            rowData.forEach( (dataItem)=> {
                var node = new RowNode(eventService, gridOptionsWrapper, selectionController);
                var nodeChildDetails = nodeChildDetailsFunc ? nodeChildDetailsFunc(dataItem) : null;
                if (nodeChildDetails && nodeChildDetails.group) {
                    node.group = true;
                    node.children = recursiveFunction(nodeChildDetails.children, node, level + 1);
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

    private getTotalChildCount(rowNodes: any) {
        var count = 0;
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group) {
                count += item.allChildrenCount;
            } else {
                count++;
            }
        }
        return count;
    }

    private doRowsToDisplay() {
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        this.rowsToDisplay = [];
        this.nextRowTop = 0;
        this.recursivelyAddToRowsToDisplay(this.rowsAfterSort);
    }

    private recursivelyAddToRowsToDisplay(rowNodes: RowNode[]) {
        if (!rowNodes) {
            return;
        }
        var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        for (var i = 0; i < rowNodes.length; i++) {
            var rowNode = rowNodes[i];
            var skipGroupNode = groupSuppressRow && rowNode.group;
            if (!skipGroupNode) {
                this.addRowNodeToRowsToDisplay(rowNode);
            }
            if (rowNode.group && rowNode.expanded) {
                this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort);

                // put a footer in if user is looking for it
                if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                    var footerNode = this.createFooterNode(rowNode);
                    this.addRowNodeToRowsToDisplay(footerNode);
                }
            }
        }
    }

    // duplicated method, it's also in floatingRowModel
    private addRowNodeToRowsToDisplay(rowNode: RowNode): void {
        this.rowsToDisplay.push(rowNode);
        rowNode.rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
        rowNode.rowTop = this.nextRowTop;
        this.nextRowTop += rowNode.rowHeight;
    }

    private createFooterNode(groupNode: RowNode): RowNode {
        var footerNode = new RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
        Object.keys(groupNode).forEach(function (key) {
            (<any>footerNode)[key] = (<any>groupNode)[key];
        });
        footerNode.footer = true;
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
        return footerNode;
    }

}
