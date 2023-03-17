"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultStrategy = void 0;
const core_1 = require("@ag-grid-community/core");
class DefaultStrategy extends core_1.BeanStub {
    constructor() {
        super(...arguments);
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.lastSelected = null;
        this.selectAllUsed = false;
        // this is to prevent regressions, default selectionService retains reference of clicked nodes.
        this.selectedNodes = {};
    }
    init() {
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', (propChange) => {
            this.rowSelection = propChange.currentValue;
        });
    }
    getSelectedState() {
        return {
            selectAll: this.selectedState.selectAll,
            toggledNodes: [...this.selectedState.toggledNodes],
        };
    }
    setSelectedState(state) {
        // fire selection changed event
        const newState = {
            selectAll: false,
            toggledNodes: new Set(),
        };
        if (typeof state !== 'object') {
            console.error('AG Grid: The provided selection state should be an object.');
            return;
        }
        if ('selectAll' in state && typeof state.selectAll === 'boolean') {
            newState.selectAll = state.selectAll;
        }
        else {
            console.error('AG Grid: Select all status should be of boolean type.');
            return;
        }
        if ('toggledNodes' in state && Array.isArray(state.toggledNodes)) {
            state.toggledNodes.forEach((key) => {
                if (typeof key === 'string') {
                    newState.toggledNodes.add(key);
                }
                else {
                    console.warn(`AG Grid: Provided ids must be of string type. Invalid id provided: ${key}`);
                }
            });
        }
        else {
            console.error('AG Grid: `toggledNodes` must be an array of string ids.');
            return;
        }
        this.selectedState = newState;
    }
    deleteSelectionStateFromParent(parentPath, removedNodeIds) {
        if (this.selectedState.toggledNodes.size === 0) {
            return false;
        }
        let anyNodesToggled = false;
        removedNodeIds.forEach(id => {
            if (this.selectedState.toggledNodes.delete(id)) {
                anyNodesToggled = true;
            }
        });
        return anyNodesToggled;
    }
    setNodeSelected(params) {
        const onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
        if (this.rowSelection !== 'multiple' || onlyThisNode) {
            if (params.newValue) {
                this.selectedNodes = { [params.node.id]: params.node };
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set([params.node.id]),
                };
            }
            else {
                this.selectedNodes = {};
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set(),
                };
            }
            this.lastSelected = params.node.id;
            return 1;
        }
        const updateNodeState = (node) => {
            if (params.newValue) {
                this.selectedNodes[node.id] = node;
            }
            else {
                delete this.selectedNodes[node.id];
            }
            const doesNodeConform = params.newValue === this.selectedState.selectAll;
            if (doesNodeConform) {
                this.selectedState.toggledNodes.delete(node.id);
                return;
            }
            this.selectedState.toggledNodes.add(node.id);
        };
        if (params.rangeSelect && this.lastSelected) {
            const lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
            this.rowModel.getNodesInRangeForSelection(params.node, lastSelectedNode !== null && lastSelectedNode !== void 0 ? lastSelectedNode : null).forEach(updateNodeState);
            this.lastSelected = params.node.id;
            return 1;
        }
        updateNodeState(params.node);
        this.lastSelected = params.node.id;
        return 1;
    }
    processNewRow(node) {
        if (this.selectedNodes[node.id]) {
            this.selectedNodes[node.id] = node;
        }
    }
    isNodeSelected(node) {
        const isToggled = this.selectedState.toggledNodes.has(node.id);
        return this.selectedState.selectAll ? !isToggled : isToggled;
    }
    getSelectedNodes() {
        if (this.selectAllUsed) {
            console.warn(`AG Grid: getSelectedNodes and getSelectedRows functions cannot be used with select all functionality with the server-side row model.
                Use \`api.getServerSideSelectionState()\` instead.`);
        }
        return Object.values(this.selectedNodes);
    }
    getSelectedRows() {
        return this.getSelectedNodes().map(node => node.data);
    }
    getSelectionCount() {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size;
    }
    clearOtherNodes(rowNodeToKeepSelected, source) {
        const clearedRows = this.selectedState.selectAll ? 1 : this.selectedState.toggledNodes.size - 1;
        this.selectedState = {
            selectAll: false,
            toggledNodes: new Set([rowNodeToKeepSelected.id]),
        };
        this.rowModel.forEachNode(node => {
            if (node !== rowNodeToKeepSelected) {
                node.selectThisNode(false, undefined, source);
            }
        });
        const event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source,
        };
        this.eventService.dispatchEvent(event);
        return clearedRows;
    }
    isEmpty() {
        var _a;
        return !this.selectedState.selectAll && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    }
    selectAllRowNodes(params) {
        this.selectedState = { selectAll: true, toggledNodes: new Set() };
        this.selectedNodes = {};
        this.selectAllUsed = true;
    }
    deselectAllRowNodes(params) {
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.selectedNodes = {};
    }
    getSelectAllState(justFiltered, justCurrentPage) {
        if (this.selectedState.selectAll) {
            if (this.selectedState.toggledNodes.size > 0) {
                return null;
            }
            return true;
        }
        if (this.selectedState.toggledNodes.size > 0) {
            return null;
        }
        return false;
    }
}
__decorate([
    core_1.Autowired('rowModel')
], DefaultStrategy.prototype, "rowModel", void 0);
__decorate([
    core_1.PostConstruct
], DefaultStrategy.prototype, "init", null);
exports.DefaultStrategy = DefaultStrategy;
