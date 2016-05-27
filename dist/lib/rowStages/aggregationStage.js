// ag-grid-enterprise v4.2.0
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
var AggregationStage = (function () {
    function AggregationStage() {
        this.aggFunctionService = new AggFunctionService();
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    AggregationStage.prototype.execute = function (rootNode) {
        // we don't do aggregation if user provided the groups
        var userProvidedTheGroups = main_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (userProvidedTheGroups) {
            return;
        }
        var valueColumns = this.columnController.getValueColumns();
        var pivotColumns = this.columnController.getPivotColumns();
        this.recursivelyCreateAggData(rootNode, valueColumns, pivotColumns);
    };
    AggregationStage.prototype.recursivelyCreateAggData = function (rowNode, valueColumns, pivotColumns) {
        var _this = this;
        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                _this.recursivelyCreateAggData(child, valueColumns, pivotColumns);
            }
        });
        this.aggregateRowNode(rowNode, valueColumns, pivotColumns);
    };
    AggregationStage.prototype.aggregateRowNode = function (rowNode, valueColumns, pivotColumns) {
        var valueColumnsMissing = valueColumns.length === 0;
        var pivotColumnsMissing = pivotColumns.length === 0;
        var aggResult;
        if (valueColumnsMissing) {
            aggResult = null;
        }
        else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, valueColumns);
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
        var pivotColumnDefs = this.pivotService.getPivotColumnDefs();
        pivotColumnDefs.forEach(function (pivotColumnDef) {
            var values;
            var valueColumn = pivotColumnDef.valueColumn;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                var keys = pivotColumnDef.keys;
                values = _this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = _this.getValuesPivotNonLeaf(rowNode, pivotColumnDef.colId);
            }
            result[pivotColumnDef.colId] = _this.aggregateValues(values, valueColumn.getAggFunc());
        });
        return result;
    };
    AggregationStage.prototype.aggregateRowNodeUsingValuesOnly = function (rowNode, valueColumns) {
        var _this = this;
        var result = {};
        valueColumns.forEach(function (valueColumn) {
            var values = _this.getValuesNormal(rowNode, valueColumn);
            result[valueColumn.getId()] = _this.aggregateValues(values, valueColumn.getAggFunc());
        });
        return result;
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
    AggregationStage.prototype.getValuesNormal = function (rowNode, valueColumn) {
        var _this = this;
        var values = [];
        rowNode.childrenAfterFilter.forEach(function (rowNode) {
            var value;
            // if the row is a group, then it will only have an agg result value,
            // which means valueGetter is never used.
            if (rowNode.group) {
                value = rowNode.data[valueColumn.getId()];
            }
            else {
                value = _this.valueService.getValue(valueColumn, rowNode);
            }
            values.push(value);
        });
        return values;
    };
    AggregationStage.prototype.aggregateValues = function (values, aggFuncOrString) {
        var aggFunction;
        if (typeof aggFuncOrString === 'string') {
            aggFunction = this.aggFunctionService.getAggFunction(aggFuncOrString);
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
        main_1.Autowired('pivotService'), 
        __metadata('design:type', main_1.PivotService)
    ], AggregationStage.prototype, "pivotService", void 0);
    AggregationStage = __decorate([
        main_1.Bean('aggregationStage'), 
        __metadata('design:paramtypes', [])
    ], AggregationStage);
    return AggregationStage;
})();
exports.AggregationStage = AggregationStage;
var AggFunctionService = (function () {
    function AggFunctionService() {
        this.aggFunctionsMap = {};
        this.aggFunctionsMap['sum'] = function (input) {
            var result = null;
            input.forEach(function (value) {
                if (typeof value === 'number') {
                    if (result === null) {
                        result = value;
                    }
                    else {
                        result += value;
                    }
                }
            });
            return result;
        };
        this.aggFunctionsMap['first'] = function (input) {
            if (input.length >= 0) {
                return input[0];
            }
            else {
                return null;
            }
        };
        this.aggFunctionsMap['last'] = function (input) {
            if (input.length >= 0) {
                return input[input.length - 1];
            }
            else {
                return null;
            }
        };
        this.aggFunctionsMap['min'] = function (input) {
            var result = null;
            input.forEach(function (value) {
                if (typeof value === 'number') {
                    if (result === null) {
                        result = value;
                    }
                    else if (result > value) {
                        result = value;
                    }
                }
            });
            return result;
        };
        this.aggFunctionsMap['max'] = function (input) {
            var result = null;
            input.forEach(function (value) {
                if (typeof value === 'number') {
                    if (result === null) {
                        result = value;
                    }
                    else if (result < value) {
                        result = value;
                    }
                }
            });
            return result;
        };
    }
    AggFunctionService.prototype.getAggFunction = function (name) {
        return this.aggFunctionsMap[name];
    };
    return AggFunctionService;
})();
// in time we will turn this into a factory that the user can register their own agg functions
var aggFunctions = {};
