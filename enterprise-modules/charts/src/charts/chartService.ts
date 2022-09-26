import {
    AgChartThemeOverrides,
    AgChartThemePalette,
    Autowired,
    Bean,
    BeanStub,
    ChartDownloadParams,
    OpenChartToolPanelParams,
    CellRange,
    CellRangeParams,
    ChartModel,
    ChartRef,
    ChartType,
    ColumnModel,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    Environment,
    GetChartImageDataUrlParams,
    IAggFunc,
    IChartService,
    IRangeService,
    Optional,
    PreDestroy,
    SeriesChartType
} from "@ag-grid-community/core";
import { GridChartComp, GridChartParams } from "./chartComp/gridChartComp";
import { CURRENT_VERSION, upgradeChartModel } from "./chartModelMigration";

export interface CrossFilteringContext {
    lastSelectedChartId: string;
}

@Bean('chartService')
export class ChartService extends BeanStub implements IChartService {

    @Optional('rangeService') private rangeService: IRangeService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('environment') private environment: Environment;

    // we destroy all charts bound to this grid when grid is destroyed. activeCharts contains all charts, including
    // those in developer provided containers.
    private activeCharts = new Set<ChartRef>();
    private activeChartComps = new Set<GridChartComp>();

    // this shared (singleton) context is used by cross filtering in line and area charts
    private crossFilteringContext: CrossFilteringContext = {
        lastSelectedChartId: '',
    };

    public getChartModels(): ChartModel[] {
        const models: ChartModel[] = [];

        const versionedModel = (c: ChartModel) => {
            return {...c, version: CURRENT_VERSION };
        };
        this.activeChartComps.forEach(c => models.push(versionedModel(c.getChartModel())));

        return models;
    }

    public getChartRef(chartId: string): ChartRef | undefined {
        let chartRef;

        this.activeCharts.forEach(cr => {
            if (cr.chartId === chartId) {
                chartRef = cr;
            }
        });

        return chartRef;
    }

    public getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined {
        let url: any;
        this.activeChartComps.forEach(c => {
            if (c.getChartId() === params.chartId) {
                url = c.getChartImageDataURL(params.fileFormat);
            }
        });
        return url;
    }

    public downloadChart(params: ChartDownloadParams) {
        const chartComp = Array.from(this.activeChartComps).find(c => c.getChartId() === params.chartId);
        chartComp?.downloadChart(params.dimensions, params.fileName, params.fileFormat);
    }

    public openChartToolPanel(params: OpenChartToolPanelParams) {
        const chartComp = Array.from(this.activeChartComps).find(c => c.getChartId() === params.chartId);
        chartComp?.openChartToolPanel(params.tabName);
    }

    public closeChartToolPanel(chartId: string) {
        const chartComp = Array.from(this.activeChartComps).find(c => c.getChartId() === chartId);
        chartComp?.closeChartToolPanel();
    }

    public createChartFromCurrentRange(chartType: ChartType = 'groupedColumn'): ChartRef | undefined {
        const selectedRange: CellRange = this.getSelectedRange();
        return this.createChart(selectedRange, chartType);
    }

