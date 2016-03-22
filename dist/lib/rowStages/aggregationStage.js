// ag-grid-enterprise v4.0.7
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var AggregationStage = (function () {
    function AggregationStage() {
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    AggregationStage.prototype.execute = function (rowsToAgg) {
        var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
        if (typeof groupAggFunction === 'function') {
            this.recursivelyCreateAggData(rowsToAgg, groupAggFunction, 0);
            return;
        }
        var valueColumns = this.columnController.getValueColumns();
        if (valueColumns && valueColumns.length > 0) {
            var defaultAggFunction = this.defaultGroupAggFunctionFactory(valueColumns);
            this.recursivelyCreateAggData(rowsToAgg, defaultAggFunction, 0);
        }
        else {
            // if no agg data, need to clear out any previous items, when can be left behind
            // if use is creating / removing columns using the tool panel.
            // one exception - don't do this if already grouped, as this breaks the File Explorer example!!
            // to fix another day - how to we reset when the user provided the data??
            if (main_1.Utils.missing(this.gridOptionsWrapper.getNodeChildDetailsFunc())) {
                this.recursivelyClearAggData(rowsToAgg);
            }
        }
        return rowsToAgg;
    };
    AggregationStage.prototype.recursivelyClearAggData = function (nodes) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyClearAggData(node.childrenAfterFilter);
                node.data = null;
            }
        }
    };
    AggregationStage.prototype.recursivelyCreateAggData = function (nodes, groupAggFunction, level) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyCreateAggData(node.childrenAfterFilter, groupAggFunction, level++);
                // after traversal, we can now do the agg at this level
                var data = groupAggFunction(node.childrenAfterFilter, level);
                node.data = data;
                // if we are grouping, then it's possible there is a sibling footer
                // to the group, so update the data here also if there is one
                if (node.sibling) {
                    node.sibling.data = data;
                }
            }
        }
    };
    AggregationStage.prototype.defaultGroupAggFunctionFactory = function (valueColumns) {
        // make closure of variable, so is available for methods below
        var _valueService = this.valueService;
        return function groupAggFunction(rows) {
            var result = {};
            for (var j = 0; j < valueColumns.length; j++) {
                var valueColumn = valueColumns[j];
                var colKey = valueColumn.getColDef().field;
                if (!colKey) {
                    console.log('ag-Grid: you need to provide a field for all value columns so that ' +
                        'the grid knows what field to store the result in. so even if using a valueGetter, ' +
                        'the result will not be stored in a value getter.');
                }
                // at this point, if no values were numbers, the result is null (not zero)
                result[colKey] = aggregateColumn(rows, valueColumn.getAggFunc(), colKey, valueColumn);
            }
            return result;
        };
        // if colDef is passed in, we are working off a column value, if it is not passed in, we are
        // working off colKeys passed in to the gridOptions
        function aggregateColumn(rowNodes, aggFunc, colKey, column) {
            var resultForColumn = null;
            for (var i = 0; i < rowNodes.length; i++) {
                var rowNode = rowNodes[i];
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                var thisColumnValue;
                if (rowNode.group) {
                    thisColumnValue = rowNode.data[colKey];
                }
                else {
                    thisColumnValue = _valueService.getValue(column, rowNode);
                }
                // only include if the value is a number
                if (typeof thisColumnValue === 'number') {
                    var firstRow = i === 0;
                    var lastRow = i === (rowNodes.length - 1);
                    switch (aggFunc) {
                        case main_7.Column.AGG_SUM:
                            resultForColumn += thisColumnValue;
                            break;
                        case main_7.Column.AGG_MIN:
                            if (resultForColumn === null) {
                                resultForColumn = thisColumnValue;
                            }
                            else if (resultForColumn > thisColumnValue) {
                                resultForColumn = thisColumnValue;
                            }
                            break;
                        case main_7.Column.AGG_MAX:
                            if (resultForColumn === null) {
                                resultForColumn = thisColumnValue;
                            }
                            else if (resultForColumn < thisColumnValue) {
                                resultForColumn = thisColumnValue;
                            }
                            break;
                        case main_7.Column.AGG_FIRST:
                            if (firstRow) {
                                resultForColumn = thisColumnValue;
                            }
                            break;
                        case main_7.Column.AGG_LAST:
                            if (lastRow) {
                                resultForColumn = thisColumnValue;
                            }
                            break;
                    }
                }
            }
            return resultForColumn;
        }
    };
    __decorate([
        main_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_4.GridOptionsWrapper)
    ], AggregationStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_3.Autowired('columnController'), 
        __metadata('design:type', main_5.ColumnController)
    ], AggregationStage.prototype, "columnController", void 0);
    __decorate([
        main_3.Autowired('valueService'), 
        __metadata('design:type', main_6.ValueService)
    ], AggregationStage.prototype, "valueService", void 0);
    AggregationStage = __decorate([
        main_2.Bean('aggregationStage'), 
        __metadata('design:paramtypes', [])
    ], AggregationStage);
    return AggregationStage;
})();
exports.AggregationStage = AggregationStage;
