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

interface IServerSideRowExpansionState {
    expandAll: boolean | undefined; // undefined = 'notInteracted' | true = 'expandAll' | false = 'collapseAll'
    toggledNodes: string[];
}

/**
 * Service for managing row expansion in the server-side row model.
 * Contains declarative states for interacted with nodes and toggled nodes.
 * Nodes still maintain their own expanded state, and also there is a user-defined lazy initial state.
 * This service manages all these states and provides an API for expanding/collapsing rows.
 */
export class ServerSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionSvc' as const;
    private readonly interactedWith = new Set<string>();
    private readonly toggledNodes = new Set<string>();
    private expandAllStatus: IServerSideRowExpansionState['expandAll'];
    private serverSideRowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            columnRowGroupChanged: () => {
                this.reset();
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

        if (this.gos.get('ssrmExpandAllAffectsAllRows') && this.hasInteractedWith(rowNode.id!)) {
            return this.isExpanded(rowNode.id!);
        }

        const userFunc = this.gos.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return false;
        }

        const params: WithoutGridCommon<IsServerSideGroupOpenByDefaultParams> = {
            data: rowNode.data,
            rowNode,
        };

        const userState = userFunc(params);
        if (this.isExpanded(rowNode.id!) !== userState) {
            // sync with user defined state
            this.toggleNode(rowNode.id!);
        }
        return userState;
    }

    public expandRows(rowIdsToExpand: string[], rowIdsToCollapse?: string[]): void {
        const rowIdsToExpandSet = new Set(rowIdsToExpand);
        const rowIdsToCollapseSet = new Set(rowIdsToCollapse || []);
        this.serverSideRowModel.forEachNodeTransactional((node) => {
            if (rowIdsToExpandSet.has(node.id!)) {
                return node.setExpanded(true);
            }
            if (rowIdsToCollapseSet.has(node.id!)) {
                return node.setExpanded(false);
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
        if (expanded !== this.isExpanded(rowIdC)) {
            this.toggleNode(rowIdC);
        }
        if (rowNode) {
            super.setExpanded(rowNode, expanded, e);
        }
    }

    public expandAll(expanded: boolean): void {
        this.reset(expanded);
        const ssrmExpandAllAffectsAllRows = this.gos.get('ssrmExpandAllAffectsAllRows');
        this.serverSideRowModel.forEachNodeTransactional((node) => {
            if (!ssrmExpandAllAffectsAllRows && (node.stub || !node.hasChildren())) {
                return;
            }
            node.setExpanded(expanded);
        });
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

    /**
     * Internal method for checking service internal state only.
     * expandAll XOR isToggled, since toggleNodes signifies a diff from expandAll.
     */
    private isExpanded = (rowId: string) => !!this.expandAllStatus !== this.toggledNodes.has(rowId);

    /**
     * Cleans up sets and sets the expandAll state if provided, otherwise resets it too.
     */
    private reset = (newExpandAll: IServerSideRowExpansionState['expandAll'] = undefined) => {
        this.expandAllStatus = newExpandAll;
        this.interactedWith.clear();
        this.toggledNodes.clear();
    };

    /**
     * Toggles the expansion state of a node.
     */
    private toggleNode = (rowId: string) => {
        if (!this.hasInteractedWithAll()) this.interactedWith.add(rowId);
        this.toggledNodes[this.toggledNodes.has(rowId) ? 'delete' : 'add'](rowId);
    };

    /**
     * Returns true if the user has interacted with the node (by expanding/collapsing it).
     * If we have touched the expand/collapse all button, we return true for all nodes.
     */
    private hasInteractedWith = (rowId: string) => this.hasInteractedWithAll() || this.interactedWith.has(rowId);

    /**
     * Returns true if the user has interacted with all nodes in the grid (by using expandAll/collapseAll).
     */
    private hasInteractedWithAll = () => typeof this.expandAllStatus === 'boolean';
}
