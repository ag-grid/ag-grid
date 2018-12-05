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
    const n = data.length;
    // @ts-ignore
    const xData = Array.from({length: n}, (_, i) => i);
    const yData = data;
    const width = 640;
    const height = 480;

    const yScale = scaleLinear();
    yScale.domain = [0, Math.max(...yData)];
    yScale.range = [height, 0];

    const xScale = new BandScale();
    xScale.domain = xData;
    xScale.range = [0, width];
    xScale.paddingInner = 0.1;
    xScale.paddingOuter = 0.5;
    let bandwidth = xScale.bandwidth;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // canvas.style.border = '1px solid black';
    canvas.style.zIndex = '100';
    document.body.appendChild(canvas);
    setDevicePixelRatio(canvas);

    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Verdana';

    function renderBarLabel(x: number, text: string) {
        const w = ctx.measureText(text).width;
        ctx.fillText(text, x + bandwidth / 2 - w / 2, height - 20);
    }

    for (let i = 0; i < n; i++) {
        const category = xData[i];
        const value = yData[i];
        const x = xScale.convert(category);
        const y = yScale.convert(value);
        ctx.fillStyle = '#4983B2';
        ctx.fillRect(x, y, bandwidth, height);
        ctx.fillStyle = 'black';
        // const w = ctx.measureText(category).width;
        // ctx.fillText(category, x + bandwidth / 2 - w / 2, height - 20);
        renderBarLabel(x, value.toString());
    }

    const ticks = yScale.ticks();
    const tickCount = ticks.length;

    const tickSize = 5;
    const halfLineWidth = 0.5;
    const labelWidth = 20;
    const labelGap = 5;
    ctx.strokeStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.lineWidth = halfLineWidth * 2;
    ctx.beginPath();
    for (let i = 0; i < tickCount; i++) {
        const y = yScale.convert(ticks[i]) - halfLineWidth; // align to the pixel grid
        ctx.moveTo(labelWidth + labelGap, y);
        ctx.lineTo(labelWidth + labelGap + tickSize, y);

        ctx.fillText(ticks[i].toString(), labelWidth, y);
    }
    ctx.moveTo(labelWidth + labelGap + tickSize, 0);
    ctx.lineTo(labelWidth + labelGap + tickSize, height);

    ctx.stroke();
}