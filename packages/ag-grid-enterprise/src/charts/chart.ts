import scaleLinear from "./scale/linearScale";
import {_, Component, RefSelector} from "ag-grid-community";
import {BandScale} from "./scale/bandScale";
import {createHdpiCanvas} from "./canvas/canvas";
import {CanvasAxis} from "./canvasAxis";
import {ChartRangeDatasource} from "./chartRangeDatasource";
import {ChartEverythingDatasource} from "./chartEverythingDatasource";
import {CartesianChart} from "./chart/cartesianChart";
import {CategoryAxis} from "./chart/axis/categoryAxis";
import {NumberAxis} from "./chart/axis/numberAxis";
import {BarSeries} from "./chart/series/barSeries";

export interface ChartOptions {
    width: number;
    height: number;
    datasource: ChartDatasource;
}

export interface ChartDatasource {
    getCategory(i: number): string;
    getFields(): string[];
    getFieldNames(): string[];
    getValue(i: number, field: string): number;
    getRowCount(): number;
    destroy(): void;

    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
}

const gradientTheme = [
    ['#69C5EC', '#53AFD6'],
    ['#FDED7C', '#FDE95C'],
    ['#B6D471', '#A4CA4E'],
    ['#EC866B', '#E76846'],
    ['#FB9D5D', '#FA8535'],
];

export class Chart_Old extends Component {

    private chartOptions: ChartOptions;

    private readonly eCanvas: HTMLCanvasElement;

    private datasource: ChartRangeDatasource | ChartEverythingDatasource;

    constructor(chartOptions: ChartOptions) {
        super(`<div></div>`);

        this.chartOptions = chartOptions;

        const canvas = createHdpiCanvas(this.chartOptions.width, this.chartOptions.height);
        this.eCanvas = canvas;

        this.datasource = <ChartRangeDatasource | ChartEverythingDatasource> chartOptions.datasource;
        this.datasource.addEventListener('modelUpdated', this.refresh.bind(this));

        this.refresh();
    }

    public refresh(): void {

        const errors = this.datasource.getErrors();
        const eGui = this.getGui();
        _.clearElement(eGui);

        if (errors && errors.length > 0) {
            const html: string[] = [];

            html.push(`Could not create chart:`);
            html.push(`<ul>`);
            errors.forEach( error => html.push(`<li>${error}</li>`));
            html.push(`</ul>`);

            eGui.innerHTML = html.join('');
        } else {
            const ctx = this.eCanvas.getContext('2d')!;
            ctx.clearRect(0, 0, this.chartOptions.width, this.chartOptions.height);
            this.drawChart();
            eGui.appendChild(this.eCanvas);
        }
    }

    public destroy(): void {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    }

    private drawChart() {

        let yData: any[][] = [];
        let yFieldNames: string[] = [];

        const ds = this.chartOptions.datasource;
        const xData = ds.getFieldNames();
        const yFields = ds.getFields();
        const rowCount = ds.getRowCount();

        const getValuesForField = (field: string): any[] => {
            const res: any[] = [];
            for (let i = 0; i<rowCount; i++) {
                const val = ds.getValue(i, field);
                res.push(val);
            }
            return res;
        };

        yFieldNames = [];
        for (let i = 0; i<rowCount; i++) {
            yFieldNames.push(ds.getCategory(i));
        }

        yData = [];
        yFields.forEach( yField => {
            const values = getValuesForField(yField);
            yData.push(values);
        });

        const padding = {
            top: 20,
            right: 40,
            bottom: 40,
            left: 60
        };

        const canvasWidth = this.chartOptions.width;
        const canvasHeight = this.chartOptions.height;
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
        xBarScale.domain = yFieldNames;
        xBarScale.range = [0, groupWidth];
        xBarScale.padding = 0.1;
        xBarScale.round = true;
        const barWidth = xBarScale.bandwidth;

        const ctx = this.eCanvas.getContext('2d')!;
        ctx.font = '14px Verdana';

        const colors = gradientTheme;

        // bars
        ctx.save();
        ctx.translate(padding.left, padding.top);
        for (let i = 0; i < xData.length; i++) {
            const category = xData[i];
            const values = yData[i];
            const groupX = xGroupScale.convert(category); // x-coordinate of the group
            values.forEach((value, j) => {
                const barX = xBarScale.convert(yFieldNames[j]); // x-coordinate of the bar within a group
                const x = groupX + barX;
                const y = yScale.convert(value);

                const color = colors[j % colors.length];
                if (Array.isArray(color)) {
                    const gradient = ctx.createLinearGradient(x, y, x + barWidth, seriesHeight);
                    gradient.addColorStop(0, color[0]);
                    gradient.addColorStop(1, color[1]);
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = color;
                }
                ctx.fillRect(x, y, barWidth, seriesHeight - y);
                ctx.strokeRect(x, y, barWidth, seriesHeight - y);

                const label = yFieldNames[j];
                const labelWidth = ctx.measureText(label).width;
                if (labelWidth < barWidth - 10) {
                    ctx.fillStyle = 'black';
                    ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, y + 20);
                }
            })
        }
        ctx.restore();

        // y-axis
        const yAxis = new CanvasAxis<number>(yScale);
        yAxis.translation = [padding.left, padding.top];
        yAxis.render(ctx);

