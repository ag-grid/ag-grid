/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var FilterService = (function () {
    function FilterService() {
    }
    FilterService.prototype.filterAccordingToColumnState = function (rowNode) {
        var filterActive = this.filterManager.isAnyFilterPresent();
        this.filter(rowNode, filterActive);
    };
    FilterService.prototype.filter = function (rowNode, filterActive) {
        var _this = this;
        // recursively get all children that are groups to also filter
        rowNode.childrenAfterGroup.forEach(function (child) {
            if (child.group) {
                _this.filter(child, filterActive);
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
    FilterService.prototype.setAllChildrenCount = function (rowNode) {
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
    return FilterService;
}());
__decorate([
    context_1.Autowired('filterManager'),
    __metadata("design:type", filterManager_1.FilterManager)
], FilterService.prototype, "filterManager", void 0);
FilterService = __decorate([
    context_1.Bean("filterService")
], FilterService);
exports.FilterService = FilterService;
