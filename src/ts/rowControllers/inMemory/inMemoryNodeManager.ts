
import {RowNode} from "../../entities/rowNode";
import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Context} from "../../context/context";
import {GetNodeChildDetails} from "../../entities/gridOptions";
import {EventService} from "../../eventService";

export class InMemoryNodeManager {

    private static TOP_LEVEL = 0;

    private rootNode: RowNode;
    private gridOptionsWrapper: GridOptionsWrapper;
    private context: Context;
    private eventService: EventService;

    private nextId = 0;

    private getNodeChildDetails: GetNodeChildDetails;
    private doesDataFlower: (data: any) => boolean;
    private suppressParentsInRowNodes: boolean;

    constructor(rootNode: RowNode, gridOptionsWrapper: GridOptionsWrapper, context: Context, eventService: EventService) {
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;

        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterFilter = [];
    }

    public setRowData(rowData: any[], firstId?: number): RowNode[] {

        this.rootNode.childrenAfterFilter = null;
        this.rootNode.childrenAfterGroup = null;
        this.rootNode.childrenAfterSort = null;
        this.rootNode.childrenMapped = null;

        this.nextId = _.exists(firstId) ? firstId : 0;

        if (!rowData) {
            this.rootNode.allLeafChildren = [];
            this.rootNode.childrenAfterGroup = [];
            return;
        }

        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.getNodeChildDetails = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        this.suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.doesDataFlower = this.gridOptionsWrapper.getDoesDataFlowerFunc();

        var rowsAlreadyGrouped = _.exists(this.getNodeChildDetails);

        // kick off recursion
        var result = this.recursiveFunction(rowData, null, InMemoryNodeManager.TOP_LEVEL);

        if (rowsAlreadyGrouped) {
            this.rootNode.childrenAfterGroup = result;
            this.setLeafChildren(this.rootNode);
        } else {
            this.rootNode.allLeafChildren = result;
        }
    }

    private recursiveFunction(rowData: any[], parent: RowNode, level: number): RowNode[] {

        // make sure the rowData is an array and not a string of json - this was a commonly reported problem on the forum
        if (typeof rowData === 'string') {
            console.warn('ag-Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }

        var rowNodes: RowNode[] = [];
        rowData.forEach( (dataItem)=> {
            var node = this.createNode(dataItem, parent, level);

            var nodeChildDetails = this.getNodeChildDetails ? this.getNodeChildDetails(dataItem) : null;
            if (nodeChildDetails && nodeChildDetails.group) {
                node.group = true;
                node.childrenAfterGroup = this.recursiveFunction(nodeChildDetails.children, node, level + 1);
                node.expanded = nodeChildDetails.expanded === true;
                node.field = nodeChildDetails.field;
                node.key = nodeChildDetails.key;
                // pull out all the leaf children and add to our node
                this.setLeafChildren(node);
            }

            rowNodes.push(node);
        });
        return rowNodes;
    }

    private createNode(dataItem: any, parent: RowNode, level: number): RowNode {
        var node = new RowNode();
        this.context.wireBean(node);
        var nodeChildDetails = this.getNodeChildDetails ? this.getNodeChildDetails(dataItem) : null;
        if (nodeChildDetails && nodeChildDetails.group) {
            node.group = true;
            node.childrenAfterGroup = this.recursiveFunction(nodeChildDetails.children, node, level + 1);
            node.expanded = nodeChildDetails.expanded === true;
            node.field = nodeChildDetails.field;
            node.key = nodeChildDetails.key;
            node.canFlower = false;
            // pull out all the leaf children and add to our node
            this.setLeafChildren(node);
        } else {
            node.group = false;
            node.canFlower = this.doesDataFlower ? this.doesDataFlower(dataItem) : false;
            if (node.canFlower) {
                node.expanded = false;
            }
        }

        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());

        this.nextId++;

        return node;
    }

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
        if (this.isRowsAlreadyGrouped()) { return null; }

        var nodeList = this.rootNode.allLeafChildren;

        if (index > nodeList.length) {
            console.warn(`ag-Grid: invalid index ${index}, max index is ${nodeList.length}`);
            return;
        }

        var newNodes: RowNode[] = [];
        rowData.forEach( (data) => {
            var newNode = this.createNode(data, null, InMemoryNodeManager.TOP_LEVEL);
            _.insertIntoArray(nodeList, newNode, index);
             newNodes.push(newNode);
        });

        return newNodes.length > 0 ? newNodes : null;
    }

    public removeItems(rowNodes: RowNode[]): RowNode[] {
        if (this.isRowsAlreadyGrouped()) { return; }

        var nodeList = this.rootNode.allLeafChildren;

        var removedNodes: RowNode[] = [];
        rowNodes.forEach( rowNode => {
            var indexOfNode = nodeList.indexOf(rowNode);
            if (indexOfNode>=0) {
                rowNode.setSelected(false);
                nodeList.splice(indexOfNode, 1);
            }
            removedNodes.push(rowNode);
        });

        return removedNodes.length > 0 ? removedNodes : null;
    }

    public addItems(items: any): RowNode[] {
        var nodeList = this.rootNode.allLeafChildren;
        return this.insertItemsAtIndex(nodeList.length, items);
    }

    public isRowsAlreadyGrouped(): boolean {
        var rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            console.warn('ag-Grid: adding and removing rows is not supported when using nodeChildDetailsFunc, ie it is not ' +
                'supported if providing groups');
            return true;
        } else {
            return false;
        }
    }
}