import { Bean, RowNode, PreDestroy } from "@ag-grid-community/core";

@Bean('ssrmNodeManager')
export class NodeManager {

    private rowNodes: {[id: string]: RowNode | undefined } = {};

    public addRowNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes[id]) {
            console.warn('AG Grid: duplicate node id ' + rowNode.id);
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