/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
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
    FilterStage.prototype.execute = function (rowsToFilter) {
        var filterActive;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterActive = false;
        }
        else {
            filterActive = this.filterManager.isAnyFilterPresent();
        }
        var result;
        if (filterActive) {
            result = this.filterItems(rowsToFilter);
        }
        else {
            // do it here
            result = rowsToFilter;
            this.recursivelyResetFilter(rowsToFilter);
        }
        return result;
    };
    FilterStage.prototype.filterItems = function (rowNodes) {
        var result = [];
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var node = rowNodes[i];
            if (node.group) {
                // deal with group
                node.childrenAfterFilter = this.filterItems(node.children);
                if (node.childrenAfterFilter.length > 0) {
                    node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                    result.push(node);
                }
            }
            else {
                if (this.filterManager.doesRowPassFilter(node)) {
                    result.push(node);
                }
            }
        }
        return result;
    };
    FilterStage.prototype.recursivelyResetFilter = function (nodes) {
        if (!nodes) {
            return;
        }
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterFilter = node.children;
                this.recursivelyResetFilter(node.children);
                node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
            }
        }
    };
    FilterStage.prototype.getTotalChildCount = function (rowNodes) {
        var count = 0;
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group) {
                count += item.allChildrenCount;
            }
            else {
                count++;
            }
        }
        return count;
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