    public restoreChart(model: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined {
        if (!model) {
            console.warn("AG Grid - unable to restore chart as no chart model is provided");
            return;
        }

        if (model.version !== CURRENT_VERSION) {
            model = upgradeChartModel(model);
        }

        const params = {
            cellRange: model.cellRange,
            chartType: model.chartType,
            chartThemeName: model.chartThemeName,
            chartContainer: chartContainer,
            suppressChartRanges: model.suppressChartRanges,
            aggFunc: model.aggFunc,
            unlinkChart: model.unlinkChart,
            seriesChartTypes: model.seriesChartTypes
        };

        const getCellRange = (cellRangeParams: CellRangeParams) => {
            return this.rangeService
                ? this.rangeService.createCellRangeFromCellRangeParams(cellRangeParams)
                : undefined;
        }

        if (model.modelType === 'pivot') {
            // if required enter pivot mode
            if (!this.columnModel.isPivotMode()) {
                this.columnModel.setPivotMode(true, "pivotChart");
            }

            // pivot chart range contains all visible column without a row range to include all rows
            const columns = this.columnModel.getAllDisplayedColumns().map(col => col.getColId());
            const chartAllRangeParams: CellRangeParams = { 
                rowStartIndex: null,
                rowStartPinned: undefined,
                rowEndIndex: null,
                rowEndPinned: undefined,
                columns 
            };

            const cellRange = getCellRange(chartAllRangeParams);
            if (!cellRange) {
                console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
                return;
            }

            return this.createChart(
                cellRange,
                params.chartType,
                params.chartThemeName,
                true,
                true,
                params.chartContainer,
                undefined,
                undefined,
                params.unlinkChart,
                false,
                model.chartOptions);
        }

        const cellRange = getCellRange(params.cellRange);
        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }

        return this.createChart(
            cellRange!,
            params.chartType,
            params.chartThemeName,
            false,
            params.suppressChartRanges,
            params.chartContainer,
            params.aggFunc,
            undefined,
            params.unlinkChart,
            false,
            model.chartOptions,
            model.chartPalette,
            params.seriesChartTypes);
    }

    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        const cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(params.cellRange as CellRangeParams)
            : undefined;

        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }

        return this.createChart(
            cellRange,
            params.chartType,
            params.chartThemeName,
            false,
            params.suppressChartRanges,
            params.chartContainer,
            params.aggFunc,
            params.chartThemeOverrides,
            params.unlinkChart,
            undefined,
            undefined,
            undefined,
            params.seriesChartTypes);
    }

    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        // if required enter pivot mode
        if (!this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(true, "pivotChart");
        }

        // pivot chart range contains all visible column without a row range to include all rows
        const chartAllRangeParams: CellRangeParams = {
            rowStartIndex: null,
            rowStartPinned: undefined,
            rowEndIndex: null,
            rowEndPinned: undefined,
            columns: this.columnModel.getAllDisplayedColumns().map(col => col.getColId())
        };

        const cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(chartAllRangeParams)
            : undefined;

        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as there are no columns in the grid.");
            return;
        }

        return this.createChart(
            cellRange,
            params.chartType,
            params.chartThemeName,
            true,
            true,
            params.chartContainer,
            undefined,
            params.chartThemeOverrides,
            params.unlinkChart);
    }

    public createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined {
        const cellRange = this.rangeService
            ? this.rangeService.createCellRangeFromCellRangeParams(params.cellRange as CellRangeParams)
            : undefined;

        if (!cellRange) {
            console.warn("AG Grid - unable to create chart as no range is selected");
            return;
        }

        const crossFiltering = true;

        const suppressChartRangesSupplied = typeof params.suppressChartRanges !== 'undefined' && params.suppressChartRanges !== null;
        const suppressChartRanges = suppressChartRangesSupplied ? params.suppressChartRanges : true;

        return this.createChart(
            cellRange,
            params.chartType,
            params.chartThemeName,
            false,
            suppressChartRanges,
            params.chartContainer,
            params.aggFunc,
            params.chartThemeOverrides,
            params.unlinkChart,
            crossFiltering);
    }

    private createChart(
        cellRange: CellRange,
        chartType: ChartType,
        chartThemeName?: string,
        pivotChart = false,
        suppressChartRanges = false,
        container?: HTMLElement,
        aggFunc?: string | IAggFunc,
        chartThemeOverrides?: AgChartThemeOverrides,
        unlinkChart = false,
        crossFiltering  = false,
        chartOptionsToRestore?: AgChartThemeOverrides,
        chartPaletteToRestore?: AgChartThemePalette,
        seriesChartTypes?: SeriesChartType[]): ChartRef | undefined {

        const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();

        const params: GridChartParams = {
            chartId: this.generateId(),
            pivotChart,
            cellRange,
            chartType,
            chartThemeName,
            insideDialog: !(container || createChartContainerFunc),
            suppressChartRanges,
            aggFunc,
            chartThemeOverrides,
            unlinkChart,
            crossFiltering,
            crossFilteringContext: this.crossFilteringContext,
            chartOptionsToRestore,
            chartPaletteToRestore,
            seriesChartTypes,
            crossFilteringResetCallback: () => this.activeChartComps.forEach(c => c.crossFilteringReset())
        };

        const chartComp = new GridChartComp(params);
        this.context.createBean(chartComp);

        const chartRef = this.createChartRef(chartComp);

        if (container) {
            // if container exists, means developer initiated chart create via API, so place in provided container
            container.appendChild(chartComp.getGui());

            // if the chart container was placed outside of an element that
            // has the grid's theme, we manually add the current theme to
            // make sure all styles for the chartMenu are rendered correctly
            const theme = this.environment.getTheme();

            if (theme.el && !theme.el.contains(container)) {
                container.classList.add(theme.theme!);
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
                    this.context.destroyBean(chartComp);
                    this.activeChartComps.delete(chartComp);
                    this.activeCharts.delete(chartRef);
                }
            },
            chartElement: chartComp.getGui(),
            chart: chartComp.getUnderlyingChart(),
            chartId: chartComp.getChartModel().chartId
        };

        this.activeCharts.add(chartRef);
        this.activeChartComps.add(chartComp);

        return chartRef;
    }

    private getSelectedRange(): CellRange {
        const ranges = this.rangeService.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {} as CellRange;
    }

    private generateId(): string {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }

    @PreDestroy
    private destroyAllActiveCharts(): void {
        this.activeCharts.forEach(chart => chart.destroyChart());
    }
}
