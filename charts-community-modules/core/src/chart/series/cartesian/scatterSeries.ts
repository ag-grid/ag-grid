import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import { SeriesNodeDatum, CartesianTooltipRendererParams } from "../series";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { LegendDatum } from "../../legend";
import { Shape } from "../../../scene/shape/shape";
import linearScale from "../../../scale/linearScale";
import { Marker } from "../../marker/marker";
import { reactive } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import palette from "../../palettes";
import { getMarker } from "../../marker/util";
import { chainObjects } from "../../../util/object";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    size: number;
}

export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    sizeKey?: string;
    sizeName?: string;

    labelKey?: string;
    labelName?: string;
}

export class ScatterSeries extends CartesianSeries {

    static className = 'ScatterSeries';

    static defaults = chainObjects(CartesianSeries.defaults, {
        title: undefined,
        xKey: '',
        yKey: '',
        sizeKey: undefined,
        labelKey: undefined,
        xName: 'X',
        yName: 'Y',
        sizeName: 'Size',
        labelName: 'Label',
        fill: palette.fills[0],
        stroke: palette.strokes[0],
        strokeWidth: 2,
        fillOpacity: 1,
        strokeOpacity: 1,
        highlightStyle: {
            fill: 'yellow'
        },
        tooltipRenderer: undefined
    });

