"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultStrategy = void 0;
var core_1 = require("@ag-grid-community/core");
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
            toggledNodes: __spread(this.selectedState.toggledNodes),
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
    DefaultStrategy.prototype.setNodeSelected = function (params) {
        var _a;
        var _this = this;
        var onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
        if (this.rowSelection !== 'multiple' || onlyThisNode) {
            if (params.newValue) {
                this.selectedNodes = (_a = {}, _a[params.node.id] = params.node, _a);
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
            var lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
            this.rowModel.getNodesInRangeForSelection(params.node, lastSelectedNode !== null && lastSelectedNode !== void 0 ? lastSelectedNode : null).forEach(updateNodeState);
            this.lastSelected = params.node.id;
            return 1;
        }
        updateNodeState(params.node);
        this.lastSelected = params.node.id;
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
            type: core_1.Events.EVENT_SELECTION_CHANGED,
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
        core_1.Autowired('rowModel')
    ], DefaultStrategy.prototype, "rowModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], DefaultStrategy.prototype, "init", null);
    return DefaultStrategy;
}(core_1.BeanStub));
exports.DefaultStrategy = DefaultStrategy;
