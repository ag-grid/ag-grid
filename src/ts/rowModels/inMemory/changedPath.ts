import {RowNode} from "../../entities/rowNode";
import {Column} from "../../entities/column";

export class ChangedPath {

    private active = true;

    private keepingColumns: boolean;

    private nodeIdsToBoolean: {[nodeId:string]: boolean} = {};

    private nodeIdsToColumns: {[nodeId:string]: {[colId:string]:boolean}} = {};

    public constructor(keepingColumns: boolean) {
        this.keepingColumns = keepingColumns;
    }

    public setInactive(): void {
        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    public addParentNode(rowNode: RowNode, columns?: Column[]): void {
        this.validateActive();

        let pointer = rowNode;

        while (pointer) {
            // add this item to the path, all the way to parent
            this.nodeIdsToBoolean[pointer.id] = true;

            // if columns, add the columns in all the way to parent, merging
            // in any other columns that might be there already
            if (this.keepingColumns && columns) {
                if (!this.nodeIdsToColumns[pointer.id]) {
                    this.nodeIdsToColumns[pointer.id] = {};
                }
                columns.forEach( col => this.nodeIdsToColumns[pointer.id][col.getId()] = true );
            }

            pointer = pointer.parent;
        }
    }

    public isInPath(rowNode: RowNode): boolean {
        this.validateActive();
        return this.nodeIdsToBoolean[rowNode.id];
    }

    public getValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[] {
        this.validateActive();
        if (!this.keepingColumns) { return valueColumns; }

        let colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        let result = valueColumns.filter( col => colsForThisNode[col.getId()]);
        return result;
    }

    public getNotValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[] {
        this.validateActive();
        if (!this.keepingColumns) { return null; }

        let colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        let result = valueColumns.filter( col => !colsForThisNode[col.getId()]);
        return result;
    }

    // this is to check for a bug in our code. each part that uses ChangePath should check
    // if it is valid first, and not use it if it is not valid
    private validateActive(): void {
        if (!this.active) {
            throw "ag-Grid: tried to work on an invalid changed path";
        }
    }

}
