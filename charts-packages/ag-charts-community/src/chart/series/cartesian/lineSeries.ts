import { Path } from "../../../scene/shape/path";
import ContinuousScale from "../../../scale/continuousScale";
import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import palette from "../../palettes";
import { SeriesNodeDatum, CartesianTooltipRendererParams as LineTooltipRendererParams } from "../series";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { reactive, PropertyChangeEvent } from "../../../util/observable";
import { Chart } from "../../chart";

interface GroupSelectionDatum extends SeriesNodeDatum {
    point: {
        x: number;
        y: number;
    }
}

export { LineTooltipRendererParams };

export class LineSeries extends CartesianSeries {

    static className = 'LineSeries';
    static type = 'line';

    private xDomain: any[] = [];
    private yDomain: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private groupSelectionData: GroupSelectionDatum[] = [];

    private lineNode = new Path();

    // We use groups for this selection even though each group only contains a marker ATM
    // because in the future we might want to add label support as well.
    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    readonly marker = new CartesianSeriesMarker();

    @reactive('layoutChange') title?: string;

    @reactive('update') stroke: string = palette.fills[0];
    @reactive('update') strokeWidth: number = 2;
    @reactive('update') strokeOpacity: number = 1;

    tooltipRenderer?: (params: LineTooltipRendererParams) => string;

    constructor() {
        super();

        const lineNode = this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        this.group.append(lineNode);

        this.addEventListener('update', this.update);

        const { marker } = this;
        marker.fill = palette.fills[0];
        marker.stroke = palette.strokes[0];
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addPropertyListener('enabled', this.onMarkerEnabledChange, this);
        marker.addEventListener('change', this.update, this);
    }

    onMarkerShapeChange() {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();

        this.fireEvent({type: 'legendChange'});
    }

    protected onMarkerEnabledChange(event: PropertyChangeEvent<CartesianSeriesMarker, boolean>) {
        if (!event.value) {
            this.groupSelection = this.groupSelection.setData([]);
            this.groupSelection.exit.remove();
        }
    }

    protected _xKey: string = '';
    set xKey(value: string) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.xData = [];
            this.scheduleData();
        }
    }
    get xKey(): string {
        return this._xKey;
    }

    @reactive('update') xName: string = '';

    protected _yKey: string = '';
    set yKey(value: string) {
        if (this._yKey !== value) {
            this._yKey = value;
            this.yData = [];
            this.scheduleData();
        }
    }
    get yKey(): string {
        return this._yKey;
    }

    @reactive('update') yName: string = '';

    processData(): boolean {
        const { xAxis, xKey, yKey, xData, yData } = this;
        const data = xKey && yKey && this.data ? this.data : [];

        if (!xAxis) {
            return false;
        }

        const isContinuousX = xAxis.scale instanceof ContinuousScale;

        xData.length = 0;
        yData.length = 0;

        for (let i = 0, n = data.length; i < n; i++) {
            const datum = data[i];
            const x = datum[xKey];
            const y = datum[yKey];

            xData.push(x);
            yData.push(y);
        }

        this.xDomain = isContinuousX ? this.fixNumericExtent(numericExtent(xData), 'x') : xData;
        this.yDomain = this.fixNumericExtent(numericExtent(yData), 'y');

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    }

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = { fill: 'yellow' };

    update(): void {
        const { chart, xAxis, yAxis } = this;

        this.group.visible = this.visible;

        if (!xAxis || !yAxis || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const isContinuousX = xScale instanceof ContinuousScale;

        const {
            data,
            xData,
            yData,
            marker,
            lineNode
        } = this;

        const groupSelectionData: GroupSelectionDatum[] = [];
        const linePath = lineNode.path;

        linePath.clear();
        let moveTo = true;
        xData.forEach((xDatum, i) => {
            const yDatum = yData[i];
            const isGap = yDatum == null || isNaN(yDatum) || !isFinite(yDatum)
                || xDatum == null || (isContinuousX && (isNaN(xDatum) || !isFinite(xDatum)));

            if (isGap) {
                moveTo = true;
            } else {
                const x = xScale.convert(xDatum) + xOffset;
                const y = yScale.convert(yDatum) + yOffset;

                if (moveTo) {
                    linePath.moveTo(x, y);
                    moveTo = false;
                } else {
                    linePath.lineTo(x, y);
                }

                if (marker) {
                    groupSelectionData.push({
                        series: this,
                        seriesDatum: data[i],
                        point: { x, y }
                    });
                }
            }
        });

        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.strokeWidth;
        lineNode.strokeOpacity = this.strokeOpacity;

        this.groupSelectionData = groupSelectionData;
        this.updateGroupSelection(groupSelectionData);
    }

    getNodeDatums(): GroupSelectionDatum[] {
        return this.groupSelectionData;
    }

    private updateGroupSelection(groupSelectionData: GroupSelectionDatum[]) {
        const { marker, xKey, yKey, highlightedDatum, stroke, strokeWidth } = this;
        let { groupSelection } = this;

        const MarkerShape = getMarker(marker.shape);

        const updateGroups = groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(MarkerShape);

        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;
        const markerFormatter = marker.formatter;
        const markerSize = marker.size;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;

        groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByClass(MarkerShape)
            .each((node, datum) => {
                const highlighted = highlightedDatum &&
                    highlightedDatum.series === datum.series &&
                    highlightedDatum.seriesDatum === datum.seriesDatum;
                const markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
                const markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
                let markerFormat: CartesianSeriesMarkerFormat | undefined = undefined;

                if (markerFormatter) {
                    markerFormat = markerFormatter({
                        datum: datum.seriesDatum,
                        xKey,
                        yKey,
                        fill: markerFill,
                        stroke: markerStroke,
                        strokeWidth: markerStrokeWidth,
                        size: markerSize,
                        highlighted
                    });
                }

                node.fill = markerFormat && markerFormat.fill || markerFill;
                node.stroke = markerFormat && markerFormat.stroke || markerStroke;
                node.strokeWidth = markerFormat && markerFormat.strokeWidth !== undefined
                    ? markerFormat.strokeWidth
                    : markerStrokeWidth;
                node.size = markerFormat && markerFormat.size !== undefined
                    ? markerFormat.size
                    : markerSize;

                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible = marker.enabled && node.size > 0;
            });

        this.groupSelection = groupSelection;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        const { xKey, yKey } = this;

        if (!xKey || !yKey) {
            return '';
        }

        const { xName, yName, stroke: color, tooltipRenderer } = this;

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey,
                xName,
                yKey,
                yName,
                title: this.title,
                color
            });
        } else {
            const title = this.title || yName;
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleString = title ? `<div class="${Chart.defaultTooltipClass}-title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xKey];
            const yValue = seriesDatum[yKey];
            const xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);

            return `${titleString}<div class="${Chart.defaultTooltipClass}-content">${xString}: ${yString}</div>`;
        }
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            id, data, xKey, yKey, yName, visible,
            title, marker, stroke, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKey) {
            legendData.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill,
                    stroke: marker.stroke || stroke,
                    fillOpacity: 1,
                    strokeOpacity
                }
            });
        }
    }
}
