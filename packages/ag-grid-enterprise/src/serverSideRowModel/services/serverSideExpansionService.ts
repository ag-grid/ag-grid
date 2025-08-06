import type {
    BeanCollection,
    IExpansionService,
    IsServerSideGroupOpenByDefaultParams,
    NamedBean,
    RowGroupOpenedEvent,
    RowNode,
    WithoutGridCommon,
} from 'ag-grid-community';

import { BaseExpansionService } from '../../rowHierarchy/baseExpansionService';
import type { ServerSideRowModel } from '../serverSideRowModel';

/**
 * This function creates a default expansion state object that tracks the expansion state of nodes.
 */
const getDefaultExpansionState = () => {
    const interactedWith = new Set<string>();
    const toggledNodes = new Set<string>();
    let expandAll: undefined | boolean = undefined;

    const self = {
        isExpanded: (rowId: string) => (expandAll ? !toggledNodes.has(rowId) : toggledNodes.has(rowId)),
        expandAll: (expanded: boolean) => self.reset(expanded),
        reset: (newExpandAll?: boolean) => {
            expandAll = newExpandAll;
            interactedWith.clear();
            toggledNodes.clear();
        },
        /**
         * Toggles the expansion state of a node.
         */
        toggleNode: (rowId: string) => {
            interactedWith[self.hasInteractedWithAll() ? 'delete' : 'add'](rowId);
            return toggledNodes[toggledNodes.has(rowId) ? 'delete' : 'add'](rowId);
        },
        /**
         * Returns true if the user has interacted with the node (by expanding/collapsing it).
         * If we have touched the expand/collapse all button, we return true for all nodes.
         */
        hasInteractedWith: (rowId: string) =>
            self.hasInteractedWithAll() ? interactedWith.delete(rowId) || true : interactedWith.has(rowId),
        /**
         * Returns true if the user has interacted with all nodes in the grid (by using expandAll/collapseAll).
         */
        hasInteractedWithAll: () => expandAll !== undefined,
    };
    return self;
};

export class ServerSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionSvc' as const;

    private expandedState = getDefaultExpansionState();
    private serverSideRowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            columnRowGroupChanged: () => {
                this.expandedState.reset();
            },
        });
    }

    /**
     * This is different from just checking expandedState.isExpanded(rowNode.id),
     * as this correctly prioritizes user interaction over the user-defined initial state.
     * Plus sanity checks that the rowNode is actually expandable.
     */
    public isRowExpanded(rowNode: RowNode): boolean {
        if (!rowNode.isExpandable()) {
            return false;
        }

        if (this.expandedState.hasInteractedWith(rowNode.id!)) {
            return this.expandedState.isExpanded(rowNode.id!);
        }

        const userFunc = this.gos.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return false;
        }

        const params: WithoutGridCommon<IsServerSideGroupOpenByDefaultParams> = {
            data: rowNode.data,
            rowNode,
        };

        return userFunc(params);
    }

    public expandRows(rowIdsToExpand: string[], rowIdsToCollapse?: string[]): void {
        const rowIdsToExpandSet = new Set(rowIdsToExpand);
        const rowIdsToCollapseSet = new Set(rowIdsToCollapse || []);
        this.serverSideRowModel.forEachNodeTransactional((node) => {
            if (rowIdsToExpandSet.has(node.id!)) {
                return this.setExpanded(node, true);
            }
            if (rowIdsToCollapseSet.has(node.id!)) {
                return this.setExpanded(node, false);
            }
        });
    }

    public override setExpanded(
        rowNode: RowNode | undefined,
        expanded: boolean,
        e?: MouseEvent | KeyboardEvent,
        _?: boolean,
        rowId?: string
    ): void {
        const rowIdC = rowId || rowNode!.id!;
        if (expanded !== this.expandedState.isExpanded(rowIdC)) {
            this.expandedState.toggleNode(rowIdC);
        }
        if (rowNode) {
            super.setExpanded(rowNode, expanded, e);
        }
    }

    public expandAll(expanded: boolean): void {
        this.expandedState.expandAll(expanded);
        this.serverSideRowModel.forEachNodeTransactional((node) => node.setExpanded(expanded));
        this.beans.eventSvc.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expanded ? 'expandAll' : 'collapseAll',
        });
    }

    public onGroupExpandedOrCollapsed(): void {
        // do nothing
    }

    protected override dispatchExpandedEvent(event: RowGroupOpenedEvent): void {
        this.eventSvc.dispatchEvent(event);

        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer, because the footer can be callback
        // we refresh regardless as the output of the callback could be a moving target
        this.beans.rowRenderer.refreshCells({ rowNodes: [event.node] });
    }
}
