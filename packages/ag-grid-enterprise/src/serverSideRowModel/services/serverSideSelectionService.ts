import type {
    ISelectionService,
    ISetNodesSelectedParams,
    NamedBean,
    RowNode,
    RowSelectionMode,
    SelectionEventSourceType,
    ServerSideRowGroupSelectionState,
    ServerSideRowSelectionState,
} from 'ag-grid-community';
import {
    BaseSelectionService,
    _getGroupSelectsDescendants,
    _getRowSelectionMode,
    _isMultiRowSelection,
    _isUsingNewRowSelectionAPI,
    _warn,
} from 'ag-grid-community';

import { DefaultStrategy } from './selection/strategies/defaultStrategy';
import { GroupSelectsChildrenStrategy } from './selection/strategies/groupSelectsChildrenStrategy';
import type { ISelectionStrategy } from './selection/strategies/iSelectionStrategy';

export class ServerSideSelectionService extends BaseSelectionService implements NamedBean, ISelectionService {
    beanName = 'selectionService' as const;

    private selectionStrategy: ISelectionStrategy;
    private selectionMode?: RowSelectionMode;

    public override postConstruct(): void {
        super.postConstruct();
        this.addManagedPropertyListeners(['groupSelectsChildren', 'rowSelection'], () => {
            const groupSelectsChildren = _getGroupSelectsDescendants(this.gos);

            // Only switch strategies when value of groupSelectsChildren actually changes, not just any part of selection options
            const Strategy =
                groupSelectsChildren && this.selectionStrategy instanceof DefaultStrategy
                    ? GroupSelectsChildrenStrategy
                    : !groupSelectsChildren && this.selectionStrategy instanceof GroupSelectsChildrenStrategy
                      ? DefaultStrategy
                      : undefined;

            if (Strategy) {
                this.destroyBean(this.selectionStrategy);

                this.selectionStrategy = this.createManagedBean(new Strategy());

                this.shotgunResetNodeSelectionState();
                this.dispatchSelectionChanged('api');
            }
        });

        this.addManagedPropertyListeners(['rowSelection'], () => {
            // Only reset selection when selection mode changes, not just any part of selection options
            const rowSelection = _getRowSelectionMode(this.gos);
            if (rowSelection !== this.selectionMode) {
                this.selectionMode = rowSelection;
                this.deselectAllRowNodes({ source: 'api' });
            }
        });

        this.selectionMode = _getRowSelectionMode(this.gos);
        const groupSelectsChildren = _getGroupSelectsDescendants(this.gos);
        const Strategy = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new Strategy());
    }

    public getSelectionState(): string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | null {
        return this.selectionStrategy.getSelectedState();
    }

    public setSelectionState(
        state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState,
        source: SelectionEventSourceType
    ): void {
        if (Array.isArray(state)) {
            return;
        }
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();

        this.dispatchSelectionChanged(source);
    }

    public setNodesSelected(params: ISetNodesSelectedParams): number {
        const { nodes, ...otherParams } = params;

        if (nodes.length > 1 && this.selectionMode !== 'multiRow') {
            _warn(191);
            return 0;
        }

        if (nodes.length > 1 && params.rangeSelect) {
            _warn(192);
            return 0;
        }

        const adjustedParams = {
            nodes: nodes.filter((node) => node.selectable),
            ...otherParams,
        };

        // if no selectable nodes, then return 0
        if (!adjustedParams.nodes.length) {
            return 0;
        }

        const changedNodes = this.selectionStrategy.setNodesSelected(adjustedParams);
        this.shotgunResetNodeSelectionState(adjustedParams.source);
        this.dispatchSelectionChanged(adjustedParams.source);
        return changedNodes;
    }

    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    public deleteSelectionStateFromParent(storeRoute: string[], removedNodeIds: string[]) {
        const stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
        if (!stateChanged) {
            return;
        }

        this.shotgunResetNodeSelectionState();
        this.dispatchSelectionChanged('api');
    }

    private shotgunResetNodeSelectionState(source?: SelectionEventSourceType) {
        this.rowModel.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            const isNodeSelected = this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                node.selectThisNode(isNodeSelected, undefined, source);
            }
        });
    }

    public getSelectedNodes(): RowNode<any>[] {
        return this.selectionStrategy.getSelectedNodes();
    }

    public getSelectedRows(): any[] {
        return this.selectionStrategy.getSelectedRows();
    }

    public getSelectionCount(): number {
        return this.selectionStrategy.getSelectionCount();
    }

    public syncInRowNode(rowNode: RowNode<any>): void {
        // update any refs being held in the strategies
        this.selectionStrategy.processNewRow(rowNode);

        const isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);

        // if the node was selected but node is not selectable, we deselect the node.
        // (could be due to user applying selected state directly, or a change in selectable)
        if (isNodeSelected != false && !rowNode.selectable) {
            this.selectionStrategy.setNodesSelected({
                nodes: [rowNode],
                newValue: false,
                source: 'api',
            });

            // we need to shotgun reset here as if this was hierarchical, some group nodes
            // may be changing from indeterminate to unchecked.
            this.shotgunResetNodeSelectionState();
            this.dispatchSelectionChanged('api');
            return;
        }
        rowNode.setSelectedInitialValue(isNodeSelected);
    }

    public reset(): void {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
    }

    public isEmpty(): boolean {
        return this.selectionStrategy.isEmpty();
    }

    public hasNodesToSelect() {
        return true;
    }

    public selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean | undefined;
        justCurrentPage?: boolean | undefined;
    }): void {
        validateSelectionParameters(params);
        if (_isUsingNewRowSelectionAPI(this.gos) && !_isMultiRowSelection(this.gos)) {
            _warn(193);
            return;
        }

        this.selectionStrategy.selectAllRowNodes(params);

        this.rowModel.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            node.selectThisNode(true, undefined, params.source);
        });

        this.dispatchSelectionChanged(params.source);
    }

    public deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean | undefined;
        justCurrentPage?: boolean | undefined;
    }): void {
        validateSelectionParameters(params);

        this.selectionStrategy.deselectAllRowNodes(params);

        this.rowModel.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            node.selectThisNode(false, undefined, params.source);
        });

        this.dispatchSelectionChanged(params.source);
    }

    public getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null {
        return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
    }

    // used by CSRM
    public getBestCostNodeSelection(): RowNode<any>[] | undefined {
        _warn(194);
        return undefined;
    }
}
function validateSelectionParameters({
    justCurrentPage,
    justFiltered,
}: {
    source: SelectionEventSourceType;
    justFiltered?: boolean | undefined;
    justCurrentPage?: boolean | undefined;
}) {
    if (justCurrentPage || justFiltered) {
        _warn(195, { justCurrentPage });
    }
}
