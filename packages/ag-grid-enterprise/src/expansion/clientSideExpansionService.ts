import type { BeanCollection, IClientSideRowModel, IExpansionService, NamedBean } from 'ag-grid-community';
import { BeanStub, ClientSideRowModelSteps } from 'ag-grid-community';

export class ClientSideExpansionService extends BeanStub implements NamedBean, IExpansionService {
    beanName = 'expansionService' as const;

    private rowModel: IClientSideRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel as IClientSideRowModel;
    }

    public expandRows(rowIds: string[]): void {
        const rowIdSet = new Set(rowIds);
        this.rowModel.forEachNode((node) => {
            if (node.id && rowIdSet.has(node.id)) {
                node.expanded = true;
            }
        });
        this.onGroupExpandedOrCollapsed();
    }

    public expandAll(value: boolean): void {
        this.rowModel.expandOrCollapseAll(value);
    }

    public onGroupExpandedOrCollapsed(): void {
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.rowModel.refreshModel({ step: ClientSideRowModelSteps.MAP });
    }
}
