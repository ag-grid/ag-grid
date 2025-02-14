import type { NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub, _warn } from 'ag-grid-community';

export class NodeManager extends BeanStub implements NamedBean {
    beanName = 'ssrmNodeManager' as const;

    private rowNodes: Map<string, RowNode> = new Map();

    public addRowNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes.has(id)) {
            _warn(187, {
                rowId: id,
                firstData: this.rowNodes.get(id)!.data,
                secondData: rowNode.data,
            });
        }

        this.rowNodes.set(id, rowNode);
    }

    public removeNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        this.rowNodes.delete(id);
    }

    public override destroy(): void {
        this.clear();
        super.destroy();
    }

    public clear(): void {
        this.rowNodes.clear();
        super.destroy();
    }
}
