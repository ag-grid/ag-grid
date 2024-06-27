import type { NamedBean, RowNode } from '@ag-grid-community/core';
import { BeanStub, _warnOnce } from '@ag-grid-community/core';

export class NodeManager extends BeanStub implements NamedBean {
    beanName = 'ssrmNodeManager' as const;

    private rowNodes: { [id: string]: RowNode | undefined } = {};

    public addRowNode(rowNode: RowNode): void {
        const id = rowNode.id!;
        if (this.rowNodes[id]) {
            _warnOnce(
                `Duplicate node id ${rowNode.id}. Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.`
            );
            _warnOnce('first instance', this.rowNodes[id]!.data);
            _warnOnce('second instance', rowNode.data);
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
