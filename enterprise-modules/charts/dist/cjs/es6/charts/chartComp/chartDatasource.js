"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const chartDataModel_1 = require("./chartDataModel");
class ChartDatasource extends core_1.BeanStub {
    getData(params) {
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
        const isServerSide = this.gridOptionsWrapper.isRowModelServerSide();
        if (isServerSide && params.pivoting) {
            this.updatePivotKeysForSSRM();
        }
        const result = this.extractRowsFromGridRowModel(params);
        result.chartData = this.aggregateRowsByDimension(params, result.chartData);
        return result;
    }
    extractRowsFromGridRowModel(params) {
        let extractedRowData = [];
        const columnNames = {};
        // maps used to keep track of expanded groups that need to be removed
        const groupNodeIndexes = {};
        const groupsToRemove = {};
        // only used when cross filtering
        let filteredNodes = {};
        let allRowNodes = [];
        let numRows;
        if (params.crossFiltering) {
            filteredNodes = this.getFilteredRowNodes();
            allRowNodes = this.getAllRowNodes();
            numRows = allRowNodes.length;
        }
        else {
            // make sure enough rows in range to chart. if user filters and less rows, then end row will be
            // the last displayed row, not where the range ends.
            const modelLastRow = this.gridRowModel.getRowCount() - 1;
            const rangeLastRow = params.endRow >= 0 ? Math.min(params.endRow, modelLastRow) : modelLastRow;
            numRows = rangeLastRow - params.startRow + 1;
        }
        for (let i = 0; i < numRows; i++) {
            const data = {};
            const rowNode = params.crossFiltering ? allRowNodes[i] : this.gridRowModel.getRow(i + params.startRow);
            // first get data for dimensions columns
            params.dimensionCols.forEach(col => {
                const colId = col.colId;
                const column = this.columnModel.getGridColumn(colId);
                if (column) {
                    const valueObject = this.valueService.getValue(column, rowNode);
                    // when grouping we also need to build up multi category labels for charts
                    if (params.grouping) {
                        const valueString = valueObject && valueObject.toString ? String(valueObject.toString()) : '';
                        // traverse parents to extract group label path
                        const labels = ChartDatasource.getGroupLabels(rowNode, valueString);
                        data[colId] = {
                            labels, toString: function () {
                                return this.labels.filter((l) => !!l).reverse().join(' - ');
                            }
                        };
                        // keep track of group node indexes, so they can be padded when other groups are expanded
                        if (rowNode.group) {
                            groupNodeIndexes[labels.toString()] = i;
                        }
                        // if node (group or leaf) has parents then it is expanded and should be removed
                        const groupKey = labels.slice(1, labels.length).toString();
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
            params.valueCols.forEach(col => {
                let columnNamesArr = [];
                // pivot keys should be added first
                const pivotKeys = col.getColDef().pivotKeys;
                if (pivotKeys) {
                    columnNamesArr = pivotKeys.slice();
                }
                // then add column header name to results
                const headerName = col.getColDef().headerName;
                if (headerName) {
                    columnNamesArr.push(headerName);
                }
                // add array of column names to results
                if (columnNamesArr.length > 0) {
                    columnNames[col.getId()] = columnNamesArr;
                }
                const colId = col.getColId();
                if (params.crossFiltering) {
                    const filteredOutColId = colId + '-filtered-out';
                    // add data value to value column
                    const value = this.valueService.getValue(col, rowNode);
                    const actualValue = value != null && typeof value.toNumber === 'function' ? value.toNumber() : value;
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
                    let value = this.valueService.getValue(col, rowNode);
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
        }
        if (params.grouping) {
            const groupIndexesToRemove = core_1._.values(groupsToRemove);
            const filterFunc = (data, index) => !data.footer && !core_1._.includes(groupIndexesToRemove, index);
            extractedRowData = extractedRowData.filter(filterFunc);
        }
        return { chartData: extractedRowData, columnNames };
    }
    aggregateRowsByDimension(params, dataFromGrid) {
        const dimensionCols = params.dimensionCols;
        if (!params.aggFunc || dimensionCols.length === 0) {
            return dataFromGrid;
        }
        const lastCol = core_1._.last(dimensionCols);
        const lastColId = lastCol && lastCol.colId;
        const map = {};
        const dataAggregated = [];
        dataFromGrid.forEach(data => {
            let currentMap = map;
            dimensionCols.forEach(col => {
                const colId = col.colId;
                const key = data[colId];
                if (colId === lastColId) {
                    let groupItem = currentMap[key];
                    if (!groupItem) {
                        groupItem = { __children: [] };
                        dimensionCols.forEach(dimCol => {
                            const dimColId = dimCol.colId;
                            groupItem[dimColId] = data[dimColId];
                        });
                        currentMap[key] = groupItem;
                        dataAggregated.push(groupItem);
                    }
                    groupItem.__children.push(data);
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
            dataAggregated.forEach(groupItem => params.valueCols.forEach(col => {
                if (params.crossFiltering) {
                    params.valueCols.forEach(valueCol => {
                        const colId = valueCol.getColId();
                        // filtered data
                        const dataToAgg = groupItem.__children
                            .filter((child) => typeof child[colId] !== 'undefined')
                            .map((child) => child[colId]);
                        let aggResult = this.aggregationStage.aggregateValues(dataToAgg, params.aggFunc);
                        groupItem[valueCol.getId()] = aggResult && typeof aggResult.value !== 'undefined' ? aggResult.value : aggResult;
                        // filtered out data
                        const filteredOutColId = `${colId}-filtered-out`;
                        const dataToAggFiltered = groupItem.__children
                            .filter((child) => typeof child[filteredOutColId] !== 'undefined')
                            .map((child) => child[filteredOutColId]);
                        let aggResultFiltered = this.aggregationStage.aggregateValues(dataToAggFiltered, params.aggFunc);
                        groupItem[filteredOutColId] = aggResultFiltered && typeof aggResultFiltered.value !== 'undefined' ? aggResultFiltered.value : aggResultFiltered;
                    });
                }
                else {
                    const dataToAgg = groupItem.__children.map((child) => child[col.getId()]);
                    let aggResult = 0;
                    if (core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.RowGroupingModule, 'Charting Aggregation')) {
                        aggResult = this.aggregationStage.aggregateValues(dataToAgg, params.aggFunc);
                    }
                    groupItem[col.getId()] = aggResult && typeof aggResult.value !== 'undefined' ? aggResult.value : aggResult;
                }
            }));
        }
        return dataAggregated;
    }
    updatePivotKeysForSSRM() {
        const secondaryColumns = this.columnModel.getSecondaryColumns();
        if (!secondaryColumns) {
            return;
        }
        // we don't know what the application will use for the pivot key separator (i.e. '_' or '|' ) as the
        // secondary columns are provided to grid by the application via columnApi.setSecondaryColumns()
        const pivotKeySeparator = this.extractPivotKeySeparator(secondaryColumns);
        // `pivotKeys` is not used by the SSRM for pivoting, so it is safe to reuse this colDef property. This way
        // the same logic can be used for CSRM and SSRM to extract legend names in extractRowsFromGridRowModel()
        secondaryColumns.forEach(col => {
            if (pivotKeySeparator === '') {
                col.getColDef().pivotKeys = [];
            }
            else {
                const keys = col.getColId().split(pivotKeySeparator);
                col.getColDef().pivotKeys = keys.slice(0, keys.length - 1);
            }
        });
    }
    extractPivotKeySeparator(secondaryColumns) {
        if (secondaryColumns.length === 0) {
            return '';
        }
        const extractSeparator = (columnGroup, childId) => {
            const groupId = columnGroup.getGroupId();
            if (!columnGroup.getParent()) {
                // removing groupId ('2000') from childId ('2000|Swimming') yields '|Swimming' so first char is separator
                return childId.split(groupId)[1][0];
            }
            return extractSeparator(columnGroup.getParent(), groupId);
        };
        const firstSecondaryCol = secondaryColumns[0];
        if (firstSecondaryCol.getParent() == null) {
            return '';
        }
        return extractSeparator(firstSecondaryCol.getParent(), firstSecondaryCol.getColId());
    }
    static getGroupLabels(rowNode, initialLabel) {
        const labels = [initialLabel];
        while (rowNode && rowNode.level !== 0) {
            rowNode = rowNode.parent;
            if (rowNode) {
                labels.push(rowNode.key);
            }
        }
        return labels;
    }
    getFilteredRowNodes() {
        const filteredNodes = {};
        this.gridRowModel.forEachNodeAfterFilterAndSort((rowNode) => {
            filteredNodes[rowNode.id] = rowNode;
        });
        return filteredNodes;
    }
    getAllRowNodes() {
        let allRowNodes = [];
        this.gridRowModel.forEachNode((rowNode) => {
            allRowNodes.push(rowNode);
        });
        return this.sortRowNodes(allRowNodes);
    }
    sortRowNodes(rowNodes) {
        const sortOptions = this.sortController.getSortOptions();
        const noSort = !sortOptions || sortOptions.length == 0;
        if (noSort)
            return rowNodes;
        return this.rowNodeSorter.doFullSort(rowNodes, sortOptions);
    }
}
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
exports.ChartDatasource = ChartDatasource;
