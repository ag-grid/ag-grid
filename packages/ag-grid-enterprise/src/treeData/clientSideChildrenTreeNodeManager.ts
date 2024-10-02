import type { IClientSideNodeManager, NamedBean, RowNode } from 'ag-grid-community';
import { AbstractClientSideNodeManager } from 'ag-grid-community';

import { makeFieldPathGetter } from './fieldAccess';
import type { DataFieldGetter } from './fieldAccess';

export class ClientSideChildrenTreeNodeManager<TData>
    extends AbstractClientSideNodeManager<TData>
    implements IClientSideNodeManager<TData>, NamedBean
{
    beanName = 'clientSideChildrenTreeNodeManager' as const;

    private childrenGetter: DataFieldGetter;

    public override initRootNode(rootRowNode: RowNode<TData>): void {
        const oldChildrenGetter = this.childrenGetter;
        const childrenField = this.gos.get('treeDataChildrenField');
        if (!oldChildrenGetter || oldChildrenGetter.path !== childrenField) {
            this.childrenGetter = makeFieldPathGetter(childrenField);
        }

        super.initRootNode(rootRowNode);
    }

    public setMasterForAllRows(rows: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void {
        this.beans.detailGridApiService?.setMasterForAllRows(rows, shouldSetExpanded);
    }

    protected override createRowNode(data: TData, sourceRowIndex: number): RowNode<TData> {
        const node = super.createRowNode(data, sourceRowIndex);
        if (!this.gos.get('treeData')) {
            this.beans.detailGridApiService?.setMasterForRow(node, data, true);
        }
        return node;
    }
}
