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
var FilterService = /** @class */ (function (_super) {
    __extends(FilterService, _super);
    function FilterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterService.prototype.postConstruct = function () {
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
    };
    FilterService.prototype.filter = function (changedPath) {
        var filterActive = this.filterManager.isAnyFilterPresent();
        this.filterNodes(filterActive, changedPath);
    };
    FilterService.prototype.filterNodes = function (filterActive, changedPath) {
        var _this = this;
        var filterCallback = function (rowNode, includeChildNodes) {
            // recursively get all children that are groups to also filter
            if (rowNode.hasChildren()) {
                // result of filter for this node. when filtering tree data, includeChildNodes = true when parent passes
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(function (childNode) {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        var passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        var passBecauseDataPasses = childNode.data
                            && _this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass
                        return passBecauseChildren || passBecauseDataPasses;
                    });
                }
                else {
                    // if not filtering, the result is the original list
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }
                _this.setAllChildrenCount(rowNode);
            }
            else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                rowNode.setAllChildrenCount(null);
            }
        };
        if (this.doingTreeDataFiltering()) {
            var treeDataDepthFirstFilter_1 = function (rowNode, alreadyFoundInParent) {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.
                if (rowNode.childrenAfterGroup) {
                    for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        var childNode = rowNode.childrenAfterGroup[i];
                        // first check if current node passes filter before invoking child nodes
                        var foundInParent = alreadyFoundInParent
                            || _this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter_1(rowNode.childrenAfterGroup[i], foundInParent);
                        }
                        else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };
            var treeDataFilterCallback = function (rowNode) { return treeDataDepthFirstFilter_1(rowNode, false); };
            changedPath.executeFromRootNode(treeDataFilterCallback);
        }
        else {
            var defaultFilterCallback = function (rowNode) { return filterCallback(rowNode, false); };
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    };
    FilterService.prototype.setAllChildrenCountTreeData = function (rowNode) {
        // for tree data, we include all children, groups and leafs
        var allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach(function (child) {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    };
    FilterService.prototype.setAllChildrenCountGridGrouping = function (rowNode) {
        // for grid data, we only count the leafs
        var allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            }
            else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    };
    FilterService.prototype.setAllChildrenCount = function (rowNode) {
        if (this.doingTreeData) {
            this.setAllChildrenCountTreeData(rowNode);
        }
        else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    };
    FilterService.prototype.doingTreeDataFiltering = function () {
        return this.gridOptionsWrapper.isTreeData() && !this.gridOptionsWrapper.isExcludeChildrenWhenTreeDataFiltering();
    };
    __decorate([
        core_1.Autowired('filterManager')
    ], FilterService.prototype, "filterManager", void 0);
    __decorate([
        core_1.PostConstruct
    ], FilterService.prototype, "postConstruct", null);
    FilterService = __decorate([
        core_1.Bean("filterService")
    ], FilterService);
    return FilterService;
}(core_1.BeanStub));
exports.FilterService = FilterService;
//# sourceMappingURL=filterService.js.map