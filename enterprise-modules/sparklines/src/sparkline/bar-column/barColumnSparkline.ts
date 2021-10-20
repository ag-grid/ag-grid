import { SeriesNodeDatum, Sparkline } from "../sparkline";
import { BandScale } from '../../scale/bandScale';
import { Group } from '../../scene/group';
import { Line } from '../../scene/shape/line';
import { Selection } from '../../scene/selection';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';

export interface NodeDatum extends SeriesNodeDatum {
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
    stroke?: string,
    strokeWidth: number
}
export interface FormatterParams {
    datum: any;
    xValue: any;
    yValue: any;
    width: number;
    height: number;
    min?: boolean;
    max?: boolean;
    first?: boolean;
    last?: boolean;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    highlighted: boolean;
}
export interface Format {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export class BarColumnSparkline extends Sparkline {

    protected isBarSparkline: boolean = false;

    private sparklineGroup: Group = new Group();
    protected axisLine: Line = new Line();
    protected nodes: Group = new Group();
    protected nodeSelection: Selection<Rectangle, Group, NodeDatum, NodeDatum> = Selection.select(this.nodes).selectAll<Rectangle>();
    protected nodeSelectionData: NodeDatum[] = [];
    fill: string = 'rgb(124, 181, 236)';
    stroke: string = 'silver';
    strokeWidth: number = 0;
    paddingInner: number = 0.1;
    paddingOuter: number = 0.2;
    valueAxisDomain: [number, number] | undefined = undefined;
    formatter?: (params: FormatterParams) => Format = undefined;


    constructor() {
        super();

        this.rootGroup.append(this.sparklineGroup);
        this.sparklineGroup.append([this.nodes, this.axisLine]);

        this.addEventListener('update', this.scheduleLayout, this);

        this.axisLine.lineCap = 'round';
    }

    protected getNodeData(): NodeDatum[] {
        return this.nodeSelectionData;
    }

    protected update() {
        const nodeData = this.generateNodeData();

        if (!nodeData) {
            return;
        }

        this.nodeSelectionData = nodeData;

        this.updateSelection(nodeData);
        this.updateNodes();
    }

    protected generateNodeData(): NodeDatum[] | undefined {
        const { isBarSparkline, data, yData, xData, xScale, yScale, fill, stroke, strokeWidth } = this;

        if (!data) {
            return;
        }

        const nodeData: NodeDatum[] = [];

        const yZero = yScale.convert(0);


        for (let i = 0, n = yData.length; i < n; i++) {
            let yDatum = yData[i];
            let xDatum = xData[i];

            let invalidDatum = yDatum === undefined;

            if (invalidDatum) {
                yDatum = 0;
            }

            const y = isBarSparkline ? xScale.convert(xDatum) : Math.min(yScale.convert(yDatum), yZero);
            const x = isBarSparkline ? Math.min(yScale.convert(yDatum), yZero) : xScale.convert(xDatum);

            const bottom: number = Math.max(yScale.convert(yDatum), yZero);

            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            const barHeight = xScale instanceof BandScale ? xScale.bandwidth : (Math.abs(yScale.range[1] - yScale.range[0]) / data.length);
            const columnWidth = xScale instanceof BandScale ? xScale.bandwidth : (Math.abs(yScale.range[1] - yScale.range[0]) / data.length);

            // barHeight = columnWidth = xScale instanceof BandScale ? xScale.bandwidth : (Math.abs(yScale.range[1] - yScale.range[0]) / data.length);
            const barWidth = bottom - x;
            const columnHeight = bottom - y;

            const height = isBarSparkline ? barHeight : columnHeight;
            const width = isBarSparkline ? barWidth : columnWidth;

            const midPoint = {
                x: isBarSparkline ? yZero : x + (width / 2),
                y: isBarSparkline ? y : yZero
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

    protected updateYScaleDomain() {
        const { yScale, yData, valueAxisDomain } = this;

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

        if (valueAxisDomain) {
            if (valueAxisDomain[1] < yMax) {
                valueAxisDomain[1] = yMax;
            }
            if (valueAxisDomain[0] > yMin) {
                valueAxisDomain[0] = yMin;
            }
        }

        yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
    }

    protected updateYScaleRange() {
        const { isBarSparkline, seriesRect, yScale } = this;
        yScale.range = isBarSparkline ? [0, seriesRect.width] : [seriesRect.height, 0];
    }

    protected updateXScaleRange() {
        const { isBarSparkline, xScale, seriesRect, paddingOuter, paddingInner, data } = this;
        if (xScale instanceof BandScale) {
            xScale.range = isBarSparkline ? [0, seriesRect.height] : [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        } else {
            // last node will be clipped if the scale is not a band scale
            // subtract maximum possible node width from the range so that the last node is not clipped
            xScale.range = isBarSparkline ? [0, seriesRect.height - (seriesRect.height / data!.length)] : [0, seriesRect.width - (seriesRect.width / data!.length)];
        }
    }

    protected updateAxisLine() {
        const { isBarSparkline, yScale, axis, axisLine, seriesRect } = this;
        const { strokeWidth } = axis;

        axisLine.x1 = 0;
        axisLine.x2 = isBarSparkline ? 0 : seriesRect.width;
        axisLine.y1 = 0;
        axisLine.y2 = isBarSparkline ? seriesRect.height : 0;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);

        const yZero: number = yScale.convert(0);
        axisLine.translationY = isBarSparkline ? 0 : yZero;
        axisLine.translationX = isBarSparkline ? yZero : 0;
    }

    private updateSelection(selectionData: NodeDatum[]) {
        const updateColumnsSelection = this.nodeSelection.setData(selectionData);

        const enterColumnsSelection = updateColumnsSelection.enter.append(Rectangle);

        updateColumnsSelection.exit.remove();

        this.nodeSelection = updateColumnsSelection.merge(enterColumnsSelection);
    }

    protected updateNodes() {
        const { highlightedDatum, formatter: nodeFormatter, fill, stroke, strokeWidth } = this;
        const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;

        this.nodeSelection.each((node, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const nodeStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;

            let nodeFormat: Format | undefined = undefined;

            const { x, y, width, height, seriesDatum } = datum;

            if (nodeFormatter) {
                const first = index === 0;
                const last = index === this.nodeSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;

                nodeFormat = nodeFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min,
                    max,
                    first,
                    last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted
                })
            }

            node.fill = nodeFormat && nodeFormat.fill || nodeFill;
            node.stroke = nodeFormat && nodeFormat.stroke || nodeStroke;
            node.strokeWidth = nodeFormat && nodeFormat.strokeWidth || nodeStrokeWidth;

            node.x = node.y = 0;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;

            node.translationX = x;
            node.translationY = y;

            // shifts bars upwards?
            // node.crisp = true;
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