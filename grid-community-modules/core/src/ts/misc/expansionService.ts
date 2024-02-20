import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IExpansionService } from "../interfaces/iExpansionService";
import { IRowModel } from "../interfaces/iRowModel";
import { ClientSideRowModelSteps, IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { IRowNode } from "../interfaces/iRowNode";

@Bean('expansionService')
export class ExpansionService extends BeanStub implements IExpansionService {
    @Autowired('rowModel') private readonly rowModel: IRowModel;

    private isClientSideRowModel: boolean;

    @PostConstruct
    protected postConstruct(): void {
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';
    }

    public expandRows(rowIds: string[]): void {
        if (!this.isClientSideRowModel) { return; }

        const rowIdSet = new Set(rowIds);
        this.rowModel.forEachNode(node => {
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
        if (!this.isClientSideRowModel) { return; }
        (this.rowModel as IClientSideRowModel).expandOrCollapseAll(value);
    }

    public setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean): void {
        if (rowNode) {
            // expand all parents recursively, except root node.
            if (expandParents && rowNode.parent && rowNode.parent.level !== -1) {
                this.setRowNodeExpanded(rowNode.parent, expanded, expandParents);
            }

            rowNode.setExpanded(expanded);
        }
    }

    public onGroupExpandedOrCollapsed(): void {
        if (!this.isClientSideRowModel) { return; }
         // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        (this.rowModel as IClientSideRowModel).refreshModel({ step: ClientSideRowModelSteps.MAP });
    }
}
