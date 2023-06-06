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
import { Autowired, Bean, BeanStub, } from "@ag-grid-community/core";
var FilterAggregatesStage = /** @class */ (function (_super) {
    __extends(FilterAggregatesStage, _super);
    function FilterAggregatesStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterAggregatesStage.prototype.execute = function (params) {
        var _this = this;
        var isPivotMode = this.columnModel.isPivotMode();
        var isAggFilterActive = this.filterManager.isAggregateFilterPresent()
            || this.filterManager.isAggregateQuickFilterPresent();
        // This is the default filter for applying only to leaf nodes, realistically this should not apply as primary agg columns,
        // should not be applied by the filterManager if getGroupAggFiltering is missing. Predicate will apply filters to leaf level.
        var defaultPrimaryColumnPredicate = function (params) { return !params.node.group; };
        // Default secondary column predicate, selecting only leaf level groups.
        var defaultSecondaryColumnPredicate = (function (params) { return params.node.leafGroup; });
        // The predicate to determine whether filters should apply to this row. Either defined by the user in groupAggFiltering or a default depending
        // on current pivot mode status.
        var applyFilterToNode = this.gridOptionsService.getGroupAggFiltering()
            || (isPivotMode ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);
        var changedPath = params.changedPath;
        var preserveChildren = function (node, recursive) {
            if (recursive === void 0) { recursive = false; }
            if (node.childrenAfterFilter) {
                node.childrenAfterAggFilter = node.childrenAfterFilter;
                if (recursive) {
                    node.childrenAfterAggFilter.forEach(function (child) { return preserveChildren(child, recursive); });
                }
                _this.setAllChildrenCount(node);
            }
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        var filterChildren = function (node) {
            var _a;
            node.childrenAfterAggFilter = ((_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.filter(function (child) {
                var _a;
                var shouldFilterRow = applyFilterToNode({ node: child });
                if (shouldFilterRow) {
                    var doesNodePassFilter = _this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
                    if (doesNodePassFilter) {
                        // Node has passed, so preserve children
                        preserveChildren(child, true);
                        return true;
                    }
                }
                var hasChildPassed = (_a = child.childrenAfterAggFilter) === null || _a === void 0 ? void 0 : _a.length;
                return hasChildPassed;
            })) || null;
            _this.setAllChildrenCount(node);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        changedPath.forEachChangedNodeDepthFirst(isAggFilterActive ? filterChildren : preserveChildren, true);
    };
    FilterAggregatesStage.prototype.setAllChildrenCountTreeData = function (rowNode) {
        // for tree data, we include all children, groups and leafs
        var allChildrenCount = 0;
        rowNode.childrenAfterAggFilter.forEach(function (child) {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    };
    FilterAggregatesStage.prototype.setAllChildrenCountGridGrouping = function (rowNode) {
        // for grid data, we only count the leafs
        var allChildrenCount = 0;
        rowNode.childrenAfterAggFilter.forEach(function (child) {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            }
            else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    };
    FilterAggregatesStage.prototype.setAllChildrenCount = function (rowNode) {
        if (!rowNode.hasChildren()) {
            rowNode.setAllChildrenCount(null);
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
            this.setAllChildrenCountTreeData(rowNode);
        }
        else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    };
    __decorate([
        Autowired('filterManager')
    ], FilterAggregatesStage.prototype, "filterManager", void 0);
    __decorate([
        Autowired('columnModel')
    ], FilterAggregatesStage.prototype, "columnModel", void 0);
    FilterAggregatesStage = __decorate([
        Bean('filterAggregatesStage')
    ], FilterAggregatesStage);
    return FilterAggregatesStage;
}(BeanStub));
export { FilterAggregatesStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyQWdncmVnYXRlc1N0YWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2ZpbHRlckFnZ3JlZ2F0ZXNTdGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFHSixRQUFRLEdBSVgsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUEyQyx5Q0FBUTtJQUFuRDs7SUFzR0EsQ0FBQztJQWpHVSx1Q0FBTyxHQUFkLFVBQWUsTUFBMEI7UUFBekMsaUJBMERDO1FBekRHLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkQsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUF3QixFQUFFO2VBQ2hFLElBQUksQ0FBQyxhQUFhLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUUxRCwwSEFBMEg7UUFDMUgsNkhBQTZIO1FBQzdILElBQU0sNkJBQTZCLEdBQUcsVUFBQyxNQUF5QixJQUFLLE9BQUEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBbEIsQ0FBa0IsQ0FBQztRQUV4Rix3RUFBd0U7UUFDeEUsSUFBTSwrQkFBK0IsR0FBRyxDQUFDLFVBQUMsTUFBeUIsSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFyQixDQUFxQixDQUFDLENBQUM7UUFFL0YsOElBQThJO1FBQzlJLGdDQUFnQztRQUNoQyxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsRUFBRTtlQUNqRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFL0UsSUFBQSxXQUFXLEdBQUssTUFBTSxZQUFYLENBQVk7UUFFL0IsSUFBTSxnQkFBZ0Is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