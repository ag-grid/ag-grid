import type {
    BeanCollection,
    IExpansionService,
    NamedBean,
    RowGroupBulkExpansionState,
    RowGroupExpansionState,
    RowGroupOpenedEvent,
    RowNode,
} from 'ag-grid-community';

import { BaseExpansionService } from '../../rowHierarchy/baseExpansionService';
import type { ServerSideRowModel } from '../serverSideRowModel';
import { ExpandStrategy } from './expansion/strategies/defaultStrategy';
import { ExpandAllStrategy } from './expansion/strategies/expandAllStrategy';
import type { IExpansionStrategy } from './expansion/strategies/iExpansionStrategy';

/**
 * Service for managing row expansion in the server-side row model.
 * Contains declarative states for interacted with nodes and toggled nodes.
 * Nodes still maintain their own expanded state, and also there is a user-defined lazy initial state.
 * This service manages all these states and provides an API for expanding/collapsing rows.
 */
export class ServerSideExpansionService
    extends BaseExpansionService
    implements NamedBean, IExpansionService<RowGroupExpansionState | RowGroupBulkExpansionState>
{
    beanName = 'expansionSvc' as const;

    private strategy: IExpansionStrategy<RowGroupExpansionState> | IExpansionStrategy<RowGroupBulkExpansionState>;
    private serverSideRowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    public postConstruct(): void {
        const setDefaultExpand = () => {
            this.strategy = this.createManagedBean(new ExpandStrategy());
        };

        this.addManagedEventListeners({
            // when row grouping changes, the old expand all state is no longer valid as rows changed
            columnRowGroupChanged: setDefaultExpand,
        });

        this.addManagedPropertyListener('ssrmExpandAllAffectsAllRows', (p) => {
            // reset strategy if explicitly disabled, otherwise state is fine to remain until new
            // select all value is set/removed
            if (!p.currentValue) {
                this.strategy = this.createManagedBean(new ExpandStrategy());
                this.updateAllNodes();
                this.dispatchStateUpdatedEvent();
            }
        });

        setDefaultExpand();
    }

    public setExpansionState(state: RowGroupExpansionState | RowGroupBulkExpansionState): void {
        const isExpandAllState = 'expandAll' in state;
        const isExpandAllStrategy = this.isExpandAllStrategy(this.strategy);

        if (isExpandAllState !== isExpandAllStrategy) {
            this.strategy = isExpandAllState
                ? this.createManagedBean(new ExpandAllStrategy())
                : this.createManagedBean(new ExpandStrategy());
        }
        this.strategy.setExpandedState(state as any); // cast to any, as we know the type is correct due to the previous assertion
        this.dispatchStateUpdatedEvent();
        this.updateAllNodes();
    }

    public getExpansionState(): RowGroupExpansionState | RowGroupBulkExpansionState {
        return this.strategy.getExpandedState();
    }

    /**
     * Updates all nodes to the correct expanded/collapsed state.
     */
    private updateAllNodes() {
        this.serverSideRowModel.forEachNode((node) => {
            super.setExpanded(node, this.isNodeExpanded(node));
        });
    }

    public isNodeExpanded(node: RowNode): boolean {
        return this.strategy.isRowExpanded(node);
    }

    public override setExpanded(node: RowNode, expanded: boolean, e?: MouseEvent | KeyboardEvent, _?: boolean): void {
        this.strategy.setRowExpanded(node, expanded);
        super.setExpanded(node, expanded, e);
        this.dispatchStateUpdatedEvent();
    }

    public expandAll(expanded: boolean): void {
        const canUseNewExpandAll = this.beans.gos.get('ssrmExpandAllAffectsAllRows');
        // if allowed, swap to expand all strategy
        const strategy: IExpansionStrategy<any> =
            this.isExpandAllStrategy(this.strategy) || !canUseNewExpandAll ? this.strategy : new ExpandAllStrategy();
        this.strategy = strategy;
        strategy.expandAll(expanded);
        this.updateAllNodes();
        this.dispatchStateUpdatedEvent();
        this.beans.eventSvc.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expanded ? 'expandAll' : 'collapseAll',
        });
    }

    private isExpandAllStrategy(
        strategy: IExpansionStrategy<any>
    ): strategy is IExpansionStrategy<RowGroupBulkExpansionState> {
        return strategy.name === 'expandAll';
    }

    public onGroupExpandedOrCollapsed(): void {
        // this could be made to work, but the pattern for encouraging .expanded to be explicitly set on nodes
        // is old, and we should move towards batch APIs
    }

    protected override dispatchExpandedEvent(event: RowGroupOpenedEvent): void {
        this.eventSvc.dispatchEvent(event);

        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer, because the footer can be callback
        // we refresh regardless as the output of the callback could be a moving target
        this.beans.rowRenderer.refreshCells({ rowNodes: [event.node] });
    }
}
