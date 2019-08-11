import {
    _,
    Autowired,
    BeanStub,
    Column,
    ColumnController,
    IRowModel,
    ValueService,
    IAggFunc,
    RowNode
} from "ag-grid-community";
import { AggregationStage } from "../../rowStages/aggregationStage";
import { ChartModel } from "./chartModel";

export interface ChartDatasourceParams {
    dimensionColIds: string[];
    grouping: boolean;
    pivoting: boolean;
    valueCols: Column[];
    startRow: number;
    endRow: number;
    aggFunc?: string | IAggFunc;
    multiCategories: boolean;
}

export class ChartDatasource extends BeanStub {
    @Autowired('rowModel') gridRowModel: IRowModel;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('aggregationStage') aggregationStage: AggregationStage;
    @Autowired('columnController') private columnController: ColumnController;

    public getData(params: ChartDatasourceParams): {data: any[], columnNames: { [key: string]: string[] }} {
        const result = this.extractRowsFromGridRowModel(params);
        result.data = this.aggregateRowsByDimension(params, result.data);
        return result;
    }

    private extractRowsFromGridRowModel(params: ChartDatasourceParams): {data: any[], columnNames: { [key: string]: string[] }} {
        let extractedRowData = [];
        const columnNames: { [key: string]: string[] } = {};

        // maps used to keep track of expanded groups that need to be removed
        const groupNodeIndexes: { [key: string]: number } = {};
        const groupsToRemove: { [key: string]: number } = {};

        // make sure enough rows in range to chart. if user filters and less rows, then end row will be
        // the last displayed row, not where the range ends.
        const modelLastRow = this.gridRowModel.getRowCount() - 1;
        const rangeLastRow = params.endRow > 0 ? Math.min(params.endRow, modelLastRow) : modelLastRow;

        const numRows = rangeLastRow - params.startRow + 1;
        for (let i = 0; i < numRows; i++) {
            const data: any = {};

            // lookup row node from row model using row index
            const rowNode = this.gridRowModel.getRow(i + params.startRow)!;

            // first get data for dimensions columns
            params.dimensionColIds.forEach(colId => {
                const column = this.columnController.getGridColumn(colId);
                if (column) {
                    const valueObject = this.valueService.getValue(column, rowNode);

                    // force return type to be string or empty string (as value can be an object)
                    const value = (valueObject && valueObject.toString) ? valueObject.toString() : '';

                    // when grouping we also need to build up multi category labels for charts
                    if (params.grouping) {
                        // traverse parents to extract group label path
                        const labels = this.getGroupLabels(rowNode, [String(value)]);

                        // add group labels to group column for multi category charts
                        data[colId] = params.multiCategories ? {labels: labels} : value;

                        // keep track of group node indexes so they can be padded when other groups are expanded
                        if (rowNode.group) {
                            groupNodeIndexes[labels.toString()] = i;
                        }

                        // if node (group or leaf) has parents then it is expanded and should be removed
                        const groupKey = labels.slice(1, labels.length).toString();
                        if (groupKey) {
                            groupsToRemove[groupKey] = groupNodeIndexes[groupKey];
                        }
                    } else {
                        // leaf nodes can be directly added to dimension columns
                        data[colId] = value;
                    }
                } else {
                    // introduce a default category when no dimensions exist with a value based off row index (+1)
                    data[ChartModel.DEFAULT_CATEGORY] = (i + 1).toString();
                }
            });

            // then get data for value columns
            params.valueCols.forEach(col => {
                let columnNamesArr: string[] = [];

                // add header name of column to results
                const headerName = col.getColDef().headerName;
                headerName ? columnNamesArr.push(headerName) : columnNamesArr.push('');

                // concat pivot keys to header name
                const pivotKeys = col.getColDef().pivotKeys;
                if (pivotKeys) {
                    columnNamesArr = columnNamesArr.concat(pivotKeys);
                }

                // add array of column names to results
                columnNames[col.getId()] = columnNamesArr;

                // add data value to value column
                data[col.getId()] = this.valueService.getValue(col, rowNode);
            });

            // add data to results
            extractedRowData.push(data);
        }

        if (params.grouping) {
            // determine indexes of expanded group nodes to be removed
            const groupIndexesToRemove = Object.keys(groupsToRemove).map(key => groupsToRemove[key]);

            // remove expanded groups from results
            extractedRowData = extractedRowData.filter((_, index: number) => groupIndexesToRemove.indexOf(index) < 0);
        }

        return {data: extractedRowData, columnNames: columnNames};
    }

    private aggregateRowsByDimension(params: ChartDatasourceParams, dataFromGrid: any[]): any[] {
        const dimensionColIds = params.dimensionColIds;
        const skipAggregation = !params.aggFunc || dimensionColIds.length === 0;
        if (skipAggregation) return dataFromGrid;

        const lastColId = _.last(dimensionColIds);

        const map: any = {};
        const dataAggregated: any[] = [];

        dataFromGrid.forEach(data => {
            let currentMap = map;
            dimensionColIds.forEach(colId => {
                const key = data[colId];
                if (colId === lastColId) {
                    let groupItem = currentMap[key];
                    if (!groupItem) {
                        groupItem = {__children: []};
                        dimensionColIds.forEach(colId => {
                            groupItem[colId] = data[colId];
                        });
                        currentMap[key] = groupItem;
                        dataAggregated.push(groupItem);
                    }
                    groupItem.__children.push(data);
                } else {
                    // map of maps
                    if (!currentMap[key]) {
                        currentMap[key] = {};
                    }
                    currentMap = currentMap[key];
                }
            });
        });

        dataAggregated.forEach(groupItem => {
            params.valueCols.forEach(col => {
                const dataToAgg: any[] = [];
                groupItem.__children.forEach((child:any) => {
                    dataToAgg.push(child[col.getId()]);
                });

                const aggResult = this.aggregationStage.aggregateValues(dataToAgg, params.aggFunc as IAggFunc);

                if (typeof(aggResult.value) !== 'undefined') {
                    groupItem[col.getId()] = aggResult.value;
                } else {
                    groupItem[col.getId()] = aggResult;
                }
            });
        });

        return dataAggregated;
    }

    private getGroupLabels(rowNode: RowNode, result: string[]): string[] {
        // add parent group keys by walking up the tree
        if (rowNode.level === 0) return result;
        const parentNode = rowNode.parent as RowNode;
        result.push(parentNode.key);
        return this.getGroupLabels(parentNode, result);
    };
}