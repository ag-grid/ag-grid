import type {
    BeanCollection,
    ColumnModel,
    IClientSideRowModel,
    IExpansionService,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import { _exists } from 'ag-grid-community';

import { BaseExpansionService } from './baseExpansionService';

export class ClientSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionService' as const;

    private rowModel: IClientSideRowModel;
    private columnModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel as IClientSideRowModel;
        this.columnModel = beans.columnModel;
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

    public expandAll(expand: boolean): void {
        const usingTreeData = this.gos.get('treeData');
        const usingPivotMode = this.columnModel.isPivotActive();

        const recursiveExpandOrCollapse = (rowNodes: RowNode[] | null): void => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach((rowNode) => {
                const actionRow = () => {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };

                if (usingTreeData) {
                    const hasChildren = _exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }

                if (usingPivotMode) {
                    const notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }

                const isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        };

        const rootNode = this.rowModel.getRootNode();
        if (rootNode) {
            recursiveExpandOrCollapse(rootNode.childrenAfterGroup);
        }

        this.rowModel.refreshModel({ step: 'map' });

        this.eventService.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expand ? 'expandAll' : 'collapseAll',
        });
    }

    public onGroupExpandedOrCollapsed(): void {
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.rowModel.refreshModel({ step: 'map' });
    }
}
