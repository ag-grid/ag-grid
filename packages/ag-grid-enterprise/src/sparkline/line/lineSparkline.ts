import type { _Scene } from 'ag-charts-community';

import type { CrosshairLineOptions, MarkerFormat, MarkerFormatterParams } from 'ag-grid-community';

import { ChartWrapper } from '../../charts/chartWrapper';
import { getMarker } from '../marker/markerFactory';
import type { Point, SeriesNodeDatum } from '../sparkline';
import { Sparkline, ZINDICIES } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getLineDash } from '../util/lineDash';

// const { extent } = _Util;
// const { BandScale } = _Scale;

interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: Point;
}

class SparklineMarker {
    enabled: boolean = true;
    shape: string = 'circle';
    size: number = 0;
    fill?: string = 'rgb(124, 181, 236)';
    stroke?: string = 'rgb(124, 181, 236)';
    strokeWidth: number = 1;
    formatter?: (params: MarkerFormatterParams) => MarkerFormat = undefined;
}

class SparklineLine {
    stroke: string = 'rgb(124, 181, 236)';
    strokeWidth: number = 1;
}

class SparklineCrosshairs {
    xLine: CrosshairLineOptions = {
        enabled: true,
        stroke: 'rgba(0,0,0, 0.54)',
        strokeWidth: 1,
        lineDash: 'solid',
        lineCap: undefined,
    };
    yLine: CrosshairLineOptions = {
        enabled: false,
        stroke: 'rgba(0,0,0, 0.54)',
        strokeWidth: 1,
        lineDash: 'solid',
        lineCap: undefined,
    };
}

export class LineSparkline extends Sparkline {
    protected linePath = new ChartWrapper._Scene.Path();
    protected xCrosshairLine = new ChartWrapper._Scene.Line();
    protected yCrosshairLine = new ChartWrapper._Scene.Line();

    private lineSparklineGroup = new ChartWrapper._Scene.Group();
    private markers = new ChartWrapper._Scene.Group();
    private markerSelection = ChartWrapper._Scene.Selection.select(this.markers, () => this.markerFactory());
    private markerSelectionData: LineNodeDatum[] = [];

    readonly marker = new SparklineMarker();
    readonly line = new SparklineLine();
    readonly crosshairs = new SparklineCrosshairs();

    constructor() {
        super();
        this.rootGroup.append(this.lineSparklineGroup);

        this.linePath.zIndex = ZINDICIES.SERIES_STROKE_ZINDEX;
        this.xCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        this.yCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        this.markers.zIndex = ZINDICIES.SERIES_MARKERS_ZINDEX;

        this.lineSparklineGroup.append([this.linePath, this.xCrosshairLine, this.yCrosshairLine, this.markers]);
    }

    protected override getNodeData(): LineNodeDatum[] {
        return this.markerSelectionData;
    }

