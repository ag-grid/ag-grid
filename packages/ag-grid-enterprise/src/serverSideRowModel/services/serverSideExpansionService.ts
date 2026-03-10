import { RowNode, _exists, _getRowHeightForNode } from 'ag-grid-community';
import type {
    BeanCollection,
    GridApi,
    IExpansionService,
    NamedBean,
    RowGroupBulkExpansionState,
    RowGroupExpansionState,
    RowGroupOpenedEvent,
} from 'ag-grid-community';

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
    private prevGroupColIds: string[] = [];

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
        this.storeFactory = beans.ssrmStoreFactory as StoreFactory;
    }

    public postConstruct(): void {
        const resetExpand = () => {
            this.strategy = this.createManagedBean(new ExpandStrategy());
        };

        const preserveAndResetExpand = () => {
            const newGroupColIds = (this.beans.rowGroupColsSvc?.columns ?? []).map((col) => col.getId());
            const oldGroupColIds = this.prevGroupColIds;
            this.prevGroupColIds = newGroupColIds;

            const newStrategy = this.createManagedBean(new ExpandStrategy());
            // Preserve expansion state from the previous default strategy across group column changes
            if (this.strategy && !this.isExpandAllStrategy(this.strategy)) {
                const oldStrategy = this.strategy as ExpandStrategy;

                // Find the first level where group columns diverged — no IDs at or beyond this
                // level can survive since those nodes will all have different IDs or cease to exist.
                const firstDirtyLevel = findFirstChangedGroupLevel(oldGroupColIds, newGroupColIds);
                // If the top-level group column changed, no existing IDs survive — skip snapshot.
                if (firstDirtyLevel === 0) {
                    this.strategy = newStrategy;
                    return;
                }

                let { expandedRowGroupIds, collapsedRowGroupIds } = oldStrategy.getExpandedState();

                // Filter out IDs at levels that no longer exist, that will become leaf groups in
                // pivot mode, or that are at/beyond the first dirty group column level.
                const newGroupColCount = newGroupColIds.length;
                const maxValidLevel = this.beans.colModel.isPivotMode() ? newGroupColCount - 1 : newGroupColCount;
                const upperBound = Math.min(maxValidLevel, firstDirtyLevel);
                if (upperBound >= 0) {
                    const isValidLevel = (id: string) => {
                        const level = oldStrategy.getNodeLevel(id);
                        return level != null && level < upperBound;
                    };
                    expandedRowGroupIds = expandedRowGroupIds.filter(isValidLevel);
                    collapsedRowGroupIds = collapsedRowGroupIds?.filter(isValidLevel);
                }

                if (expandedRowGroupIds.length || collapsedRowGroupIds?.length) {
                    newStrategy.setExpandedState({ expandedRowGroupIds, collapsedRowGroupIds });
                }
            }
            this.strategy = newStrategy;
        };

        this.addManagedEventListeners({
            // preserve expansion state across row group column changes (IDs may still match)
            columnRowGroupChanged: preserveAndResetExpand,
            // pivot changes restructure rows entirely — reset without preserving
            columnPivotChanged: resetExpand,
            columnPivotModeChanged: resetExpand,
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

        resetExpand();
        this.prevGroupColIds = (this.beans.rowGroupColsSvc?.columns ?? []).map((col) => col.getId());
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
        if (this.updateAllNodes()) {
            // Trigger display recalculation — needed when child stores already have cached data
            // and no async load fires storeUpdated as a side effect
            this.eventSvc.dispatchEvent({ type: 'storeUpdated' });
        }
    }

    public getExpansionState(): RowGroupExpansionState | RowGroupBulkExpansionState {
        return this.strategy.getExpandedState();
    }

    /**
     * Updates all nodes to the correct expanded/collapsed state,
     * creating or destroying child stores as needed.
     * @returns true if any node's expanded state changed
     */
    private updateAllNodes(): boolean {
        let changed = false;
        this.serverSideRowModel.forEachNode((node) => {
            const desired = this.isNodeExpanded(node);
            if (node.expanded !== desired) {
                changed = true;
            }
            super.setExpanded(node, desired);
        });
        return changed;
    }

    public isNodeExpanded(node: RowNode): boolean {
        return this.strategy.isRowExpanded(node);
    }

    public override setExpanded(node: RowNode, expanded: boolean, e?: MouseEvent | KeyboardEvent, _?: boolean): void {
        this.strategy.setRowExpanded(node, expanded);
        super.setExpanded(node, expanded, e);
        this.dispatchStateUpdatedEvent();
        this.updateExpandedState(node);
    }

    public resetExpansion(): void {
        this.strategy = this.createManagedBean(new ExpandStrategy());
        this.updateAllNodes();
        this.dispatchStateUpdatedEvent();
    }

    public expandAll(expanded: boolean): void {
        const ssrmExpandAllAffectsAllRows = this.beans.gos.get('ssrmExpandAllAffectsAllRows');
        // if allowed, swap to expand all strategy
        const shouldUseExpandAllStrategy = !this.isExpandAllStrategy(this.strategy) && ssrmExpandAllAffectsAllRows;

        this.strategy = shouldUseExpandAllStrategy ? new ExpandAllStrategy() : this.strategy;
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
        this.beans.rowRenderer.refreshCells({ rowNodes: [event.node] });
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

/**
 * Find the first level at which the group cols have changed. Used to know how many levels can be preserved when col groups have changed
 * @param oldGroupColIds
 * @param newGroupColIds
 * @returns
 */
export function findFirstChangedGroupLevel(oldGroupColIds: string[], newGroupColIds: string[]) {
    const minLen = Math.min(oldGroupColIds.length, newGroupColIds.length);
    let firstDirtyLevel = minLen; // default: columns added/removed at end
    for (let i = 0; i < minLen; i++) {
        if (oldGroupColIds[i] !== newGroupColIds[i]) {
            firstDirtyLevel = i;
            break;
        }
    }
    return firstDirtyLevel;
}
