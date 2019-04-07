import {
    Autowired,
    PostConstruct,
    AgEvent,
    BeanStub,
    ChartType,
    ColumnController
} from "ag-grid-community";
import {ChartDatasource} from "./rangeChartService";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export type ColState = {
    colId: string,
    displayName: string,
    selected: boolean
}

export class ChartModel extends BeanStub {

    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    private chartType: ChartType;
    private readonly datasource: ChartDatasource;

    @Autowired('columnController') private columnController: ColumnController;

    public constructor(chartType: ChartType, chartDatasource: ChartDatasource) {
        super();
        this.chartType = chartType;
        this.datasource = chartDatasource;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.raiseChartUpdatedEvent.bind(this));
    }

    public getChartType(): ChartType {
        return this.chartType;
    }

    public getFields(): string[] {
        return this.datasource.getFields();
    }

    public getFieldNames(): string[] {
        return this.datasource.getFieldNames();
    }

    public getColStateForMenu(): ColState[] {
        const allDisplayedColumns = this.columnController.getAllDisplayedColumns();
        const selectedColumns = this.getFields();

        return allDisplayedColumns.map(col => {
            const colId = col.getColId();

            let displayName = this.columnController.getDisplayNameForColumn(col, 'toolPanel');
            displayName = displayName ? displayName : '';

            const selected = selectedColumns.indexOf(colId) > -1;

            return {colId, displayName, selected}
        });
    }

    public getData(): any[] {
        const data: any[] = [];
        const fields = this.datasource.getFields();
        for (let i = 0; i < this.datasource.getRowCount(); i++) {
            const item: any = {
                category: this.datasource.getCategory(i)
            };
            fields.forEach(field => item[field] = this.datasource.getValue(i, field));
            data.push(item);
        }
        return data;
    }

    public getErrors(): string[] {
        return this.datasource.getErrors();
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    public update(colState: ColState[]): void {
        console.log(colState);
        this.raiseChartUpdatedEvent();
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartModel.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    }

    public destroy() {
        super.destroy();
    }
}