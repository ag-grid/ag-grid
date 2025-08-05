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

interface ExpansionState {
    /** Base expansion state for all nodes, whether they have been loaded or not */
    expandAll: boolean;
    /** Whether the user has interacted with all nodes */
    interactedWithAll: boolean;
    /** RowNode IDs of those nodes whose expansion state differs from the base state */
    toggledNodes: Record<string, boolean>;
    /** RowNode IDs of those nodes that have been interacted with by the user */
    interactedWith: Record<string, boolean>;
}
const DEFAULT_EXPANDED_STATE: ExpansionState = {
    expandAll: false,
    interactedWithAll: false,
    toggledNodes: {},
    interactedWith: {},
};
export class ServerSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionSvc' as const;

    private expandedState = { ...DEFAULT_EXPANDED_STATE };
    private serverSideRowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            columnRowGroupChanged: () => {
                this.resetExpandedState();
            },
        });
    }

    public checkOpenByDefault(rowNode: RowNode): boolean {
        if (!rowNode.isExpandable()) {
            return false;
        }

        if (this.expandedState.interactedWithAll || this.expandedState.interactedWith[rowNode.id!]) {
            return this.expandedState.expandAll !== this.expandedState.toggledNodes[rowNode.id!];
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
        this.expandedState.toggledNodes[rowIdC] = this.expandedState.expandAll !== expanded;
        if (!this.expandedState.interactedWithAll) {
            this.expandedState.interactedWith[rowIdC] = true;
        }
        if (rowNode) {
            super.setExpanded(rowNode, expanded, e);
        }
    }

    public expandAll(expanded: boolean): void {
        this.expandedState.expandAll = expanded;
        this.expandedState.interactedWithAll = true;
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

    private resetExpandedState(defaultOverrides: Partial<ExpansionState> = {}): void {
        this.expandedState = {
            ...DEFAULT_EXPANDED_STATE,
            ...defaultOverrides,
        };
    }
}
