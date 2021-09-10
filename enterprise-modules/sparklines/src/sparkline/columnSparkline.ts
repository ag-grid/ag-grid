import { BandScale } from '../scale/bandScale';
import { LinearScale } from '../scale/linearScale';
import { Group } from '../scene/group';
import { Line } from '../scene/shape/line';
import { Selection } from '../scene/selection';
import { SeriesNodeDatum, Sparkline } from './sparkline';
import { toTooltipHtml } from './tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { ColumnFormatterParams, ColumnFormat } from "@ag-grid-community/core";

interface ColumnNodeDatum extends SeriesNodeDatum {
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
    stroke?: string,
    strokeWidth: number
}

export class ColumnSparkline extends Sparkline {

    static className = 'ColumnSparkline';

    private columnSparklineGroup: Group = new Group();
    private yScale: LinearScale = new LinearScale();
    private xScale: BandScale<number | undefined> = new BandScale<number | undefined>();
    private xAxisLine: Line = new Line();
    private columns: Group = new Group();
    private columnSelection: Selection<Rectangle, Group, ColumnNodeDatum, ColumnNodeDatum> = Selection.select(this.columns).selectAll<Rectangle>();
    private columnSelectionData: ColumnNodeDatum[] = [];
    fill: string = 'rgb(124, 181, 236)';
    stroke: string = 'silver';
    strokeWidth: number = 0;
    paddingInner: number = 0.5;
    paddingOuter: number = 0.2;
    yScaleDomain: [number, number] | undefined = undefined;
    formatter?: (params: ColumnFormatterParams) => ColumnFormat = undefined;

    constructor() {
        super();

        this.rootGroup.append(this.columnSparklineGroup);
        this.columnSparklineGroup.append([this.columns, this.xAxisLine]);

        this.xAxisLine.lineCap = 'round';
    }

    protected getNodeData(): ColumnNodeDatum[] {
        return this.columnSelectionData;
    }

    protected update() {
        const nodeData = this.generateNodeData();

        if (!nodeData) {
            return;
        }

        this.columnSelectionData = nodeData;

        this.updateSelection(nodeData);
        this.updateNodes();
    }

    protected updateYScale() {
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

        // if minY is positive, set minY to 0.
        minY = minY < 0 ? minY : 0;

        // if maxY is negative, set maxY to 0.
        maxY = maxY < 0 ? 0 : maxY

        if (minY === maxY) {
            // if minY and maxY are equal, maxY should be set to 0?
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

    protected updateXScale() {
        const { xScale, seriesRect, xData, paddingOuter, paddingInner } = this;

        xScale.range = [0, seriesRect.width];
        xScale.domain = xData;
        xScale.paddingInner = paddingInner;
        xScale.paddingOuter = paddingOuter;
    }

    protected updateXAxisLine() {
        const { xScale, yScale, axis, xAxisLine } = this;
        const { strokeWidth } = axis;

        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);

        const yZero: number = yScale.convert(0);
        xAxisLine.translationY = yZero;
    }

    protected generateNodeData(): ColumnNodeDatum[] | undefined {
        const { data, yData, xData, xScale, yScale, fill, stroke, strokeWidth } = this;

        if (!data) {
            return;
        }

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

    private updateSelection(selectionData: ColumnNodeDatum[]) {
        const updateColumnsSelection = this.columnSelection.setData(selectionData);

        const enterColumnsSelection = updateColumnsSelection.enter.append(Rectangle);

        updateColumnsSelection.exit.remove();

        this.columnSelection = updateColumnsSelection.merge(enterColumnsSelection);
    }

    protected updateNodes() {
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

        if (Sparkline.tooltip.renderer) {
            return toTooltipHtml(Sparkline.tooltip.renderer({
                // context: this.context,
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