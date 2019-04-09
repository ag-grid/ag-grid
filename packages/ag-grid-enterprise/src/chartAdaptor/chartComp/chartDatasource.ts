import {_, Autowired, BeanStub, Column, IAggFunc, IRowModel, ValueService} from "ag-grid-community";
import {AggregationStage} from "../../rowStages/aggregationStage";

export class ChartDatasource extends BeanStub {

    @Autowired('rowModel') gridRowModel: IRowModel;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('aggregationStage') aggregationStage: AggregationStage;

    private aggFunc: IAggFunc | string | undefined;

    private categories: Column[];
    private fields: Column[];

    private startRow: number;
    private endRow: number;

    private dataFromGrid: any[];
    private dataGrouped: any[];

    private errors: string[] = [];

    constructor(aggFunc?: IAggFunc | string) {
        super();
        this.aggFunc = aggFunc;
    }

    public getChartData(categories: Column[], fields: Column[], startRow: number, endRow: number, aggFunc?: IAggFunc | string): any [] {
        this.aggFunc = aggFunc!;
        this.categories = categories;
        this.fields = fields;

        this.startRow = startRow;
        this.endRow = endRow;

        this.clearErrors();

        this.extractRowsFromGridRowModel();
        this.groupRowsByCategory();

        return this.dataGrouped;
    }

    private groupRowsByCategory(): void {
        this.dataGrouped = this.dataFromGrid;

        const doingGrouping = this.categories.length > 0 && _.exists(this.aggFunc);

        if (!doingGrouping) {
            this.dataGrouped = this.dataFromGrid;
            return;
        }

        this.dataGrouped = [];

        const map: any = {};
        const lastCol = this.categories[this.categories.length - 1];

        this.dataFromGrid.forEach(data => {
            let currentMap = map;
            this.categories.forEach(col => {
                const key = data[col.getId()];
                if (col === lastCol) {
                    let groupItem = currentMap[key];
                    if (!groupItem) {
                        groupItem = {__children: []};
                        this.categories.forEach(col => {
                                groupItem[col.getId()] = data[col.getId()];
                        });
                        currentMap[key] = groupItem;
                        this.dataGrouped.push(groupItem);
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

        this.dataGrouped.forEach(groupItem => {
            this.fields.forEach(col => {
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
        const rangeLastRow = Math.min(this.endRow, modelLastRow);

        const rowCount = rangeLastRow - this.startRow + 1;

        this.dataFromGrid = [];
        for (let i = 0; i < rowCount; i++) {
            const rowNode = this.gridRowModel.getRow(i + this.startRow)!;
            const data: any = {};

            this.categories.forEach(col => {
                const part = this.valueService.getValue(col, rowNode);
                // force return type to be string or empty string (as value can be an object)
                data[col.getId()] = (part && part.toString) ? part.toString() : '';
            });

            this.fields.forEach(col => {
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