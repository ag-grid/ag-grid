import type {
    BeanCollection,
    IExpansionService,
    IsServerSideGroupOpenByDefaultParams,
    NamedBean,
    RowNode,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { Events, ExpansionService } from '@ag-grid-community/core';

import type { ServerSideRowModel } from '../serverSideRowModel';

export class ServerSideExpansionService extends ExpansionService implements NamedBean, IExpansionService {
    override beanName = 'expansionService' as const;

    private serverSideRowModel: ServerSideRowModel;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    private queuedRowIds: Set<string> = new Set();

    public override postConstruct(): void {
        super.postConstruct();
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => {
            this.queuedRowIds.clear();
        });
    }

    public checkOpenByDefault(rowNode: RowNode): void {
        if (!rowNode.isExpandable()) {
            return;
        }

        if (this.queuedRowIds.has(rowNode.id!)) {
            this.queuedRowIds.delete(rowNode.id!);
            rowNode.setExpanded(true);
            return;
        }

        const userFunc = this.gos.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }

        const params: WithoutGridCommon<IsServerSideGroupOpenByDefaultParams> = {
            data: rowNode.data,
            rowNode,
        };

        const userFuncRes = userFunc(params);

        if (userFuncRes) {
            rowNode.setExpanded(true);
        }
    }

    public override expandRows(rowIds: string[]): void {
        rowIds.forEach((rowId) => {
            const rowNode = this.serverSideRowModel.getRowNode(rowId);
            if (rowNode) {
                rowNode.setExpanded(true);
            } else {
                this.queuedRowIds.add(rowId);
            }
        });
    }

    public override expandAll(value: boolean): void {
        this.serverSideRowModel.expandAll(value);
    }

    public override onGroupExpandedOrCollapsed(): void {
        // do nothing
    }
}
