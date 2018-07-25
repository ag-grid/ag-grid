/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var filterManager_1 = require("../filter/filterManager");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var FilterService = (function () {
    function FilterService() {
    }
    FilterService.prototype.postConstruct = function () {
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
    };
    FilterService.prototype.filterAccordingToColumnState = function (rowNode) {
        var filterActive = this.filterManager.isAnyFilterPresent();
        this.filter(rowNode, filterActive);
    };
    FilterService.prototype.filter = function (rowNode, filterActive) {
        var _this = this;
        // recursively get all children that are groups to also filter
        if (rowNode.hasChildren()) {
            rowNode.childrenAfterGroup.forEach(function (node) { return _this.filter(node, filterActive); });
            // result of filter for this node
            if (filterActive) {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(function (childNode) {
                    // a group is included in the result if it has any children of it's own.
                    // by this stage, the child groups are already filtered
                    var passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                    // both leaf level nodes and tree data nodes have data. these get added if
                    // the data passes the filter
                    var passBecauseDataPasses = childNode.data && _this.filterManager.doesRowPassFilter(childNode);
                    // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass
                    return passBecauseChildren || passBecauseDataPasses;
                });
            }
            else {
                // if not filtering, the result is the original list
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            }
            this.setAllChildrenCount(rowNode);
        }
        else {
            rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            rowNode.setAllChildrenCount(null);
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
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], FilterService.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], FilterService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FilterService.prototype, "postConstruct", null);
    FilterService = __decorate([
        context_1.Bean("filterService")
    ], FilterService);
    return FilterService;
}());
exports.FilterService = FilterService;