    protected markerFactory(): _Scene.Marker {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }

    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    private onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.clear();
        this.scheduleLayout();
    }

    protected override update(): void {
        const nodeData = this.generateNodeData();

        if (!nodeData) {
            return;
        }

        this.markerSelectionData = nodeData;

        this.updateSelection(nodeData);
        this.updateNodes();

        this.updateLine();
    }

    protected override updateYScaleDomain(): void {
        const { yData, yScale } = this;

        const yMinMax = ChartWrapper._Util.extent(yData as number[]);

        let yMin = 0;
        let yMax = 1;

        if (yMinMax != null) {
            yMin = this.min = yMinMax[0] as number;
            yMax = this.max = yMinMax[1] as number;
        }

        if (yMin === yMax) {
            // if all values in the data are the same, yMin and yMax will be equal, need to adjust the domain with some padding
            const padding = Math.abs(yMin * 0.01);
            yMin -= padding;
            yMax += padding;
        }

        yScale.domain = [yMin, yMax];
    }

    protected override generateNodeData(): LineNodeDatum[] | undefined {
        const { data, yData, xData, xScale, yScale } = this;

        if (!data) {
            return;
        }

        const continuous = !(xScale instanceof ChartWrapper._Scale.BandScale);
        const offsetX = !continuous ? xScale.bandwidth / 2 : 0;

        const nodeData: LineNodeDatum[] = [];

        for (let i = 0; i < yData.length; i++) {
            const yDatum = yData[i];
            const xDatum = xData[i];

            if (yDatum == undefined) {
                continue;
            }

            const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
            const y = yDatum === undefined ? NaN : yScale.convert(yDatum);

            nodeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x, y },
            });
        }
        return nodeData;
    }

    private updateSelection(selectionData: LineNodeDatum[]): void {
        this.markerSelection.update(selectionData);
    }

    protected override updateNodes(): void {
        const { highlightedDatum, highlightStyle, marker } = this;
        const {
            size: highlightSize,
            fill: highlightFill,
            stroke: highlightStroke,
            strokeWidth: highlightStrokeWidth,
        } = highlightStyle;
        const markerFormatter = marker.formatter;

        this.markerSelection.each((node, datum, index) => {
            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            const markerStrokeWidth =
                highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            const markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;

            let markerFormat: MarkerFormat | undefined;

            const { seriesDatum, point } = datum;

            if (markerFormatter) {
                const first = index === 0;
                const last = index === this.markerSelectionData.length - 1;
                const min = seriesDatum.y === this.min;
                const max = seriesDatum.y === this.max;

                markerFormat = markerFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min,
                    max,
                    first,
                    last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted,
                });
            }

            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth =
                markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;

            node.translationX = point.x;
            node.translationY = point.y;
            node.visible =
                markerFormat && markerFormat.enabled != undefined
                    ? markerFormat.enabled
                    : marker.enabled && node.size > 0;
        });
    }

    protected updateLine(): void {
        const { linePath, yData, xData, xScale, yScale, line } = this;

        const path = linePath.path;
        path.clear();

        if (yData.length < 2) {
            return;
        }

        const continuous = !(xScale instanceof ChartWrapper._Scale.BandScale);
        const n = yData.length;
        const offsetX = !continuous ? xScale.bandwidth / 2 : 0;
        let moveTo = true;

        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];

            const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
            const y = yDatum === undefined ? NaN : yScale.convert(yDatum);

            if (yDatum == undefined) {
                moveTo = true;
            } else {
                if (moveTo) {
                    path.moveTo(x, y);
                    moveTo = false;
                } else {
                    path.lineTo(x, y);
                }
            }
        }

        linePath.fill = undefined;
        linePath.stroke = line.stroke;
        linePath.strokeWidth = line.strokeWidth;
    }

    protected override updateXCrosshairLine(): void {
        const {
            yScale,
            xCrosshairLine,
            highlightedDatum,
            crosshairs: { xLine },
        } = this;

        if (!xLine.enabled || highlightedDatum == undefined) {
            xCrosshairLine.strokeWidth = 0;
            return;
        }

        xCrosshairLine.y1 = yScale.range[0];
        xCrosshairLine.y2 = yScale.range[1];
        xCrosshairLine.x1 = xCrosshairLine.x2 = highlightedDatum.point!.x;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = xLine.strokeWidth ?? 1;

        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;

        const { lineDash } = xLine;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash as string);
    }

    protected override updateYCrosshairLine() {
        const {
            xScale,
            yCrosshairLine,
            highlightedDatum,
            crosshairs: { yLine },
        } = this;

        if (!yLine.enabled || highlightedDatum == undefined) {
            yCrosshairLine.strokeWidth = 0;
            return;
        }

        yCrosshairLine.x1 = xScale.range[0];
        yCrosshairLine.x2 = xScale.range[1];
        yCrosshairLine.y1 = yCrosshairLine.y2 = highlightedDatum.point!.y;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = yLine.strokeWidth ?? 1;

        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;

        const { lineDash } = yLine;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash as string);
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
}
