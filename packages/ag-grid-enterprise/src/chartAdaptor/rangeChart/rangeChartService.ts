import {
    Autowired,
    Bean,
    ChartType,
    CellRangeParams,
    CellRange,
    Component,
    Context,
    Dialog,
    IEventEmitter,
    IRangeChartService,
    MessageBox,
    GridOptionsWrapper,
    ChartRef,
    _, PreDestroy
} from "ag-grid-community";
import { RangeChartDatasource } from "./rangeChartDatasource";
import { RangeController } from "../../rangeController";
import { GridChartComp } from "../gridChartComp";
import { ChartMenu } from "../menu/chartMenu";

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
    // childDialogs only contains charts in our dialogs, doesn't container dev provided containers. there is overlap,
    // all charts in this list are also listed in activeCharts, however we must also dispose the dialogs as well as
    // the charts comps.
    private childDialogs: Dialog[] = [];

    public chartCurrentRange(chartType: ChartType = ChartType.GroupedBar): ChartRef | undefined {
        const selectedRange = this.getSelectedRange();
        return this.chartRange(selectedRange, chartType);
    }

    public chartCellRange(params: CellRangeParams, chartTypeString: string, container?: HTMLElement): ChartRef | undefined {
        const cellRange = this.rangeController.createCellRangeFromCellRangeParams(params);

        let chartType: ChartType;
        switch (chartTypeString) {
            case 'groupedBar': chartType = ChartType.GroupedBar; break;
            case 'stackedBar': chartType = ChartType.StackedBar; break;
            case 'pie': chartType = ChartType.Pie; break;
            case 'line': chartType = ChartType.Line; break;
            default: chartType = ChartType.GroupedBar;
        }

        if (cellRange) {
            return this.chartRange(cellRange, chartType, container);
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

    public chartRange(cellRange: CellRange, chartType: ChartType = ChartType.GroupedBar, container?: HTMLElement): ChartRef | undefined{
        const ds = this.createDatasource(cellRange);

        if (ds) {
            const chartComp = new GridChartComp(chartType, ds);
            this.context.wireBean(chartComp);

            const createChartContainerFunc = this.gridOptionsWrapper.getCreateChartContainerFunc();

            const chartRef = this.createChartRef(chartComp);

            if (container) {
                // if container exists, means developer initiated chart create via API, so place in provided container
                container.appendChild(chartComp.getGui());
            } else if (createChartContainerFunc) {
                // otherwise user created chart via grid UI, check if developer provides containers (eg if the application
                // is using it's own dialog's rather than the grid provided dialogs)
                createChartContainerFunc(chartRef);
            } else {
                // lastly, this means user created chart via grid UI and we are going to use grid's dialog
                this.createChartDialog(chartComp, chartRef);
            }

            return chartRef;

        } else {
            // TODO: replace with error dialog
            console.warn('ag-Grid: unable to perform charting due to invalid range selection');
        }
    }

    private getSelectedRange(): CellRange {
        const ranges = this.rangeController.getCellRanges();
        return ranges.length > 0 ? ranges[0] : {} as CellRange;
    }

    private createDatasource(range: CellRange): ChartDatasource | null {
        if (!range.columns) { return null; }

        const ds = new RangeChartDatasource(range);
        this.context.wireBean(ds);

        const errors = ds.getErrors();
        if (errors && errors.length > 0) {
            this.addErrorMessageBox(errors);
            return null;
        }

        return ds;
    }

    private createChartDialog(chart: Component, chartRef: ChartRef): void {
        const chartDialog = new Dialog({
            resizable: true,
            movable: true,
            title: 'Chart',
            component: chart,
            centered: true,
            closable: false
        });
        this.context.wireBean(chartDialog);

        this.childDialogs.push(chartDialog);

        chartDialog.addEventListener(Dialog.EVENT_DESTROYED, () => {
            chartRef.destroyChart();
            _.removeFromArray(this.childDialogs, chartDialog);
        });

        const menu = new ChartMenu(chart);
        this.context.wireBean(menu);

        chartDialog.addTitleBarButton(menu, 0);
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
        const activeDialogs = this.childDialogs.slice();
        activeDialogs.forEach( dlg => dlg.destroy() );

        // we take copy as the forEach is removing from the array as we process
        const activeCharts = this.activeCharts.slice();
        activeCharts.forEach( chart => chart.destroyChart() );
    }
}