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
exports.FilterAggregatesStage = void 0;
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
