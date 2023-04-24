var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, BeanStub, PostConstruct, Events } from "@ag-grid-community/core";
export class GroupSelectsChildrenStrategy extends BeanStub {
    constructor() {
        super(...arguments);
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
        this.lastSelected = null;
    }
    init() {
        // if model has updated, a store may now be fully loaded to clean up indeterminate states
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, () => this.removeRedundantState());
        // when the grouping changes, the state no longer makes sense, so reset the state.
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.selectionService.reset());
    }
    getSelectedState() {
        const recursivelySerializeState = (state, level, nodeId) => {
            const normalisedState = {
                nodeId,
            };
            if (level <= this.columnModel.getRowGroupColumns().length) {
                normalisedState.selectAllChildren = state.selectAllChildren;
            }
            // omit toggledNodes if empty
            if (state.toggledNodes.size) {
                const toggledNodes = [];
                state.toggledNodes.forEach((value, key) => {
                    const newState = recursivelySerializeState(value, level + 1, key);
                    toggledNodes.push(newState);
                });
                normalisedState.toggledNodes = toggledNodes;
            }
            return normalisedState;
        };
        return recursivelySerializeState(this.selectedState, 0);
    }
    setSelectedState(state) {
        const recursivelyDeserializeState = (normalisedState, parentSelected) => {
            var _a, _b;
            if (typeof normalisedState !== 'object') {
                throw new Error('AG Grid: Each provided state object must be an object.');
            }
            if ('selectAllChildren' in normalisedState && typeof normalisedState.selectAllChildren !== 'boolean') {
                throw new Error('AG Grid: `selectAllChildren` must be a boolean value or undefined.');
            }
            if ('toggledNodes' in normalisedState) {
                if (!Array.isArray(normalisedState.toggledNodes)) {
                    throw new Error('AG Grid: `toggledNodes` must be an array.');
                }
                const allHaveIds = normalisedState.toggledNodes.every(innerState => (typeof innerState === 'object' && 'nodeId' in innerState && typeof innerState.nodeId === 'string'));
                if (!allHaveIds) {
                    throw new Error('AG Grid: Every `toggledNode` requires an associated string id.');
                }
            }
            const isThisNodeSelected = (_a = normalisedState.selectAllChildren) !== null && _a !== void 0 ? _a : !parentSelected;
            const convertedChildren = (_b = normalisedState.toggledNodes) === null || _b === void 0 ? void 0 : _b.map(innerState => ([innerState.nodeId, recursivelyDeserializeState(innerState, isThisNodeSelected)]));
            const doesRedundantStateExist = convertedChildren === null || convertedChildren === void 0 ? void 0 : convertedChildren.some(([_, innerState]) => isThisNodeSelected === innerState.selectAllChildren && innerState.toggledNodes.size === 0);
            if (doesRedundantStateExist) {
                throw new Error(`
                    AG Grid: AG Grid: Row selection state could not be parsed due to invalid data. Ensure all child state has toggledNodes or does not conform with the parent rule.
                    Please rebuild the selection state and reapply it.
                `);
            }
            return {
                selectAllChildren: isThisNodeSelected,
                toggledNodes: new Map(convertedChildren),
            };
        };
        try {
            this.selectedState = recursivelyDeserializeState(state, !!state.selectAllChildren);
        }
        catch (e) {
            console.error(e.message);
        }
    }
    deleteSelectionStateFromParent(parentRoute, removedNodeIds) {
        let parentState = this.selectedState;
        const remainingRoute = [...parentRoute];
        while (parentState && remainingRoute.length) {
            parentState = parentState.toggledNodes.get(remainingRoute.pop());
        }
        // parent has no explicit state, nothing to remove
        if (!parentState) {
            return false;
        }
        let anyStateChanged = false;
        removedNodeIds.forEach(id => {
            if (parentState === null || parentState === void 0 ? void 0 : parentState.toggledNodes.delete(id)) {
                anyStateChanged = true;
            }
        });
        if (anyStateChanged) {
            this.removeRedundantState();
        }
        return anyStateChanged;
    }
    setNodeSelected(params) {
        if (params.rangeSelect) {
            const nodes = this.rowModel.getNodesInRangeForSelection(params.node, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            const routes = nodes.map(this.getRouteToNode).sort((a, b) => b.length - a.length);
            // skip routes if we've already done a descendent
            const completedRoutes = new Set();
            routes.forEach(route => {
                // skip routes if we've already selected a descendent
                if (completedRoutes.has(route[route.length - 1])) {
                    return;
                }
                route.forEach(part => completedRoutes.add(part));
                this.recursivelySelectNode(route, this.selectedState, params);
            });
            this.removeRedundantState();
            this.lastSelected = params.node;
            return 1;
        }
        const idPathToNode = this.getRouteToNode(params.node);
        this.recursivelySelectNode(idPathToNode, this.selectedState, params);
        this.removeRedundantState();
        this.lastSelected = params.node;
        return 1;
    }
    isNodeSelected(node) {
        const path = this.getRouteToNode(node);
        return this.isNodePathSelected(path, this.selectedState);
    }
    isNodePathSelected([nextNode, ...nodes], state) {
        if (nodes.length === 0) {
            const isToggled = state.toggledNodes.has(nextNode.id);
            if (nextNode.hasChildren()) {
                const groupState = state.toggledNodes.get(nextNode.id);
                if (groupState && groupState.toggledNodes.size) {
                    return undefined;
                }
            }
            return state.selectAllChildren ? !isToggled : isToggled;
        }
        // if there's a deeper level, check recursively
        if (state.toggledNodes.has(nextNode.id)) {
            const nextState = state.toggledNodes.get(nextNode.id);
            if (nextState) {
                return this.isNodePathSelected(nodes, nextState);
            }
        }
        // no deeper custom state, respect the closest default
        return !!state.selectAllChildren;
    }
    getRouteToNode(node) {
        const pathToNode = [];
        let tempNode = node;
        while (tempNode.parent) {
            pathToNode.push(tempNode);
            tempNode = tempNode.parent;
        }
        return pathToNode.reverse();
    }
    removeRedundantState() {
        if (this.filterManager.isAnyFilterPresent()) {
            return;
        }
        const recursivelyRemoveState = (selectedState = this.selectedState, store = this.serverSideRowModel.getRootStore(), node) => {
            let allChildNodesFound = true;
            let noIndeterminateChildren = true;
            selectedState.toggledNodes.forEach((state, id) => {
                const parentNode = this.rowModel.getRowNode(id);
                if (!parentNode) {
                    allChildNodesFound = false;
                }
                const nextStore = parentNode === null || parentNode === void 0 ? void 0 : parentNode.childStore;
                if (!nextStore) {
                    if (state.toggledNodes.size > 0) {
                        noIndeterminateChildren = false;
                    }
                    return;
                }
                // if child was cleared, check if this state is still relevant
                if (recursivelyRemoveState(state, nextStore, parentNode)) {
                    // cleans out groups which have no toggled nodes and an equivalent default to its parent
                    if (selectedState.selectAllChildren === state.selectAllChildren) {
                        selectedState.toggledNodes.delete(id);
                    }
                }
                if (state.toggledNodes.size > 0) {
                    noIndeterminateChildren = false;
                }
            });
            if (!store || !store.isLastRowIndexKnown() || store.getRowCount() !== selectedState.toggledNodes.size) {
                // if row count unknown, or doesn't match the size of toggledNodes, ignore.
                return false;
            }
            if (noIndeterminateChildren && allChildNodesFound) {
                selectedState.toggledNodes.clear();
                selectedState.selectAllChildren = !selectedState.selectAllChildren;
                // if node was indeterminate, it's not any more.
                if (node && (node === null || node === void 0 ? void 0 : node.isSelected()) !== selectedState.selectAllChildren) {
                    node.selectThisNode(selectedState.selectAllChildren, undefined, 'api');
                }
                return true;
            }
            return false;
        };
        recursivelyRemoveState();
    }
    recursivelySelectNode([nextNode, ...nodes], selectedState, params) {
        if (!nextNode) {
            return;
        }
        // if this is the last node, hard add/remove based on its selectAllChildren state
        const isLastNode = !nodes.length;
        if (isLastNode) {
            const needsDeleted = selectedState.selectAllChildren === params.newValue;
            if (needsDeleted) {
                selectedState.toggledNodes.delete(nextNode.id);
                return;
            }
            const newState = {
                selectAllChildren: params.newValue,
                toggledNodes: new Map(),
            };
            selectedState.toggledNodes.set(nextNode.id, newState);
            return;
        }
        const doesStateAlreadyExist = selectedState.toggledNodes.has(nextNode.id);
        const childState = doesStateAlreadyExist ? (selectedState.toggledNodes.get(nextNode.id)) : {
            selectAllChildren: selectedState.selectAllChildren,
            toggledNodes: new Map(),
        };
        if (!doesStateAlreadyExist) {
            selectedState.toggledNodes.set(nextNode.id, childState);
        }
        this.recursivelySelectNode(nodes, childState, params);
        // cleans out groups which have no toggled nodes and an equivalent default to its parent
        if (selectedState.selectAllChildren === childState.selectAllChildren && childState.toggledNodes.size === 0) {
            selectedState.toggledNodes.delete(nextNode.id);
        }
    }
    getSelectedNodes() {
        console.warn(`AG Grid: \`getSelectedNodes\` and \`getSelectedRows\` functions cannot be used with \`groupSelectsChildren\` and the server-side row model.
            Use \`api.getServerSideSelectionState()\` instead.`);
        const selectedNodes = [];
        this.rowModel.forEachNode(node => {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        });
        return selectedNodes;
    }
    processNewRow(node) {
        // This is used for updating outdated node refs, as this model entirely uses ids it's irrelevant
    }
    getSelectedRows() {
        return this.getSelectedNodes().map(node => node.data);
    }
    getSelectionCount() {
        return -1;
    }
    isEmpty() {
        var _a;
        return !this.selectedState.selectAllChildren && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    }
    selectAllRowNodes(params) {
        this.selectedState = { selectAllChildren: true, toggledNodes: new Map() };
    }
    deselectAllRowNodes(params) {
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
    }
    getSelectAllState(justFiltered, justCurrentPage) {
        if (this.selectedState.selectAllChildren) {
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
    Autowired('rowModel')
], GroupSelectsChildrenStrategy.prototype, "rowModel", void 0);
__decorate([
    Autowired('columnModel')
], GroupSelectsChildrenStrategy.prototype, "columnModel", void 0);
__decorate([
    Autowired('filterManager')
], GroupSelectsChildrenStrategy.prototype, "filterManager", void 0);
__decorate([
    Autowired('rowModel')
], GroupSelectsChildrenStrategy.prototype, "serverSideRowModel", void 0);
__decorate([
    Autowired('selectionService')
], GroupSelectsChildrenStrategy.prototype, "selectionService", void 0);
__decorate([
    PostConstruct
], GroupSelectsChildrenStrategy.prototype, "init", null);
