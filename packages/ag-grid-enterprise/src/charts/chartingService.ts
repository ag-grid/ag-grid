import {Autowired, Bean, IRowModel} from "ag-grid-community";
import {RangeController} from "../rangeController";
import scaleLinear from "./scale/linearScale";
import {BandScale} from "./scale/bandScale";
import { createHdpiCanvas } from "./canvas/canvas";
import {Axis} from "./axis";

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

        // showVerticalBarChart(values);
        // showHorizontalBarChart(values);
        showStackedBarChart();
        showGroupedBarChart();
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

function drawRect(ctx: CanvasRenderingContext2D,
                  x1: number, y1: number, x2: number, y2: number,
                  fill?: string, stroke?: string) {
    if (fill) {
        ctx.fillStyle = fill;
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
    }
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.fillRect(x1, y1, width, height);
    ctx.strokeRect(x1, y1, width, height);
}

const colorTheme1 = [
    '#5BC0EB',
    '#FDE74C',
    '#9BC53D',
    '#E55934',
    '#FA7921',
];

const colorTheme2 = [
    '#94ae0a',
    '#115fa6',
    '#a61120',
    '#ff8809',
    '#ffd13e',
    '#a61187',
    '#24ad9a',
];

const colorTheme3 = [
    ['#69C5EC', '#53AFD6'],
    ['#FDED7C', '#FDE95C'],
    ['#B6D471', '#A4CA4E'],
    ['#EC866B', '#E76846'],
    ['#FB9D5D', '#FA8535'],
];

function showStackedBarChart() {
    const data = [
        {
            category: 'Coffee',

            q1Budget: 500,
            q2Budget: 500,
            q3Budget: 500,
            q4Budget: 500,

            q1Actual: 450,
            q2Actual: 560,
            q3Actual: 600,
            q4Actual: 700
        },
        {
            category: 'Tea',

            q1Budget: 350,
            q2Budget: 400,
            q3Budget: 450,
            q4Budget: 500,

            q1Actual: 270,
            q2Actual: 380,
            q3Actual: 450,
            q4Actual: 520
        },
        {
            category: 'Milk',

            q1Budget: 200,
            q2Budget: 180,
            q3Budget: 180,
            q4Budget: 180,

            q1Actual: 180,
            q2Actual: 170,
            q3Actual: 190,
            q4Actual: 200
        },
    ];

    const yFields = ['q1Actual', 'q2Actual', 'q3Actual', 'q4Actual'];
    const yFieldNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    const colors = colorTheme3;

    const padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 60
    };
    const n = data.length;
    const xData = data.map(d => d.category);
    // For each category returns an array of values representing the top
    // of each bar in the stack, the last value being the height of the stack.
    const yData = data.map(datum => {
        const values: number[] = [];
        let sum = 0;
        yFields.forEach(field => values.push(sum += (datum as any)[field]));
        return values;
    });
    const canvasWidth = document.body.getBoundingClientRect().width;
    const canvasHeight = 480;
    const seriesWidth = canvasWidth - padding.left - padding.right;
    const seriesHeight = canvasHeight - padding.top - padding.bottom;

    const yScale = scaleLinear();
    // Get the height of each stack and find the highest one.
    yScale.domain = [0, Math.max(...yData.map(d => d[d.length - 1]))];
    yScale.range = [seriesHeight, 0];

    const xScale = new BandScale<string>();
    xScale.domain = xData;
    xScale.range = [0, seriesWidth];
    xScale.paddingInner = 0.1;
    xScale.paddingOuter = 0.3;
    const barWidth = xScale.bandwidth;

    const canvas = createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Verdana';

    // bars
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 15;
    ctx.translate(padding.left, padding.top);
    for (let i = 0; i < n; i++) {
        const category = xData[i];
        const values = yData[i];
        const x = xScale.convert(category);
        // Using reduce here simply to get pairs of numbers in the `values` array:
        // the bottom and top of each bar.
        let j = 0;
        values.reduce((bottom, top) => {
            const yBottom = yScale.convert(bottom);
            const yTop = yScale.convert(top);

            const color = colors[j % colors.length];
            if (Array.isArray(color)) {
                const gradient = ctx.createLinearGradient(x, yTop, x + barWidth, yBottom);
                gradient.addColorStop(0, color[0]);
                gradient.addColorStop(1, color[1]);
                ctx.fillStyle = gradient;
            }
            else {
                ctx.fillStyle = color;
            }
            ctx.fillRect(x, yTop, barWidth, yBottom - yTop);
            ctx.strokeRect(x, yTop, barWidth, yBottom - yTop);

            const label = yFieldNames[j] + ': ' + (data[i] as any)[yFields[j]].toString();
            const labelWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'black';
            ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, yTop + 20);

            j++;
            return top;
        }, 0);
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

