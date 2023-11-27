"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideSelectionService = void 0;
var core_1 = require("@ag-grid-community/core");
var defaultStrategy_1 = require("./selection/strategies/defaultStrategy");
var groupSelectsChildrenStrategy_1 = require("./selection/strategies/groupSelectsChildrenStrategy");
var ServerSideSelectionService = /** @class */ (function (_super) {
    __extends(ServerSideSelectionService, _super);
    function ServerSideSelectionService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServerSideSelectionService.prototype.init = function () {
        var _this = this;
        var groupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', function (propChange) {
            _this.destroyBean(_this.selectionStrategy);
            var StrategyClazz = !propChange.currentValue ? defaultStrategy_1.DefaultStrategy : groupSelectsChildrenStrategy_1.GroupSelectsChildrenStrategy;
            _this.selectionStrategy = _this.createManagedBean(new StrategyClazz());
            _this.shotgunResetNodeSelectionState();
            var event = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            _this.eventService.dispatchEvent(event);
        });
        this.addManagedPropertyListener('rowSelection', function () { return _this.deselectAllRowNodes({ source: 'api' }); });
        var StrategyClazz = !groupSelectsChildren ? defaultStrategy_1.DefaultStrategy : groupSelectsChildrenStrategy_1.GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    };
    ServerSideSelectionService.prototype.getSelectionState = function () {
        return this.selectionStrategy.getSelectedState();
    };
    ServerSideSelectionService.prototype.setSelectionState = function (state, source) {
        if (Array.isArray(state)) {
            return;
        }
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: source,
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.setNodesSelected = function (params) {
        var nodes = params.nodes, otherParams = __rest(params, ["nodes"]);
        var rowSelection = this.gridOptionsService.get('rowSelection');
        if (nodes.length > 1 && rowSelection !== 'multiple') {
            console.warn("AG Grid: cannot multi select while rowSelection='single'");
            return 0;
        }
        if (nodes.length > 1 && params.rangeSelect) {
            console.warn("AG Grid: cannot use range selection when multi selecting rows");
            return 0;
        }
        var adjustedParams = __assign({ nodes: nodes.filter(function (node) { return node.selectable; }) }, otherParams);
        // if no selectable nodes, then return 0
        if (!adjustedParams.nodes.length) {
            return 0;
        }
        var changedNodes = this.selectionStrategy.setNodesSelected(adjustedParams);
        this.shotgunResetNodeSelectionState(adjustedParams.source);
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: adjustedParams.source,
        };
        this.eventService.dispatchEvent(event);
        return changedNodes;
    };
    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    ServerSideSelectionService.prototype.deleteSelectionStateFromParent = function (storeRoute, removedNodeIds) {
        var stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
        if (!stateChanged) {
            return;
        }
        this.shotgunResetNodeSelectionState();
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.shotgunResetNodeSelectionState = function (source) {
        var _this = this;
        this.rowModel.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            var isNodeSelected = _this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                node.selectThisNode(isNodeSelected, undefined, source);
            }
        });
    };
    ServerSideSelectionService.prototype.getSelectedNodes = function () {
        return this.selectionStrategy.getSelectedNodes();
    };
    ServerSideSelectionService.prototype.getSelectedRows = function () {
        return this.selectionStrategy.getSelectedRows();
    };
    ServerSideSelectionService.prototype.getSelectionCount = function () {
        return this.selectionStrategy.getSelectionCount();
    };
    ServerSideSelectionService.prototype.syncInRowNode = function (rowNode, oldNode) {
        // update any refs being held in the strategies
        this.selectionStrategy.processNewRow(rowNode);
        var isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);
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
            var event_1 = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            this.eventService.dispatchEvent(event_1);
            return;
        }
        rowNode.setSelectedInitialValue(isNodeSelected);
    };
    ServerSideSelectionService.prototype.reset = function () {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
    };
    ServerSideSelectionService.prototype.isEmpty = function () {
        return this.selectionStrategy.isEmpty();
    };
    ServerSideSelectionService.prototype.selectAllRowNodes = function (params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.selectAllRowNodes(params);
        this.rowModel.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            node.selectThisNode(true, undefined, params.source);
        });
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.deselectAllRowNodes = function (params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.deselectAllRowNodes(params);
        this.rowModel.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            node.selectThisNode(false, undefined, params.source);
        });
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
        return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
    };
    // used by CSRM
    ServerSideSelectionService.prototype.updateGroupsFromChildrenSelections = function (source, changedPath) {
        return false;
    };
    // used by CSRM
    ServerSideSelectionService.prototype.getBestCostNodeSelection = function () {
        console.warn('AG Grid: calling gridApi.getBestCostNodeSelection() is only possible when using rowModelType=`clientSide`.');
        return undefined;
    };
    // used by CSRM
    ServerSideSelectionService.prototype.filterFromSelection = function () {
        return;
    };
    __decorate([
        (0, core_1.Autowired)('rowModel')
    ], ServerSideSelectionService.prototype, "rowModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], ServerSideSelectionService.prototype, "init", null);
    ServerSideSelectionService = __decorate([
        (0, core_1.Bean)('selectionService')
    ], ServerSideSelectionService);
    return ServerSideSelectionService;
}(core_1.BeanStub));
exports.ServerSideSelectionService = ServerSideSelectionService;
