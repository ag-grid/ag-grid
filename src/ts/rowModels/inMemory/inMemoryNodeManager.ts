
import {RowNode} from "../../entities/rowNode";
import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Context, PostConstruct} from "../../context/context";
import {GetNodeChildDetails, IsRowMaster} from "../../entities/gridOptions";
import {EventService} from "../../eventService";
import {RowDataTransaction, RowNodeTransaction} from "./inMemoryRowModel";
import {ColumnController} from "../../columnController/columnController";

export class InMemoryNodeManager {

    private static TOP_LEVEL = 0;

    private rootNode: RowNode;
    private gridOptionsWrapper: GridOptionsWrapper;
    private context: Context;
    private eventService: EventService;
    private columnController: ColumnController;

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

    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService, columnController: ColumnController) {
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;
        this.columnController = columnController;

        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = InMemoryNodeManager.ROOT_NODE_ID;
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
    }

    public getCopyOfNodesMap(): {[id:string]: RowNode} {
        let result: {[id:string]: RowNode} = _.cloneObject(this.allNodesMap);
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
        let result = this.recursiveFunction(rowData, null, InMemoryNodeManager.TOP_LEVEL);

        if (this.doingLegacyTreeData) {
            this.rootNode.childrenAfterGroup = result;
            this.setLeafChildren(this.rootNode);
        } else {
            this.rootNode.allLeafChildren = result;
        }
    }

    public updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: {[id:string]: number}): RowNodeTransaction {
        if (this.isLegacyTreeData()) { return null; }

        let {add, addIndex, remove, update} = rowDataTran;

        let rowNodeTransaction: RowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };

        if (_.exists(add)) {
            let useIndex = typeof addIndex === 'number' && addIndex >= 0;
            if (useIndex) {
                // items get inserted in reverse order for index insertion
                add.reverse().forEach( item => {
                    let newRowNode: RowNode = this.addRowNode(item, addIndex);
                    rowNodeTransaction.add.push(newRowNode);
                });
            } else {
                add.forEach( item => {
                    let newRowNode: RowNode = this.addRowNode(item);
                    rowNodeTransaction.add.push(newRowNode);
                });
            }
        }

        if (_.exists(remove)) {
            remove.forEach( item => {
                let removedRowNode: RowNode = this.updatedRowNode(item, false);
                if (removedRowNode) {
                    rowNodeTransaction.remove.push(removedRowNode);
                }
            });
        }

        if (_.exists(update)) {
            update.forEach( item => {
                let updatedRowNode: RowNode = this.updatedRowNode(item, true);
                if (updatedRowNode) {
                    rowNodeTransaction.update.push(updatedRowNode);
                }
            });
        }

        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }

        return rowNodeTransaction;
    }

    private addRowNode(data: any, index?: number): RowNode {

        let newNode = this.createNode(data, null, InMemoryNodeManager.TOP_LEVEL);

        if (_.exists(index)) {
            _.insertIntoArray(this.rootNode.allLeafChildren, newNode, index);
        } else {
            this.rootNode.allLeafChildren.push(newNode);
        }

        return newNode;
    }

    private updatedRowNode(data: any, update: boolean): RowNode {
        let rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();

        let rowNode: RowNode;
        if (_.exists(rowNodeIdFunc)) {
            // find rowNode using id
            let id: string = rowNodeIdFunc(data);
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

        if (update) {
            // do update
            rowNode.updateData(data);
        } else {
            // do delete
            rowNode.setSelected(false);
            _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            this.allNodesMap[rowNode.id] = undefined;
        }

        return rowNode;
    }

    private recursiveFunction(rowData: any[], parent: RowNode, level: number): RowNode[] {

        // make sure the rowData is an array and not a string of json - this was a commonly reported problem on the forum
        if (typeof rowData === 'string') {
            console.warn('ag-Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }

        let rowNodes: RowNode[] = [];
        rowData.forEach( (dataItem)=> {
            let node = this.createNode(dataItem, parent, level);
            rowNodes.push(node);
        });
        return rowNodes;
    }

    private createNode(dataItem: any, parent: RowNode, level: number): RowNode {
        let node = new RowNode();
        this.context.wireBean(node);

        let doingTreeData = this.gridOptionsWrapper.isTreeData();
        let doingLegacyTreeData = !doingTreeData && _.exists(this.getNodeChildDetails);

        let nodeChildDetails = doingLegacyTreeData ? this.getNodeChildDetails(dataItem) : null;

        if (nodeChildDetails && nodeChildDetails.group) {
            node.group = true;
            node.childrenAfterGroup = this.recursiveFunction(nodeChildDetails.children, node, level + 1);
            node.expanded = nodeChildDetails.expanded === true;
            node.field = nodeChildDetails.field;
            node.key = nodeChildDetails.key;
            node.canFlower = node.master; // deprecated, is now 'master'
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
                node.expanded = node.master ? this.isExpanded(level) : false;
            }
        }

        // support for backwards compatibility, canFlow is now called 'master'
        node.canFlower = node.master;

        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());

        this.allNodesMap[node.id] = node;

        this.nextId++;

        return node;
    }

    private isExpanded(level: any) {
        let expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        if (expandByDefault===-1) {
            return true;
        } else {
            return level < expandByDefault;
        }
    }

    // this is only used for doing legacy tree data
    private setLeafChildren(node: RowNode): void {
        node.allLeafChildren = [];
        if (node.childrenAfterGroup) {
            node.childrenAfterGroup.forEach( childAfterGroup => {
                if (childAfterGroup.group) {
                    if (childAfterGroup.allLeafChildren) {
                        childAfterGroup.allLeafChildren.forEach( leafChild => node.allLeafChildren.push(leafChild) );
                    }
                } else {
                    node.allLeafChildren.push(childAfterGroup)
                }
            });
        }
    }

    public insertItemsAtIndex(index: number, rowData: any[]): RowNode[] {
        if (this.isLegacyTreeData()) { return null; }

        let nodeList = this.rootNode.allLeafChildren;

        if (index > nodeList.length) {
            console.warn(`ag-Grid: invalid index ${index}, max index is ${nodeList.length}`);
            return;
        }

        let newNodes: RowNode[] = [];
        // go through the items backwards, otherwise they get added in reverse order
        for (let i = rowData.length - 1; i >= 0; i--) {
            let data = rowData[i];
            let newNode = this.createNode(data, null, InMemoryNodeManager.TOP_LEVEL);
            _.insertIntoArray(nodeList, newNode, index);
            newNodes.push(newNode);
        }

        return newNodes.length > 0 ? newNodes : null;
    }

    public addItems(items: any): RowNode[] {
        let nodeList = this.rootNode.allLeafChildren;
        return this.insertItemsAtIndex(nodeList.length, items);
    }

    public isLegacyTreeData(): boolean {
        let rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            console.warn('ag-Grid: adding and removing rows is not supported when using nodeChildDetailsFunc, ie it is not ' +
                'supported for legacy tree data. Please see the docs on the new preferred way of providing tree data that works with delta updates.');
            return true;
        } else {
            return false;
        }
    }
}
