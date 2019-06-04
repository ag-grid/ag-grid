import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Context } from "../../context/context";
import { GetNodeChildDetails, IsRowMaster } from "../../entities/gridOptions";
import { EventService } from "../../eventService";
import { RowDataTransaction, RowNodeTransaction } from "./clientSideRowModel";
import { ColumnController } from "../../columnController/columnController";
import { Events, SelectionChangedEvent } from "../../events";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnApi";
import { SelectionController } from "../../selectionController";
import { _ } from "../../utils";

export class ClientSideNodeManager {

    private static TOP_LEVEL = 0;

    private rootNode: RowNode;
    private gridOptionsWrapper: GridOptionsWrapper;
    private context: Context;
    private eventService: EventService;
    private columnController: ColumnController;
    private selectionController: SelectionController;

    private nextId = 0;

    private static ROOT_NODE_ID = 'ROOT_NODE_ID';

    private getNodeChildDetails: GetNodeChildDetails;
    private doesDataFlower: (data: any) => boolean;
    private isRowMasterFunc: IsRowMaster;
    private suppressParentsInRowNodes: boolean;

    private doingLegacyTreeData: boolean;
    private doingMasterDetail: boolean;

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: {[id:string]: RowNode} = {};
    private columnApi: ColumnApi;
    private gridApi: GridApi;

    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService,
                columnController: ColumnController, gridApi: GridApi, columnApi: ColumnApi,
                selectionController: SelectionController) {
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;
        this.columnController = columnController;
        this.gridApi = gridApi;
        this.columnApi = columnApi;
        this.selectionController = selectionController;

        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = ClientSideNodeManager.ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterFilter = [];

        // if we make this class a bean, then can annotate postConstruct
        this.postConstruct();
    }

    // @PostConstruct - this is not a bean, so postConstruct called by constructor
    public postConstruct(): void {
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.getNodeChildDetails = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        this.suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.doesDataFlower = this.gridOptionsWrapper.getDoesDataFlowerFunc();
        this.isRowMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();

        this.doingLegacyTreeData = _.exists(this.getNodeChildDetails);
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();

        if (this.getNodeChildDetails) {
            console.warn(`ag-Grid: the callback nodeChildDetailsFunc() is now deprecated. The new way of doing
                                    tree data in ag-Grid was introduced in v14 (released November 2017). In the next
                                    major release of ag-Grid we will be dropping support for the old version of
                                    tree data. If you are reading this message, please go to the docs to see how
                                    to implement Tree Data without using nodeChildDetailsFunc().`);
        }
    }

    public getCopyOfNodesMap(): {[id:string]: RowNode} {
        const result: {[id:string]: RowNode} = _.cloneObject(this.allNodesMap);
        return result;
    }

    public getRowNode(id: string): RowNode {
        return this.allNodesMap[id];
    }

    public setRowData(rowData: any[]): RowNode[] {

        this.rootNode.childrenAfterFilter = null;
        this.rootNode.childrenAfterGroup = null;
        this.rootNode.childrenAfterSort = null;
        this.rootNode.childrenMapped = null;

        this.nextId = 0;
        this.allNodesMap = {};

        if (!rowData) {
            this.rootNode.allLeafChildren = [];
            this.rootNode.childrenAfterGroup = [];
            return;
        }

        // kick off recursion
        // we add rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
        // sets the parent node on each row (even if we are not grouping). so setting parent node
        // here is for benefit of ag-grid-community users
        const result = this.recursiveFunction(rowData, this.rootNode, ClientSideNodeManager.TOP_LEVEL);

        if (this.doingLegacyTreeData) {
            this.rootNode.childrenAfterGroup = result;
            this.setLeafChildren(this.rootNode);
        } else {
            this.rootNode.allLeafChildren = result;
        }
    }

    public updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {[id:string]: number} | null | undefined): RowNodeTransaction | null {
        if (this.isLegacyTreeData()) { return null; }

        const {add, addIndex, remove, update} = rowDataTran;

        const rowNodeTransaction: RowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };

        this.executeAdd(rowDataTran, rowNodeTransaction);
        this.executeRemove(rowDataTran, rowNodeTransaction);
        this.executeUpdate(rowDataTran, rowNodeTransaction);

        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }

        return rowNodeTransaction;
    }

    private executeAdd(rowDataTran: RowDataTransaction, rowNodeTransaction: RowNodeTransaction): void {
        const {add, addIndex} = rowDataTran;
        if (!add) { return; }

        const useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add.reverse().forEach(item => {
                const newRowNode: RowNode = this.addRowNode(item, addIndex);
                rowNodeTransaction.add.push(newRowNode);
            });
        } else {
            add.forEach(item => {
                const newRowNode: RowNode = this.addRowNode(item);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
    }

    private executeRemove(rowDataTran: RowDataTransaction, rowNodeTransaction: RowNodeTransaction): void {
        const {remove} = rowDataTran;

        if (!remove) { return; }

        const rowIdsRemoved: {[key: string]: boolean} = {};
        let anyNodesSelected = false;

        remove.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            if (rowNode.isSelected()) {
                anyNodesSelected = true;
            }

            // do delete - setting 'tailingNodeInSequence = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            rowNode.setSelected(false, false, true);

            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTop();

            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id];

            rowNodeTransaction.remove.push(rowNode);
        });

        this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter(rowNode => !rowIdsRemoved[rowNode.id]);

        if (anyNodesSelected) {
            this.selectionController.updateGroupsFromChildrenSelections();
            const event: SelectionChangedEvent = {
                type: Events.EVENT_SELECTION_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    private executeUpdate(rowDataTran: RowDataTransaction, rowNodeTransaction: RowNodeTransaction): void {
        const {update} = rowDataTran;
        if (!update) { return; }

        update.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            rowNode.updateData(item);

            rowNodeTransaction.update.push(rowNode);
        });
    }

    private addRowNode(data: any, index?: number): RowNode {

        const newNode = this.createNode(data, this.rootNode, ClientSideNodeManager.TOP_LEVEL);

        if (_.exists(index)) {
            _.insertIntoArray(this.rootNode.allLeafChildren, newNode, index);
        } else {
            this.rootNode.allLeafChildren.push(newNode);
        }

        return newNode;
    }

    private lookupRowNode(data: any): RowNode {
        const rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();

        let rowNode: RowNode;
        if (_.exists(rowNodeIdFunc)) {
            // find rowNode using id
            const id: string = rowNodeIdFunc(data);
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error(`ag-Grid: could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = _.find(this.rootNode.allLeafChildren, rowNode => rowNode.data === data);
            if (!rowNode) {
                console.error(`ag-Grid: could not find data item as object was not found`, data);
                return null;
            }
        }

        return rowNode;
    }

    private recursiveFunction(rowData: any[], parent: RowNode, level: number): RowNode[] {

        // make sure the rowData is an array and not a string of json - this was a commonly reported problem on the forum
        if (typeof rowData === 'string') {
            console.warn('ag-Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }

        const rowNodes: RowNode[] = [];
        rowData.forEach((dataItem) => {
            const node = this.createNode(dataItem, parent, level);
            rowNodes.push(node);
        });
        return rowNodes;
    }

    private createNode(dataItem: any, parent: RowNode, level: number): RowNode {
        const node = new RowNode();
        this.context.wireBean(node);

        const doingTreeData = this.gridOptionsWrapper.isTreeData();
        const doingLegacyTreeData = !doingTreeData && _.exists(this.getNodeChildDetails);

        const nodeChildDetails = doingLegacyTreeData ? this.getNodeChildDetails(dataItem) : null;

        if (nodeChildDetails && nodeChildDetails.group) {
            node.group = true;
            node.childrenAfterGroup = this.recursiveFunction(nodeChildDetails.children, node, level + 1);
            node.expanded = nodeChildDetails.expanded === true;
            node.field = nodeChildDetails.field;
            node.key = nodeChildDetails.key;
            /** @deprecated is now 'master' */
            node.canFlower = node.master;
            // pull out all the leaf children and add to our node
            this.setLeafChildren(node);
        } else {

            node.group = false;

            if (doingTreeData) {
                node.master = false;
                node.expanded = false;
            } else {
                // this is the default, for when doing grid data
                if (this.doesDataFlower) {
                    node.master = this.doesDataFlower(dataItem);
                } else if (this.doingMasterDetail) {
                    // if we are doing master detail, then the
                    // default is that everything can flower.
                    if (this.isRowMasterFunc) {
                        node.master = this.isRowMasterFunc(dataItem);
                    } else {
                        node.master = true;
                    }
                } else {
                    node.master = false;
                }

                const rowGroupColumns = this.columnController.getRowGroupColumns();
                const numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;

                // need to take row group into account when determining level
                const masterRowLevel = level + numRowGroupColumns;

                node.expanded = node.master ? this.isExpanded(masterRowLevel) : false;
            }
        }

        // support for backwards compatibility, canFlow is now called 'master'
        node.canFlower = node.master;

        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());

        if (this.allNodesMap[node.id]) {
            console.warn(`ag-grid: duplicate node id '${node.id}' detected from getRowNodeId callback, this could cause issues in your grid.`);
        }
        this.allNodesMap[node.id] = node;

        this.nextId++;

        return node;
    }

    private isExpanded(level: any) {
        const expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        if (expandByDefault === -1) {
            return true;
        } else {
            return level < expandByDefault;
        }
    }

    // this is only used for doing legacy tree data
    private setLeafChildren(node: RowNode): void {
        node.allLeafChildren = [];
        if (node.childrenAfterGroup) {
            node.childrenAfterGroup.forEach(childAfterGroup => {
                if (childAfterGroup.group) {
                    if (childAfterGroup.allLeafChildren) {
                        childAfterGroup.allLeafChildren.forEach(leafChild => node.allLeafChildren.push(leafChild));
                    }
                } else {
                    node.allLeafChildren.push(childAfterGroup);
                }
            });
        }
    }

    public isLegacyTreeData(): boolean {
        const rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            console.warn('ag-Grid: adding and removing rows is not supported when using nodeChildDetailsFunc, ie it is not ' +
                'supported for legacy tree data. Please see the docs on the new preferred way of providing tree data that works with delta updates.');
            return true;
        } else {
            return false;
        }
    }
}
