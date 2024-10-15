import type { NamedBean } from '../context/bean';
import type { RowNode } from '../entities/rowNode';
import { AbstractClientSideNodeManager } from './abstractClientSideNodeManager';

export class ClientSideNodeManager<TData> extends AbstractClientSideNodeManager<TData> implements NamedBean {
    beanName = 'clientSideNodeManager' as const;

    public setMasterForAllRows(rows: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void {
        this.beans.detailGridApiService?.setMasterForAllRows(rows, shouldSetExpanded);
    }
}
