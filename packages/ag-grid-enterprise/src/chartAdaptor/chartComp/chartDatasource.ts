import {
    Autowired,
    BeanStub,
    Column,
    IRowModel,
    ValueService,
    ColumnController
} from "ag-grid-community";
import { AggregationStage } from "../../rowStages/aggregationStage";
import {ChartModel} from "./chartModel";

export interface ChartDatasourceParams {
    categoryIds: string[];
    fields: Column[];
    startRow: number;
    endRow: number;
    aggregate: boolean;
}

export class ChartDatasource extends BeanStub {

    @Autowired('rowModel') gridRowModel: IRowModel;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('aggregationStage') aggregationStage: AggregationStage;
    @Autowired('columnController') private columnController: ColumnController;

    private params: ChartDatasourceParams;

    private dataFromGrid: any[];
    private dataAggregated: any[];

    constructor() {
        super();
    }

    public getData(params: ChartDatasourceParams): any [] {
        this.params = params;

        this.extractRowsFromGridRowModel();
        this.aggregateRowsByCategory();

        return this.dataAggregated;
    }

    private aggregateRowsByCategory(): void {
        this.dataAggregated = this.dataFromGrid;

        const categoryIds = this.params.categoryIds;

        const dontAggregate = !this.params.aggregate || categoryIds.length === 0;
        if (dontAggregate) {
            this.dataAggregated = this.dataFromGrid;
            return;
        }

        this.dataAggregated = [];

        const map: any = {};


        const lastColId = categoryIds[categoryIds.length - 1];

        this.dataFromGrid.forEach(data => {
            let currentMap = map;
            categoryIds.forEach(colId => {
                const key = data[colId];
                if (colId === lastColId) {
                    let groupItem = currentMap[key];
                    if (!groupItem) {
                        groupItem = {__children: []};
                        categoryIds.forEach(colId => {
                            groupItem[colId] = data[colId];
                        });
                        currentMap[key] = groupItem;
                        this.dataAggregated.push(groupItem);
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

        this.dataAggregated.forEach(groupItem => {
            this.params.fields.forEach(col => {
                const dataToAgg: any[] = [];
                groupItem.__children.forEach((child:any) => {
                    dataToAgg.push(child[col.getId()]);
                });
                // always use 'sum' agg func, is that right????
                groupItem[col.getId()] = this.aggregationStage.aggregateValues(dataToAgg, 'sum');
            });
        });
    }

    private extractRowsFromGridRowModel(): void {

        // make sure enough rows in range to chart. if user filters and less rows, then
        // end row will be the last displayed row, not where the range ends.
        const modelLastRow = this.gridRowModel.getRowCount() - 1;
        const rangeLastRow = Math.min(this.params.endRow, modelLastRow);

        const rowCount = rangeLastRow - this.params.startRow + 1;

        this.dataFromGrid = [];
        for (let i = 0; i < rowCount; i++) {
            const rowNode = this.gridRowModel.getRow(i + this.params.startRow)!;
            const data: any = {};

            this.params.categoryIds.forEach(colId => {
                const column = this.columnController.getGridColumn(colId);
                if (column) {
                    const part = this.valueService.getValue(column, rowNode);
                    // force return type to be string or empty string (as value can be an object)
                    data[colId] = (part && part.toString) ? part.toString() : '';
                } else {
                    data[ChartModel.DEFAULT_CATEGORY] = i.toString();
                }
            });

            this.params.fields.forEach(col => {
                data[col.getId()] = this.valueService.getValue(col, rowNode);
            });

            this.dataFromGrid.push(data);
        }
    }
}