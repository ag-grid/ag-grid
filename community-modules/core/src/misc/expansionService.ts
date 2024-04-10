import { BeanStub } from "../context/beanStub";
import { Bean, PostConstruct } from "../context/context";
import { ClientSideRowModelSteps, IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { IExpansionService } from "../interfaces/iExpansionService";
import { IRowNode } from "../interfaces/iRowNode";

@Bean('expansionService')
export class ExpansionService extends BeanStub implements IExpansionService {
    private clientSideRowModel: IClientSideRowModel;

    @PostConstruct
    protected postConstruct(): void {
        this.clientSideRowModel = this.beans.clientSideRowModel;
    }

    public expandRows(rowIds: string[]): void {
        if (!this.clientSideRowModel) { return; }

        const rowIdSet = new Set(rowIds);
        this.beans.rowModel.forEachNode(node => {
            if (node.id && rowIdSet.has(node.id)) {
                node.expanded = true;
            }
        });
        this.onGroupExpandedOrCollapsed();
    }

    public getExpandedRows(): string[] {
        const expandedRows: string[] = [];
        this.beans.rowModel.forEachNode(({ expanded, id }) => {
            if (expanded && id) {
                expandedRows.push(id);
            }
        });
        return expandedRows;
    }

    public expandAll(value: boolean): void {
        this.clientSideRowModel?.expandOrCollapseAll(value);
    }

    public setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean, forceSync?: boolean): void {
        if (rowNode) {
            // expand all parents recursively, except root node.
            if (expandParents && rowNode.parent && rowNode.parent.level !== -1) {
                this.setRowNodeExpanded(rowNode.parent, expanded, expandParents, forceSync);
            }

            rowNode.setExpanded(expanded, undefined, forceSync);
        }
    }

    public onGroupExpandedOrCollapsed(): void {
         // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.clientSideRowModel?.refreshModel({ step: ClientSideRowModelSteps.MAP });
    }
}
