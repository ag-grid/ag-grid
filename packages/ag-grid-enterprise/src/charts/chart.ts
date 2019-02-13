import scaleLinear from "./scale/linearScale";
import {BandScale} from "./scale/bandScale";
import {createHdpiCanvas} from "./canvas/canvas";
import {Axis} from "./axis";
import {CanvasAxis} from "./canvasAxis";

export interface ChartOptions {
    width: number;
    height: number;
    store?: {
        categoryField: string;
        fields: string[];
        fieldNames: string[],
        data: any[]
    };
    datasource?: ChartDatasource;
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

export class Chart {

    private chartOptions: ChartOptions;

    private readonly eCanvas: HTMLElement;

    constructor(chartOptions: ChartOptions) {
        this.chartOptions = chartOptions;

        const canvas = createHdpiCanvas(this.chartOptions.width, this.chartOptions.height);
        this.eCanvas = canvas;

        this.init();

        const ds = this.chartOptions.datasource;
        if (ds) {
            ds.addEventListener('modelUpdated', this.refresh.bind(this));
        }
    }

    public getGui(): HTMLElement {
        return this.eCanvas;
    }

    public refresh(): void {
        const canvas = <HTMLCanvasElement> this.getGui();
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, this.chartOptions.width, this.chartOptions.height)

        this.init();
    }

    public destroy(): void {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    }

    private init() {

        let xData: string[] = [];
        let yData: any[][] = [];
        let yFields: string[] = [];
        let yFieldNames: string[] = [];

        if (this.chartOptions.store) {
            const store = this.chartOptions.store;

            const data = store.data;

            // These are fields to use to fetch the values for each bar in a category.
            yFields = store.fields;

            // These are labels for each bar in a category.
            yFieldNames = data.map(d => d[store.categoryField]);

            const n = data.length;
            // const xData = data.map(d => d[this.chartOptions.store.categoryField]);
            xData = store.fieldNames; // These are category names.

            // Fetch one field from each record to form a category.
            // (The above code fetched all fields from each record to form a category).
            yData = yFields.map(field => data.map(d => d[field]));

        } else if (this.chartOptions.datasource) {

            const ds = this.chartOptions.datasource;

            xData = ds.getFieldNames();

            yFields = ds.getFields();

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

        } else {
            console.error('at least one of store or datasource must be provided');
        }



        // For each category returns an array of values representing the height
        // of each bar in the group.
        // const yData = data.map(datum => {
        //     const values: number[] = [];
        //     yFields.forEach(field => values.push((datum as any)[field]));
        //     return values;
        // });


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

        const canvas = <HTMLCanvasElement> this.getGui();

        const ctx = canvas.getContext('2d')!;
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
