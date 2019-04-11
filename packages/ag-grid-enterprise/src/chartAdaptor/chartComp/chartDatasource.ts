import {Autowired, BeanStub, Column, IRowModel, ValueService} from "ag-grid-community";
import {AggregationStage} from "../../rowStages/aggregationStage";

export interface ChartDatasourceParams {
    categories: Column[];
    fields: Column[];
    startRow: number;
    endRow: number;
    aggregate: boolean;
}

export class ChartDatasource extends BeanStub {

    @Autowired('rowModel') gridRowModel: IRowModel;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('aggregationStage') aggregationStage: AggregationStage;

    private params: ChartDatasourceParams;

    private dataFromGrid: any[];
    private dataAggregated: any[];

    private errors: string[] = [];

    constructor() {
        super();
    }

    public getData(params: ChartDatasourceParams): any [] {
        this.params = params;

        this.clearErrors();

        this.extractRowsFromGridRowModel();
        this.aggregateRowsByCategory();

        return this.dataAggregated;
    }

    private aggregateRowsByCategory(): void {
        this.dataAggregated = this.dataFromGrid;

        const dontAggregate = !this.params.aggregate || this.params.categories.length===0;
        if (dontAggregate) {
            this.dataAggregated = this.dataFromGrid;
            return;
        }

        this.dataAggregated = [];

        const map: any = {};
        const lastCol = this.params.categories[this.params.categories.length - 1];

        this.dataFromGrid.forEach(data => {
            let currentMap = map;
            this.params.categories.forEach(col => {
                const key = data[col.getId()];
                if (col === lastCol) {
                    let groupItem = currentMap[key];
                    if (!groupItem) {
                        groupItem = {__children: []};
                        this.params.categories.forEach(col => {
                                groupItem[col.getId()] = data[col.getId()];
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

            this.params.categories.forEach(col => {
                const part = this.valueService.getValue(col, rowNode);
                // force return type to be string or empty string (as value can be an object)
                data[col.getId()] = (part && part.toString) ? part.toString() : '';
            });

            this.params.fields.forEach(col => {
                data[col.getId()] = this.valueService.getValue(col, rowNode);
            });

            this.dataFromGrid.push(data);
        }

        if (rowCount <= 0) {
            this.addError('No rows in selected range.');
        }
    }

    public getErrors(): string[] {
        return this.errors;
    }

    private clearErrors(): void {
        this.errors = [];
    }

    private addError(error: string): void {
        this.errors.push(error);
    }
}