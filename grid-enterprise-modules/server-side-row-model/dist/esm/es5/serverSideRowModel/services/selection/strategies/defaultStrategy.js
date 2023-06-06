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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Autowired, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
var DefaultStrategy = /** @class */ (function (_super) {
    __extends(DefaultStrategy, _super);
    function DefaultStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedState = { selectAll: false, toggledNodes: new Set() };
        _this.lastSelected = null;
        _this.selectAllUsed = false;
        // this is to prevent regressions, default selectionService retains reference of clicked nodes.
        _this.selectedNodes = {};
        return _this;
    }
    DefaultStrategy.prototype.init = function () {
        var _this = this;
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', function (propChange) {
            _this.rowSelection = propChange.currentValue;
        });
    };
    DefaultStrategy.prototype.getSelectedState = function () {
        return {
            selectAll: this.selectedState.selectAll,
            toggledNodes: __spreadArray([], __read(this.selectedState.toggledNodes)),
        };
    };
    DefaultStrategy.prototype.setSelectedState = function (state) {
        // fire selection changed event
        var newState = {
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
            state.toggledNodes.forEach(function (key) {
                if (typeof key === 'string') {
                    newState.toggledNodes.add(key);
                }
                else {
                    console.warn("AG Grid: Provided ids must be of string type. Invalid id provided: " + key);
                }
            });
        }
        else {
            console.error('AG Grid: `toggledNodes` must be an array of string ids.');
            return;
        }
        this.selectedState = newState;
    };
    DefaultStrategy.prototype.deleteSelectionStateFromParent = function (parentPath, removedNodeIds) {
        var _this = this;
        if (this.selectedState.toggledNodes.size === 0) {
            return false;
        }
        var anyNodesToggled = false;
        removedNodeIds.forEach(function (id) {
            if (_this.selectedState.toggledNodes.delete(id)) {
                anyNodesToggled = true;
            }
        });
        return anyNodesToggled;
    };
    DefaultStrategy.prototype.setNodesSelected = function (params) {
        var _a;
        var _this = this;
        if (params.nodes.length === 0)
            return 0;
        var onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
        if (this.rowSelection !== 'multiple' || onlyThisNode) {
            if (params.nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when rowSelection is set to \'single\'');
            }
            var node = params.nodes[0];
            if (params.newValue) {
                this.selectedNodes = (_a = {}, _a[node.id] = node, _a);
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set([node.id]),
                };
            }
            else {
                this.selectedNodes = {};
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set(),
                };
            }
            this.lastSelected = node.id;
            return 1;
        }
        var updateNodeState = function (node) {
            if (params.newValue) {
                _this.selectedNodes[node.id] = node;
            }
            else {
                delete _this.selectedNodes[node.id];
            }
            var doesNodeConform = params.newValue === _this.selectedState.selectAll;
            if (doesNodeConform) {
                _this.selectedState.toggledNodes.delete(node.id);
                return;
            }
            _this.selectedState.toggledNodes.add(node.id);
        };
        if (params.rangeSelect && this.lastSelected) {
            if (params.nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            var node = params.nodes[0];
            var lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
            this.rowModel.getNodesInRangeForSelection(node, lastSelectedNode !== null && lastSelectedNode !== void 0 ? lastSelectedNode : null).forEach(updateNodeState);
            this.lastSelected = node.id;
            return 1;
        }
        params.nodes.forEach(updateNodeState);
        this.lastSelected = params.nodes[params.nodes.length - 1].id;
        return 1;
    };
    DefaultStrategy.prototype.processNewRow = function (node) {
        if (this.selectedNodes[node.id]) {
            this.selectedNodes[node.id] = node;
        }
    };
    DefaultStrategy.prototype.isNodeSelected = function (node) {
        var isToggled = this.selectedState.toggledNodes.has(node.id);
        return this.selectedState.selectAll ? !isToggled : isToggled;
    };
    DefaultStrategy.prototype.getSelectedNodes = function () {
        if (this.selectAllUsed) {
            console.warn("AG Grid: getSelectedNodes and getSelectedRows functions cannot be used with select all functionality with the server-side row model.\n                Use `api.getServerSideSelectionState()` instead.");
        }
        return Object.values(this.selectedNodes);
    };
    DefaultStrategy.prototype.getSelectedRows = function () {
        return this.getSelectedNodes().map(function (node) { return node.data; });
    };
    DefaultStrategy.prototype.getSelectionCount = function () {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size;
    };
    DefaultStrategy.prototype.clearOtherNodes = function (rowNodeToKeepSelected, source) {
        var clearedRows = this.selectedState.selectAll ? 1 : this.selectedState.toggledNodes.size - 1;
        this.selectedState = {
            selectAll: false,
            toggledNodes: new Set([rowNodeToKeepSelected.id]),
        };
        this.rowModel.forEachNode(function (node) {
            if (node !== rowNodeToKeepSelected) {
                node.selectThisNode(false, undefined, source);
            }
        });
        var event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: source,
        };
        this.eventService.dispatchEvent(event);
        return clearedRows;
    };
    DefaultStrategy.prototype.isEmpty = function () {
        var _a;
        return !this.selectedState.selectAll && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    };
    DefaultStrategy.prototype.selectAllRowNodes = function (params) {
        this.selectedState = { selectAll: true, toggledNodes: new Set() };
        this.selectedNodes = {};
        this.selectAllUsed = true;
    };
    DefaultStrategy.prototype.deselectAllRowNodes = function (params) {
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.selectedNodes = {};
    };
    DefaultStrategy.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
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
    };
    __decorate([
        Autowired('rowModel')
    ], DefaultStrategy.prototype, "rowModel", void 0);
    __decorate([
        PostConstruct
    ], DefaultStrategy.prototype, "init", null);
    return DefaultStrategy;
}(BeanStub));
export { DefaultStrategy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zZXJ2aWNlcy9zZWxlY3Rpb24vc3RyYXRlZ2llcy9kZWZhdWx0U3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFhLGFBQWEsRUFBbUksTUFBTSx5QkFBeUIsQ0FBQztBQVFqTztJQUFxQyxtQ0FBUTtJQUE3QztRQUFBLHFFQTBOQztRQXZOVyxtQkFBYSxHQUFrQixFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUM3RSxrQkFBWSxHQUFrQixJQUFJLENBQUM7UUFFbkMsbUJBQWEsR0FBWSxLQUFLLENBQUM7UUFDdkMsK0ZBQStGO1FBQ3ZGLG1CQUFhLEdBQStCLEVBQUUsQ0FBQzs7SUFrTjNELENBQUM7SUE3TVcsOEJBQUksR0FBWjtRQURBLGlCQU9DO1FBTEcsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxjQUFjLEVBQUUsVUFBQyxVQUFVO1lBQ3ZELEtBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFTSwwQ0FBZ0IsR0FBdkI7UUFDSSxPQUFPO1lBQ0gsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUztZQUN2QyxZQUFZLDJCQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFDO1NBQ3JELENBQUM7SUFDTixDQUFDO0lBRU0sMENBQWdCLEdB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