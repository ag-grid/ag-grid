var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, BeanStub, ModuleNames, ModuleRegistry, Optional, } from "@ag-grid-community/core";
import { ChartDataModel } from "../model/chartDataModel";
export class ChartDatasource extends BeanStub {
    getData(params) {
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
        const isServerSide = this.gridOptionsService.isRowModelType('serverSide');
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
                    data[ChartDataModel.DEFAULT_CATEGORY] = i + 1;
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
            const groupIndexesToRemove = _.values(groupsToRemove);
            const filterFunc = (data, index) => !data.footer && !_.includes(groupIndexesToRemove, index);
            extractedRowData = extractedRowData.filter(filterFunc);
        }
        return { chartData: extractedRowData, columnNames };
    }
    aggregateRowsByDimension(params, dataFromGrid) {
        const dimensionCols = params.dimensionCols;
        if (!params.aggFunc || dimensionCols.length === 0) {
            return dataFromGrid;
        }
        const lastCol = _.last(dimensionCols);
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
        if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Charting Aggregation', this.context.getGridId())) {
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
                    if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Charting Aggregation', this.context.getGridId())) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnREYXRhc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvZGF0YXNvdXJjZS9jaGFydERhdGFzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsUUFBUSxFQVNSLFdBQVcsRUFDWCxjQUFjLEVBQ2QsUUFBUSxHQUtYLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGNBQWMsRUFBWSxNQUFNLHlCQUF5QixDQUFDO0FBb0JuRSxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxRQUFRO0lBUWxDLE9BQU8sQ0FBQyxNQUE2QjtRQUN4QyxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7WUFDdkIsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLGlFQUFpRSxDQUFDLENBQUM7Z0JBQ2hGLE9BQU8sRUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUMsQ0FBQzthQUMzQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLDZFQUE2RSxDQUFDLENBQUM7Z0JBQzVGLE9BQU8sRUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUMsQ0FBQzthQUMzQztTQUNKO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRSxJQUFJLFlBQVksSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1NBQ2pDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFD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