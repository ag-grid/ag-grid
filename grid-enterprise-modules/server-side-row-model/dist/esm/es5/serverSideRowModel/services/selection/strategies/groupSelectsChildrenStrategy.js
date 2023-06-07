var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
        var remainingRoute = __spreadArray([], __read(parentRoute));
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
    GroupSelectsChildrenStrategy.prototype.setNodesSelected = function (params) {
        var _this = this;
        var nodes = params.nodes, other = __rest(params, ["nodes"]);
        if (nodes.length === 0)
            return 0;
        if (params.rangeSelect) {
            if (nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            var node_1 = nodes[0];
            var rangeOfNodes = this.rowModel.getNodesInRangeForSelection(node_1, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            var routes = rangeOfNodes.map(this.getRouteToNode).sort(function (a, b) { return b.length - a.length; });
            // skip routes if we've already done a descendent
            var completedRoutes_1 = new Set();
            routes.forEach(function (route) {
                // skip routes if we've already selected a descendent
                if (completedRoutes_1.has(route[route.length - 1])) {
                    return;
                }
                route.forEach(function (part) { return completedRoutes_1.add(part); });
                _this.recursivelySelectNode(route, _this.selectedState, __assign({ node: node_1 }, other));
            });
            this.removeRedundantState();
            this.lastSelected = node_1;
            return 1;
        }
        params.nodes.forEach(function (node) {
            var idPathToNode = _this.getRouteToNode(node);
            _this.recursivelySelectNode(idPathToNode, _this.selectedState, __assign(__assign({}, other), { node: node }));
        });
        this.removeRedundantState();
        this.lastSelected = params.nodes[params.nodes.length - 1];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBTZWxlY3RzQ2hpbGRyZW5TdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvc2VydmljZXMvc2VsZWN0aW9uL3N0cmF0ZWdpZXMvZ3JvdXBTZWxlY3RzQ2hpbGRyZW5TdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQStJLGFBQWEsRUFBRSxNQUFNLEVBQXVDLE1BQU0seUJBQXlCLENBQUM7QUFTdlE7SUFBa0QsZ0RBQVE7SUFBMUQ7UUFBQSxxRUF3VkM7UUFqVlcsbUJBQWEsR0FBbUIsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUN0RixrQkFBWSxHQUFtQixJQUFJLENBQUM7O0lBZ1ZoRCxDQUFDO0lBN1VXLDJDQUFJLEdBQVo7UUFEQSxpQkFPQztRQUxHLHlGQUF5RjtRQUN6RixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUEzQixDQUEyQixDQUFDLENBQUM7UUFFMUcsa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxFQUE3QixDQUE2QixDQUFDLENBQUM7SUFDM0gsQ0FBQztJQUVNLHVEQUFnQixHQUF2QjtRQUFBLGlCQXVCQztRQXRCRyxJQUFNLHlCQUF5QixHQUFHLFVBQUMsS0FBcUIsRUFBRSxL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