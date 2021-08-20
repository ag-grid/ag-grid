
import { BandScale } from '../scale/bandScale';
import { LinearScale } from '../scale/linearScale';
import { Group } from '../scene/group';
import { Line } from '../scene/shape/line';
import { Selection } from '../scene/selection';
import { MiniChart, SeriesNodeDatum } from './miniChart';
import { toTooltipHtml } from './miniChartTooltip';
import { Rectangle } from './rectangle';
import { reactive } from '../util/observable';

interface ColumnNodeDatum extends SeriesNodeDatum {
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
    stroke?: string,
    strokeWidth: number
}

interface ColumnFormatterParams {
    datum: any;
    xValue: any;
    yValue: any;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    highlighted: boolean;
}

interface ColumnFormat{
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export class MiniColumnChart extends MiniChart {
    
    static className = 'MiniColumnChart';

    private miniColumnChartGroup: Group = new Group();
    private yScale: LinearScale = new LinearScale();
    // hmm
    private xScale: BandScale<number | undefined> = new BandScale<number | undefined>();
    private xAxisLine: Line = new Line();
    private columns: Group = new Group();
    private columnSelection: Selection<Rectangle, Group, ColumnNodeDatum, ColumnNodeDatum> = Selection.select(this.columns).selectAll<Rectangle>();
    private columnSelectionData: ColumnNodeDatum[] = [];
    @reactive('update') fill: string = 'rgb(124, 181, 236)';
    @reactive('update') stroke: string = 'silver';
    @reactive('update') strokeWidth: number = 0;
    @reactive('update') paddingInner: number = 0.5;
    @reactive('update') paddingOuter: number = 0.2;
    @reactive('update') yScaleDomain: [number, number] | undefined = undefined;
    @reactive('update') formatter: (params: ColumnFormatterParams) => ColumnFormat;

    constructor() {
        super();

        this.rootGroup.append(this.miniColumnChartGroup);
        this.miniColumnChartGroup.append([this.columns, this.xAxisLine]);

        this.addEventListener('update', this.scheduleLayout, this);

        this.xAxisLine.lineCap = 'round';
    }

    protected getNodeData() : ColumnNodeDatum[] {
        return this.columnSelectionData;
    }

    protected update() {
        const { seriesRect } = this;
        this.rootGroup.translationX = seriesRect.x;
        this.rootGroup.translationY = seriesRect.y;

        this.updateYScale();
        this.updateXScale();
        this.updateXAxisLine();

        const nodeData = this.generateNodeData();
        this.columnSelectionData = nodeData;
        
        this.updateRectNodesSelection(nodeData);
        this.updateRectNodes();
    }

    private updateYScale() {
        const { yScale, seriesRect, yData, yScaleDomain } = this;

        yScale.range = [seriesRect.height, 0];

        // TODO: fix this up
        const extent = this.findMinAndMax(yData);
        let minY;
        let maxY;

        if (!extent) {
            minY = 0;
            maxY = 1;
        } else {
            minY = extent[0];
            maxY = extent[1];
        }
        
        minY = minY < 0 ? minY : 0;

        if (minY === maxY) {
            // if minY and maxY are equal and negative, maxY should be set to 0?
            const padding = Math.abs(minY * 0.01);
            minY -= padding;
            maxY = 0 + padding;
        }

        if (yScaleDomain) {
            if (yScaleDomain[1] < maxY) {
                yScaleDomain[1] = maxY;
            }
            if (yScaleDomain[0] > minY) {
                yScaleDomain[0] = minY;
            }
        }

        yScale.domain = yScaleDomain ? yScaleDomain : [minY, maxY];
    }

    private updateXScale() {
        const { xScale, seriesRect, xData, paddingOuter, paddingInner } = this;

        xScale.range = [0, seriesRect.width];
        xScale.domain = xData;
        xScale.paddingInner = paddingInner;
        xScale.paddingOuter = paddingOuter;
    }

    private updateXAxisLine() {
        const { xScale, yScale, axis, xAxisLine } = this;

        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;

        const yZero: number = yScale.convert(0);
        xAxisLine.translationY = yZero;
    }

    protected generateNodeData(): ColumnNodeDatum[] {
        const { yData, xData, xScale, yScale, fill, stroke, strokeWidth } = this;

        const nodeData: ColumnNodeDatum[] = [];
        
        const yZero: number = yScale.convert(0);
        const width: number = xScale.bandwidth;

        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            let xDatum = xData[i];

            let invalidDatum = yDatum === undefined;
            
            if (invalidDatum) {
                yDatum = 0;
            }

            const y: number = Math.min(yScale.convert(yDatum), yZero);
            const yBottom: number = Math.max(yScale.convert(yDatum), yZero);
            const height: number = yBottom - y;
            const x: number = xScale.convert(xDatum);

            const midPoint = {
                x: x + (width / 2),
                y: yZero
            }

            nodeData.push({ 
                x, 
                y, 
                width, 
                height, 
                fill, 
                stroke, 
                strokeWidth,
                seriesDatum: { x: xDatum, y: invalidDatum ? undefined : yDatum },
                point: midPoint
            });
        }
        return nodeData;
    }

    private updateRectNodesSelection(selectionData: ColumnNodeDatum[]) {
        const updateColumnsSelection = this.columnSelection.setData(selectionData);

        const enterColumnsSelection = updateColumnsSelection.enter.append(Rectangle);

        updateColumnsSelection.exit.remove();

        this.columnSelection = updateColumnsSelection.merge(enterColumnsSelection);
    }

    private updateRectNodes() {
        const { highlightedDatum, formatter: columnFormatter, fill, stroke, strokeWidth } = this;
        const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;
        
        this.columnSelection.each((column, datum) => {
            const highlighted = datum === highlightedDatum;
            const columnFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const columnStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const columnStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;

            let columnFormat: ColumnFormat | undefined = undefined;

            const { x, y, width, height, seriesDatum } = datum;

            if (columnFormatter) {
                columnFormat = columnFormatter({
                    datum, 
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    fill: columnFill,
                    stroke: columnStroke,
                    strokeWidth: columnStrokeWidth,
                    highlighted
                })
            }

            column.fill = columnFormat && columnFormat.fill || columnFill;
            column.stroke = columnFormat && columnFormat.stroke || columnStroke;
            column.strokeWidth = columnFormat && columnFormat.strokeWidth || columnStrokeWidth;

            column.x = column.y = 0;
            column.width = width;
            column.height = height;
            column.visible = column.height > 0;

            column.translationX = x;
            column.translationY = y;

            // shifts bars upwards?
            // column.crisp = true;
        });
    }

    private highlightedDatum?: SeriesNodeDatum;
    protected highlightDatum(closestDatum: SeriesNodeDatum): void {
        this.highlightedDatum = closestDatum;
        this.updateRectNodes();
    }

    protected dehighlightDatum(): void {
        this.highlightedDatum = undefined;
        this.updateRectNodes();
    }

    getTooltipHtml(datum: SeriesNodeDatum): string | undefined {
        const { title, fill } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const backgroundColor = fill;
        const content = typeof xValue !== 'number' ? `${this.formatDatum(seriesDatum.x)}: ${this.formatDatum(seriesDatum.y)}` : `${this.formatDatum(seriesDatum.y)}`;

        const defaults = {
            backgroundColor,
            title,
            content
        }

        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                datum: seriesDatum,
                title,
                backgroundColor,
                yValue,
                xValue,
            }), defaults);
        }

        return toTooltipHtml(defaults);
    }
}