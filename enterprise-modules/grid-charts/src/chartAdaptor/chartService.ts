import {
    _,
    Bean,
    Autowired,
    PreDestroy,
    CellRange,
    CreateRangeChartParams,
    CreatePivotChartParams,
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
    SeriesOptions,
    Optional,
    IRangeController,
    ChartModel
} from "@ag-grid-community/core";
import { GridChartParams, GridChartComp } from "./chartComp/gridChartComp";
import { ChartPaletteName } from "../charts/chart/palettes";

@Bean('chartService')
export class ChartService implements IChartService {

    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('environment') private environment: Environment;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
    // those in developer provided containers.
    private activeCharts = new Set<ChartRef>();
    private activeChartComps = new Set<GridChartComp>();

    public getChartModels(): ChartModel[] {
        const models: ChartModel[] = [];

        this.activeChartComps.forEach(c => models.push(c.getChartModel()));

        return models;
    }

    public createChartFromCurrentRange(chartType: ChartType = ChartType.GroupedColumn): ChartRef | undefined {
        const selectedRange: CellRange = this.getSelectedRange();
        return this.createChart(selectedRange, chartType);
    }

    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        const cellRange = this.rangeController
            ? this.rangeController.createCellRangeFromCellRangeParams(params.cellRange)
            : undefined;

        if (!cellRange) {
            console.warn("ag-Grid - unable to create chart as no range is selected");
            return;
        }

        return this.createChart(
            cellRange,
            params.chartType,
            params.chartPalette as ChartPaletteName,
            false,
            params.suppressChartRanges,
            params.chartContainer,
            params.aggFunc,
            params.processChartOptions);
    }

    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        // if required enter pivot mode
        if (!this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(true, "pivotChart");
        }

        // pivot chart range contains all visible column without a row range to include all rows
        const chartAllRangeParams = {
            columns: this.columnController.getAllDisplayedColumns().map(col => col.getColId())
        };

        const cellRange = this.rangeController
            ? this.rangeController.createCellRangeFromCellRangeParams(chartAllRangeParams)
            : undefined;

        if (!cellRange) {
            console.warn("ag-Grid - unable to create chart as there are no columns in the grid.");
            return;
        }

        return this.createChart(
            cellRange,
            params.chartType,
            params.chartPalette as ChartPaletteName,
            true,
            true,
            params.chartContainer,
            undefined,
            params.processChartOptions);
    }

    private createChart(cellRange: CellRange,
        chartType: ChartType,
        chartPaletteName: ChartPaletteName = 'borneo',
        pivotChart = false,
        suppressChartRanges = false,
        container?: HTMLElement,
        aggFunc?: string | IAggFunc,
        processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<SeriesOptions>): ChartRef | undefined {

        const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();

        const params: GridChartParams = {
            pivotChart,
            cellRange,
            chartType,
            chartPaletteName,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges,
            aggFunc,
            processChartOptions,
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
            // is using its own dialogs rather than the grid provided dialogs)
            createChartContainerFunc(chartRef);
        } else {
            // add listener to remove from active charts list when charts are destroyed, e.g. closing chart dialog
            chartComp.addEventListener(
                GridChartComp.EVENT_DESTROYED,
                () => {
                    this.activeChartComps.delete(chartComp);
                    this.activeCharts.delete(chartRef);
                });
        }

        return chartRef;
    }

    private createChartRef(chartComp: GridChartComp): ChartRef {
        const chartRef: ChartRef = {
            destroyChart: () => {
                if (this.activeCharts.has(chartRef)) {
                    chartComp.destroy();
                    this.activeChartComps.delete(chartComp);
                    this.activeCharts.delete(chartRef);
                }
            },
            chartElement: chartComp.getGui()
        };

        this.activeCharts.add(chartRef);
        this.activeChartComps.add(chartComp);

        return chartRef;
    }

    private getSelectedRange(): CellRange {
        const ranges = this.rangeController.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {} as CellRange;
    }

    @PreDestroy
    private destroyAllActiveCharts(): void {
        this.activeCharts.forEach(chart => chart.destroyChart());
    }
}
