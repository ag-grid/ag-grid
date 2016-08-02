/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("../../context/context");
var context_2 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var filterManager_1 = require("../../filter/filterManager");
var FilterStage = (function () {
    function FilterStage() {
    }
    FilterStage.prototype.execute = function (rowNode) {
        var filterActive;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterActive = false;
        }
        else {
            filterActive = this.filterManager.isAnyFilterPresent();
        }
        this.recursivelyFilter(rowNode, filterActive);
    };
    FilterStage.prototype.recursivelyFilter = function (rowNode, filterActive) {
        var _this = this;
        // recursively get all children that are groups to also filter
        rowNode.childrenAfterGroup.forEach(function (child) {
            if (child.group) {
                _this.recursivelyFilter(child, filterActive);
            }
        });
        // result of filter for this node
        var filterResult;
        if (filterActive) {
            filterResult = [];
            rowNode.childrenAfterGroup.forEach(function (childNode) {
                if (childNode.group) {
                    // a group is included in the result if it has any children of it's own.
                    // by this stage, the child groups are already filtered
                    if (childNode.childrenAfterFilter.length > 0) {
                        filterResult.push(childNode);
                    }
                }
                else {
                    // a leaf level node is included if it passes the filter
                    if (_this.filterManager.doesRowPassFilter(childNode)) {
                        filterResult.push(childNode);
                    }
                }
            });
        }
        else {
            // if not filtering, the result is the original list
            filterResult = rowNode.childrenAfterGroup;
        }
        rowNode.childrenAfterFilter = filterResult;
        this.setAllChildrenCount(rowNode);
    };
    FilterStage.prototype.setAllChildrenCount = function (rowNode) {
        var allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            }
            else {
                allChildrenCount++;
            }
        });
        rowNode.allChildrenCount = allChildrenCount;
    };
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], FilterStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], FilterStage.prototype, "filterManager", void 0);
    FilterStage = __decorate([
        context_1.Bean('filterStage'), 
        __metadata('design:paramtypes', [])
    ], FilterStage);
    return FilterStage;
})();
exports.FilterStage = FilterStage;
