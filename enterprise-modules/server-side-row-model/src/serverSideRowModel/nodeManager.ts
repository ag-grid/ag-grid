import { Bean, RowNode, PreDestroy } from "@ag-grid-community/core";

@Bean('ssrmNodeManager')
export class NodeManager {

    private rowNodes: {[id: string]: RowNode | undefined } = {};

    public addRowNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes[id]) {
            debugger;
            console.warn(`AG Grid: Duplicate node id ${rowNode.id}. Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.`);
            console.warn('first instance', this.rowNodes[id]!.data);
            console.warn('second instance', rowNode.data);
        }

        this.rowNodes[id] = rowNode;
    }

    public removeNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    }

    @PreDestroy
    public clear(): void {
        this.rowNodes = {};
    }

}