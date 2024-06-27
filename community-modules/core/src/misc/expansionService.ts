import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import { ClientSideRowModelSteps } from '../interfaces/iClientSideRowModel';
import type { IExpansionService } from '../interfaces/iExpansionService';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNode } from '../interfaces/iRowNode';

export class ExpansionService extends BeanStub implements NamedBean, IExpansionService {
    beanName = 'expansionService' as const;

    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
    }

    private isClientSideRowModel: boolean;

    public postConstruct(): void {
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';
    }

    public expandRows(rowIds: string[]): void {
        if (!this.isClientSideRowModel) {
            return;
        }

        const rowIdSet = new Set(rowIds);
        this.rowModel.forEachNode((node) => {
            if (node.id && rowIdSet.has(node.id)) {
                node.expanded = true;
            }
        });
        this.onGroupExpandedOrCollapsed();
    }

    public getExpandedRows(): string[] {
        const expandedRows: string[] = [];
        this.rowModel.forEachNode(({ expanded, id }) => {
            if (expanded && id) {
                expandedRows.push(id);
            }
        });
        return expandedRows;
    }

    public expandAll(value: boolean): void {
        if (!this.isClientSideRowModel) {
            return;
        }
        (this.rowModel as IClientSideRowModel).expandOrCollapseAll(value);
    }

    public setRowNodeExpanded(
        rowNode: IRowNode,
        expanded: boolean,
        expandParents?: boolean,
        forceSync?: boolean
    ): void {
        if (rowNode) {
            // expand all parents recursively, except root node.
            if (expandParents && rowNode.parent && rowNode.parent.level !== -1) {
                this.setRowNodeExpanded(rowNode.parent, expanded, expandParents, forceSync);
            }

            rowNode.setExpanded(expanded, undefined, forceSync);
        }
    }

    public onGroupExpandedOrCollapsed(): void {
        if (!this.isClientSideRowModel) {
            return;
        }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        (this.rowModel as IClientSideRowModel).refreshModel({ step: ClientSideRowModelSteps.MAP });
    }
}
