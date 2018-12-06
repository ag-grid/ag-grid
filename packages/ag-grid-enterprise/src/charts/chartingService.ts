import {Autowired, Bean, IRowModel} from "ag-grid-community";
import {RangeController} from "../rangeController";
import scaleLinear from "./scale/linearScale";
import {BandScale} from "./scale/bandScale";
import { setDevicePixelRatio } from "./canvas/canvas";

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
    // @ts-ignore
    const xData = Array.from({length: n}, (_, i) => i);
    const yData = data;
    const canvasWidth = 640;
    const canvasHeight = 480;
    const seriesWidth = canvasWidth - padding.left - padding.right;
    const seriesHeight = canvasHeight - padding.top - padding.bottom;

    const yScale = scaleLinear();
    yScale.domain = [0, Math.max(...yData)];
    yScale.range = [canvasHeight - padding.bottom, padding.top];

    const xScale = new BandScale();
    xScale.domain = xData;
    xScale.range = [padding.left, canvasWidth - padding.right];
    xScale.paddingInner = 0.1;
    xScale.paddingOuter = 0.3;
    let bandwidth = xScale.bandwidth;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    // canvas.style.border = '1px solid black';
    canvas.style.zIndex = '100';
    document.body.appendChild(canvas);
    setDevicePixelRatio(canvas);

    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Verdana';

    function renderBarLabel(text: string, x: number, index: number) {
        const w = ctx.measureText(text).width;
        ctx.fillText(text, x + bandwidth / 2 - w / 2, canvasHeight - padding.bottom - 20);
        // just some dummy labels for categories (which we don't have) to make it look better
        const category = String.fromCharCode(65 + index);
        const catWidth = ctx.measureText(category).width;
        ctx.fillText(String.fromCharCode(65 + index), x + bandwidth / 2 - catWidth / 2, canvasHeight - 20);
    }

    // bars
    for (let i = 0; i < n; i++) {
        const category = xData[i];
        const value = yData[i];
        const x = xScale.convert(category);
        const y = yScale.convert(value);
        ctx.fillStyle = '#4983B2';
        ctx.fillRect(x, y, bandwidth, canvasHeight - padding.bottom - y);
        ctx.fillStyle = 'black';
        // const w = ctx.measureText(category).width;
        // ctx.fillText(category, x + bandwidth / 2 - w / 2, height - 20);
        renderBarLabel(value.toString(), x, i);
    }

    // y-axis
    const ticks = yScale.ticks();
    const tickCount = ticks.length;

    const tickSize = 5;
    const halfLineWidth = 0.5;
    const labelGap = 5;
    ctx.strokeStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.lineWidth = halfLineWidth * 2;
    ctx.beginPath();
    for (let i = 0; i < tickCount; i++) {
        const y = yScale.convert(ticks[i]) - halfLineWidth; // align to the pixel grid
        ctx.moveTo(padding.left + labelGap, y);
        ctx.lineTo(padding.left + labelGap + tickSize, y);

        ctx.fillText(ticks[i].toString(), padding.left, y);
    }
    ctx.moveTo(padding.left + labelGap + tickSize, padding.top);
    ctx.lineTo(padding.left + labelGap + tickSize, canvasHeight - padding.bottom);
    ctx.stroke();

    // x-axis
    const barCount = xScale.domain.length;
    for (let i = 0; i < barCount; i++) {
        const x = xScale.convert(xScale.domain[i]) + bandwidth / 2;
        ctx.moveTo(x, canvasHeight - padding.bottom);
        ctx.lineTo(x, canvasHeight - padding.bottom + tickSize);
    }
    ctx.moveTo(padding.left, canvasHeight - padding.bottom);
    ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom);
    ctx.stroke();
}