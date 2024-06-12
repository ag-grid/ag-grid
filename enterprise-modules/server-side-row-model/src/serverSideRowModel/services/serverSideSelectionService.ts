import type {
    BeanCollection,
    IRowModel,
    ISelectionService,
    ISetNodesSelectedParams,
    NamedBean,
    RowNode,
    SelectionChangedEvent,
    SelectionEventSourceType,
    ServerSideRowGroupSelectionState,
    ServerSideRowSelectionState,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import { BeanStub, _warnOnce } from '@ag-grid-community/core';

import { DefaultStrategy } from './selection/strategies/defaultStrategy';
import { GroupSelectsChildrenStrategy } from './selection/strategies/groupSelectsChildrenStrategy';
import type { ISelectionStrategy } from './selection/strategies/iSelectionStrategy';

export class ServerSideSelectionService extends BeanStub implements NamedBean, ISelectionService {
    beanName = 'selectionService' as const;

    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    private selectionStrategy: ISelectionStrategy;

    public postConstruct(): void {
        const groupSelectsChildren = this.gos.get('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', (propChange) => {
            this.destroyBean(this.selectionStrategy);

            const StrategyClazz = !propChange.currentValue ? DefaultStrategy : GroupSelectsChildrenStrategy;
            this.selectionStrategy = this.createManagedBean(new StrategyClazz());

            this.shotgunResetNodeSelectionState();
            this.dispatchSelectionChanged('api');
        });

        this.addManagedPropertyListener('rowSelection', () => this.deselectAllRowNodes({ source: 'api' }));

        const StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
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

        const rowSelection = this.gos.get('rowSelection');
        if (nodes.length > 1 && rowSelection !== 'multiple') {
            _warnOnce(`cannot multi select while rowSelection='single'`);
            return 0;
        }

        if (nodes.length > 1 && params.rangeSelect) {
            _warnOnce(`cannot use range selection when multi selecting rows`);
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
        if (params.justCurrentPage || params.justFiltered) {
            _warnOnce("selecting just filtered only works when gridOptions.rowModelType='clientSide'");
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
        if (params.justCurrentPage || params.justFiltered) {
            _warnOnce("selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }

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
    public updateGroupsFromChildrenSelections(): boolean {
        return false;
    }

    // used by CSRM
    public getBestCostNodeSelection(): RowNode<any>[] | undefined {
        _warnOnce('calling gridApi.getBestCostNodeSelection() is only possible when using rowModelType=`clientSide`.');
        return undefined;
    }

    // used by CSRM
    public filterFromSelection(): void {
        return;
    }

    private dispatchSelectionChanged(source: SelectionEventSourceType): void {
        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: 'selectionChanged',
            source,
        };
        this.eventService.dispatchEvent(event);
    }
}
