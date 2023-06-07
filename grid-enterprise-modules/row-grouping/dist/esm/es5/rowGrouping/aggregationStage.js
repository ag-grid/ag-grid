var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { Bean, BeanStub, Autowired, _, PostConstruct, } from "@ag-grid-community/core";
var AggregationStage = /** @class */ (function (_super) {
    __extends(AggregationStage, _super);
    function AggregationStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AggregationStage.prototype.init = function () {
        var _this = this;
        this.alwaysAggregateAtRootLevel = this.gridOptionsService.is('alwaysAggregateAtRootLevel');
        this.addManagedPropertyListener('alwaysAggregateAtRootLevel', function (propChange) { return _this.alwaysAggregateAtRootLevel = propChange.currentValue; });
        this.groupIncludeTotalFooter = this.gridOptionsService.is('groupIncludeTotalFooter');
        this.addManagedPropertyListener('groupIncludeTotalFooter', function (propChange) { return _this.groupIncludeTotalFooter = propChange.currentValue; });
    };
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    AggregationStage.prototype.execute = function (params) {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        var noValueColumns = _.missingOrEmpty(this.columnModel.getValueColumns());
        var noUserAgg = !this.gridOptionsService.getCallback('getGroupRowAgg');
        var changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) {
            return;
        }
        var aggDetails = this.createAggDetails(params);
        this.recursivelyCreateAggData(aggDetails);
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
            //Optionally enable the aggregation at the root Node
            var isRootNode = rowNode.level === -1;
            // if total footer is displayed, the value is in use
            if (isRootNode && !_this.groupIncludeTotalFooter) {
                var notPivoting = !_this.columnModel.isPivotMode();
                if (!_this.alwaysAggregateAtRootLevel && notPivoting) {
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
        var userFunc = this.gridOptionsService.getCallback('getGroupRowAgg');
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
        var _a;
        var result = {};
        var secondaryColumns = (_a = this.columnModel.getSecondaryColumns()) !== null && _a !== void 0 ? _a : [];
        secondaryColumns.forEach(function (secondaryCol) {
            var _a = secondaryCol.getColDef(), pivotValueColumn = _a.pivotValueColumn, pivotTotalColumnIds = _a.pivotTotalColumnIds, colId = _a.colId, pivotKeys = _a.pivotKeys;
            if (_.exists(pivotTotalColumnIds)) {
                return;
            }
            var keys = pivotKeys !== null && pivotKeys !== void 0 ? pivotKeys : [];
            var values;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = _this.getValuesFromMappedSet(rowNode.childrenMapped, keys, pivotValueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = _this.getValuesPivotNonLeaf(rowNode, colId);
            }
            result[colId] = _this.aggregateValues(values, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode, secondaryCol);
        });
        secondaryColumns.forEach(function (secondaryCol) {
            var _a = secondaryCol.getColDef(), pivotValueColumn = _a.pivotValueColumn, pivotTotalColumnIds = _a.pivotTotalColumnIds, colId = _a.colId;
            if (!_.exists(pivotTotalColumnIds)) {
                return;
            }
            var aggResults = [];
            //retrieve results for colIds associated with this pivot total column
            if (!pivotTotalColumnIds || !pivotTotalColumnIds.length) {
                return;
            }
            pivotTotalColumnIds.forEach(function (currentColId) {
                aggResults.push(result[currentColId]);
            });
            result[colId] = _this.aggregateValues(aggResults, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode, secondaryCol);
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
    AggregationStage.prototype.aggregateValues = function (values, aggFuncOrString, column, rowNode, pivotResultColumn) {
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
            pivotResultColumn: pivotResultColumn,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context,
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
        Autowired('aggFuncService')
    ], AggregationStage.prototype, "aggFuncService", void 0);
    __decorate([
        Autowired('gridApi')
    ], AggregationStage.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], AggregationStage.prototype, "columnApi", void 0);
    __decorate([
        PostConstruct
    ], AggregationStage.prototype, "init", null);
    AggregationStage = __decorate([
        Bean('aggregationStage')
    ], AggregationStage);
    return AggregationStage;
}(BeanStub));
export { AggregationStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRpb25TdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9hZ2dyZWdhdGlvblN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxJQUFJLEVBQ0osUUFBUSxFQUVSLFNBQVMsRUFXVCxDQUFDLEVBR0QsYUFBYSxHQUNoQixNQUFNLHlCQUF5QixDQUFDO0FBVWpDO0lBQXNDLG9DQUFRO0lBQTlDOztJQTRRQSxDQUFDO0lBOVBXLCtCQUFJLEdBQVo7UUFEQSxpQkFNQztRQUpHLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLDBCQUEwQixDQUFDLDRCQUE0QixFQUFFLFVBQUMsVUFBVSxJQUFLLE9BQUEsS0FBSSxDQUFDLDBCQUEwQixHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQXpELENBQXlELENBQUMsQ0FBQztRQUN6SSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx5QkFBeUIsRUFBRSxVQUFDLFVBQVUsSUFBSyxPQUFBLEtBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsWUFBWSxFQUF0RCxDQUFzRCxDQUFDLENBQUM7SUFDdkksQ0FBQztJQUVELHlFQUF5RTtJQUN6RSwrQ0FBK0M7SUFDeEMsa0NBQU8sR0FBZCxVQUFlLE1BQTBCO1FBQ3JDLGlHQUFpRztRQUNqRyxpR0FBaUc7UUFDakcsbUdBQW1HO1FBQ25HLGlHQUFpRztRQUNqRyxpREFBaUQ7UUFDakQsSUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFB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