import { _exists } from 'ag-stack';

import type {
    BeanCollection,
    GridApi,
    IExpansionService,
    NamedBean,
    RowGroupBulkExpansionState,
    RowGroupExpansionState,
    RowGroupOpenedEvent,
} from 'ag-grid-community';
import { RowNode, _getRowHeightForNode } from 'ag-grid-community';

import { BaseExpansionService } from '../../rowHierarchy/baseExpansionService';
import type { ServerSideRowModel } from '../serverSideRowModel';
import type { StoreFactory } from '../stores/storeFactory';
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
    private storeFactory: StoreFactory;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
        this.storeFactory = beans.ssrmStoreFactory as StoreFactory;
    }

    private setStrategy(strategy: ExpandStrategy | ExpandAllStrategy): void {
        this.destroyBean(this.strategy as any);
        this.strategy = this.createManagedBean(strategy);
    }

    public postConstruct(): void {
        const setDefaultExpand = () => {
            this.setStrategy(new ExpandStrategy());
        };

        this.addManagedEventListeners({
            // when row grouping / pivot changes, the old expand all state is no longer valid as rows changed
            columnRowGroupChanged: setDefaultExpand,
            columnPivotChanged: setDefaultExpand,
            columnPivotModeChanged: setDefaultExpand,
        });

        this.addManagedPropertyListener('ssrmExpandAllAffectsAllRows', (p) => {
            // reset strategy if explicitly disabled, otherwise state is fine to remain until new
            // select all value is set/removed
            if (!p.currentValue) {
                this.setStrategy(new ExpandStrategy());
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
            this.setStrategy(isExpandAllState ? new ExpandAllStrategy() : new ExpandStrategy());
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

    public isExpanded(rowNode: RowNode): boolean {
        let value = rowNode._expanded;
        // Non-expandable ⇒ collapsed; don't resolve/cache the default so it re-resolves if the node becomes expandable.
        if (value === false || !rowNode.isExpandable()) {
            return false;
        }
        if (value === null) {
            value = this.defaultExpanded(rowNode);
            rowNode._expanded = value;
        }
        // This could be returning undefined which is currently
        // handled via coercion in SSRM. When fixing this to always
        // return a boolean must validate that the undefined state is
        // correctly handled.
        return value as boolean;
    }

    public isNodeExpanded(node: RowNode): boolean {
        return this.strategy.isRowExpanded(node) && node.isExpandable();
    }

    public override setExpanded(node: RowNode, expanded: boolean, e?: MouseEvent | KeyboardEvent, _?: boolean): void {
        const expandable = node.isExpandable();

        // No-op for nodes that can never open (footer / detail / pivot leaf-group / pivot master), keeping state clean.
        // A group whose children haven't loaded yet still counts, via the structural group flag.
        if (!expandable && !this.checkExpandable(node, !!node.group)) {
            return;
        }

        // Record intent even while not yet expandable, so an unloaded group applies it once its children arrive.
        this.strategy.setRowExpanded(node, expanded);

        // Don't physically open a group whose children aren't loaded yet; checkOpenByDefault applies it on load.
        if (expanded && !expandable) {
            this.dispatchStateUpdatedEvent();
            return;
        }
        super.setExpanded(node, expanded, e);
        this.dispatchStateUpdatedEvent();
        this.updateExpandedState(node);
    }

    public resetExpansion(): void {
        this.setStrategy(new ExpandStrategy());
        this.updateAllNodes();
        this.dispatchStateUpdatedEvent();
    }

    public expandAll(expanded: boolean): void {
        const ssrmExpandAllAffectsAllRows = this.beans.gos.get('ssrmExpandAllAffectsAllRows');
        // if allowed, swap to expand all strategy
        const shouldUseExpandAllStrategy = !this.isExpandAllStrategy(this.strategy) && ssrmExpandAllAffectsAllRows;

        if (shouldUseExpandAllStrategy) {
            this.setStrategy(new ExpandAllStrategy());
        }
        this.strategy.expandAll(expanded);
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

    public setDetailsExpansionState(detailGridApi: GridApi): void {
        const { gos: masterGos } = this.beans;

        // to prevent massive server side queries, we only propagate if the master is using a special flag
        // this flag also indicates that we are using the expandAll strategy, and it's safe to cast the state to RowGroupBulkExpansionState
        if (!masterGos.get('ssrmExpandAllAffectsAllRows')) {
            return;
        }

        // ideally, we would want to combine these strategies / states some day so there is no need in type cast here
        const masterExpansionState = this.getExpansionState() as RowGroupBulkExpansionState;
        const isInitial = masterExpansionState.expandAll === undefined;
        if (isInitial) {
            return;
        }
        const allExpanded = masterExpansionState.expandAll! && masterExpansionState.invertedRowGroupIds.length === 0;
        const allCollapsed = !masterExpansionState.expandAll! && masterExpansionState.invertedRowGroupIds.length === 0;

        if (allCollapsed === allExpanded) {
            return;
        }
        return allExpanded ? detailGridApi.expandAll() : detailGridApi.collapseAll();
    }

    protected override dispatchExpandedEvent(event: RowGroupOpenedEvent): void {
        this.eventSvc.dispatchEvent(event);

        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer, because the footer can be callback
        // we refresh regardless as the output of the callback could be a moving target
        this.beans.rowRenderer.refreshRowByNode(event.node);
    }

    public updateExpandedState(rowNode: RowNode): void {
        const oldChildStore = rowNode.childStore;
        if (rowNode.expanded) {
            if (rowNode.master && !rowNode.detailNode) {
                rowNode.detailNode = this.createDetailNode(rowNode);
            }
            if (!oldChildStore && rowNode.hasChildren()) {
                const storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        } else if (oldChildStore && this.gos.get('purgeClosedRowNodes')) {
            rowNode.childStore = this.destroyBean(oldChildStore)!;
        }
    }

    private createDetailNode(masterNode: RowNode): RowNode {
        const detailNode = new RowNode(this.beans);

        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;

        if (_exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }

        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;

        const defaultDetailRowHeight = 200;
        const rowHeight = _getRowHeightForNode(this.beans, detailNode).height;

        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;

        return detailNode;
    }
}
