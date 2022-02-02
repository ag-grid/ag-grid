import { Group } from '../../scene/group';
import { Path } from '../../scene/shape/path';
import { Line } from '../../scene/shape/line';
import { BandScale } from '../../scale/bandScale';
import { Selection } from '../../scene/selection';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
import { Marker } from '../marker/marker';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getMarker } from '../marker/markerFactory';
import { MarkerFormat, MarkerFormatterParams } from '@ag-grid-community/core';
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';
import { CrosshairLineOptions } from '@ag-grid-community/core';
import { getLineDash } from '../../util/lineDash';

interface AreaNodeDatum extends SeriesNodeDatum { }

interface PathDatum extends SeriesNodeDatum {
    point: Point;
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
export class AreaSparkline extends Sparkline {
    static className = 'AreaSparkline';

    fill: string = 'rgba(124, 181, 236, 0.25)';

    protected strokePath: Path = new Path();
    protected fillPath: Path = new Path();
    protected xCrosshairLine: Line = new Line();
    protected yCrosshairLine: Line = new Line();

    private areaSparklineGroup: Group = new Group();
    private fillPathData: PathDatum[] = [];
    private strokePathData: PathDatum[] = [];
    private xAxisLine: Line = new Line();
    private markers: Group = new Group();
    private markerSelection: Selection<Marker, Group, AreaNodeDatum, any> = Selection.select(
        this.markers
    ).selectAll<Marker>();
    private markerSelectionData: AreaNodeDatum[] = [];

    readonly marker = new SparklineMarker();
    readonly line = new SparklineLine();
    readonly crosshairs = new SparklineCrosshairs();

    constructor() {
        super();
        this.rootGroup.append(this.areaSparklineGroup);
        this.areaSparklineGroup.append([
            this.fillPath,
            this.xAxisLine,
            this.strokePath,
            this.xCrosshairLine,
            this.yCrosshairLine,
            this.markers,
        ]);
    }

    protected getNodeData(): AreaNodeDatum[] {
        return this.markerSelectionData;
    }

    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    private onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    }

    protected update(): void {
        const data = this.generateNodeData();

        if (!data) {
            return;
        }

        const { nodeData, fillData, strokeData } = data;

        this.markerSelectionData = nodeData;
        this.fillPathData = fillData;
        this.strokePathData = strokeData;

        this.updateSelection(nodeData);
        this.updateNodes();

        this.updateStroke(strokeData);
        this.updateFill(fillData);
    }

    protected updateYScaleDomain(): void {
        const { yData, yScale } = this;
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

        yScale.domain = [yMin, yMax];
    }

    protected generateNodeData():
        | { nodeData: AreaNodeDatum[]; fillData: PathDatum[]; strokeData: PathDatum[] }
        | undefined {
        const { data, yData, xData, xScale, yScale } = this;

        if (!data) {
            return;
        }

        const offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        const n = yData.length;

        const nodeData: AreaNodeDatum[] = [];
        const fillData: PathDatum[] = [];
        const strokeData: PathDatum[] = [];

        let firstValidX;
        let lastValidX;

        let previousX;
        let nextX;

        const yZero = yScale.convert(0);

        for (let i = 0; i < n; i++) {
            const yDatum = yData[i];
            const xDatum = xData[i];

            const x = xScale.convert(xDatum) + offsetX;
            const y = yScale.convert(yDatum);

            // if this iteration is not the last, set nextX using the next value in the data array
            if (i + 1 < n) {
                nextX = xScale.convert(xData[i + 1]) + offsetX;
            }

            // set stroke data regardless of missing/ undefined values. Undefined values will be handled in the updateStroke() method
            strokeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x, y },
            });

            if (yDatum === undefined && previousX !== undefined) {
                // if yDatum is undefined and there is a valid previous data point, add a phantom point at yZero
                // if a next data point exists, add a phantom point at yZero at the next X
                fillData.push({ seriesDatum: undefined, point: { x: previousX, y: yZero } });
                if (nextX !== undefined) {
                    fillData.push({ seriesDatum: undefined, point: { x: nextX, y: yZero } });
                }
            } else if (yDatum !== undefined) {
                fillData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x, y },
                });

                // set node data only if yDatum is not undefined. These values are used in the updateSelection() method to update markers
                nodeData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x, y },
                });

                firstValidX = firstValidX !== undefined ? firstValidX : x;
                lastValidX = x;
            }
            previousX = x;
        }

        // phantom points for creating closed area
        fillData.push(
            { seriesDatum: undefined, point: { x: lastValidX, y: yZero } },
            { seriesDatum: undefined, point: { x: firstValidX, y: yZero } }
        );

        return { nodeData, fillData, strokeData };
    }

    protected updateAxisLine() {
        const { xScale, yScale, axis, xAxisLine } = this;

        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;

        const yZero: number = yScale.convert(0);
        xAxisLine.translationY = yZero;
    }

    private updateSelection(selectionData: AreaNodeDatum[]): void {
        const { marker } = this;

        const shape = getMarker(marker.shape);

        const updateMarkerSelection = this.markerSelection.setData(selectionData);
        const enterMarkerSelection = updateMarkerSelection.enter.append(shape);

        updateMarkerSelection.exit.remove();

        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    }

    protected updateNodes(): void {
        const { highlightedDatum, highlightStyle, marker } = this;
        const {
            size: highlightSize,
            fill: highlightFill,
            stroke: highlightStroke,
            strokeWidth: highlightStrokeWidth,
        } = highlightStyle;
        const markerFormatter = marker.formatter;

        this.markerSelection.each((node, datum, index) => {
            const { point, seriesDatum } = datum;

            if (!point) {
                return;
            }

            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            const markerStrokeWidth =
                highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            const markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;

            let markerFormat: MarkerFormat | undefined;

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

    updateStroke(strokeData: PathDatum[]) {
        const { strokePath, yData, line } = this;

        if (yData.length < 2) {
            return;
        }

        const path = strokePath.path;
        const n = strokeData.length;

        let moveTo = true;

        path.clear();

        for (let i = 0; i < n; i++) {
            const { point, seriesDatum } = strokeData[i];

            const x = point.x;
            const y = point.y;

            if (seriesDatum.y == undefined) {
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

        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    }

    updateFill(areaData: PathDatum[]) {
        const { fillPath, yData, fill } = this;

        const path = fillPath.path;
        const n = areaData.length;

        path.clear();

        if (yData.length < 2) {
            return;
        }

        for (let i = 0; i < n; i++) {
            const { point } = areaData[i];

            const x = point.x;
            const y = point.y;

            if (i > 0) {
                path.lineTo(x, y);
            } else {
                path.moveTo(x, y);
            }
        }

        path.closePath();

        fillPath.lineJoin = 'round';
        fillPath.stroke = undefined;
        fillPath.fill = fill;
    }

    protected updateXCrosshairLine(): void {
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
        xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = xLine.strokeWidth || 1;

        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;

        const { lineDash } = xLine;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash as string);

        xCrosshairLine.translationX = highlightedDatum.point!.x;
    }

    protected updateYCrosshairLine() {
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
        yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = yLine.strokeWidth || 1;

        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;

        const { lineDash } = yLine;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash as string);

        yCrosshairLine.translationY = highlightedDatum.point!.y;
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

        if (this.tooltip.renderer) {
            return toTooltipHtml(
                this.tooltip.renderer({
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