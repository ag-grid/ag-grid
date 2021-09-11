import { BandScale } from '../../scale/bandScale';
import { LinearScale } from '../../scale/linearScale';
import { Group } from '../../scene/group';
import { Path } from '../../scene/shape/path';
import { Observable } from '../../util/observable';
import { Selection } from '../../scene/selection';
import { Marker } from '../marker/marker';
import { Point, SeriesNodeDatum, Sparkline } from '../sparkline';
import { SparklineTooltip, toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getMarker } from '../marker/markerFactory';
import { MarkerFormat, MarkerFormatterParams } from "@ag-grid-community/core";

interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: Point;
}

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

export class LineSparkline extends Sparkline {
    static className = 'LineSparkline';

    private lineSparklineGroup: Group = new Group();
    protected linePath: Path = new Path();
    protected yScale: LinearScale = new LinearScale();
    protected xScale: BandScale<number | undefined> = new BandScale<number | undefined>();
    private markers: Group = new Group();
    private markerSelection: Selection<Marker, Group, LineNodeDatum, any> = Selection.select(this.markers).selectAll<Marker>();
    private markerSelectionData: LineNodeDatum[] = [];

    readonly marker = new SparklineMarker();
    readonly line = new SparklineLine();

    constructor(document = window.document, tooltip: SparklineTooltip) {
        super(document, tooltip);
        this.rootGroup.append(this.lineSparklineGroup);
        this.lineSparklineGroup.append([this.linePath, this.markers]);
    }

    protected getNodeData(): LineNodeDatum[] {
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
        const nodeData = this.generateNodeData();

        if (!nodeData) {
            return;
        }

        this.markerSelectionData = nodeData;

        this.updateSelection(nodeData);
        this.updateNodes();

        this.updateLine();
    }

    protected updateYScale(): void {
        const { yData, yScale, seriesRect } = this;

        yScale.range = [seriesRect.height, 0];

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

        if (minY === maxY) {
            // if all values in the data are the same, minY and maxY will be equal, need to adjust the domain with some padding.
            const padding = Math.abs(minY * 0.01);
            minY -= padding;
            maxY += padding;
        }

        yScale.domain = [minY, maxY];
    }

    protected updateXScale(): void {
        const { xScale, seriesRect, xData } = this;
        xScale.range = [0, seriesRect.width];
        xScale.domain = xData;
    }

    protected generateNodeData(): LineNodeDatum[] | undefined {
        const { data, yData, xData, xScale, yScale } = this;

        if (!data) {
            return;
        }

        const offsetX = xScale.bandwidth / 2;

        const nodeData: LineNodeDatum[] = [];

        for (let i = 0; i < yData.length; i++) {
            let yDatum = yData[i];
            let xDatum = xData[i];

            if (yDatum == undefined) {
                continue;
            }

            const x = xScale.convert(i) + offsetX;
            const y = yScale.convert(yDatum);

            nodeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x, y }
            });
        }
        return nodeData;
    }

    private updateSelection(selectionData: LineNodeDatum[]): void {
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

        this.markerSelection.each((node, datum) => {
            const highlighted = datum === highlightedDatum;
            const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            const markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            const markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;

            let markerFormat: MarkerFormat | undefined = undefined;

            const { seriesDatum, point } = datum;

            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
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

    protected updateLine(): void {
        const { linePath, yData, xData, xScale, yScale, line } = this;

        if (yData.length < 2) {
            return;
        }

        const path = linePath.path;
        const n = yData.length;
        const offsetX = xScale.bandwidth / 2;
        let moveTo = true;

        path.clear();

        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];

            const x = xScale.convert(xDatum) + offsetX;
            const y = yScale.convert(yDatum);

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

    getTooltipHtml(datum: SeriesNodeDatum): string | undefined {
        const { title, marker } = this;
        const { seriesDatum } = datum;
        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;
        const backgroundColor = marker.fill;
        const content = typeof xValue !== 'number' ? `${this.formatDatum(seriesDatum.x)}: ${this.formatDatum(seriesDatum.y)}` : `${this.formatDatum(seriesDatum.y)}`;

        const defaults = {
            backgroundColor,
            title,
            content
        }

        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
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