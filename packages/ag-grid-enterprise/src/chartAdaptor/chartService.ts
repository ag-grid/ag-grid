import {
    _,
    Bean,
    Autowired,
    PreDestroy,
    CellRange,
    ChartRangeParams,
    ChartRef,
    ChartType,
    Context,
    GridOptionsWrapper,
    ProcessChartOptionsParams,
    ChartOptions,
    IAggFunc,
    Environment,
    ColumnController,
    IChartService,
} from "ag-grid-community";
import { RangeController } from "../rangeController";
import { GridChartParams, GridChartComp } from "./chartComp/gridChartComp";

@Bean('chartService')
export class ChartService implements IChartService {

    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('environment') private environment: Environment;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
    // those in developer provided containers.
    private activeCharts: ChartRef[] = [];

    public chartCurrentRange(chartType: ChartType = ChartType.GroupedColumn): ChartRef | undefined {
        const selectedRange: CellRange = this.getSelectedRange();
        return this.chartRange(selectedRange, chartType);
    }

    public chartCellRange(params: ChartRangeParams): ChartRef | undefined {
        const cellRange = this.rangeController.createCellRangeFromCellRangeParams(params.cellRange);

        if (!cellRange) {
            console.warn("ag-Grid - unable to chart as no range is selected");
            return;
        }
        if (cellRange) {
            const pivotChart = false;
            return this.chartRange(cellRange, params.chartType, pivotChart, params.suppressChartRanges,
                params.chartContainer, params.aggFunc, params.processChartOptions);
        }
    }

    public pivotChart(chartType: ChartType = ChartType.GroupedColumn): ChartRef | undefined {
        // if required enter pivot mode
        if (!this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(true, "pivotChart");
        }

        // pivot chart range contains all visible column without a row range to include all rows
        const chartAllRangeParams = {
            columns: this.columnController.getAllDisplayedColumns().map(col => col.getColId())
        };

        const cellRange = this.rangeController.createCellRangeFromCellRangeParams(chartAllRangeParams);
        if (!cellRange) {
            console.warn("ag-Grid - unable to chart as there are no columns in the grid.");
            return;
        }

        const pivotChart = true, suppressChartRanges = true;
        return this.chartRange(cellRange, chartType, pivotChart, suppressChartRanges);
    }

    private chartRange(cellRange: CellRange,
                       chartType: ChartType,
                       pivotChart = false,
                       suppressChartRanges = false,
                       container?: HTMLElement,
                       aggFunc?: string | IAggFunc,
                       processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions): ChartRef | undefined {

        const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();

        const params: GridChartParams = {
            pivotChart,
            cellRange,
            chartType,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges,
            aggFunc,
            processChartOptions,
            height: 400, //TODO
            width: 800   //TODO
        };

        const chartComp = new GridChartComp(params);
        this.context.wireBean(chartComp);

        const chartRef = this.createChartRef(chartComp);

        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());

            // if the chart container was placed outside of an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            const theme = this.environment.getTheme();
            if (theme.el && !theme.el.contains(container)) {
                _.addCssClass(container, theme.theme!);
            }
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
