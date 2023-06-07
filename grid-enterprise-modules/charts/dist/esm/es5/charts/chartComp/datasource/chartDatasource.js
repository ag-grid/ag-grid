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
import { _, Autowired, BeanStub, ModuleNames, ModuleRegistry, Optional, } from "@ag-grid-community/core";
import { ChartDataModel } from "../model/chartDataModel";
var ChartDatasource = /** @class */ (function (_super) {
    __extends(ChartDatasource, _super);
    function ChartDatasource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartDatasource.prototype.getData = function (params) {
        if (params.crossFiltering) {
            if (params.grouping) {
                console.warn("AG Grid: crossing filtering with row grouping is not supported.");
                return { chartData: [], columnNames: {} };
            }
            if (!this.gridOptionsService.isRowModelType('clientSide')) {
                console.warn("AG Grid: crossing filtering is only supported in the client side row model.");
                return { chartData: [], columnNames: {} };
            }
        }
        var isServerSide = this.gridOptionsService.isRowModelType('serverSide');
        if (isServerSide && params.pivoting) {
            this.updatePivotKeysForSSRM();
        }
        var result = this.extractRowsFromGridRowModel(params);
        result.chartData = this.aggregateRowsByDimension(params, result.chartData);
        return result;
    };
    ChartDatasource.prototype.extractRowsFromGridRowModel = function (params) {
        var _this = this;
        var extractedRowData = [];
        var columnNames = {};
        // maps used to keep track of expanded groups that need to be removed
        var groupNodeIndexes = {};
        var groupsToRemove = {};
        // only used when cross filtering
        var filteredNodes = {};
        var allRowNodes = [];
        var numRows;
        if (params.crossFiltering) {
            filteredNodes = this.getFilteredRowNodes();
            allRowNodes = this.getAllRowNodes();
            numRows = allRowNodes.length;
        }
        else {
            // make sure enough rows in range to chart. if user filters and less rows, then end row will be
            // the last displayed row, not where the range ends.
            var modelLastRow = this.gridRowModel.getRowCount() - 1;
            var rangeLastRow = params.endRow >= 0 ? Math.min(params.endRow, modelLastRow) : modelLastRow;
            numRows = rangeLastRow - params.startRow + 1;
        }
        var _loop_1 = function (i) {
            var data = {};
            var rowNode = params.crossFiltering ? allRowNodes[i] : this_1.gridRowModel.getRow(i + params.startRow);
            // first get data for dimensions columns
            params.dimensionCols.forEach(function (col) {
                var colId = col.colId;
                var column = _this.columnModel.getGridColumn(colId);
                if (column) {
                    var valueObject = _this.valueService.getValue(column, rowNode);
                    // when grouping we also need to build up multi category labels for charts
                    if (params.grouping) {
                        var valueString = valueObject && valueObject.toString ? String(valueObject.toString()) : '';
                        // traverse parents to extract group label path
                        var labels = ChartDatasource.getGroupLabels(rowNode, valueString);
                        data[colId] = {
                            labels: labels,
                            toString: function () {
                                return this.labels.filter(function (l) { return !!l; }).reverse().join(' - ');
                            }
                        };
                        // keep track of group node indexes, so they can be padded when other groups are expanded
                        if (rowNode.group) {
                            groupNodeIndexes[labels.toString()] = i;
                        }
                        // if node (group or leaf) has parents then it is expanded and should be removed
                        var groupKey = labels.slice(1, labels.length).toString();
                        if (groupKey) {
                            groupsToRemove[groupKey] = groupNodeIndexes[groupKey];
                        }
                    }
                    else {
                        // leaf nodes can be directly added to dimension columns
                        data[colId] = valueObject;
                    }
                }
                else {
                    // introduce a default category when no dimensions exist with a value based off row index (+1)
                    data[ChartDataModel.DEFAULT_CATEGORY] = i + 1;
                }
            });
            // then get data for value columns
            params.valueCols.forEach(function (col) {
                var columnNamesArr = [];
                // pivot keys should be added first
                var pivotKeys = col.getColDef().pivotKeys;
                if (pivotKeys) {
                    columnNamesArr = pivotKeys.slice();
                }
                // then add column header name to results
                var headerName = col.getColDef().headerName;
                if (headerName) {
                    columnNamesArr.push(headerName);
                }
                // add array of column names to results
                if (columnNamesArr.length > 0) {
                    columnNames[col.getId()] = columnNamesArr;
                }
                var colId = col.getColId();
                if (params.crossFiltering) {
                    var filteredOutColId = colId + '-filtered-out';
                    // add data value to value column
                    var value = _this.valueService.getValue(col, rowNode);
                    var actualValue = value != null && typeof value.toNumber === 'function' ? value.toNumber() : value;
                    if (filteredNodes[rowNode.id]) {
                        data[colId] = actualValue;
                        data[filteredOutColId] = params.aggFunc || params.isScatter ? undefined : 0;
                    }
                    else {
                        data[colId] = params.aggFunc || params.isScatter ? undefined : 0;
                        data[filteredOutColId] = actualValue;
                    }
                }
                else {
                    // add data value to value column
                    var value = _this.valueService.getValue(col, rowNode);
                    // aggregated value
                    if (value && value.hasOwnProperty('toString')) {
                        value = parseFloat(value.toString());
                    }
                    data[colId] = value != null && typeof value.toNumber === 'function' ? value.toNumber() : value;
                }
            });
            // row data from footer nodes should not be included in charts
            if (rowNode.footer) {
                // 'stamping' data as footer to avoid impacting previously calculated `groupIndexesToRemove` and will
                // be removed from the results along with any expanded group nodes
                data.footer = true;
            }
            // add data to results
            extractedRowData.push(data);
        };
        var this_1 = this;
        for (var i = 0; i < numRows; i++) {
            _loop_1(i);
        }
        if (params.grouping) {
            var groupIndexesToRemove_1 = _.values(groupsToRemove);
            var filterFunc = function (data, index) { return !data.footer && !_.includes(groupIndexesToRemove_1, index); };
            extractedRowData = extractedRowData.filter(filterFunc);
        }
        return { chartData: extractedRowData, columnNames: columnNames };
    };
    ChartDatasource.prototype.aggregateRowsByDimension = function (params, dataFromGrid) {
        var _this = this;
        var dimensionCols = params.dimensionCols;
        if (!params.aggFunc || dimensionCols.length === 0) {
            return dataFromGrid;
        }
        var lastCol = _.last(dimensionCols);
        var lastColId = lastCol && lastCol.colId;
        var map = {};
        var dataAggregated = [];
        dataFromGrid.forEach(function (data) {
            var currentMap = map;
            dimensionCols.forEach(function (col) {
                var colId = col.colId;
                var key = data[colId];
                if (colId === lastColId) {
                    var groupItem_1 = currentMap[key];
                    if (!groupItem_1) {
                        groupItem_1 = { __children: [] };
                        dimensionCols.forEach(function (dimCol) {
                            var dimColId = dimCol.colId;
                            groupItem_1[dimColId] = data[dimColId];
                        });
                        currentMap[key] = groupItem_1;
                        dataAggregated.push(groupItem_1);
                    }
                    groupItem_1.__children.push(data);
                }
                else {
                    // map of maps
                    if (!currentMap[key]) {
                        currentMap[key] = {};
                    }
                    currentMap = currentMap[key];
                }
            });
        });
        if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Charting Aggregation', this.context.getGridId())) {
            dataAggregated.forEach(function (groupItem) { return params.valueCols.forEach(function (col) {
                if (params.crossFiltering) {
                    params.valueCols.forEach(function (valueCol) {
                        var colId = valueCol.getColId();
                        // filtered data
                        var dataToAgg = groupItem.__children
                            .filter(function (child) { return typeof child[colId] !== 'undefined'; })
                            .map(function (child) { return child[colId]; });
                        var aggResult = _this.aggregationStage.aggregateValues(dataToAgg, params.aggFunc);
                        groupItem[valueCol.getId()] = aggResult && typeof aggResult.value !== 'undefined' ? aggResult.value : aggResult;
                        // filtered out data
                        var filteredOutColId = colId + "-filtered-out";
                        var dataToAggFiltered = groupItem.__children
                            .filter(function (child) { return typeof child[filteredOutColId] !== 'undefined'; })
                            .map(function (child) { return child[filteredOutColId]; });
                        var aggResultFiltered = _this.aggregationStage.aggregateValues(dataToAggFiltered, params.aggFunc);
                        groupItem[filteredOutColId] = aggResultFiltered && typeof aggResultFiltered.value !== 'undefined' ? aggResultFiltered.value : aggResultFiltered;
                    });
                }
                else {
                    var dataToAgg = groupItem.__children.map(function (child) { return child[col.getId()]; });
                    var aggResult = 0;
                    if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Charting Aggregation', _this.context.getGridId())) {
                        aggResult = _this.aggregationStage.aggregateValues(dataToAgg, params.aggFunc);
                    }
                    groupItem[col.getId()] = aggResult && typeof aggResult.value !== 'undefined' ? aggResult.value : aggResult;
                }
            }); });
        }
        return dataAggregated;
    };
    ChartDatasource.prototype.updatePivotKeysForSSRM = function () {
        var secondaryColumns = this.columnModel.getSecondaryColumns();
        if (!secondaryColumns) {
            return;
        }
        // we don't know what the application will use for the pivot key separator (i.e. '_' or '|' ) as the
        // secondary columns are provided to grid by the application via columnApi.setSecondaryColumns()
        var pivotKeySeparator = this.extractPivotKeySeparator(secondaryColumns);
        // `pivotKeys` is not used by the SSRM for pivoting, so it is safe to reuse this colDef property. This way
        // the same logic can be used for CSRM and SSRM to extract legend names in extractRowsFromGridRowModel()
        secondaryColumns.forEach(function (col) {
            if (pivotKeySeparator === '') {
                col.getColDef().pivotKeys = [];
            }
            else {
                var keys = col.getColId().split(pivotKeySeparator);
                col.getColDef().pivotKeys = keys.slice(0, keys.length - 1);
            }
        });
    };
    ChartDatasource.prototype.extractPivotKeySeparator = function (secondaryColumns) {
        if (secondaryColumns.length === 0) {
            return '';
        }
        var extractSeparator = function (columnGroup, childId) {
            var groupId = columnGroup.getGroupId();
            if (!columnGroup.getParent()) {
                // removing groupId ('2000') from childId ('2000|Swimming') yields '|Swimming' so first char is separator
                return childId.split(groupId)[1][0];
            }
            return extractSeparator(columnGroup.getParent(), groupId);
        };
        var firstSecondaryCol = secondaryColumns[0];
        if (firstSecondaryCol.getParent() == null) {
            return '';
        }
        return extractSeparator(firstSecondaryCol.getParent(), firstSecondaryCol.getColId());
    };
    ChartDatasource.getGroupLabels = function (rowNode, initialLabel) {
        var labels = [initialLabel];
        while (rowNode && rowNode.level !== 0) {
            rowNode = rowNode.parent;
            if (rowNode) {
                labels.push(rowNode.key);
            }
        }
        return labels;
    };
    ChartDatasource.prototype.getFilteredRowNodes = function () {
        var filteredNodes = {};
        this.gridRowModel.forEachNodeAfterFilterAndSort(function (rowNode) {
            filteredNodes[rowNode.id] = rowNode;
        });
        return filteredNodes;
    };
    ChartDatasource.prototype.getAllRowNodes = function () {
        var allRowNodes = [];
        this.gridRowModel.forEachNode(function (rowNode) {
            allRowNodes.push(rowNode);
        });
        return this.sortRowNodes(allRowNodes);
    };
    ChartDatasource.prototype.sortRowNodes = function (rowNodes) {
        var sortOptions = this.sortController.getSortOptions();
        var noSort = !sortOptions || sortOptions.length == 0;
        if (noSort)
            return rowNodes;
        return this.rowNodeSorter.doFullSort(rowNodes, sortOptions);
    };
    __decorate([
        Autowired('rowModel')
    ], ChartDatasource.prototype, "gridRowModel", void 0);
    __decorate([
        Autowired('valueService')
    ], ChartDatasource.prototype, "valueService", void 0);
    __decorate([
        Autowired('columnModel')
    ], ChartDatasource.prototype, "columnModel", void 0);
    __decorate([
        Autowired('rowNodeSorter')
    ], ChartDatasource.prototype, "rowNodeSorter", void 0);
    __decorate([
        Autowired('sortController')
    ], ChartDatasource.prototype, "sortController", void 0);
    __decorate([
        Optional('aggregationStage')
    ], ChartDatasource.prototype, "aggregationStage", void 0);
    return ChartDatasource;
}(BeanStub));
export { ChartDatasource };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnREYXRhc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvZGF0YXNvdXJjZS9jaGFydERhdGFzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsUUFBUSxFQVNSLFdBQVcsRUFDWCxjQUFjLEVBQ2QsUUFBUSxHQUtYLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGNBQWMsRUFBWSxNQUFNLHlCQUF5QixDQUFDO0FBb0JuRTtJQUFxQyxtQ0FBUTtJQUE3Qzs7SUEwVUEsQ0FBQztJQWxVVSxpQ0FBTyxHQUFkLFVBQWUsTUFBNkI7UUFDeEMsSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQ3ZCLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO2dCQUNoRixPQUFPLEVBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFDLENBQUM7YUFDM0M7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO2dCQUM1RixPQUFPLEVBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFDLENBQUM7YUFDM0M7U0FDSjtRQUVELElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUUsSUFBSSxZQUFZLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNqQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNqQztRQUVELElBQU0sTUFBTSxH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