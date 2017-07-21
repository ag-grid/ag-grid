import {RowNode} from "../../entities/rowNode";
import {Column} from "../../entities/column";

export class ChangedPath {

    private keepingColumns: boolean;

    private nodeIdsToBoolean: {[nodeId:string]: boolean} = {};

    private nodeIdsToColumns: {[nodeId:string]: {[colId:string]:boolean}} = {};

    public constructor(keepingColumns: boolean) {
        this.keepingColumns = keepingColumns;
    }

    public addParentNode(rowNode: RowNode, columns?: Column[]): void {
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
        return this.nodeIdsToBoolean[rowNode.id];
    }

    public getValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[] {
        if (!this.keepingColumns) { return valueColumns; }

        let colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        let result = valueColumns.filter( col => colsForThisNode[col.getId()]);
        return result;
    }

    public getNotValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[] {
        if (!this.keepingColumns) { return null; }

        let colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        let result = valueColumns.filter( col => !colsForThisNode[col.getId()]);
        return result;
    }

}