        // x-axis
        const xAxis = new CanvasAxis<string>(xGroupScale);
        xAxis.rotation = -Math.PI / 2;
        xAxis.translation = [padding.left, padding.top + seriesHeight];
        xAxis.flippedLabels = true;
        xAxis.render(ctx);
    }

}


export class Chart extends Component {

    private chartOptions: ChartOptions;

    private datasource: ChartRangeDatasource | ChartEverythingDatasource;

    private chart: CartesianChart<any, string, number>;
    private barSeries: BarSeries<any>;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    constructor(chartOptions: ChartOptions) {
        super(`<div><div ref="eChart"></div><div ref="eErrors"></div></div>`);

        this.chartOptions = chartOptions;

        this.datasource = <ChartRangeDatasource | ChartEverythingDatasource> chartOptions.datasource;
        this.datasource.addEventListener('modelUpdated', this.refresh.bind(this));

        this.setupChart();
        this.refresh();
    }

    private setupChart(): void {
        this.chart = new CartesianChart<any, string, number>(
            new CategoryAxis(),
            new NumberAxis(),
            this.eChart
        );
        this.chart.width = 1200;
        this.chart.height = 800;
        this.chart.padding = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        };

        this.barSeries = new BarSeries<any>();
        this.chart.addSeries(this.barSeries);
        this.barSeries.grouped = false;
    }

    public refresh(): void {

        const errors = this.datasource.getErrors();
        const eGui = this.getGui();

        const errorsExist = errors && errors.length > 0;

        _.setVisible(this.eChart, !errorsExist);
        _.setVisible(this.eErrors, errorsExist);

        if (errorsExist) {
            const html: string[] = [];

            html.push(`Could not create chart:`);
            html.push(`<ul>`);
            errors.forEach( error => html.push(`<li>${error}</li>`));
            html.push(`</ul>`);

            eGui.innerHTML = html.join('');
        } else {
            this.drawChart();
        }
    }

    public destroy(): void {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    }

    private drawChart() {

        const ds = this.datasource;

        const data: any[] = [];
        const rowCount = ds.getRowCount();

        const fields = ds.getFields();

        this.barSeries.yFieldNames = ds.getFieldNames();
        // this.barSeries.yFields = fields;
        // this.barSeries.xField = 'category';

        for (let i = 0; i<rowCount; i++) {
            let item: any = {
                category: ds.getCategory(i)
            };
            fields.forEach( field => item[field] = ds.getValue(i, field) );
            data.push(item);
        }

        // this.barSeries.data = data;

        this.barSeries.setDataAndFields(data, 'category', fields);

        /*
        let yData: any[][] = [];
        let yFieldNames: string[] = [];

        const ds = this.chartOptions.datasource;
        const xData = ds.getFieldNames();
        const yFields = ds.getFields();
        const rowCount = ds.getRowCount();

        const getValuesForField = (field: string): any[] => {
            const res: any[] = [];
            for (let i = 0; i<rowCount; i++) {
                const val = ds.getValue(i, field);
                res.push(val);
            }
            return res;
        };

        yFieldNames = [];
        for (let i = 0; i<rowCount; i++) {
            yFieldNames.push(ds.getCategory(i));
        }

        yData = [];
        yFields.forEach( yField => {
            const values = getValuesForField(yField);
            yData.push(values);
        });

        const padding = {
            top: 20,
            right: 40,
            bottom: 40,
            left: 60
        };

        const canvasWidth = this.chartOptions.width;
        const canvasHeight = this.chartOptions.height;
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
        xBarScale.domain = yFieldNames;
        xBarScale.range = [0, groupWidth];
        xBarScale.padding = 0.1;
        xBarScale.round = true;
        const barWidth = xBarScale.bandwidth;

        const ctx = this.eCanvas.getContext('2d')!;
        ctx.font = '14px Verdana';

        const colors = gradientTheme;

        // bars
        ctx.save();
        ctx.translate(padding.left, padding.top);
        for (let i = 0; i < xData.length; i++) {
            const category = xData[i];
            const values = yData[i];
            const groupX = xGroupScale.convert(category); // x-coordinate of the group
            values.forEach((value, j) => {
                const barX = xBarScale.convert(yFieldNames[j]); // x-coordinate of the bar within a group
                const x = groupX + barX;
                const y = yScale.convert(value);

                const color = colors[j % colors.length];
                if (Array.isArray(color)) {
                    const gradient = ctx.createLinearGradient(x, y, x + barWidth, seriesHeight);
                    gradient.addColorStop(0, color[0]);
                    gradient.addColorStop(1, color[1]);
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = color;
                }
                ctx.fillRect(x, y, barWidth, seriesHeight - y);
                ctx.strokeRect(x, y, barWidth, seriesHeight - y);

                const label = yFieldNames[j];
                const labelWidth = ctx.measureText(label).width;
                if (labelWidth < barWidth - 10) {
                    ctx.fillStyle = 'black';
                    ctx.fillText(label, x + barWidth / 2 - labelWidth / 2, y + 20);
                }
            })
        }
        ctx.restore();

        // y-axis
        const yAxis = new CanvasAxis<number>(yScale);
        yAxis.translation = [padding.left, padding.top];
        yAxis.render(ctx);

        // x-axis
        const xAxis = new CanvasAxis<string>(xGroupScale);
        xAxis.rotation = -Math.PI / 2;
        xAxis.translation = [padding.left, padding.top + seriesHeight];
        xAxis.flippedLabels = true;
        xAxis.render(ctx);*/
    }

}