    private xDomain: number[] = [];
    private yDomain: number[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private sizeData: number[] = [];
    private sizeScale = linearScale();

    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    private highlightedNode?: Marker;

    readonly marker = new CartesianSeriesMarker();

    private _fill: string = ScatterSeries.defaults.fill;
    set fill(value: string) {
        if (this._fill !== value) {
            this._fill = value;
            this.scheduleData();
        }
    }
    get fill(): string {
        return this._fill;
    }

    private _stroke: string = ScatterSeries.defaults.stroke;
    set stroke(value: string) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.scheduleData();
        }
    }
    get stroke(): string {
        return this._stroke;
    }

    private _strokeWidth: number = ScatterSeries.defaults.strokeWidth;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _fillOpacity: number = ScatterSeries.defaults.fillOpacity;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.scheduleLayout();
        }
    }
    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = ScatterSeries.defaults.strokeOpacity;
    set strokeOpacity(value: number) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.scheduleLayout();
        }
    }
    get strokeOpacity(): number {
        return this._strokeOpacity;
    }

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = ScatterSeries.defaults.highlightStyle;

    @reactive(['layoutChange']) title?: string = ScatterSeries.defaults.title;
    @reactive(['dataChange']) xKey: string = ScatterSeries.defaults.xKey;
    @reactive(['dataChange']) yKey: string = ScatterSeries.defaults.yKey;
    @reactive(['dataChange']) sizeKey?: string = ScatterSeries.defaults.sizeKey;
    @reactive(['dataChange']) labelKey?: string = ScatterSeries.defaults.labelKey;

    xName: string = ScatterSeries.defaults.xName;
    yName: string = ScatterSeries.defaults.yName;
    sizeName?: string = ScatterSeries.defaults.sizeName;
    labelName?: string = ScatterSeries.defaults.labelName;

    tooltipRenderer?: (params: ScatterTooltipRendererParams) => string = ScatterSeries.defaults.tooltipRenderer;

    constructor() {
        super();

        const { marker } = this;
        marker.addPropertyListener('shape', () => this.onMarkerShapeChange());
        marker.addEventListener('change', () => this.update());

        this.addPropertyListener('xKey', () => this.xData = []);
        this.addPropertyListener('yKey', () => this.yData = []);
        this.addPropertyListener('sizeKey', () => this.sizeData = []);
    }

    onMarkerShapeChange() {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();

        this.fireEvent({type: 'legendChange'});
    }

    processData(): boolean {
        const {
            xKey,
            yKey,
            sizeKey
        } = this;

        const data = xKey && yKey && this.data ? this.data : [];

        this.xData = data.map(d => d[xKey]);
        this.yData = data.map(d => d[yKey]);

        if (sizeKey) {
            this.sizeData = data.map(d => d[sizeKey]);
        } else {
            this.sizeData = [];
        }

        this.sizeScale.domain = numericExtent(this.sizeData) || [1, 1];
        this.xDomain = this.fixNumericExtent(numericExtent(this.xData), 'x');
        this.yDomain = this.fixNumericExtent(numericExtent(this.yData), 'y');

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    highlightNode(node: Shape) {
        if (!(node instanceof Marker)) {
            return;
        }

        this.highlightedNode = node;
        this.scheduleLayout();
    }

    dehighlightNode() {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    }

    update(): void {
        const { visible, chart, xAxis, yAxis } = this;

        this.group.visible = visible;

        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;

        const {
            data,
            xData,
            yData,
            sizeData,
            xKey,
            yKey,
            sizeScale,
            marker,
            fill,
            stroke,
            strokeWidth,
            fillOpacity,
            strokeOpacity,
            highlightedNode
        } = this;

        const MarkerShape = getMarker(marker.shape);
        const markerFormatter = marker.formatter;

        this.sizeScale.range = [marker.minSize, marker.size];

        const groupSelectionData: GroupSelectionDatum[] = xData.map((xDatum, i) => ({
            seriesDatum: data[i],
            x: xScale.convert(xDatum) + xOffset,
            y: yScale.convert(yData[i]) + yOffset,
            size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size
        }));

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(MarkerShape);

        const groupSelection = updateGroups.merge(enterGroups);
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;

        groupSelection.selectByClass(MarkerShape)
            .each((node, datum) => {
                const isHighlightedNode = node === highlightedNode;
                const markerFill = isHighlightedNode && highlightFill !== undefined ? highlightFill : marker.fill || fill;
                const markerStroke = isHighlightedNode && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
                let markerFormat: CartesianSeriesMarkerFormat | undefined = undefined;

                if (markerFormatter) {
                    markerFormat = markerFormatter({
                        datum: datum.seriesDatum,
                        xKey,
                        yKey,
                        fill: markerFill,
                        stroke: markerStroke,
                        strokeWidth: markerStrokeWidth,
                        size: datum.size,
                        highlighted: isHighlightedNode
                    });
                }

                node.fill = markerFormat && markerFormat.fill || markerFill;
                node.stroke = markerFormat && markerFormat.stroke || markerStroke;
                node.strokeWidth = markerFormat && markerFormat.strokeWidth !== undefined
                    ? markerFormat.strokeWidth
                    : markerStrokeWidth;
                node.size = markerFormat && markerFormat.size !== undefined
                    ? markerFormat.size
                    : datum.size;
                node.fillOpacity = fillOpacity;
                node.strokeOpacity = strokeOpacity;
                node.translationX = datum.x;
                node.translationY = datum.y;
                node.visible = marker.enabled && node.size > 0;
            });

        this.groupSelection = groupSelection;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        const { xKey, yKey } = this;

        if (!xKey || !yKey) {
            return '';
        }

        const {
            title,
            tooltipRenderer,
            xName,
            yName,
            sizeKey,
            sizeName,
            labelKey,
            labelName,
            fill
        } = this;

        const color = fill || 'gray';

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey,
                yKey,
                sizeKey,
                labelKey,
                xName,
                yName,
                sizeName,
                labelName,
                title,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleHtml = title ? `<div class="ag-chart-tooltip-title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xKey];
            const yValue = seriesDatum[yKey];
            let contentHtml = `<b>${xName}</b>: ${toFixed(xValue)}<br><b>${yName}</b>: ${toFixed(yValue)}`;

            if (sizeKey) {
                contentHtml += `<br><b>${sizeName}</b>: ${seriesDatum[sizeKey]}`;
            }

            if (labelKey) {
                contentHtml = `<b>${labelName}</b>: ${seriesDatum[labelKey]}<br>` + contentHtml;
            }

            return `${titleHtml}<div class="ag-chart-tooltip-content">${contentHtml}</div>`;
        }
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, xKey, yKey, yName,
            title, visible, marker, fill, stroke, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKey) {
            legendData.push({
                id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill,
                    stroke: marker.stroke || stroke,
                    fillOpacity,
                    strokeOpacity
                }
            });
        }
    }
}
