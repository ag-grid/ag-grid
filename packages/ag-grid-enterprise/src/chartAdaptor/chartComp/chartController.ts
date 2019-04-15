import {
    AgEvent,
    Autowired,
    BeanStub,
    CellRange,
    ChartType,
    ColDef,
    Column,
    Events,
    EventService,
    PostConstruct,
} from "ag-grid-community";
import { RangeController } from "../../rangeController";
import { ChartDatasource, ChartDatasourceParams } from "./chartDatasource";
import { ChartOptions } from "./gridChartComp";
import { ChartRangeModel } from "./model/chartRangeModel";
import { ChartColumnModel, ColState } from "./model/chartColumnModel";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {
    public static EVENT_CHART_MODEL_UPDATED = 'chartModelUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') rangeController: RangeController;

    private readonly aggregate: boolean;
    private readonly showTooltips: boolean;
    private readonly insideDialog: boolean;
    private readonly startingCellRanges: CellRange[];

    private width: number;
    private height: number;

    private chartType: ChartType;
    private chartData: any[];

    private rangeModel: ChartRangeModel;
    private columnModel: ChartColumnModel;

    private datasource: ChartDatasource;

    public constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super();
        this.chartType = chartOptions.chartType;
        this.aggregate = chartOptions.aggregate;
        this.width = chartOptions.width;
        this.height = chartOptions.height;
        this.showTooltips = chartOptions.showTooltips;
        this.insideDialog = chartOptions.insideDialog;
        this.startingCellRanges = cellRanges;
    }

    @PostConstruct
    private init(): void {
        this.setupDatasource();
        this.setupRangeModel();
        this.setupColumnModel();

        this.updateModel();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHART_RANGE_SELECTION_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateModel.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onGridColumnChange.bind(this));
    }

    private setupDatasource() {
        this.datasource = new ChartDatasource();
        this.getContext().wireBean(this.datasource);
    }

    private setupRangeModel() {
        this.rangeModel = new ChartRangeModel(this.startingCellRanges);
        this.getContext().wireBean(this.rangeModel);

        // update the range controller now that we have updated the cell ranges as 'value' or 'dimension'
        this.setChartCellRangesInRangeController();
    }

    private setupColumnModel() {
        this.columnModel = new ChartColumnModel();
        this.getContext().wireBean(this.columnModel);

        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.resetColumnState(allColsFromRanges);
    }

    public updateForColumnSelection(updatedCol: ColState): void {
        this.columnModel.updateColumnState(updatedCol);
        this.rangeModel.updateCellRanges(this.columnModel.getDimensionColState(), updatedCol);
        this.updateModel();
        this.setChartCellRangesInRangeController();
    }

    private updateModel() {
        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.updateColumnStateFromRanges(allColsFromRanges);

        const {startRow, endRow} = this.getRowIndexes();

        const params: ChartDatasourceParams = {
            categoryIds: [this.columnModel.getSelectedDimensionId()],
            fields: this.columnModel.getSelectedValueCols(),
            startRow: startRow,
            endRow: endRow,
            aggregate: this.aggregate
        };

        this.chartData = this.datasource.getData(params);

        this.raiseChartUpdatedEvent();
    }

    public setChartType(chartType: ChartType): void {
        this.chartType = chartType;
        this.raiseChartUpdatedEvent();
    }

    private onGridColumnChange() {
        const allColsFromRanges = this.rangeModel.getAllColumnsFromRanges();
        this.columnModel.resetColumnState(allColsFromRanges);
        this.updateModel();
    }

    public getColStateForMenu(): { dimensionCols: ColState[], valueCols: ColState[] } {
        return {dimensionCols: this.columnModel.getDimensionColState(), valueCols: this.columnModel.getValueColState()}
    }

    public getData(): any[] {
        return this.chartData;
    }

    public getSelectedCategory(): string {
        return this.columnModel.getSelectedDimensionId();
    }

    public getFields(): { colId: string, displayName: string }[] {
        return this.columnModel.getSelectedColState().map(cs => {
            return {
                colId: cs.colId,
                displayName: cs.displayName
            };
        });
    };

    public getChartType(): ChartType {
        return this.chartType;
    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(width: number): void {
        this.width = width;
    }

    public getHeight(): number {
        return this.height;
    }

    public setHeight(height: number): void {
        this.height = height;
    }

    public isShowTooltips(): boolean {
        return this.showTooltips;
    }

    public isInsideDialog(): boolean {
        return this.insideDialog;
    }

    public setChartCellRangesInRangeController() {
        this.rangeController.setCellRanges(this.rangeModel.getCellRanges());
    }

    public removeChartCellRangesFromRangeController() {
        this.rangeController.setCellRanges([]);
    }

    private raiseChartUpdatedEvent() {
        const event: ChartModelUpdatedEvent = {
            type: ChartController.EVENT_CHART_MODEL_UPDATED
        };
        this.dispatchEvent(event);
    }

    static isDimensionColumn(col: Column, displayedCols: Column[]): boolean {
        const colDef = col.getColDef() as ColDef;
        return displayedCols.indexOf(col) > -1 && (!!colDef.enableRowGroup || !!colDef.enablePivot);
    }

    static isValueColumn(col: Column, displayedCols: Column[]): boolean {
        const colDef = col.getColDef() as ColDef;
        return displayedCols.indexOf(col) > -1 && (!!colDef.enableValue);
    }

    private getRowIndexes(): {startRow: number, endRow: number} {
        let startRow = 0, endRow = 0;
        const lastRange = this.rangeModel.getLastRange();
        if (lastRange) {
            startRow = this.rangeController.getRangeStartRow(lastRange).rowIndex;
            endRow = this.rangeController.getRangeEndRow(lastRange).rowIndex;
        }
        return {startRow, endRow}
    }

    public destroy() {
        super.destroy();

        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}