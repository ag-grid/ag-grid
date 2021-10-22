import { SeriesNodeDatum, Sparkline } from "../sparkline";
import { Group } from '../../scene/group';
import { Line } from '../../scene/shape/line';
import { Selection } from '../../scene/selection';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Rectangle } from './rectangle';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';
import { ColumnFormat, ColumnFormatterParams } from "@ag-grid-community/core";

export interface RectNodeDatum extends SeriesNodeDatum {
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string,
    stroke?: string,
    strokeWidth: number
}
export abstract class BarColumnSparkline extends Sparkline {

    fill: string = 'rgb(124, 181, 236)';
    stroke: string = 'silver';
    strokeWidth: number = 0;
    paddingInner: number = 0.1;
    paddingOuter: number = 0.2;
    valueAxisDomain: [number, number] | undefined = undefined;
    formatter?: (params: ColumnFormatterParams) => ColumnFormat = undefined;

    protected axisLine: Line = new Line();
    protected nodes: Group = new Group();
    protected nodeSelection: Selection<Rectangle, Group, RectNodeDatum, RectNodeDatum> = Selection.select(this.nodes).selectAll<Rectangle>();
    protected nodeSelectionData: RectNodeDatum[] = [];

    private sparklineGroup: Group = new Group();

    constructor() {
        super();

        this.rootGroup.append(this.sparklineGroup);
        this.sparklineGroup.append([this.nodes, this.axisLine]);

        this.axisLine.lineCap = 'round';
    }

    protected abstract generateNodeData() : RectNodeDatum[] | undefined
    protected abstract updateYScaleRange() : void
    protected abstract updateXScaleRange() : void

    protected getNodeData(): RectNodeDatum[] {
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

    private updateSelection(selectionData: RectNodeDatum[]) {
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

            let nodeFormat: ColumnFormat | undefined = undefined;

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