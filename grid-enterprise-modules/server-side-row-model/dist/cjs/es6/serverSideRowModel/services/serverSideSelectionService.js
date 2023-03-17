"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideSelectionService = void 0;
const core_1 = require("@ag-grid-community/core");
const defaultStrategy_1 = require("./selection/strategies/defaultStrategy");
const groupSelectsChildrenStrategy_1 = require("./selection/strategies/groupSelectsChildrenStrategy");
let ServerSideSelectionService = class ServerSideSelectionService extends core_1.BeanStub {
    init() {
        const groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', (propChange) => {
            this.destroyBean(this.selectionStrategy);
            const StrategyClazz = !propChange.currentValue ? defaultStrategy_1.DefaultStrategy : groupSelectsChildrenStrategy_1.GroupSelectsChildrenStrategy;
            this.selectionStrategy = this.createManagedBean(new StrategyClazz());
            this.shotgunResetNodeSelectionState();
            const event = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            this.eventService.dispatchEvent(event);
        });
        const StrategyClazz = !groupSelectsChildren ? defaultStrategy_1.DefaultStrategy : groupSelectsChildrenStrategy_1.GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    }
    getServerSideSelectionState() {
        return this.selectionStrategy.getSelectedState();
    }
    setServerSideSelectionState(state) {
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        const event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    }
    setNodeSelected(params) {
        const changedNodes = this.selectionStrategy.setNodeSelected(params);
        this.shotgunResetNodeSelectionState(params.source);
        const event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
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
            type: core_1.Events.EVENT_SELECTION_CHANGED,
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
            type: core_1.Events.EVENT_SELECTION_CHANGED,
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
            type: core_1.Events.EVENT_SELECTION_CHANGED,
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
    core_1.Autowired('rowModel')
], ServerSideSelectionService.prototype, "rowModel", void 0);
__decorate([
    core_1.PostConstruct
], ServerSideSelectionService.prototype, "init", null);
ServerSideSelectionService = __decorate([
    core_1.Bean('selectionService')
], ServerSideSelectionService);
exports.ServerSideSelectionService = ServerSideSelectionService;
