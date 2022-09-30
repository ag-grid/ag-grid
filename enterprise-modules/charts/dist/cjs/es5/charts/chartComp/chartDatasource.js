"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var chartDataModel_1 = require("./chartDataModel");
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
            if (!this.gridOptionsWrapper.isRowModelDefault()) {
                console.warn("AG Grid: crossing filtering is only supported in the client side row model.");
                return { chartData: [], columnNames: {} };
            }
        }
        var isServerSide = this.gridOptionsWrapper.isRowModelServerSide();
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
                            labels: labels, toString: function () {
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
                    data[chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY] = i + 1;
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
            var groupIndexesToRemove_1 = core_1._.values(groupsToRemove);
            var filterFunc = function (data, index) { return !data.footer && !core_1._.includes(groupIndexesToRemove_1, index); };
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
        var lastCol = core_1._.last(dimensionCols);
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
        if (core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.RowGroupingModule, 'Charting Aggregation')) {
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
                    if (core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.RowGroupingModule, 'Charting Aggregation')) {
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
        core_1.Autowired('rowModel')
    ], ChartDatasource.prototype, "gridRowModel", void 0);
    __decorate([
        core_1.Autowired('valueService')
    ], ChartDatasource.prototype, "valueService", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], ChartDatasource.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('rowNodeSorter')
    ], ChartDatasource.prototype, "rowNodeSorter", void 0);
    __decorate([
        core_1.Autowired('sortController')
    ], ChartDatasource.prototype, "sortController", void 0);
    __decorate([
        core_1.Optional('aggregationStage')
    ], ChartDatasource.prototype, "aggregationStage", void 0);
    return ChartDatasource;
}(core_1.BeanStub));
exports.ChartDatasource = ChartDatasource;
