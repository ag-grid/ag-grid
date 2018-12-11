import {Autowired, Bean, IRowModel} from "ag-grid-community";
import {RangeController} from "../rangeController";
import scaleLinear from "./scale/linearScale";
import {BandScale} from "./scale/bandScale";
import { createHdpiCanvas } from "./canvas/canvas";
import {Axis} from "./Axis";

@Bean('chartingService')
export class ChartingService {

    @Autowired('rangeController') private rangeController: RangeController;

    @Autowired('rowModel') private rowModel: IRowModel;
    public createChart(): void {
        const ranges = this.rangeController.getCellRanges();

        if (!ranges) return;

        const values: number[] = [];
        this.rowModel.forEachNode((node, index) => {

            if (index >= ranges[0].start.rowIndex && index < ranges[0].end.rowIndex ) {
                // @ts-ignore
                const value = node.data[ranges[0].columns[0].getId()];
                values.push(value);
            }
        });

        showBasicBarChart(values);
    }
}

function showBasicBarChart(data: number[]) {
    const padding = {
        top: 20,
        right: 60,
        bottom: 40,
        left: 40
    };
    const n = data.length;
    const xData = data.map((d, i) => i.toString());
    const yData = data;
    const canvasWidth = 640;
    const canvasHeight = 480;
    const seriesWidth = canvasWidth - padding.left - padding.right;
    const seriesHeight = canvasHeight - padding.top - padding.bottom;

    const yScale = scaleLinear();
    yScale.domain = [0, Math.max(...yData)];
    yScale.range = [seriesHeight, 0];

    const xScale = new BandScale<string>();
    xScale.domain = xData;
    xScale.range = [0, seriesWidth];
    xScale.paddingInner = 0.1;
    xScale.paddingOuter = 0.3;
    let bandwidth = xScale.bandwidth;

    const canvas = createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Verdana';

    // bars
    ctx.save();
    ctx.translate(padding.left, padding.top);
    for (let i = 0; i < n; i++) {
        const category = xData[i];
        const value = yData[i];
        const x = xScale.convert(category);
        const y = yScale.convert(value);
        ctx.fillStyle = '#4983B2';
        ctx.fillRect(x, y, bandwidth, seriesHeight - y);
        ctx.fillStyle = 'black';

        const label = value.toString();
        const w = ctx.measureText(label).width;
        ctx.fillText(label, x + bandwidth / 2 - w / 2, seriesHeight - 20);
    }
    ctx.restore();

    // y-axis
    const yAxis = new Axis<number>(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);

    // x-axis
    const xAxis = new Axis<string>(xScale);
    console.log(xScale.domain, xScale.range);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
}
