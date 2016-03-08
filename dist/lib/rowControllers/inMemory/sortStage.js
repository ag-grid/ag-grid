/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
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
var sortController_1 = require("../../sortController");
var valueService_1 = require("../../valueService");
var utils_1 = require('../../utils');
var SortStage = (function () {
    function SortStage() {
    }
    SortStage.prototype.execute = function (rowsToSort) {
        var sorting;
        // if the sorting is already done by the server, then we should not do it here
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sorting = false;
        }
        else {
            //see if there is a col we are sorting by
            var sortingOptions = this.sortController.getSortForRowController();
            sorting = sortingOptions.length > 0;
        }
        var result = rowsToSort.slice(0);
        if (sorting) {
            this.sortList(result, sortingOptions);
        }
        else {
            // if no sorting, set all group children after sort to the original list.
            // note: it is important to do this, even if doing server side sorting,
            // to allow the rows to pass to the next stage (ie set the node value
            // childrenAfterSort)
            this.recursivelyResetSort(result);
        }
        return result;
    };
    SortStage.prototype.sortList = function (nodes, sortOptions) {
        // sort any groups recursively
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterSort = node.childrenAfterFilter.slice(0);
                this.sortList(node.childrenAfterSort, sortOptions);
            }
        }
        var that = this;
        function compare(nodeA, nodeB, column, isInverted) {
            var valueA = that.valueService.getValue(column, nodeA);
            var valueB = that.valueService.getValue(column, nodeB);
            if (column.getColDef().comparator) {
                //if comparator provided, use it
                return column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
            }
            else {
                //otherwise do our own comparison
                return utils_1.Utils.defaultComparator(valueA, valueB);
            }
        }
        nodes.sort(function (nodeA, nodeB) {
            // Iterate columns, return the first that doesn't match
            for (var i = 0, len = sortOptions.length; i < len; i++) {
                var sortOption = sortOptions[i];
                var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
                if (compared !== 0) {
                    return compared * sortOption.inverter;
                }
            }
            // All matched, these are identical as far as the sort is concerned:
            return 0;
        });
        this.updateChildIndexes(nodes);
    };
    SortStage.prototype.recursivelyResetSort = function (rowNodes) {
        if (!rowNodes) {
            return;
        }
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group && item.children) {
                item.childrenAfterSort = item.childrenAfterFilter;
                this.recursivelyResetSort(item.children);
            }
        }
        this.updateChildIndexes(rowNodes);
    };
    SortStage.prototype.updateChildIndexes = function (nodes) {
        for (var j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            node.firstChild = j === 0;
            node.lastChild = j === nodes.length - 1;
            node.childIndex = j;
        }
    };
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], SortStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('sortController'), 
        __metadata('design:type', sortController_1.SortController)
    ], SortStage.prototype, "sortController", void 0);
    __decorate([
        context_2.Autowired('valueService'), 
        __metadata('design:type', valueService_1.ValueService)
    ], SortStage.prototype, "valueService", void 0);
    SortStage = __decorate([
        context_1.Bean('sortStage'), 
        __metadata('design:paramtypes', [])
    ], SortStage);
    return SortStage;
})();
exports.SortStage = SortStage;
