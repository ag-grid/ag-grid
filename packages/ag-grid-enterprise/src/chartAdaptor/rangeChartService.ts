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
    IRangeChartService,
    PreDestroy,
    ProcessChartOptionsParams,
    ChartOptions
} from "ag-grid-community";
import { RangeController } from "../rangeController";
import { GridChartParams, GridChartComp } from "./chartComp/gridChartComp";

@Bean('rangeChartService')
export class RangeChartService implements IRangeChartService {

    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
    // those in developer provided containers.
    private activeCharts: ChartRef[] = [];

    public chartCurrentRange(chartType: ChartType = ChartType.GroupedBar): ChartRef | undefined {
        const selectedRange: CellRange = this.getSelectedRange();
        return this.chartRange(selectedRange, chartType);
    }

    public chartCellRange(params: ChartRangeParams): ChartRef | undefined {
        const cellRange = this.rangeController.createCellRangeFromCellRangeParams(params.cellRange);

        if (!cellRange) {
            console.warn("ag-Grid - unable to chart as no range is selected");
            return;
        }

        let chartType: ChartType;
        switch (params.chartType) {
            case 'groupedBar':
                chartType = ChartType.GroupedBar;
                break;
            case 'stackedBar':
                chartType = ChartType.StackedBar;
                break;
            case 'pie':
                chartType = ChartType.Pie;
                break;
            case 'doughnut':
                chartType = ChartType.Doughnut;
                break;
            case 'line':
                chartType = ChartType.Line;
                break;
            default:
                chartType = ChartType.GroupedBar;
        }

        if (cellRange) {
            return this.chartRange(cellRange, chartType, params.chartContainer, params.suppressChartRanges, params.aggregate, params.processChartOptions);
        }
    }

    private chartRange(cellRange: CellRange, chartType: ChartType, container?: HTMLElement, suppressChartRanges = false, aggregate = false,
                       processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions): ChartRef | undefined {

        const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();

        const params: GridChartParams = {
            cellRange: cellRange,
            chartType: chartType,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges: suppressChartRanges,
            aggregate: aggregate,
            processChartOptions: processChartOptions,
            height: 400, //TODO
            width: 800   //TODO
        };

        const chartComp = new GridChartComp(params);
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
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(GridChartComp.EVENT_DESTROYED, () => {
                _.removeFromArray(this.activeCharts, chartRef);
            });
        }

        return chartRef;
    }

    private createChartRef(chartComp: GridChartComp): ChartRef {
        const chartRef: ChartRef = {
            destroyChart: () => {
                if (this.activeCharts.indexOf(chartRef) >= 0) {
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

    @PreDestroy
    private destroyAllActiveCharts(): void {
        // we take copy as the forEach is removing from the array as we process
        const activeCharts = this.activeCharts.slice();
        activeCharts.forEach(chart => chart.destroyChart());
    }
}