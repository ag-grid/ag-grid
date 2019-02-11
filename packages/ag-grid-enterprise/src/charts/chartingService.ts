import {Autowired, Bean, IRowModel, Column, PopupWindow, Context} from "ag-grid-community";
import {RangeController} from "../rangeController";
import scaleLinear from "./scale/linearScale";
import {BandScale} from "./scale/bandScale";
import { createHdpiCanvas } from "./canvas/canvas";
import {Axis} from "./axis";
import {PopupService} from "ag-grid-community";
import {Chart} from "./chart";
import {ChartRangeDatasource} from "./chartRangeDatasource";
import {ChartEverythingDatasource} from "./chartEverythingDatasource";

@Bean('chartingService')
export class ChartingService {

    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;

    public chartEverything(): void {

        const ds = new ChartEverythingDatasource();
        this.context.wireBean(ds);

        const chart = new Chart({
            height: 400,
            width: 800,
            datasource: ds
        });

        const popupWindow = new PopupWindow();
        this.context.wireBean(popupWindow);
        popupWindow.setBody(chart.getGui());

        popupWindow.addEventListener(PopupWindow.EVENT_DESTROYED, ()=> {
            chart.destroy();
        });

    }

    public chartRange(): void {
        const ranges = this.rangeController.getCellRanges();

        if (!ranges) {return;}
        const range = ranges[0];
        if (!range) {return;}
        if (!range.columns) { return; }

        const ds = new ChartRangeDatasource(range);
        this.context.wireBean(ds);

        const chart = new Chart({
            height: 400,
            width: 800,
            datasource: ds
        });

        const popupWindow = new PopupWindow();
        this.context.wireBean(popupWindow);
        popupWindow.setBody(chart.getGui());

        popupWindow.addEventListener(PopupWindow.EVENT_DESTROYED, ()=> {
            chart.destroy();
        });
    }

    public createChartOld(): void {
        const ranges = this.rangeController.getCellRanges();

        if (!ranges) {return;}
        const range = ranges[0];
        if (!range) {return;}
        if (!range.columns) { return; }

        let data: any[] = [];

        for (let rowIndex = range.start.rowIndex; rowIndex <= range.end.rowIndex; rowIndex++) {
            const rowNode = this.rowModel.getRow(rowIndex);
            if (rowNode) {
                data.push(rowNode.data);
            }
        }

        const fields: string[] = [];
        const fieldNames: string[] = [];
        range.columns.forEach( (col: Column) => {
            const colDef = col.getColDef();
            if (colDef.field && colDef.headerName) {
                fields.push(colDef.field);
                fieldNames.push(colDef.headerName);
            }
        });

        const chart = new Chart({
            height: 400,
            width: 800,
            store: {
                data: data,
                categoryField: 'name',
                fields: fields, // months
                fieldNames: fieldNames, // months
            }
        });

        const popupWindow = new PopupWindow();
        this.context.wireBean(popupWindow);
        popupWindow.setBody(chart.getGui());

        popupWindow.addEventListener(PopupWindow.EVENT_DESTROYED, ()=> {
            chart.destroy();
        });
    }
}

