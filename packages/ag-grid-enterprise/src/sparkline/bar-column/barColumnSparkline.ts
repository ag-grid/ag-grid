import type { _Scene } from 'ag-charts-community';
import type { FontStyle, FontWeight } from 'ag-charts-types';

import type { ColumnFormat, ColumnFormatterParams } from 'ag-grid-community';

import { ChartWrapper } from '../../charts/chartWrapper';
import { Label } from '../label/label';
import type { SeriesNodeDatum } from '../sparkline';
import { Sparkline, ZINDICIES } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';

export interface RectNodeDatum extends SeriesNodeDatum {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly label?: {
        readonly x: number;
        readonly y: number;
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}

enum BarColumnNodeTag {
    Rect,
    Label,
}

export enum BarColumnLabelPlacement {
    InsideBase = 'insideBase',
    InsideEnd = 'insideEnd',
    Center = 'center',
    OutsideEnd = 'outsideEnd',
}

export class BarColumnLabel extends Label {
    formatter?: (params: { value: number | undefined }) => string = undefined;
    placement = BarColumnLabelPlacement.InsideEnd;
}

export abstract class BarColumnSparkline extends Sparkline {
    fill: string = 'rgb(124, 181, 236)';
    stroke: string = 'silver';
    strokeWidth: number = 0;
    paddingInner: number = 0.1;
    paddingOuter: number = 0.2;
    valueAxisDomain: [number, number] | undefined = undefined;
    formatter?: (params: ColumnFormatterParams) => ColumnFormat = undefined;

    protected axisLine: _Scene.Line = new ChartWrapper._Scene.Line();
    protected bandWidth: number = 0;

    private sparklineGroup: _Scene.Group = new ChartWrapper._Scene.Group();
    private rectGroup: _Scene.Group = new ChartWrapper._Scene.Group();
    private labelGroup: _Scene.Group = new ChartWrapper._Scene.Group();

    private rectSelection: _Scene.Selection<_Scene.Rect, RectNodeDatum> = ChartWrapper._Scene.Selection.select(
        this.rectGroup,
        ChartWrapper._Scene.Rect
    );
    private labelSelection: _Scene.Selection<_Scene.Text, RectNodeDatum> = ChartWrapper._Scene.Selection.select(
        this.labelGroup,
        ChartWrapper._Scene.Text
    );

    private nodeSelectionData: RectNodeDatum[] = [];

    readonly label = new BarColumnLabel();

    constructor() {
        super();

        this.rootGroup.append(this.sparklineGroup);

        this.rectGroup.zIndex = ZINDICIES.SERIES_FILL_ZINDEX;
        this.axisLine.zIndex = ZINDICIES.AXIS_LINE_ZINDEX;
        this.labelGroup.zIndex = ZINDICIES.SERIES_LABEL_ZINDEX;

        this.sparklineGroup.append([this.rectGroup, this.axisLine, this.labelGroup]);

        this.axisLine.lineCap = 'round';

        this.label.enabled = false;
    }

    protected abstract override generateNodeData(): RectNodeDatum[] | undefined;
    protected abstract override updateYScaleRange(): void;
    protected abstract override updateXScaleRange(): void;

    protected override getNodeData(): RectNodeDatum[] {
        return this.nodeSelectionData;
    }

    protected override update(): void {
        this.updateSelections();
        this.updateNodes();
    }

    protected updateSelections(): void {
        const nodeData = this.generateNodeData();

        if (!nodeData) {
            return;
        }

        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    }

    protected override updateNodes(): void {
        this.updateRectNodes();
        this.updateLabelNodes();
    }

    protected calculateStep(range: number): number {
        const { xScale, paddingInner, paddingOuter, smallestInterval } = this;

        // calculate step
        const domainLength = xScale.domain[1] - xScale.domain[0];
        const intervals = domainLength / (smallestInterval?.x ?? 1) + 1;

        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum of 50 bands to ensure the step (width of individual bands + padding) does not fall below a certain number of pixels.
        // If the number of intervals exceeds 50, calculate the step for 50 bands within the given range.
        // This means there could be some overlap of the bands in the sparkline.
        const maxBands = 50;
        const bands = Math.min(intervals, maxBands);
        const gaps = bands - 1; // number of gaps (padding between bands)

        const step = range / Math.max(1, 2 * paddingOuter + gaps * paddingInner + bands); // step width is a combination of band width and gap width

        return step;
    }

    protected override updateYScaleDomain(): void {
        const { yScale, yData, valueAxisDomain } = this;

        const yMinMax = ChartWrapper._Util.extent(yData as number[]);

        let yMin = 0;
        let yMax = 1;

        if (yMinMax != null) {
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

    private updateRectSelection(selectionData: RectNodeDatum[]): void {
        this.rectSelection.update(selectionData);
    }

    protected updateRectNodes(): void {
        const { highlightedDatum, formatter: nodeFormatter, fill, stroke, strokeWidth } = this;
        const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;

        this.rectSelection.each((node, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            const nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            const nodeStrokeWidth =
                highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;

            let nodeFormat: ColumnFormat | undefined;

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
                    highlighted,
                });
            }

            node.fill = (nodeFormat && nodeFormat.fill) || nodeFill;
            node.stroke = (nodeFormat && nodeFormat.stroke) || nodeStroke;
            node.strokeWidth = (nodeFormat && nodeFormat.strokeWidth) || nodeStrokeWidth;

            node.x = x;
            node.y = y;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;
        });
    }

    private updateLabelSelection(selectionData: RectNodeDatum[]): void {
        this.labelSelection.update(selectionData, (text) => {
            text.tag = BarColumnNodeTag.Label;
            text.pointerEvents = ChartWrapper._Scene.PointerEvents.None;
        });
    }

    private updateLabelNodes(): void {
        const {
            label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color },
        } = this;
        this.labelSelection.each((text, datum) => {
            const label = datum.label;

            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            } else {
                text.visible = false;
            }
        });
    }

    getTooltipHtml(datum: SeriesNodeDatum): string | undefined {
        const { dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const content = this.formatNumericDatum(yValue);
        const title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;

        const defaults = {
            content,
            title,
        };

        const tooltipRenderer = this.processedOptions?.tooltip?.renderer;
        if (tooltipRenderer) {
            return toTooltipHtml(
                tooltipRenderer({
                    context: this.context,
                    datum: seriesDatum,
                    yValue,
                    xValue,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    protected formatLabelValue(value: number): string {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    }
}
