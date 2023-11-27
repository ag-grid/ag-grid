"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationStage = void 0;
const core_1 = require("@ag-grid-community/core");
let AggregationStage = class AggregationStage extends core_1.BeanStub {
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    execute(params) {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = core_1._.missingOrEmpty(this.columnModel.getValueColumns());
        const noUserAgg = !this.gridOptionsService.getCallback('getGroupRowAgg');
        const changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) {
            return;
        }
        const aggDetails = this.createAggDetails(params);
        this.recursivelyCreateAggData(aggDetails);
    }
    createAggDetails(params) {
        const pivotActive = this.columnModel.isPivotActive();
        const measureColumns = this.columnModel.getValueColumns();
        const pivotColumns = pivotActive ? this.columnModel.getPivotColumns() : [];
        const aggDetails = {
            alwaysAggregateAtRootLevel: this.gridOptionsService.get('alwaysAggregateAtRootLevel'),
            groupIncludeTotalFooter: this.gridOptionsService.get('groupIncludeTotalFooter'),
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns,
            filteredOnly: !this.isSuppressAggFilteredOnly(),
            userAggFunc: this.gridOptionsService.getCallback('getGroupRowAgg'),
        };
        return aggDetails;
    }
    isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = this.gridOptionsService.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || this.gridOptionsService.get('suppressAggFilteredOnly');
    }
    recursivelyCreateAggData(aggDetails) {
        const callback = (rowNode) => {
            const hasNoChildren = !rowNode.hasChildren();
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
            const isRootNode = rowNode.level === -1;
            // if total footer is displayed, the value is in use
            if (isRootNode && !aggDetails.groupIncludeTotalFooter) {
                const notPivoting = !this.columnModel.isPivotMode();
                if (!aggDetails.alwaysAggregateAtRootLevel && notPivoting) {
                    rowNode.setAggData(null);
                    return;
                }
            }
            this.aggregateRowNode(rowNode, aggDetails);
        };
        aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
    }
    aggregateRowNode(rowNode, aggDetails) {
        const measureColumnsMissing = aggDetails.valueColumns.length === 0;
        const pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
        let aggResult;
        if (aggDetails.userAggFunc) {
            aggResult = aggDetails.userAggFunc({ nodes: rowNode.childrenAfterFilter });
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
    }
    aggregateRowNodeUsingValuesAndPivot(rowNode) {
        var _a;
        const result = {};
        const secondaryColumns = (_a = this.columnModel.getSecondaryColumns()) !== null && _a !== void 0 ? _a : [];
        secondaryColumns.forEach(secondaryCol => {
            const { pivotValueColumn, pivotTotalColumnIds, colId, pivotKeys } = secondaryCol.getColDef();
            if (core_1._.exists(pivotTotalColumnIds)) {
                return;
            }
            const keys = pivotKeys !== null && pivotKeys !== void 0 ? pivotKeys : [];
            let values;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, pivotValueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, colId);
            }
            result[colId] = this.aggregateValues(values, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode, secondaryCol);
        });
        secondaryColumns.forEach(secondaryCol => {
            const { pivotValueColumn, pivotTotalColumnIds, colId } = secondaryCol.getColDef();
            if (!core_1._.exists(pivotTotalColumnIds)) {
                return;
            }
            const aggResults = [];
            //retrieve results for colIds associated with this pivot total column
            if (!pivotTotalColumnIds || !pivotTotalColumnIds.length) {
                return;
            }
            pivotTotalColumnIds.forEach((currentColId) => {
                aggResults.push(result[currentColId]);
            });
            result[colId] = this.aggregateValues(aggResults, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode, secondaryCol);
        });
        return result;
    }
    aggregateRowNodeUsingValuesOnly(rowNode, aggDetails) {
        const result = {};
        const changedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;
        const notChangedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;
        const values2d = this.getValuesNormal(rowNode, changedValueColumns, aggDetails.filteredOnly);
        const oldValues = rowNode.aggData;
        changedValueColumns.forEach((valueColumn, index) => {
            result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc(), valueColumn, rowNode);
        });
        if (notChangedValueColumns && oldValues) {
            notChangedValueColumns.forEach((valueColumn) => {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            });
        }
        return result;
    }
    getValuesPivotNonLeaf(rowNode, colId) {
        const values = [];
        rowNode.childrenAfterFilter.forEach((node) => {
            const value = node.aggData[colId];
            values.push(value);
        });
        return values;
    }
    getValuesFromMappedSet(mappedSet, keys, valueColumn) {
        let mapPointer = mappedSet;
        keys.forEach(key => (mapPointer = mapPointer ? mapPointer[key] : null));
        if (!mapPointer) {
            return [];
        }
        const values = [];
        mapPointer.forEach((rowNode) => {
            const value = this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });
        return values;
    }
    getValuesNormal(rowNode, valueColumns, filteredOnly) {
        // create 2d array, of all values for all valueColumns
        const values = [];
        valueColumns.forEach(() => values.push([]));
        const valueColumnCount = valueColumns.length;
        const nodeList = filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
        const rowCount = nodeList.length;
        for (let i = 0; i < rowCount; i++) {
            const childNode = nodeList[i];
            for (let j = 0; j < valueColumnCount; j++) {
                const valueColumn = valueColumns[j];
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                const value = this.valueService.getValue(valueColumn, childNode);
                values[j].push(value);
            }
        }
        return values;
    }
    aggregateValues(values, aggFuncOrString, column, rowNode, pivotResultColumn) {
        const aggFunc = typeof aggFuncOrString === 'string' ?
            this.aggFuncService.getAggFunc(aggFuncOrString) :
            aggFuncOrString;
        if (typeof aggFunc !== 'function') {
            console.error(`AG Grid: unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }
        const aggFuncAny = aggFunc;
        const params = {
            values: values,
            column: column,
            colDef: column ? column.getColDef() : undefined,
            pivotResultColumn: pivotResultColumn,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
        }; // the "as any" is needed to allow the deprecation warning messages
        return aggFuncAny(params);
    }
};
__decorate([
    (0, core_1.Autowired)('columnModel')
], AggregationStage.prototype, "columnModel", void 0);
__decorate([
    (0, core_1.Autowired)('valueService')
], AggregationStage.prototype, "valueService", void 0);
__decorate([
    (0, core_1.Autowired)('aggFuncService')
], AggregationStage.prototype, "aggFuncService", void 0);
AggregationStage = __decorate([
    (0, core_1.Bean)('aggregationStage')
], AggregationStage);
exports.AggregationStage = AggregationStage;
