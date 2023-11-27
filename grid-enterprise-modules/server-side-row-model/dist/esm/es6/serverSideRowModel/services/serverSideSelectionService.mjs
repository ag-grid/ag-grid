var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
import { DefaultStrategy } from "./selection/strategies/defaultStrategy.mjs";
import { GroupSelectsChildrenStrategy } from "./selection/strategies/groupSelectsChildrenStrategy.mjs";
let ServerSideSelectionService = class ServerSideSelectionService extends BeanStub {
    init() {
        const groupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
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
        this.addManagedPropertyListener('rowSelection', () => this.deselectAllRowNodes({ source: 'api' }));
        const StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    }
    getSelectionState() {
        return this.selectionStrategy.getSelectedState();
    }
    setSelectionState(state, source) {
        if (Array.isArray(state)) {
            return;
        }
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source,
        };
        this.eventService.dispatchEvent(event);
    }
    setNodesSelected(params) {
        const { nodes } = params, otherParams = __rest(params, ["nodes"]);
        const rowSelection = this.gridOptionsService.get('rowSelection');
        if (nodes.length > 1 && rowSelection !== 'multiple') {
            console.warn(`AG Grid: cannot multi select while rowSelection='single'`);
            return 0;
        }
        if (nodes.length > 1 && params.rangeSelect) {
            console.warn(`AG Grid: cannot use range selection when multi selecting rows`);
            return 0;
        }
        const adjustedParams = Object.assign({ nodes: nodes.filter(node => node.selectable) }, otherParams);
        // if no selectable nodes, then return 0
        if (!adjustedParams.nodes.length) {
            return 0;
        }
        const changedNodes = this.selectionStrategy.setNodesSelected(adjustedParams);
        this.shotgunResetNodeSelectionState(adjustedParams.source);
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: adjustedParams.source,
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
            const event = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            this.eventService.dispatchEvent(event);
            return;
        }
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
