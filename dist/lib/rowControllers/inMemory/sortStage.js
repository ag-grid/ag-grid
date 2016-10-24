/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
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
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var sortController_1 = require("../../sortController");
var valueService_1 = require("../../valueService");
var utils_1 = require("../../utils");
var SortStage = (function () {
    function SortStage() {
    }
    SortStage.prototype.execute = function (rowNode) {
        var sortOptions;
        // if the sorting is already done by the server, then we should not do it here
        if (!this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortOptions = this.sortController.getSortForRowController();
        }
        this.sortRowNode(rowNode, sortOptions);
    };
    SortStage.prototype.sortRowNode = function (rowNode, sortOptions) {
        var _this = this;
        // sort any groups recursively
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                _this.sortRowNode(child, sortOptions);
            }
        });
        rowNode.childrenAfterSort = rowNode.childrenAfterFilter.slice(0);
        var sortActive = utils_1.Utils.exists(sortOptions) && sortOptions.length > 0;
        if (sortActive) {
            rowNode.childrenAfterSort.sort(this.compareRowNodes.bind(this, sortOptions));
        }
        this.updateChildIndexes(rowNode);
    };
    SortStage.prototype.compareRowNodes = function (sortOptions, nodeA, nodeB) {
        // Iterate columns, return the first that doesn't match
        for (var i = 0, len = sortOptions.length; i < len; i++) {
            var sortOption = sortOptions[i];
            // var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
            var isInverted = sortOption.inverter === -1;
            var valueA = this.valueService.getValue(sortOption.column, nodeA);
            var valueB = this.valueService.getValue(sortOption.column, nodeB);
            var comparatorResult;
            if (sortOption.column.getColDef().comparator) {
                //if comparator provided, use it
                comparatorResult = sortOption.column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                comparatorResult = utils_1.Utils.defaultComparator(valueA, valueB);
            }
            if (comparatorResult !== 0) {
                return comparatorResult * sortOption.inverter;
            }
        }
        // All matched, these are identical as far as the sort is concerned:
        return 0;
    };
    SortStage.prototype.updateChildIndexes = function (rowNode) {
        if (utils_1.Utils.missing(rowNode.childrenAfterSort)) {
            return;
        }
        rowNode.childrenAfterSort.forEach(function (child, index) {
            child.firstChild = index === 0;
            child.lastChild = index === rowNode.childrenAfterSort.length - 1;
            child.childIndex = index;
        });
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], SortStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('sortController'), 
        __metadata('design:type', sortController_1.SortController)
    ], SortStage.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('valueService'), 
        __metadata('design:type', valueService_1.ValueService)
    ], SortStage.prototype, "valueService", void 0);
    SortStage = __decorate([
        context_1.Bean('sortStage'), 
        __metadata('design:paramtypes', [])
    ], SortStage);
    return SortStage;
})();
exports.SortStage = SortStage;
