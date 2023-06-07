var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, Autowired, _, PostConstruct, } from "@ag-grid-community/core";
let AggregationStage = class AggregationStage extends BeanStub {
    init() {
        this.alwaysAggregateAtRootLevel = this.gridOptionsService.is('alwaysAggregateAtRootLevel');
        this.addManagedPropertyListener('alwaysAggregateAtRootLevel', (propChange) => this.alwaysAggregateAtRootLevel = propChange.currentValue);
        this.groupIncludeTotalFooter = this.gridOptionsService.is('groupIncludeTotalFooter');
        this.addManagedPropertyListener('groupIncludeTotalFooter', (propChange) => this.groupIncludeTotalFooter = propChange.currentValue);
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    execute(params) {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = _.missingOrEmpty(this.columnModel.getValueColumns());
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
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns
        };
        return aggDetails;
    }
    isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = this.gridOptionsService.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || this.gridOptionsService.is('suppressAggFilteredOnly');
    }
    recursivelyCreateAggData(aggDetails) {
        // update prop, in case changed since last time
        this.filteredOnly = !this.isSuppressAggFilteredOnly();
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
            if (isRootNode && !this.groupIncludeTotalFooter) {
                const notPivoting = !this.columnModel.isPivotMode();
                if (!this.alwaysAggregateAtRootLevel && notPivoting) {
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
        const userFunc = this.gridOptionsService.getCallback('getGroupRowAgg');
        let aggResult;
        if (userFunc) {
            const params = { nodes: rowNode.childrenAfterFilter };
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
    }
    aggregateRowNodeUsingValuesAndPivot(rowNode) {
        var _a;
        const result = {};
        const secondaryColumns = (_a = this.columnModel.getSecondaryColumns()) !== null && _a !== void 0 ? _a : [];
        secondaryColumns.forEach(secondaryCol => {
            const { pivotValueColumn, pivotTotalColumnIds, colId, pivotKeys } = secondaryCol.getColDef();
            if (_.exists(pivotTotalColumnIds)) {
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
            if (!_.exists(pivotTotalColumnIds)) {
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
        const values2d = this.getValuesNormal(rowNode, changedValueColumns);
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
    getValuesNormal(rowNode, valueColumns) {
        // create 2d array, of all values for all valueColumns
        const values = [];
        valueColumns.forEach(() => values.push([]));
        const valueColumnCount = valueColumns.length;
        const nodeList = this.filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
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
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context,
        }; // the "as any" is needed to allow the deprecation warning messages
        return aggFuncAny(params);
    }
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
export { AggregationStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdncmVnYXRpb25TdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9hZ2dyZWdhdGlvblN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxJQUFJLEVBQ0osUUFBUSxFQUVSLFNBQVMsRUFXVCxDQUFDLEVBR0QsYUFBYSxHQUNoQixNQUFNLHlCQUF5QixDQUFDO0FBVWpDLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsUUFBUTtJQWNsQyxJQUFJO1FBQ1IsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsMEJBQTBCLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekksSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsMEJBQTBCLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdkksQ0FBQztJQUVELHlFQUF5RTtJQUN6RSwrQ0FBK0M7SUFDeEMsT0FBTyxDQUFDLE1BQTBCO1FBQ3JDLGlHQUFpRztRQUNqRyxpR0FBaUc7UUFDakcsbUdBQW1HO1FBQ25HLGlHQUFpRztRQUNqRyxpREFBaUQ7UUFDakQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFDNUUsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJ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