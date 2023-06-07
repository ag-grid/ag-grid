var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
import { DefaultStrategy } from "./selection/strategies/defaultStrategy";
import { GroupSelectsChildrenStrategy } from "./selection/strategies/groupSelectsChildrenStrategy";
let ServerSideSelectionService = class ServerSideSelectionService extends BeanStub {
    init() {
        const groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', (propChange) => {
            this.destroyBean(this.selectionStrategy);
            const StrategyClazz = !propChange.currentValue ? DefaultStrategy : GroupSelectsChildrenStrategy;
            this.selectionStrategy = this.createManagedBean(new StrategyClazz());
            this.shotgunResetNodeSelectionState();
            const event = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            this.eventService.dispatchEvent(event);
        });
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', (propChange) => this.rowSelection = propChange.currentValue);
        const StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    }
    getServerSideSelectionState() {
        return this.selectionStrategy.getSelectedState();
    }
    setServerSideSelectionState(state) {
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    }
    setNodesSelected(params) {
        if (params.nodes.length > 1 && this.rowSelection !== 'multiple') {
            console.warn(`AG Grid: cannot multi select while rowSelection='single'`);
            return 0;
        }
        if (params.nodes.length > 1 && params.rangeSelect) {
            console.warn(`AG Grid: cannot use range selection when multi selecting rows`);
            return 0;
        }
        const changedNodes = this.selectionStrategy.setNodesSelected(params);
        this.shotgunResetNodeSelectionState(params.source);
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
        return changedNodes;
    }
    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    deleteSelectionStateFromParent(storeRoute, removedNodeIds) {
        const stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
        if (!stateChanged) {
            return;
        }
        this.shotgunResetNodeSelectionState();
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    }
    shotgunResetNodeSelectionState(source) {
        this.rowModel.forEachNode(node => {
            if (node.stub) {
                return;
            }
            const isNodeSelected = this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                node.selectThisNode(isNodeSelected, undefined, source);
            }
        });
    }
    getSelectedNodes() {
        return this.selectionStrategy.getSelectedNodes();
    }
    getSelectedRows() {
        return this.selectionStrategy.getSelectedRows();
    }
    getSelectionCount() {
        return this.selectionStrategy.getSelectionCount();
    }
    syncInRowNode(rowNode, oldNode) {
        // update any refs being held in the strategies
        this.selectionStrategy.processNewRow(rowNode);
        const isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);
        rowNode.setSelectedInitialValue(isNodeSelected);
    }
    reset() {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
    }
    isEmpty() {
        return this.selectionStrategy.isEmpty();
    }
    selectAllRowNodes(params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.selectAllRowNodes(params);
        this.rowModel.forEachNode(node => {
            if (node.stub) {
                return;
            }
            node.selectThisNode(true, undefined, params.source);
        });
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    deselectAllRowNodes(params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.deselectAllRowNodes(params);
        this.rowModel.forEachNode(node => {
            if (node.stub) {
                return;
            }
            node.selectThisNode(false, undefined, params.source);
        });
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    getSelectAllState(justFiltered, justCurrentPage) {
        return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
    }
    // used by CSRM
    updateGroupsFromChildrenSelections(source, changedPath) {
        return false;
    }
    // used by CSRM
    getBestCostNodeSelection() {
        console.warn('AG Grid: calling gridApi.getBestCostNodeSelection() is only possible when using rowModelType=`clientSide`.');
        return undefined;
    }
    // used by CSRM
    filterFromSelection() {
        return;
    }
};
__decorate([
    Autowired('rowModel')
], ServerSideSelectionService.prototype, "rowModel", void 0);
__decorate([
    PostConstruct
], ServerSideSelectionService.prototype, "init", null);
ServerSideSelectionService = __decorate([
    Bean('selectionService')
], ServerSideSelectionService);
export { ServerSideSelectionService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU2lkZVNlbGVjdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL3NlcnZpY2VzL3NlcnZlclNpZGVTZWxlY3Rpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBZSxNQUFNLEVBQTJGLGFBQWEsRUFBd0csTUFBTSx5QkFBeUIsQ0FBQztBQUN2UyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDekUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFJbkcsSUFBYSwwQkFBMEIsR0FBdkMsTUFBYSwwQkFBMkIsU0FBUSxRQUFRO0lBTTVDLElBQUk7UUFDUixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsMEJBQTBCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNuRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sYUFBYSxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQztZQUNoRyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEtBQUssR0FBNkM7Z0JBQ3BELElBQUksRUFBRSxNQUFNLENBQUMsdUJBQXVCO2dCQUNwQyxNQUFNLEVBQUUsS0FBSzthQUNoQixDQUFDO1lBQ0YsSUFBSSxDQUFD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