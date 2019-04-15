import {PostConstruct, BeanStub, Column,} from "ag-grid-community";
import {ChartDatasource, ChartDatasourceParams} from "../chartDatasource";

export class ChartDataModel extends BeanStub {

    private chartData: any[];

    private aggregate: boolean;

    private datasource: ChartDatasource;

    public constructor(aggregate: boolean) {
        super();
        this.aggregate = aggregate;
    }

    @PostConstruct
    private init(): void {
        this.setupDatasource();
    }

    private setupDatasource(): void {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);
    }

    public updateData(dimension: string, valueCols: Column[], startRow: number, endRow: number): void {
        const params: ChartDatasourceParams = {
            dimensionColIds: [dimension],
            valueCols: valueCols,
            startRow: startRow,
            endRow: endRow,
            aggregate: this.aggregate
        };

        this.chartData = this.datasource.getData(params);
    }

    public getData(): any[] {
        return this.chartData;
    }

    public destroy(): void {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}