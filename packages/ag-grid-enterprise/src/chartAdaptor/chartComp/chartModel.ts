import {
    Autowired,
    PostConstruct,
    AgEvent,
    BeanStub,
    ChartType,
    ColumnController,
    Events,
    EventService
} from "ag-grid-community";
import {ChartData, ChartDatasource} from "../rangeChart/rangeChartService";

export interface ChartModelUpdatedEvent extends AgEvent {}

export type ColState = {
    colId: string,
    displayName: string,
    selected: boolean
}

export class ChartModel extends BeanStub {

    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    private chartType: ChartType;

    private chartData: ChartData;
    private errors: string[];

    private readonly datasource: ChartDatasource;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;

    public constructor(chartType: ChartType, datasource: ChartDatasource) {
        super();
        this.chartType = chartType;
        this.datasource = datasource;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.updateModel();
    }

    private updateModel() {
        this.chartData = this.datasource.getChartData();
        this.errors = this.datasource.getErrors();

        this.raiseChartUpdatedEvent();
    }

    public getChartType(): ChartType {
        return this.chartType;
    }

    public getErrors(): string[] {
        return this.errors;
    }

    public getFields(): string[] {
        return this.chartData.colIds;
    }

    public getFieldNames(): string[] {
        return this.chartData.colDisplayNames;
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
        const fields = this.chartData.colIds;

        for (let i = 0; i < this.chartData.dataGrouped.length; i++) {
            const item: any = {
                category: this.getCategory(i)
            };

            fields.forEach(field => {
                const data = this.chartData.dataGrouped[i];
                const col = this.chartData.colsMapped[field];
                item[field] = data[col.getId()];
            });

            data.push(item);
        }
        return data;
    }

    private getCategory(i: number): string {
        const data = this.chartData.dataGrouped[i];
        const resParts: string[] = [];
        this.chartData.categoryCols.forEach(col => {
            resParts.push(data[col.getId()]);
        });
        return resParts.join(', ');
    }

    //TODO remove - just for testing
    public setErrors(errors: string[]): void {
        this.errors = errors;
        this.raiseChartUpdatedEvent();
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    public update(colState: ColState[]): void {
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

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}