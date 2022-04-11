"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var core_1 = require("@ag-grid-community/core");
var FilterAggregatesStage = /** @class */ (function (_super) {
    __extends(FilterAggregatesStage, _super);
    function FilterAggregatesStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterAggregatesStage.prototype.execute = function (params) {
        var _this = this;
        var isPivotMode = this.columnModel.isPivotMode();
        var isAggFilterActive = this.filterManager.isAggregateFilterPresent();
        // This is the default filter for applying only to leaf nodes, realistically this should not apply as primary agg columns,
        // should not be applied by the filterManager if getGroupAggFiltering is missing. Predicate will apply filters to leaf level.
        var defaultPrimaryColumnPredicate = function (params) { return !params.node.group; };
        // Default secondary column predicate, selecting only leaf level groups.
        var defaultSecondaryColumnPredicate = (function (params) { return params.node.leafGroup; });
        // The predicate to determine whether filters should apply to this row. Either defined by the user in groupAggFiltering or a default depending
        // on current pivot mode status.
        var applyFilterToNode = this.gridOptionsWrapper.getGroupAggFiltering()
            || (isPivotMode ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);
        var changedPath = params.changedPath;
        var preserveFilterStageConfig = function (node) {
            node.childrenAfterAggFilter = node.childrenAfterFilter;
            var childCount = node.childrenAfterAggFilter.reduce(function (acc, child) { return (acc + (child.allChildrenCount || 1)); }, 0);
            node.setAllChildrenCount(childCount);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        var preserveChildren = function (node) {
            if (node.childrenAfterFilter) {
                node.childrenAfterAggFilter = node.childrenAfterFilter;
                var childCount = node.childrenAfterAggFilter.reduce(function (acc, child) {
                    preserveChildren(child);
                    return acc + (child.allChildrenCount || 1);
                }, 0);
                node.setAllChildrenCount(childCount);
            }
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        var filterChildren = function (node) {
            var _a;
            var childCount = 0;
            node.childrenAfterAggFilter = ((_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.filter(function (child) {
                var _a;
                var shouldFilterRow = applyFilterToNode({ node: child });
                if (shouldFilterRow) {
                    var doesNodePassFilter = _this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
                    if (doesNodePassFilter) {
                        // Node has passed, so preserve children
                        preserveChildren(child);
                        childCount += child.allChildrenCount || 1;
                        return true;
                    }
                }
                var hasChildPassed = (_a = child.childrenAfterAggFilter) === null || _a === void 0 ? void 0 : _a.length;
                if (hasChildPassed) {
                    childCount += child.allChildrenCount || 1;
                    return true;
                }
                return false;
            })) || null;
            node.setAllChildrenCount(childCount);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        changedPath.forEachChangedNodeDepthFirst(isAggFilterActive ? filterChildren : preserveFilterStageConfig, false);
    };
    __decorate([
        core_1.Autowired('filterManager')
    ], FilterAggregatesStage.prototype, "filterManager", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], FilterAggregatesStage.prototype, "columnModel", void 0);
    FilterAggregatesStage = __decorate([
        core_1.Bean('filterAggregatesStage')
    ], FilterAggregatesStage);
    return FilterAggregatesStage;
}(core_1.BeanStub));
exports.FilterAggregatesStage = FilterAggregatesStage;
//# sourceMappingURL=filterAggregatesStage.js.map