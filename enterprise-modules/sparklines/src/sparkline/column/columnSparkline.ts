import { BandScale } from '../../scale/bandScale';
import { Group } from '../../scene/group';
import { Line } from '../../scene/shape/line';
import { Selection } from '../../scene/selection';
import { SeriesNodeDatum, Sparkline } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { ColumnFormatterParams, ColumnFormat } from "@ag-grid-community/core";
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';

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

    protected updateYScaleDomain() {
        const { yScale, yData, yScaleDomain } = this;

        const yMinMax = extent(yData, isNumber);

        let yMin = 0;
        let yMax = 1;

        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0] as number;
            yMax = this.max = yMinMax[1] as number;
        }

        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;

        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;

        // if yMin and yMax are equal, yMax should be set to 0
        if (yMin === yMax) {
            const padding = Math.abs(yMin * 0.01);
            yMax = 0 + padding;
            yMin -= padding;
        }

        if (yScaleDomain) {
            if (yScaleDomain[1] < yMax) {
                yScaleDomain[1] = yMax;
            }
            if (yScaleDomain[0] > yMin) {
                yScaleDomain[0] = yMin;
            }
        }

        yScale.domain = yScaleDomain ? yScaleDomain : [yMin, yMax];
    }

    protected updateXScaleRange() {
        const { xScale, seriesRect, paddingOuter, paddingInner, xData } = this;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        } else {
            // last column will be clipped if the scale is not a band scale
            // subtract maximum possible column width from the range so that the last column is not clipped
            xScale.range = [0, seriesRect.width - (seriesRect.width / xData.length)];
        }
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

        const yZero = yScale.convert(0);

        // if the scale is a band scale, the width of the columns will be the bandwidth, otherwise the width of the columns will be the range / number of items in the data
        const width = xScale instanceof BandScale ? xScale.bandwidth : (Math.abs(xScale.range[1] - xScale.range[0]) / data.length);

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

        this.columnSelection.each((column, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const columnFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const columnStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const columnStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;

            let columnFormat: ColumnFormat | undefined = undefined;

            const { x, y, width, height, seriesDatum } = datum;

            if (columnFormatter) {
                const first = index === 0;
                const last = index === this.columnSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;

                columnFormat = columnFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min,
                    max,
                    first,
                    last,
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
        const { fill, dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const backgroundColor = fill;
        const content = this.formatNumericDatum(yValue);
        const title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;

        const defaults = {
            backgroundColor,
            content,
            title
        }

        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue,
                xValue,
            }), defaults);
        }

        return toTooltipHtml(defaults);
    }
}