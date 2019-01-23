import { RowNode } from "../../entities/rowNode";
import { Column } from "../../entities/column";
import {_} from "../../utils";

export class ChangedPath {

    private readonly keepingColumns: boolean;

    private active = true;

    private nodeIdsToColumns: {[nodeId:string]: {[colId:string]:boolean}} = {};

    private pathRoot: PathItem;
    private mapToItems: {[id: string]: PathItem} = {};

    public constructor(keepingColumns: boolean, rootNode: RowNode) {
        this.keepingColumns = keepingColumns;

        this.pathRoot = {
            rowNode: rootNode,
            children: null
        };
        this.mapToItems[rootNode.id] = this.pathRoot;
    }

    // can be set inactive by:
    // a) ClientSideRowModel, if no transactions or
    // b) PivotService, if secondary columns changed
    public setInactive(): void {
        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    private depthFirstSearchChangedPath(pathItem: PathItem, callback: (rowNode: RowNode)=>void): void {
        if (pathItem.children) {
            for (let i = 0; i<pathItem.children.length; i++) {
                this.depthFirstSearchChangedPath(pathItem.children[i], callback);
            }
        }
        callback(pathItem.rowNode);
    }

    private depthFirstSearchEverything(rowNode: RowNode, callback: (rowNode: RowNode)=>void, traverseEverything: boolean): void {
        if (rowNode.childrenAfterGroup) {
            for (let i = 0; i<rowNode.childrenAfterGroup.length; i++) {
                let childNode = rowNode.childrenAfterGroup[i];
                if (childNode.childrenAfterGroup) {
                    this.depthFirstSearchEverything(rowNode.childrenAfterGroup[i], callback, traverseEverything);
                } else if (traverseEverything) {
                    callback(childNode);
                }
            }
        }
        callback(rowNode);
    }

    // traverseLeafNodes -> used when NOT doing changed path, ie traversing everything. the callback
    // will be called for child nodes in addition to parent nodes.
    public forEachChangedNodeDepthFirst(callback: (rowNode: RowNode)=>void, traverseLeafNodes = false): void {
        if (this.active) {
            this.depthFirstSearchChangedPath(this.pathRoot, callback);
        } else {
            this.depthFirstSearchEverything(this.pathRoot.rowNode, callback, traverseLeafNodes);
        }
    }

    private createPathItems(rowNode: RowNode): number {
        let pointer = rowNode;
        let newEntryCount = 0;
        while (!this.mapToItems[pointer.id]) {
            let newEntry: PathItem = {
                rowNode: pointer,
                children: null
            };
            this.mapToItems[pointer.id] = newEntry;
            newEntryCount++;
            pointer = pointer.parent;
        }
        return newEntryCount;
    }

    private populateColumnsMap(rowNode: RowNode, columns: Column[]): void {
        let pointer = rowNode;
        while (pointer) {

            // if columns, add the columns in all the way to parent, merging
            // in any other columns that might be there already
            if (this.keepingColumns && columns) {
                if (!this.nodeIdsToColumns[pointer.id]) {
                    this.nodeIdsToColumns[pointer.id] = {};
                }
                columns.forEach(col => this.nodeIdsToColumns[pointer.id][col.getId()] = true);
            }

            pointer = pointer.parent;
        }
    }

    private linkPathItems(rowNode: RowNode, newEntryCount: number): void {
        let pointer = rowNode;
        for (let i = 0; i<newEntryCount; i++) {
            let thisItem = this.mapToItems[pointer.id];;
            let parentItem = this.mapToItems[pointer.parent.id];
            if (!parentItem.children) {
                parentItem.children = [];
            }
            parentItem.children.push(thisItem);
            pointer = pointer.parent;
        }
    }

    // used by change detection (provides cols) and groupStage (doesn't provide cols)
    public addParentNode(rowNode: RowNode | null, columns?: Column[]): void {
        this.validateActive();

        // we cannot do  both steps below in the same loop as
        // the second loop has a dependency on the first loop.
        // ie the hierarchy cannot be stitched up yet because
        // we don't have it built yet

        // step one - create the new PathItem objects.
        let newEntryCount = this.createPathItems(rowNode);

        // step two - link in the node items
        this.linkPathItems(rowNode, newEntryCount);

        // step 3 - update columns
        this.populateColumnsMap(rowNode, columns);
    }

    public canSkip(rowNode: RowNode): boolean {
        return this.active && !this.mapToItems[rowNode.id];
    }

    public getValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[] {
        this.validateActive();
        if (!this.keepingColumns) { return valueColumns; }

        const colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        const result = valueColumns.filter(col => colsForThisNode[col.getId()]);
        return result;
    }

    public getNotValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[] {
        this.validateActive();
        if (!this.keepingColumns) { return null; }

        const colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        const result = valueColumns.filter(col => !colsForThisNode[col.getId()]);
        return result;
    }

    // this is to check for a bug in our code. each part that uses ChangePath should check
    // if it is valid first, and not use it if it is not valid
    private validateActive(): void {
        if (!this.active) {
            throw new Error("ag-Grid: tried to work on an invalid changed path");
        }
    }
}


interface PathItem {
    rowNode: RowNode;
    children: PathItem[];
}
