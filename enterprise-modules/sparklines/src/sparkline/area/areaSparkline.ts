import { Group } from '../../scene/group';
import { Path } from '../../scene/shape/path';
import { Line } from '../../scene/shape/line';
import { BandScale } from '../../scale/bandScale';
import { Observable } from '../../util/observable';
import { Selection } from "../../scene/selection";
import { SeriesNodeDatum, Sparkline } from '../sparkline';
import { Marker } from '../marker/marker';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getMarker } from '../marker/markerFactory';
import { MarkerFormat, MarkerFormatterParams } from "@ag-grid-community/core";
import { extent } from '../../util/array';
import { isNumber } from '../../util/value';

interface AreaNodeDatum extends SeriesNodeDatum { }

interface AreaPathDatum extends SeriesNodeDatum { }

class SparklineMarker extends Observable {
    enabled: boolean = true;
    shape: string = 'circle';
    size: number = 0;
    fill?: string = 'rgb(124, 181, 236)';
    stroke?: string = 'rgb(124, 181, 236)';
    strokeWidth: number = 1;
    formatter?: (params: MarkerFormatterParams) => MarkerFormat = undefined;
}

class SparklineLine extends Observable {
    stroke: string = 'rgb(124, 181, 236)';
    strokeWidth: number = 1;
}

export class AreaSparkline extends Sparkline {
    static className = 'AreaSparkline';

    fill: string = 'rgba(124, 181, 236, 0.25)';

    private areaSparklineGroup: Group = new Group();
    protected strokePath: Path = new Path();
    protected fillPath: Path = new Path();
    private areaPathData: AreaPathDatum[] = [];
    private xAxisLine: Line = new Line();
    private markers: Group = new Group();
    private markerSelection: Selection<Marker, Group, AreaNodeDatum, any> = Selection.select(this.markers).selectAll<Marker>();
    private markerSelectionData: AreaNodeDatum[] = [];

    readonly marker = new SparklineMarker();
    readonly line = new SparklineLine();

    constructor() {
        super();
        this.rootGroup.append(this.areaSparklineGroup);
        this.areaSparklineGroup.append([this.fillPath, this.xAxisLine, this.strokePath, this.markers]);
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

        const { nodeData, areaData } = data;

        this.markerSelectionData = nodeData;
        this.areaPathData = areaData;

        this.updateSelection(nodeData);
        this.updateNodes();

        this.updateStroke(nodeData);
        this.updateFill(areaData);
    }

    protected updateYScaleDomain(): void {
        const { yData, yScale } = this;

        let yMinMax = extent(yData, isNumber);

        let yMin = 0;
        let yMax = 1;

        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0] as number;
            yMax = this.max = yMinMax[1] as number;
        }

        if (yData.length > 1) {
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
        }

        yScale.domain = [yMin, yMax];
    }

    protected generateNodeData(): { nodeData: AreaNodeDatum[], areaData: AreaPathDatum[] } | undefined {
        const { data, yData, xData, xScale, yScale } = this;

        if (!data) {
            return;
        }

        const offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        const n = yData.length;

        const nodeData: AreaNodeDatum[] = [];
        const areaData: AreaPathDatum[] = [];

        for (let i = 0; i < n; i++) {
            let yDatum = yData[i];
            let xDatum = xData[i];

            const invalidYDatum = yDatum === undefined;
            const invalidXDatum = xDatum === undefined;

            if (invalidYDatum) {
                yDatum = 0;
            }

            if (invalidXDatum) {
                xDatum = 0;
            }

            const x = xScale.convert(xDatum) + offsetX;
            const y = yScale.convert(yDatum);

            nodeData.push({
                seriesDatum: { x: invalidXDatum ? undefined : xDatum, y: invalidYDatum ? undefined : yDatum },
                point: { x, y }
            });

            areaData.push({
                seriesDatum: { x: invalidXDatum ? undefined : xDatum, y: invalidYDatum ? undefined : yDatum },
                point: { x, y }
            });
        }

        // phantom points for creating closed area
        const yZero = yScale.convert(0);
        const firstX = xScale.convert(xData[0]) + offsetX;
        const lastX = xScale.convert(xData[n - 1]) + offsetX;

        areaData.push(
            { seriesDatum: undefined, point: { x: lastX, y: yZero } },
            { seriesDatum: undefined, point: { x: firstX, y: yZero } }
        );

        return { nodeData, areaData };
    }

    protected updateXAxisLine() {
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

        let updateMarkerSelection = this.markerSelection.setData(selectionData);
        let enterMarkerSelection = updateMarkerSelection.enter.append(shape);

        updateMarkerSelection.exit.remove();

        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    }

    protected updateNodes(): void {
        const { highlightedDatum, highlightStyle, marker } = this;
        const { size: highlightSize, fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = highlightStyle;
        const markerFormatter = marker.formatter;

        this.markerSelection.each((node, datum, index) => {
            const { point, seriesDatum } = datum;

            if (!point) {
                return;
            }

            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            const markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            const markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;

            let markerFormat: MarkerFormat | undefined = undefined;

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
                    highlighted
                });
            }

            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth = markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;

            node.translationX = point.x;
            node.translationY = point.y;
            node.visible = markerFormat && markerFormat.enabled != undefined ? markerFormat.enabled : marker.enabled && node.size > 0;
        });
    }

    updateStroke(nodeData: SeriesNodeDatum[]) {
        const { strokePath, yData, line } = this;

        const path = strokePath.path;
        const n = yData.length;

        path.clear();

        if (yData.length < 2) {
            return;
        }

        for (let i = 0; i < n; i++) {
            const { point } = nodeData[i];

            if (!point) {
                return;
            }

            let x = point.x;
            let y = point.y;

            if (i > 0) {
                path.lineTo(x, y);
            } else {
                path.moveTo(x, y);
            }
        }

        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    }

    updateFill(areaData: SeriesNodeDatum[]) {
        const { fillPath, yData, fill } = this;

        const path = fillPath.path;
        const n = areaData.length;

        path.clear();

        if (yData.length < 2) {
            return;
        }

        for (let i = 0; i < n; i++) {
            const { point } = areaData[i];

            if (!point) {
                return;
            }

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

    getTooltipHtml(datum: SeriesNodeDatum): string | undefined {
        const { marker, dataType } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const backgroundColor = marker.fill;
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