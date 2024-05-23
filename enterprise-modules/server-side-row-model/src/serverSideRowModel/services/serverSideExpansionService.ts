import type {
    IExpansionService,
    IsServerSideGroupOpenByDefaultParams,
    RowNode,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { Autowired, Bean, Events, ExpansionService } from '@ag-grid-community/core';

import type { ServerSideRowModel } from '../serverSideRowModel';

@Bean('expansionService')
export class ServerSideExpansionService extends ExpansionService implements IExpansionService {
    @Autowired('rowModel') private readonly serverSideRowModel: ServerSideRowModel;

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

    public expandRows(rowIds: string[]): void {
        rowIds.forEach((rowId) => {
            const rowNode = this.serverSideRowModel.getRowNode(rowId);
            if (rowNode) {
                rowNode.setExpanded(true);
            } else {
                this.queuedRowIds.add(rowId);
            }
        });
    }

    public expandAll(value: boolean): void {
        this.serverSideRowModel.expandAll(value);
    }

    public onGroupExpandedOrCollapsed(): void {
        // do nothing
    }
}
