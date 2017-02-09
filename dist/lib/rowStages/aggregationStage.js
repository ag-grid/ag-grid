// ag-grid-enterprise v8.0.0
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
var main_1 = require("ag-grid/main");
var pivotStage_1 = require("./pivotStage");
var aggFuncService_1 = require("../aggregation/aggFuncService");
var AggregationStage = (function () {
    function AggregationStage() {
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    AggregationStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        // we don't do aggregation if user provided the groups
        var rowsAlreadyGrouped = main_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            return;
        }
        var pivotActive = this.columnController.isPivotActive();
        var measureColumns = this.columnController.getValueColumns();
        var pivotColumns = pivotActive ? this.columnController.getPivotColumns() : [];
        this.recursivelyCreateAggData(rootNode, measureColumns, pivotColumns);
    };
    AggregationStage.prototype.recursivelyCreateAggData = function (rowNode, measureColumns, pivotColumns) {
        var _this = this;
        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                _this.recursivelyCreateAggData(child, measureColumns, pivotColumns);
            }
        });
        this.aggregateRowNode(rowNode, measureColumns, pivotColumns);
    };
    AggregationStage.prototype.aggregateRowNode = function (rowNode, measureColumns, pivotColumns) {
        var measureColumnsMissing = measureColumns.length === 0;
        var pivotColumnsMissing = pivotColumns.length === 0;
        var userProvidedGroupRowAggNodes = this.gridOptionsWrapper.getGroupRowAggNodesFunc();
        var aggResult;
        if (userProvidedGroupRowAggNodes) {
            aggResult = userProvidedGroupRowAggNodes(rowNode.childrenAfterFilter);
        }
        else if (measureColumnsMissing) {
            aggResult = null;
        }
        else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, measureColumns);
        }
        else {
            aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
        }
        rowNode.data = aggResult;
        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            rowNode.sibling.data = aggResult;
        }
    };
    AggregationStage.prototype.aggregateRowNodeUsingValuesAndPivot = function (rowNode) {
        var _this = this;
        var result = {};
        var pivotColumnDefs = this.pivotStage.getPivotColumnDefs();
        pivotColumnDefs.forEach(function (pivotColumnDef) {
            var values;
            var valueColumn = pivotColumnDef.pivotValueColumn;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                var keys = pivotColumnDef.pivotKeys;
                values = _this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = _this.getValuesPivotNonLeaf(rowNode, pivotColumnDef.colId);
            }
            result[pivotColumnDef.colId] = _this.aggregateValues(values, valueColumn.getAggFunc());
        });
        this.putInValueForGroupNode(result, rowNode);
        return result;
    };
    AggregationStage.prototype.aggregateRowNodeUsingValuesOnly = function (rowNode, valueColumns) {
        var _this = this;
        var result = {};
        var values2d = this.getValuesNormal(rowNode, valueColumns);
        valueColumns.forEach(function (valueColumn, index) {
            result[valueColumn.getId()] = _this.aggregateValues(values2d[index], valueColumn.getAggFunc());
        });
        this.putInValueForGroupNode(result, rowNode);
        return result;
    };
    // when doing copy to clipboard, the valueService is used to get the value for the cell.
    // the problem is that the valueService is wired to get the values directly from the data
    // using column ID's (rather than, eg, valueGetters), so we need to have the value of the
    // group key in the data, so when copy to clipboard is executed, the value is picked up correctly.
    AggregationStage.prototype.putInValueForGroupNode = function (result, rowNode) {
        result[main_1.ColumnController.GROUP_AUTO_COLUMN_ID] = rowNode.key;
    };
    AggregationStage.prototype.getValuesPivotNonLeaf = function (rowNode, colId) {
        var values = [];
        rowNode.childrenAfterFilter.forEach(function (rowNode) {
            var value = rowNode.data[colId];
            values.push(value);
        });
        return values;
    };
    AggregationStage.prototype.getValuesFromMappedSet = function (mappedSet, keys, valueColumn) {
        var _this = this;
        var mapPointer = mappedSet;
        keys.forEach(function (key) { return mapPointer = mapPointer ? mapPointer[key] : null; });
        if (!mapPointer) {
            return [];
        }
        var values = [];
        mapPointer.forEach(function (rowNode) {
            var value = _this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });
        return values;
    };
    AggregationStage.prototype.getValuesNormal = function (rowNode, valueColumns) {
        // create 2d array, of all values for all valueColumns
        var values = [];
        valueColumns.forEach(function () { return values.push([]); });
        var valueColumnCount = valueColumns.length;
        var rowCount = rowNode.childrenAfterFilter.length;
        for (var i = 0; i < rowCount; i++) {
            var childNode = rowNode.childrenAfterFilter[i];
            for (var j = 0; j < valueColumnCount; j++) {
                var valueColumn = valueColumns[j];
                var value;
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                if (childNode.group) {
                    value = childNode.data[valueColumn.getId()];
                }
                else {
                    value = this.valueService.getValueUsingSpecificData(valueColumn, childNode.data, childNode);
                }
                values[j].push(value);
            }
        }
        return values;
    };
    AggregationStage.prototype.aggregateValues = function (values, aggFuncOrString) {
        var aggFunction;
        if (typeof aggFuncOrString === 'string') {
            aggFunction = this.aggFuncService.getAggFunc(aggFuncOrString);
        }
        else {
            aggFunction = aggFuncOrString;
        }
        if (typeof aggFunction !== 'function') {
            console.error("ag-Grid: unrecognised aggregation function " + aggFuncOrString);
            return null;
        }
        var result = aggFunction(values);
        return result;
    };
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], AggregationStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], AggregationStage.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('valueService'), 
        __metadata('design:type', main_1.ValueService)
    ], AggregationStage.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('pivotStage'), 
        __metadata('design:type', pivotStage_1.PivotStage)
    ], AggregationStage.prototype, "pivotStage", void 0);
    __decorate([
        main_1.Autowired('aggFuncService'), 
        __metadata('design:type', aggFuncService_1.AggFuncService)
    ], AggregationStage.prototype, "aggFuncService", void 0);
    AggregationStage = __decorate([
        main_1.Bean('aggregationStage'), 
        __metadata('design:paramtypes', [])
    ], AggregationStage);
    return AggregationStage;
}());
exports.AggregationStage = AggregationStage;
