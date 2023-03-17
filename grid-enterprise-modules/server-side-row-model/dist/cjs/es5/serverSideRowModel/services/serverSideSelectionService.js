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
        var groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
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
        var StrategyClazz = !groupSelectsChildren ? defaultStrategy_1.DefaultStrategy : groupSelectsChildrenStrategy_1.GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    };
    ServerSideSelectionService.prototype.getServerSideSelectionState = function () {
        return this.selectionStrategy.getSelectedState();
    };
    ServerSideSelectionService.prototype.setServerSideSelectionState = function (state) {
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.setNodeSelected = function (params) {
        var changedNodes = this.selectionStrategy.setNodeSelected(params);
        this.shotgunResetNodeSelectionState(params.source);
        var event = {
            type: core_1.Events.EVENT_SELECTION_CHANGED,
            source: params.source,
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
        core_1.Autowired('rowModel')
    ], ServerSideSelectionService.prototype, "rowModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], ServerSideSelectionService.prototype, "init", null);
    ServerSideSelectionService = __decorate([
        core_1.Bean('selectionService')
    ], ServerSideSelectionService);
    return ServerSideSelectionService;
}(core_1.BeanStub));
exports.ServerSideSelectionService = ServerSideSelectionService;
