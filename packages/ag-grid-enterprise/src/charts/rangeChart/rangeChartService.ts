import {RangeController} from "../../rangeController";
import {RangeChartDatasource} from "./rangeChartDatasource";
import {BarChartComp} from "./comps/barChartComp";
import {LineChartComp} from "./comps/lineChartComp";
import {PieChartComp} from "./comps/pieChartComp";
import {
    Autowired,
    Bean,
    Context,
    PopupMessageBox,
    PopupService,
    PopupWindow,
    IEventEmitter,
    RangeSelection,
    Component
} from "ag-grid-community";

export enum ChartType {Bar, Line, Pie}

export interface ChartOptions {
    height: number,
    width: number,
    datasource: ChartDatasource
}

export interface ChartDatasource extends IEventEmitter {
    getCategory(i: number): string;
    getFields(): string[];
    getFieldNames(): string[];
    getValue(i: number, field: string): number;
    getRowCount(): number;
    destroy(): void;
    getErrors(): string[];
}

@Bean('rangeChartService')
export class RangeChartService {

    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('context') private context: Context;

    public chartRange(chartType: ChartType = ChartType.Bar): void {
        let selectedRange = this.getSelectedRange();

        const ds = this.createDatasource(selectedRange);

        if (ds) {
            this.createChart(chartType, ds);
        } else {
            // TODO: replace with error dialog
            console.warn('ag-Grid: unable to perform charting due to invalid range selection');
        }
    }

    private getSelectedRange(): RangeSelection {
        const ranges = this.rangeController.getCellRanges();
        return (ranges && ranges.length > 0) ? ranges[0] : {} as RangeSelection;
    }

    private createDatasource(range: RangeSelection): ChartDatasource | null {
        if (!range.columns) return null;

        const ds = new RangeChartDatasource(range);
        this.context.wireBean(ds);

        const errors = ds.getErrors();
        if (errors && errors.length > 0) {
            this.addErrorPopupMessageBox(errors);
            return null;
        }

        return ds;
    }

    private createChart(type: ChartType, ds: ChartDatasource): void {
        let chart: any = null;

        const options: ChartOptions = {
            height: 400,
            width: 800,
            datasource: ds
        };

        if (type === ChartType.Line) {
            chart = new LineChartComp(options);

        } else if (type === ChartType.Pie) {
            chart = new PieChartComp(options);

        } else {
            chart = new BarChartComp(options);
        }

        this.context.wireBean(chart);
        this.addChartToPopupWindow(chart);
    }

    private addChartToPopupWindow(chart: Component): void {
        const popupWindow = new PopupWindow();
        this.context.wireBean(popupWindow);

        popupWindow.setBody(chart.getGui());
        popupWindow.setTitle('Chart');

        popupWindow.addEventListener(PopupWindow.EVENT_DESTROYED, () => {
            chart.destroy();
        });
    }

    private addErrorPopupMessageBox(errors: string[]) {
        const errorMessage = errors.join(' ');
        const popupMessageBox = new PopupMessageBox('Can Not Chart', errorMessage);
        this.context.wireBean(popupMessageBox);
    }
}