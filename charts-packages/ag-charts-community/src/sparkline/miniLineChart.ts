
import { BandScale } from '../scale/bandScale';
import { LinearScale } from '../scale/linearScale';
import { Group } from '../scene/group';
import { Path } from '../scene/shape/path';
import { Observable, reactive } from '../util/observable';
import { Selection } from '../scene/selection';
import { Marker } from './marker';
import { MiniChart, SeriesNodeDatum } from './miniChart';
import { toTooltipHtml } from './miniChartTooltip';
import { getMarkerShape } from './util';

interface LineNodeDatum extends SeriesNodeDatum { 
    readonly point: {
        readonly x: number;
        readonly y: number;
    }
}

interface MarkerFormat {
    enabled?: boolean;
    shape?: string;
    size?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

interface MarkerFormatterParams {
    datum: any;
    xValue: any;
    yValue: any;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}

class MiniChartMarker extends Observable {
    @reactive() enabled: boolean = true;
    @reactive() shape: string = 'circle';
    @reactive('update') size: number = 0;
    @reactive('update') fill?: string = 'rgb(124, 181, 236)';
    @reactive('update') stroke?: string = 'rgb(124, 181, 236)';
    @reactive('update') strokeWidth: number = 1;
    @reactive('update') formatter?: (params: MarkerFormatterParams) => MarkerFormat;
}
class MiniChartLine extends Observable {
    @reactive('update') stroke: string = 'rgb(124, 181, 236)';
    @reactive('update') strokeWidth: number = 1;
}
export class MiniLineChart extends MiniChart {

    static className = 'MiniLineChart';

    private miniLineChartGroup: Group = new Group();
    protected linePath: Path = new Path();
    protected yScale: LinearScale = new LinearScale();
    // hmm
    protected xScale: BandScale<number | undefined> = new BandScale<number | undefined>();
    private markers: Group = new Group();
    private markerSelection: Selection<Marker, Group, LineNodeDatum, any> = Selection.select(this.markers).selectAll<Marker>();
    private markerSelectionData: LineNodeDatum[] = [];

    readonly marker = new MiniChartMarker();
    readonly line = new MiniChartLine();

    constructor() {
        super();

        this.rootGroup.append(this.miniLineChartGroup);
        this.miniLineChartGroup.append([this.linePath, this.markers]);

        this.marker.addEventListener('update', this.updateMarkers, this);
        this.marker.addPropertyListener('enabled', this.updateMarkers, this);
        this.marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        this.line.addEventListener('update', this.updateLine, this);
    }

    protected getNodeData(): LineNodeDatum[] {
        return this.markerSelectionData;
    }

    private onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    }

    protected update(): void {
        const { seriesRect } = this;
        this.rootGroup.translationX = seriesRect.x;
        this.rootGroup.translationY = seriesRect.y;

        this.updateXScale();
        this.updateYScaleRange();
        this.updateYScaleDomain();

        const nodeData = this.generateNodeData();
        this.markerSelectionData = nodeData;

        this.updateMarkerSelection(nodeData);
        this.updateMarkers();

        this.updateLine();
    }

    protected updateYScaleRange(): void {
        const { yScale, seriesRect } = this;
        yScale.range = [seriesRect.height, 0];
    }

    protected updateYScaleDomain(): void {
        const { yData, yScale } = this;

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

    protected generateNodeData(): LineNodeDatum[] {
        const { yData, xData, data, xScale, yScale } = this;

        if (!data) {
            return [];
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

    private updateMarkerSelection(selectionData: LineNodeDatum[]): void {
        const { marker } = this;

        const shape = getMarkerShape(marker.shape);

        let updateMarkerSelection = this.markerSelection.setData(selectionData);
        let enterMarkerSelection = updateMarkerSelection.enter.append(shape);

        updateMarkerSelection.exit.remove();

        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    }

    private updateMarkers(): void {
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

            node.size = markerFormat && markerFormat.size || markerSize;
            node.fill = markerFormat && markerFormat.fill || markerFill;
            node.stroke = markerFormat && markerFormat.stroke || markerStroke;
            node.strokeWidth = markerFormat && markerFormat.strokeWidth || markerStrokeWidth;

            node.translationX = point.x;
            node.translationY = point.y;
            node.visible = markerFormat && markerFormat.enabled || marker.enabled && node.size > 0;
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

    private highlightedDatum?: SeriesNodeDatum;
    protected highlightDatum(closestDatum: SeriesNodeDatum): void {
        this.highlightedDatum = closestDatum;
        this.updateMarkers();
    }

    protected dehighlightDatum(): void {
        this.highlightedDatum = undefined;
        this.updateMarkers();
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