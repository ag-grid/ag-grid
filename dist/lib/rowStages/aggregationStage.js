// ag-grid-enterprise v16.0.1
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
var main_1 = require("ag-grid/main");
var pivotStage_1 = require("./pivotStage");
var aggFuncService_1 = require("../aggregation/aggFuncService");
var AggregationStage = (function () {
    function AggregationStage() {
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    AggregationStage.prototype.execute = function (params) {
        // we don't do aggregation if doing legacy tree good
        var doingLegacyTreeData = main_1._.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (doingLegacyTreeData) {
            return null;
        }
        var aggDetails = this.createAggDetails(params);
        this.recursivelyCreateAggData(params.rowNode, aggDetails);
    };
    AggregationStage.prototype.createAggDetails = function (params) {
        var pivotActive = this.columnController.isPivotActive();
        var measureColumns = this.columnController.getValueColumns();
        var pivotColumns = pivotActive ? this.columnController.getPivotColumns() : [];
        var aggDetails = {
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns
        };
        return aggDetails;
    };
    AggregationStage.prototype.recursivelyCreateAggData = function (rowNode, aggDetails) {
        var _this = this;
        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach(function (child) {
            var nodeHasChildren = child.hasChildren();
            if (nodeHasChildren) {
                _this.recursivelyCreateAggData(child, aggDetails);
            }
            else {
                if (child.aggData) {
                    child.setAggData(null);
                }
            }
        });
        //Optionally prevent the aggregation at the root Node
        //https://ag-grid.atlassian.net/browse/AG-388
        var isRootNode = rowNode.level === -1;
        if (isRootNode) {
            var notPivoting = !this.columnController.isPivotMode();
            var suppressAggAtRootLevel = this.gridOptionsWrapper.isSuppressAggAtRootLevel();
            if (suppressAggAtRootLevel && notPivoting) {
                return;
            }
        }
        var skipBecauseNoChangedPath = aggDetails.changedPath && !aggDetails.changedPath.isInPath(rowNode);
        if (skipBecauseNoChangedPath) {
            return;
        }
        this.aggregateRowNode(rowNode, aggDetails);
    };
    AggregationStage.prototype.aggregateRowNode = function (rowNode, aggDetails) {
        var measureColumnsMissing = aggDetails.valueColumns.length === 0;
        var pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
        var userFunc = this.gridOptionsWrapper.getGroupRowAggNodesFunc();
        var aggResult;
        if (userFunc) {
            aggResult = userFunc(rowNode.childrenAfterFilter);
        }
        else if (measureColumnsMissing) {
            aggResult = null;
        }
        else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, aggDetails);
        }
        else {
            aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
        }
        rowNode.setAggData(aggResult);
        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            rowNode.sibling.setAggData(aggResult);
        }
    };
    AggregationStage.prototype.aggregateRowNodeUsingValuesAndPivot = function (rowNode) {
        var _this = this;
        var result = {};
        var pivotColumnDefs = this.pivotStage.getPivotColumnDefs();
        // Step 1: process value columns
        pivotColumnDefs
            .filter(function (v) { return !main_1.Utils.exists(v.pivotTotalColumnIds); }) // only process pivot value columns
            .forEach(function (valueColDef) {
            var keys = valueColDef.pivotKeys;
            var values;
            var valueColumn = valueColDef.pivotValueColumn;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = _this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = _this.getValuesPivotNonLeaf(rowNode, valueColDef.colId);
            }
            result[valueColDef.colId] = _this.aggregateValues(values, valueColumn.getAggFunc());
        });
        // Step 2: process total columns
        pivotColumnDefs
            .filter(function (v) { return main_1.Utils.exists(v.pivotTotalColumnIds); }) // only process pivot total columns
            .forEach(function (totalColDef) {
            var aggResults = [];
            //retrieve results for colIds associated with this pivot total column
            totalColDef.pivotTotalColumnIds.forEach(function (colId) {
                aggResults.push(result[colId]);
            });
            result[totalColDef.colId] = _this.aggregateValues(aggResults, totalColDef.aggFunc);
        });
        return result;
    };
    AggregationStage.prototype.aggregateRowNodeUsingValuesOnly = function (rowNode, aggDetails) {
        var _this = this;
        var result = {};
        var changedValueColumns = aggDetails.changedPath ?
            aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;
        var notChangedValueColumns = aggDetails.changedPath ?
            aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;
        var values2d = this.getValuesNormal(rowNode, changedValueColumns);
        var oldValues = rowNode.aggData;
        changedValueColumns.forEach(function (valueColumn, index) {
            result[valueColumn.getId()] = _this.aggregateValues(values2d[index], valueColumn.getAggFunc());
        });
        if (notChangedValueColumns && oldValues) {
            notChangedValueColumns.forEach(function (valueColumn) {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            });
        }
        return result;
    };
    AggregationStage.prototype.getValuesPivotNonLeaf = function (rowNode, colId) {
        var values = [];
        rowNode.childrenAfterFilter.forEach(function (rowNode) {
            var value = rowNode.aggData[colId];
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
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                var value = this.valueService.getValue(valueColumn, childNode);
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
        return aggFunction(values);
    };
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], AggregationStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], AggregationStage.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('valueService'),
        __metadata("design:type", main_1.ValueService)
    ], AggregationStage.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('pivotStage'),
        __metadata("design:type", pivotStage_1.PivotStage)
    ], AggregationStage.prototype, "pivotStage", void 0);
    __decorate([
        main_1.Autowired('aggFuncService'),
        __metadata("design:type", aggFuncService_1.AggFuncService)
    ], AggregationStage.prototype, "aggFuncService", void 0);
    AggregationStage = __decorate([
        main_1.Bean('aggregationStage')
    ], AggregationStage);
    return AggregationStage;
}());
exports.AggregationStage = AggregationStage;
