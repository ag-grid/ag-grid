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
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
import { DefaultStrategy } from "./selection/strategies/defaultStrategy";
import { GroupSelectsChildrenStrategy } from "./selection/strategies/groupSelectsChildrenStrategy";
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
            var StrategyClazz = !propChange.currentValue ? DefaultStrategy : GroupSelectsChildrenStrategy;
            _this.selectionStrategy = _this.createManagedBean(new StrategyClazz());
            _this.shotgunResetNodeSelectionState();
            var event = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            _this.eventService.dispatchEvent(event);
        });
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', function (propChange) { return _this.rowSelection = propChange.currentValue; });
        var StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    };
    ServerSideSelectionService.prototype.getServerSideSelectionState = function () {
        return this.selectionStrategy.getSelectedState();
    };
    ServerSideSelectionService.prototype.setServerSideSelectionState = function (state) {
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        var event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.setNodesSelected = function (params) {
        if (params.nodes.length > 1 && this.rowSelection !== 'multiple') {
            console.warn("AG Grid: cannot multi select while rowSelection='single'");
            return 0;
        }
        if (params.nodes.length > 1 && params.rangeSelect) {
            console.warn("AG Grid: cannot use range selection when multi selecting rows");
            return 0;
        }
        var changedNodes = this.selectionStrategy.setNodesSelected(params);
        this.shotgunResetNodeSelectionState(params.source);
        var event = {
            type: Events.EVENT_SELECTION_CHANGED,
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
            type: Events.EVENT_SELECTION_CHANGED,
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
            type: Events.EVENT_SELECTION_CHANGED,
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
            type: Events.EVENT_SELECTION_CHANGED,
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
        Autowired('rowModel')
    ], ServerSideSelectionService.prototype, "rowModel", void 0);
    __decorate([
        PostConstruct
    ], ServerSideSelectionService.prototype, "init", null);
    ServerSideSelectionService = __decorate([
        Bean('selectionService')
    ], ServerSideSelectionService);
    return ServerSideSelectionService;
}(BeanStub));
export { ServerSideSelectionService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU2lkZVNlbGVjdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL3NlcnZpY2VzL3NlcnZlclNpZGVTZWxlY3Rpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBZSxNQUFNLEVBQTJGLGFBQWEsRUFBd0csTUFBTSx5QkFBeUIsQ0FBQztBQUN2UyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDekUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFJbkc7SUFBZ0QsOENBQVE7SUFBeEQ7O0lBNkxBLENBQUM7SUF2TFcseUNBQUksR0FBWjtRQURBLGlCQXNCQztRQXBCRyxJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsMEJBQTBCLENBQUMsc0JBQXNCLEVBQUUsVUFBQyxVQUFVO1lBQy9ELEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFekMsSUFBTSxhQUFhLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDO1lBQ2hHLEtBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBRXJFLEtBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO1lBQ3RDLElBQU0sS0FBSyxHQUE2QztnQkFDcEQsSUFBSSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUI7Z0JBQ3BDLE1BQU0sRUFBRSxLQUFLO2FBQ2hCLENBQUM7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