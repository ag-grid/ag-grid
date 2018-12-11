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

        showVerticalBarChart(values);
        showHorizontalBarChart(values);
    }
}

function showVerticalBarChart(data: number[]) {
    const padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 40
    };
    const n = data.length;
    const xData = data.map((d, i) => i.toString());
    const yData = data;
    const canvasWidth = document.body.getBoundingClientRect().width;
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
        const labelWidth = ctx.measureText(label).width;
        ctx.fillText(label, x + bandwidth / 2 - labelWidth / 2, y + 20);
    }
    ctx.restore();

    // y-axis
    const yAxis = new Axis<number>(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);

    // x-axis
    const xAxis = new Axis<string>(xScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
}

function showHorizontalBarChart(data: number[]) {
    const padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 40
    };
    const n = data.length;
    const xData = data.map((d, i) => i.toString());
    const yData = data;
    const canvasWidth = document.body.getBoundingClientRect().width;
    const canvasHeight = 480;
    const seriesWidth = canvasWidth - padding.left - padding.right;
    const seriesHeight = canvasHeight - padding.top - padding.bottom;

    const xScale = scaleLinear();
    xScale.domain = [0, Math.max(...yData)];
    xScale.range = [0, seriesWidth];

    const yScale = new BandScale<string>();
    yScale.domain = xData;
    yScale.range = [seriesHeight, 0];
    yScale.paddingInner = 0.1;
    yScale.paddingOuter = 0.3;
    let bandwidth = yScale.bandwidth;

    const canvas = createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Verdana';
    ctx.textBaseline = 'middle';

    // bars
    ctx.save();
    ctx.translate(padding.left, padding.top);
    for (let i = 0; i < n; i++) {
        const category = xData[i];
        const value = yData[i];
        const x = xScale.convert(value);
        const y = yScale.convert(category);
        ctx.fillStyle = '#4983B2';
        ctx.fillRect(0, y, x, bandwidth);
        ctx.fillStyle = 'black';

        const label = value.toString();
        const labelWidth = ctx.measureText(label).width;
        ctx.fillText(label, x - labelWidth - 10, y + bandwidth / 2);
    }
    ctx.restore();

    // x-axis
    const xAxis = new Axis<number>(xScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);

    // y-axis
    const yAxis = new Axis<string>(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);
}
