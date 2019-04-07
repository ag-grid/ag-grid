import {
    _,
    Autowired,
    Bean,
    CellRange,
    ChartRangeParams,
    ChartRef,
    ChartType,
    Context,
    GridOptionsWrapper,
    IAggFunc,
    IEventEmitter,
    IRangeChartService,
    MessageBox,
    PreDestroy
} from "ag-grid-community";
import {RangeChartDatasource} from "./rangeChartDatasource";
import {RangeController} from "../../rangeController";
import {GridChartComp} from "../gridChartComp";
import {ChartModel} from "./chartModel";
import {ChartOptions} from "../gridChartFactory";

export interface ChartDatasource extends IEventEmitter {
    getCategory(i: number): string;
    getFields(): string[];
    getFieldNames(): string[];
    getValue(i: number, field: string): number;
    getRowCount(): number;
    destroy(): void;
    getErrors(): string[];
    getRangeSelection?(): CellRange;
}

@Bean('rangeChartService')
export class RangeChartService implements IRangeChartService {

    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
    // those in developer provided containers.
    private activeCharts: ChartRef[] = [];

    public chartCurrentRange(chartType: ChartType = ChartType.GroupedBar): ChartRef | undefined {
        const selectedRange = this.getSelectedRange();
        return this.chartRange(selectedRange, chartType);
    }

    public chartCellRange(params: ChartRangeParams): ChartRef | undefined {
        const cellRange = this.rangeController.createCellRangeFromCellRangeParams(params.cellRange);

        let chartType: ChartType;
        switch (params.chartType) {
            case 'groupedBar': chartType = ChartType.GroupedBar; break;
            case 'stackedBar': chartType = ChartType.StackedBar; break;
            case 'pie': chartType = ChartType.Pie; break;
            case 'line': chartType = ChartType.Line; break;
            default: chartType = ChartType.GroupedBar;
        }

        if (cellRange) {
            return this.chartRange(cellRange, chartType, params.chartContainer, params.aggFunc);
        }
    }

    public chartRange(cellRange: CellRange, chartType: ChartType = ChartType.GroupedBar, container?: HTMLElement, aggFunc?: IAggFunc | string): ChartRef | undefined{
        const ds = this.createDatasource(cellRange, aggFunc);

        if (ds) {
            const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();

            const chartOptions: ChartOptions = {
                insideDialog: !(container || createChartContainerFunc),
                isRangeChart: true,
                height: 400,
                width: 800
            };

            const chartModel = new ChartModel(chartType, ds);
            this.context.wireBean(chartModel);

            const chartComp = new GridChartComp(chartOptions, chartModel);
            this.context.wireBean(chartComp);

            const chartRef = this.createChartRef(chartComp);

            if (container) {
                // if container exists, means developer initiated chart create via API, so place in provided container
                container.appendChild(chartComp.getGui());
            } else if (createChartContainerFunc) {
                // otherwise user created chart via grid UI, check if developer provides containers (eg if the application
                // is using it's own dialog's rather than the grid provided dialogs)
                createChartContainerFunc(chartRef);
            } else {
                // remove charts that get destroyed from the active charts list
                chartComp.addEventListener(GridChartComp.EVENT_DESTROYED, () => {
                    _.removeFromArray(this.activeCharts, chartRef);
                });
            }

            return chartRef;

        } else {
            // TODO: replace with error dialog
            console.warn('ag-Grid: unable to perform charting due to invalid range selection');
        }
    }

    private createChartRef(chartComp: GridChartComp): ChartRef {
        const chartRef: ChartRef = {
            destroyChart: ()=> {
                if (this.activeCharts.indexOf(chartRef)>=0) {
                    chartComp.destroy();
                    _.removeFromArray(this.activeCharts, chartRef);
                }
            },
            chartElement: chartComp.getGui()
        };

        this.activeCharts.push(chartRef);

        return chartRef;
    }

    private getSelectedRange(): CellRange {
        const ranges = this.rangeController.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {} as CellRange;
    }

    private createDatasource(range: CellRange, aggFunc?: IAggFunc | string): ChartDatasource | null {
        if (!range.columns) { return null; }

        const ds = new RangeChartDatasource(range, aggFunc);
        this.context.wireBean(ds);

        const errors = ds.getErrors();
        if (errors && errors.length > 0) {
            this.addErrorMessageBox(errors);
            return null;
        }

        return ds;
    }

    private addErrorMessageBox(errors: string[]) {
        const errorMessage = errors.join(' ');

        const messageBox = new MessageBox({
            title: 'Cannot Chart',
            message: errorMessage,
            centered: true,
            resizable: false,
            movable: true, 
            width: 400,
            height: 150
        });

        this.context.wireBean(messageBox);
    }

    @PreDestroy
    private destroyAllActiveCharts(): void {
        // we take copy as the forEach is removing from the array as we process
        const activeCharts = this.activeCharts.slice();
        activeCharts.forEach( chart => chart.destroyChart() );
    }
}