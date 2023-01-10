var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, Autowired, _ } from "@ag-grid-community/core";
var AggregationStage = /** @class */ (function (_super) {
    __extends(AggregationStage, _super);
    function AggregationStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    AggregationStage.prototype.execute = function (params) {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        var noValueColumns = _.missingOrEmpty(this.columnModel.getValueColumns());
        var noUserAgg = !this.getGroupRowAggFunc();
        var changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) {
            return;
        }
        var aggDetails = this.createAggDetails(params);
        this.recursivelyCreateAggData(aggDetails);
    };
    AggregationStage.prototype.getGroupRowAggFunc = function () {
        var getGroupRowAgg = this.gridOptionsService.getCallback('getGroupRowAgg');
        if (getGroupRowAgg) {
            return getGroupRowAgg;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        var groupRowAggNodes = this.gridOptionsService.get('groupRowAggNodes');
        if (groupRowAggNodes) {
            return function (params) { return groupRowAggNodes(params.nodes); };
        }
    };
    AggregationStage.prototype.createAggDetails = function (params) {
        var pivotActive = this.columnModel.isPivotActive();
        var measureColumns = this.columnModel.getValueColumns();
        var pivotColumns = pivotActive ? this.columnModel.getPivotColumns() : [];
        var aggDetails = {
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns
        };
        return aggDetails;
    };
    AggregationStage.prototype.isSuppressAggFilteredOnly = function () {
        var isGroupAggFiltering = this.gridOptionsService.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || this.gridOptionsService.is('suppressAggFilteredOnly');
    };
    AggregationStage.prototype.recursivelyCreateAggData = function (aggDetails) {
        var _this = this;
        // update prop, in case changed since last time
        this.filteredOnly = !this.isSuppressAggFilteredOnly();
        var callback = function (rowNode) {
            var hasNoChildren = !rowNode.hasChildren();
            if (hasNoChildren) {
                // this check is needed for TreeData, in case the node is no longer a child,
                // but it was a child previously.
                if (rowNode.aggData) {
                    rowNode.setAggData(null);
                }
                // never agg data for leaf nodes
                return;
            }
            //Optionally prevent the aggregation at the root Node
            //https://ag-grid.atlassian.net/browse/AG-388
            var isRootNode = rowNode.level === -1;
            if (isRootNode) {
                var notPivoting = !_this.columnModel.isPivotMode();
                var suppressAggAtRootLevel = _this.gridOptionsService.is('suppressAggAtRootLevel');
                if (suppressAggAtRootLevel && notPivoting) {
                    return;
                }
            }
            _this.aggregateRowNode(rowNode, aggDetails);
        };
        aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
    };
    AggregationStage.prototype.aggregateRowNode = function (rowNode, aggDetails) {
        var measureColumnsMissing = aggDetails.valueColumns.length === 0;
        var pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
        var userFunc = this.getGroupRowAggFunc();
        var aggResult;
        if (userFunc) {
            var params = { nodes: rowNode.childrenAfterFilter };
            aggResult = userFunc(params);
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
            .filter(function (v) { return !_.exists(v.pivotTotalColumnIds); }) // only process pivot value columns
            .forEach(function (valueColDef) {
            var keys = valueColDef.pivotKeys || [];
            var values;
            var valueColumn = valueColDef.pivotValueColumn;
            var colId = valueColDef.colId;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = _this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = _this.getValuesPivotNonLeaf(rowNode, colId);
            }
            result[colId] = _this.aggregateValues(values, valueColumn.getAggFunc(), valueColumn, rowNode);
        });
        // Step 2: process total columns
        pivotColumnDefs
            .filter(function (v) { return _.exists(v.pivotTotalColumnIds); }) // only process pivot total columns
            .forEach(function (totalColDef) {
            var aggResults = [];
            var pivotValueColumn = totalColDef.pivotValueColumn, pivotTotalColumnIds = totalColDef.pivotTotalColumnIds, colId = totalColDef.colId;
            //retrieve results for colIds associated with this pivot total column
            if (!pivotTotalColumnIds || !pivotTotalColumnIds.length) {
                return;
            }
            pivotTotalColumnIds.forEach(function (currentColId) {
                aggResults.push(result[currentColId]);
            });
            result[colId] = _this.aggregateValues(aggResults, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode);
        });
        return result;
    };
    AggregationStage.prototype.aggregateRowNodeUsingValuesOnly = function (rowNode, aggDetails) {
        var _this = this;
        var result = {};
        var changedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;
        var notChangedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;
        var values2d = this.getValuesNormal(rowNode, changedValueColumns);
        var oldValues = rowNode.aggData;
        changedValueColumns.forEach(function (valueColumn, index) {
            result[valueColumn.getId()] = _this.aggregateValues(values2d[index], valueColumn.getAggFunc(), valueColumn, rowNode);
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
        rowNode.childrenAfterFilter.forEach(function (node) {
            var value = node.aggData[colId];
            values.push(value);
        });
        return values;
    };
    AggregationStage.prototype.getValuesFromMappedSet = function (mappedSet, keys, valueColumn) {
        var _this = this;
        var mapPointer = mappedSet;
        keys.forEach(function (key) { return (mapPointer = mapPointer ? mapPointer[key] : null); });
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
        var nodeList = this.filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
        var rowCount = nodeList.length;
        for (var i = 0; i < rowCount; i++) {
            var childNode = nodeList[i];
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
    AggregationStage.prototype.aggregateValues = function (values, aggFuncOrString, column, rowNode) {
        var aggFunc = typeof aggFuncOrString === 'string' ?
            this.aggFuncService.getAggFunc(aggFuncOrString) :
            aggFuncOrString;
        if (typeof aggFunc !== 'function') {
            console.error("AG Grid: unrecognised aggregation function " + aggFuncOrString);
            return null;
        }
        var aggFuncAny = aggFunc;
        var params = {
            values: values,
            column: column,
            colDef: column ? column.getColDef() : undefined,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context'),
        }; // the "as any" is needed to allow the deprecation warning messages
        return aggFuncAny(params);
    };
    __decorate([
        Autowired('columnModel')
    ], AggregationStage.prototype, "columnModel", void 0);
    __decorate([
        Autowired('valueService')
    ], AggregationStage.prototype, "valueService", void 0);
    __decorate([
        Autowired('pivotStage')
    ], AggregationStage.prototype, "pivotStage", void 0);
    __decorate([
        Autowired('aggFuncService')
    ], AggregationStage.prototype, "aggFuncService", void 0);
    __decorate([
        Autowired('gridApi')
    ], AggregationStage.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], AggregationStage.prototype, "columnApi", void 0);
    AggregationStage = __decorate([
        Bean('aggregationStage')
    ], AggregationStage);
    return AggregationStage;
}(BeanStub));
export { AggregationStage };
