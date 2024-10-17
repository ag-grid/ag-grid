import type { NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub, _warn } from 'ag-grid-community';

export class NodeManager extends BeanStub implements NamedBean {
    beanName = 'ssrmNodeManager' as const;

    private rowNodes: { [id: string]: RowNode | undefined } = {};

    public addRowNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes[id]) {
            _warn(187, {
                rowId: id,
                firstData: this.rowNodes[id]!.data,
                secondData: rowNode.data,
            });
        }

        this.rowNodes[id] = rowNode;
    }

    public removeNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    }

    public override destroy(): void {
        this.clear();
        super.destroy();
    }

    public clear(): void {
        this.rowNodes = {};
        super.destroy();
    }
}
