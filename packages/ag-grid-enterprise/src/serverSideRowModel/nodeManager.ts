import type { RowNode, _NamedBean } from 'ag-grid-community';
import { _BeanStub, _warn } from 'ag-grid-community';

export class NodeManager extends _BeanStub implements _NamedBean {
    beanName = 'ssrmNodeManager' as const;

    private readonly rowNodes: Map<string, RowNode> = new Map();

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
