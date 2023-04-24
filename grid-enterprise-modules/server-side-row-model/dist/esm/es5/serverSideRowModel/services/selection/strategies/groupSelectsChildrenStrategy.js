var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { Autowired, BeanStub, PostConstruct, Events } from "@ag-grid-community/core";
var GroupSelectsChildrenStrategy = /** @class */ (function (_super) {
    __extends(GroupSelectsChildrenStrategy, _super);
    function GroupSelectsChildrenStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
        _this.lastSelected = null;
        return _this;
    }
    GroupSelectsChildrenStrategy.prototype.init = function () {
        var _this = this;
        // if model has updated, a store may now be fully loaded to clean up indeterminate states
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, function () { return _this.removeRedundantState(); });
        // when the grouping changes, the state no longer makes sense, so reset the state.
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.selectionService.reset(); });
    };
    GroupSelectsChildrenStrategy.prototype.getSelectedState = function () {
        var _this = this;
        var recursivelySerializeState = function (state, level, nodeId) {
            var normalisedState = {
                nodeId: nodeId,
            };
            if (level <= _this.columnModel.getRowGroupColumns().length) {
                normalisedState.selectAllChildren = state.selectAllChildren;
            }
            // omit toggledNodes if empty
            if (state.toggledNodes.size) {
                var toggledNodes_1 = [];
                state.toggledNodes.forEach(function (value, key) {
                    var newState = recursivelySerializeState(value, level + 1, key);
                    toggledNodes_1.push(newState);
                });
                normalisedState.toggledNodes = toggledNodes_1;
            }
            return normalisedState;
        };
        return recursivelySerializeState(this.selectedState, 0);
    };
    GroupSelectsChildrenStrategy.prototype.setSelectedState = function (state) {
        var recursivelyDeserializeState = function (normalisedState, parentSelected) {
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
                var allHaveIds = normalisedState.toggledNodes.every(function (innerState) { return (typeof innerState === 'object' && 'nodeId' in innerState && typeof innerState.nodeId === 'string'); });
                if (!allHaveIds) {
                    throw new Error('AG Grid: Every `toggledNode` requires an associated string id.');
                }
            }
            var isThisNodeSelected = (_a = normalisedState.selectAllChildren) !== null && _a !== void 0 ? _a : !parentSelected;
            var convertedChildren = (_b = normalisedState.toggledNodes) === null || _b === void 0 ? void 0 : _b.map(function (innerState) { return ([innerState.nodeId, recursivelyDeserializeState(innerState, isThisNodeSelected)]); });
            var doesRedundantStateExist = convertedChildren === null || convertedChildren === void 0 ? void 0 : convertedChildren.some(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], innerState = _b[1];
                return isThisNodeSelected === innerState.selectAllChildren && innerState.toggledNodes.size === 0;
            });
            if (doesRedundantStateExist) {
                throw new Error("\n                    AG Grid: AG Grid: Row selection state could not be parsed due to invalid data. Ensure all child state has toggledNodes or does not conform with the parent rule.\n                    Please rebuild the selection state and reapply it.\n                ");
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
    };
    GroupSelectsChildrenStrategy.prototype.deleteSelectionStateFromParent = function (parentRoute, removedNodeIds) {
        var parentState = this.selectedState;
        var remainingRoute = __spread(parentRoute);
        while (parentState && remainingRoute.length) {
            parentState = parentState.toggledNodes.get(remainingRoute.pop());
        }
        // parent has no explicit state, nothing to remove
        if (!parentState) {
            return false;
        }
        var anyStateChanged = false;
        removedNodeIds.forEach(function (id) {
            if (parentState === null || parentState === void 0 ? void 0 : parentState.toggledNodes.delete(id)) {
                anyStateChanged = true;
            }
        });
        if (anyStateChanged) {
            this.removeRedundantState();
        }
        return anyStateChanged;
    };
    GroupSelectsChildrenStrategy.prototype.setNodeSelected = function (params) {
        var _this = this;
        if (params.rangeSelect) {
            var nodes = this.rowModel.getNodesInRangeForSelection(params.node, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            var routes = nodes.map(this.getRouteToNode).sort(function (a, b) { return b.length - a.length; });
            // skip routes if we've already done a descendent
            var completedRoutes_1 = new Set();
            routes.forEach(function (route) {
                // skip routes if we've already selected a descendent
                if (completedRoutes_1.has(route[route.length - 1])) {
                    return;
                }
                route.forEach(function (part) { return completedRoutes_1.add(part); });
                _this.recursivelySelectNode(route, _this.selectedState, params);
            });
            this.removeRedundantState();
            this.lastSelected = params.node;
            return 1;
        }
        var idPathToNode = this.getRouteToNode(params.node);
        this.recursivelySelectNode(idPathToNode, this.selectedState, params);
        this.removeRedundantState();
        this.lastSelected = params.node;
        return 1;
    };
    GroupSelectsChildrenStrategy.prototype.isNodeSelected = function (node) {
        var path = this.getRouteToNode(node);
        return this.isNodePathSelected(path, this.selectedState);
    };
    GroupSelectsChildrenStrategy.prototype.isNodePathSelected = function (_a, state) {
        var _b = __read(_a), nextNode = _b[0], nodes = _b.slice(1);
        if (nodes.length === 0) {
            var isToggled = state.toggledNodes.has(nextNode.id);
            if (nextNode.hasChildren()) {
                var groupState = state.toggledNodes.get(nextNode.id);
                if (groupState && groupState.toggledNodes.size) {
                    return undefined;
                }
            }
            return state.selectAllChildren ? !isToggled : isToggled;
        }
        // if there's a deeper level, check recursively
        if (state.toggledNodes.has(nextNode.id)) {
            var nextState = state.toggledNodes.get(nextNode.id);
            if (nextState) {
                return this.isNodePathSelected(nodes, nextState);
            }
        }
        // no deeper custom state, respect the closest default
        return !!state.selectAllChildren;
    };
    GroupSelectsChildrenStrategy.prototype.getRouteToNode = function (node) {
        var pathToNode = [];
        var tempNode = node;
        while (tempNode.parent) {
            pathToNode.push(tempNode);
            tempNode = tempNode.parent;
        }
        return pathToNode.reverse();
    };
    GroupSelectsChildrenStrategy.prototype.removeRedundantState = function () {
        var _this = this;
        if (this.filterManager.isAnyFilterPresent()) {
            return;
        }
        var recursivelyRemoveState = function (selectedState, store, node) {
            if (selectedState === void 0) { selectedState = _this.selectedState; }
            if (store === void 0) { store = _this.serverSideRowModel.getRootStore(); }
            var allChildNodesFound = true;
            var noIndeterminateChildren = true;
            selectedState.toggledNodes.forEach(function (state, id) {
                var parentNode = _this.rowModel.getRowNode(id);
                if (!parentNode) {
                    allChildNodesFound = false;
                }
                var nextStore = parentNode === null || parentNode === void 0 ? void 0 : parentNode.childStore;
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
    };
    GroupSelectsChildrenStrategy.prototype.recursivelySelectNode = function (_a, selectedState, params) {
        var _b = __read(_a), nextNode = _b[0], nodes = _b.slice(1);
        if (!nextNode) {
            return;
        }
        // if this is the last node, hard add/remove based on its selectAllChildren state
        var isLastNode = !nodes.length;
        if (isLastNode) {
            var needsDeleted = selectedState.selectAllChildren === params.newValue;
            if (needsDeleted) {
                selectedState.toggledNodes.delete(nextNode.id);
                return;
            }
            var newState = {
                selectAllChildren: params.newValue,
                toggledNodes: new Map(),
            };
            selectedState.toggledNodes.set(nextNode.id, newState);
            return;
        }
        var doesStateAlreadyExist = selectedState.toggledNodes.has(nextNode.id);
        var childState = doesStateAlreadyExist ? (selectedState.toggledNodes.get(nextNode.id)) : {
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
    };
    GroupSelectsChildrenStrategy.prototype.getSelectedNodes = function () {
        console.warn("AG Grid: `getSelectedNodes` and `getSelectedRows` functions cannot be used with `groupSelectsChildren` and the server-side row model.\n            Use `api.getServerSideSelectionState()` instead.");
        var selectedNodes = [];
        this.rowModel.forEachNode(function (node) {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        });
        return selectedNodes;
    };
    GroupSelectsChildrenStrategy.prototype.processNewRow = function (node) {
        // This is used for updating outdated node refs, as this model entirely uses ids it's irrelevant
    };
    GroupSelectsChildrenStrategy.prototype.getSelectedRows = function () {
        return this.getSelectedNodes().map(function (node) { return node.data; });
    };
    GroupSelectsChildrenStrategy.prototype.getSelectionCount = function () {
        return -1;
    };
    GroupSelectsChildrenStrategy.prototype.isEmpty = function () {
        var _a;
        return !this.selectedState.selectAllChildren && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    };
    GroupSelectsChildrenStrategy.prototype.selectAllRowNodes = function (params) {
        this.selectedState = { selectAllChildren: true, toggledNodes: new Map() };
    };
    GroupSelectsChildrenStrategy.prototype.deselectAllRowNodes = function (params) {
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
    };
    GroupSelectsChildrenStrategy.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
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
    };
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
    return GroupSelectsChildrenStrategy;
}(BeanStub));
export { GroupSelectsChildrenStrategy };
