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
}

export class ChartDatasource extends BeanStub {
    @Autowired('rowModel') gridRowModel: IRowModel;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('aggregationStage') aggregationStage: AggregationStage;
    @Autowired('columnController') private columnController: ColumnController;

    public getData(params: ChartDatasourceParams): any [] {
        const dataFromGrid = this.extractRowsFromGridRowModel(params);
        return this.aggregateRowsByDimension(params, dataFromGrid);
    }

    private extractRowsFromGridRowModel(params: ChartDatasourceParams): any[] {
        // make sure enough rows in range to chart. if user filters and less rows, then
        // end row will be the last displayed row, not where the range ends.
        const modelLastRow = this.gridRowModel.getRowCount() - 1;
        const rangeLastRow = Math.min(params.endRow, modelLastRow);

        let maxGroupLevel = 0;
        const groupNodeIndexes: { [key: string]: number } = {};
        const groupsToRemove: { [key: string]: number } = {};

        const dataFromGrid = [];
        const rowCount = rangeLastRow - params.startRow + 1;
        for (let i = 0; i < rowCount; i++) {
            const rowNode = this.gridRowModel.getRow(i + params.startRow)!;
            const data: any = {};

            params.dimensionColIds.forEach(colId => {
                const column = this.columnController.getGridColumn(colId);

                if (column) {
                    const part = this.valueService.getValue(column, rowNode);
                    const value = (part && part.toString) ? part.toString() : '';

                    if (params.grouping) {
                        const labels = this.addParentKeys(rowNode, [String(value)]);
                        maxGroupLevel = Math.max(labels.length, maxGroupLevel);

                        data[colId] = {labels: labels.slice()};

                        if (rowNode.group) {
                            groupNodeIndexes[labels.join('-')] = i;
                        }

                        labels.shift();
                        const groupKey = labels.join('-');
                        groupsToRemove[groupKey] = groupNodeIndexes[groupKey];
                    } else {
                        // force return type to be string or empty string (as value can be an object)
                        data[colId] = value;
                    }

                } else {
                    data[ChartModel.DEFAULT_CATEGORY] = (i + 1).toString();
                }
            });

            params.valueCols.forEach(col => {
                data[col.getId()] = this.valueService.getValue(col, rowNode);
            });

            dataFromGrid.push(data);
        }

        const groupIndexesToRemove = Object.keys(groupsToRemove).map(key => groupsToRemove[key]);

        return this.processGroupData(groupIndexesToRemove, dataFromGrid, maxGroupLevel);
    }

    private processGroupData(groupIndexesToRemove: number[], dataFromGrid: any[], maxGroupLevel: number) {
        const groupsToRemoveFilter = (d: any, index: number) => groupIndexesToRemove.indexOf(index) < 0;

        const padGroupLevels = (d: any) => {
            // TODO handle all group column types
            const groupCol = d['ag-Grid-AutoColumn'];
            for (let i = groupCol.labels.length; i < maxGroupLevel; i++) {
                groupCol.labels.unshift('');
            }
            return d;
        };

        return dataFromGrid.filter(groupsToRemoveFilter).map(padGroupLevels);
    }

    private aggregateRowsByDimension(params: ChartDatasourceParams, dataFromGrid: any[]): any[] {
        const dimensionColIds = params.dimensionColIds;
        const dontAggregate = !params.aggFunc || dimensionColIds.length === 0;
        if (dontAggregate) {
            return dataFromGrid;
        }

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

    private addParentKeys(rowNode: RowNode, acc: string[]): string[] {
        if (rowNode.level === 0) return acc;
        const parentNode = rowNode.parent as RowNode;
        acc.push(parentNode.key);
        return this.addParentKeys(parentNode, acc);
    };
}