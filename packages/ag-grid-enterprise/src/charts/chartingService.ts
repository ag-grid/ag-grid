import {Autowired, Bean, Context, IRowModel, PopupMessageBox, PopupService, PopupWindow} from "ag-grid-community";
import {RangeController} from "../rangeController";
import {Chart} from "./chart";
import {ChartEverythingDatasource} from "./chartEverythingDatasource";
import {ChartRangeDatasource} from "./chartRangeDatasource";

@Bean('chartingService')
export class ChartingService {

    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;

    private showChartFromDatasource(ds: ChartEverythingDatasource | ChartRangeDatasource): void {

        const errors = ds.getErrors();
        if (errors && errors.length > 0) {
            const errorMessage = errors.join(' ');
            const popupMessageBox = new PopupMessageBox('Can Not Chart', errorMessage);
            this.context.wireBean(popupMessageBox);
            return;
        }

        const chart = new Chart({
            height: 400,
            width: 800,
            datasource: ds
        });

        const popupWindow = new PopupWindow();
        this.context.wireBean(popupWindow);
        popupWindow.setBody(chart.getGui());
        popupWindow.setTitle('Chart');

        popupWindow.addEventListener(PopupWindow.EVENT_DESTROYED, ()=> {
            chart.destroy();
        });
    }

    public chartEverything(): void {
        const ds = new ChartEverythingDatasource();
        this.context.wireBean(ds);
        this.showChartFromDatasource(ds);
    }

    public chartRange(): void {
        const ranges = this.rangeController.getCellRanges();

        if (!ranges) {return;}
        const range = ranges[0];
        if (!range) {return;}
        if (!range.columns) { return; }

        const ds = new ChartRangeDatasource(range);
        this.context.wireBean(ds);

        this.showChartFromDatasource(ds);
    }

}

