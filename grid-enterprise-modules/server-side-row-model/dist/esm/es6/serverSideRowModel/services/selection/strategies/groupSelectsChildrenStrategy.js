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
    setNodesSelected(params) {
        const { nodes } = params, other = __rest(params, ["nodes"]);
        if (nodes.length === 0)
            return 0;
        if (params.rangeSelect) {
            if (nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            const node = nodes[0];
            const rangeOfNodes = this.rowModel.getNodesInRangeForSelection(node, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            const routes = rangeOfNodes.map(this.getRouteToNode).sort((a, b) => b.length - a.length);
            // skip routes if we've already done a descendent
            const completedRoutes = new Set();
            routes.forEach(route => {
                // skip routes if we've already selected a descendent
                if (completedRoutes.has(route[route.length - 1])) {
                    return;
                }
                route.forEach(part => completedRoutes.add(part));
                this.recursivelySelectNode(route, this.selectedState, Object.assign({ node }, other));
            });
            this.removeRedundantState();
            this.lastSelected = node;
            return 1;
        }
        params.nodes.forEach(node => {
            const idPathToNode = this.getRouteToNode(node);
            this.recursivelySelectNode(idPathToNode, this.selectedState, Object.assign(Object.assign({}, other), { node }));
        });
        this.removeRedundantState();
        this.lastSelected = params.nodes[params.nodes.length - 1];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBTZWxlY3RzQ2hpbGRyZW5TdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvc2VydmljZXMvc2VsZWN0aW9uL3N0cmF0ZWdpZXMvZ3JvdXBTZWxlY3RzQ2hpbGRyZW5TdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUErSSxhQUFhLEVBQUUsTUFBTSxFQUF1QyxNQUFNLHlCQUF5QixDQUFDO0FBU3ZRLE1BQU0sT0FBTyw0QkFBNkIsU0FBUSxRQUFRO0lBQTFEOztRQU9ZLGtCQUFhLEdBQW1CLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7UUFDdEYsaUJBQVksR0FBbUIsSUFBSSxDQUFDO0lBZ1ZoRCxDQUFDO0lBN1VXLElBQUk7UUFDUix5RkFBeUY7UUFDekYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFFMUcsa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMzSCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEtBQWEsRUFBRSxNQUFlLEVBQUUsRUFBRTtZQUN4RixNQUFNLGVBQWUsR0FBbUM7Z0JBQ3BELE1BQU07YUFDVCxDQUFDO1lBRUYsSUFBSSxLQUFLLElBQUksSUFBSSxD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