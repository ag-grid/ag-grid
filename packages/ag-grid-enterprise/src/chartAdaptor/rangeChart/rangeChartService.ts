import {RangeChartDatasource} from "./rangeChartDatasource";
import {RangeController} from "../../rangeController";
import {
    Autowired,
    Bean,
    CellRange,
    Component,
    Context,
    Dialog,
    IEventEmitter,
    PopupMessageBox,
    PopupService
} from "ag-grid-community";
import {ChartType} from "../gridChartFactory";
import {GridChartComp} from "../gridChartComp";

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
            const chart = new GridChartComp(chartType, ds);

            this.context.wireBean(chart);
            this.createChartPanel(chart);
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

    private createChartPanel(chart: Component): void {
        const chartPanel = new Dialog({
            resizable: true,
            movable: true,
            title: 'Chart'
        });

        this.context.wireBean(chartPanel);

        chartPanel.setBody(chart.getGui());

        chartPanel.addEventListener(Dialog.EVENT_DESTROYED, () => {
            chart.destroy();
        });
    }

    private addErrorPopupMessageBox(errors: string[]) {
        const errorMessage = errors.join(' ');
        const popupMessageBox = new PopupMessageBox('Can Not Chart', errorMessage);
        this.context.wireBean(popupMessageBox);
    }
}