function showGroupedBarChart() {
    const data = [
        {
            category: 'Coffee',

            q1Budget: 500,
            q2Budget: 500,
            q3Budget: 500,
            q4Budget: 500,

            q1Actual: 450,
            q2Actual: 560,
            q3Actual: 600,
            q4Actual: 700
        },
        {
            category: 'Tea',

            q1Budget: 350,
            q2Budget: 400,
            q3Budget: 450,
            q4Budget: 500,

            q1Actual: 270,
            q2Actual: 380,
            q3Actual: 450,
            q4Actual: 520
        },
        {
            category: 'Milk',

            q1Budget: 200,
            q2Budget: 180,
            q3Budget: 180,
            q4Budget: 180,

            q1Actual: 180,
            q2Actual: 170,
            q3Actual: 190,
            q4Actual: 200
        },
    ];

    const yFields = ['q1Actual', 'q2Actual', 'q3Actual', 'q4Actual'];
    const yFieldNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    const colors = colorTheme3;

    const padding = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 60
    };
    const n = data.length;
    const xData = data.map(d => d.category);
    // For each category returns an array of values representing the height
    // of each bar in the group.
    const yData = data.map(datum => {
        const values: number[] = [];
        yFields.forEach(field => values.push((datum as any)[field]));
        return values;
    });
    const canvasWidth = document.body.getBoundingClientRect().width;
    const canvasHeight = 480;
    const seriesWidth = canvasWidth - padding.left - padding.right;
    const seriesHeight = canvasHeight - padding.top - padding.bottom;

    const yScale = scaleLinear();
    // Find the tallest bar in each group, then the tallest bar overall.
    yScale.domain = [0, Math.max(...yData.map(values => Math.max(...values)))];
    yScale.range = [seriesHeight, 0];

    const xGroupScale = new BandScale<string>();
    xGroupScale.domain = xData;
    xGroupScale.range = [0, seriesWidth];
    xGroupScale.paddingInner = 0.1;
    xGroupScale.paddingOuter = 0.3;
    const groupWidth = xGroupScale.bandwidth;

    const xBarScale = new BandScale<string>();
    xBarScale.domain = yFields;
    xBarScale.range = [0, groupWidth];
    xBarScale.padding = 0.1;
    xBarScale.round = true;
    const barWidth = xBarScale.bandwidth;

    const canvas = createHdpiCanvas(canvasWidth, canvasHeight);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    ctx.font = '14px Verdana';

    // bars
    ctx.save();
    ctx.translate(padding.left, padding.top);
    for (let i = 0; i < n; i++) {
        const category = xData[i];
        const values = yData[i];
        const groupX = xGroupScale.convert(category); // x-coordinate of the group
        values.forEach((value, j) => {
            const barX = xBarScale.convert(yFields[j]); // x-coordinate of the bar within a group
            const x = groupX + barX;
            const y = yScale.convert(value);

            const color = colors[j % colors.length];
            if (Array.isArray(color)) {
                const gradient = ctx.createLinearGradient(x, y, x + barWidth, seriesHeight);
                gradient.addColorStop(0, color[0]);
                gradient.addColorStop(1, color[1]);
                ctx.fillStyle = gradient;
            }
            else {
                ctx.fillStyle = color;
            }
            ctx.fillRect(x, y, barWidth, seriesHeight - y);
            ctx.strokeRect(x, y, barWidth, seriesHeight - y);

            const label = yFieldNames[j];
            const labelWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'black';
            ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, y + 20);
        })
    }
    ctx.restore();

    // y-axis
    const yAxis = new Axis<number>(yScale);
    yAxis.translation = [padding.left, padding.top];
    yAxis.render(ctx);

    // x-axis
    const xAxis = new Axis<string>(xGroupScale);
    xAxis.rotation = -Math.PI / 2;
    xAxis.translation = [padding.left, padding.top + seriesHeight];
    xAxis.flippedLabels = true;
    xAxis.render(ctx);
}

