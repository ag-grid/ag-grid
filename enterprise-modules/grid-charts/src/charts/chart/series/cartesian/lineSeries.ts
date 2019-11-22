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
import { Shape } from "../../../scene/shape/shape";
import { Marker } from "../../marker/marker";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
}

export { LineTooltipRendererParams };

export class LineSeries extends CartesianSeries {

    static className = 'LineSeries';

    private xDomain: any[] = [];
    private yDomain: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];

    private lineNode = new Path();

    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    readonly marker = new CartesianSeriesMarker();

    constructor() {
        super();

        const lineNode = this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        this.group.append(lineNode);

        this.marker.addPropertyListener('type', () => this.onMarkerTypeChange());
        this.marker.addEventListener('change', () => this.update());
    }

    onMarkerTypeChange() {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    }

    protected _title?: string;
    set title(value: string | undefined) {
        if (this._title !== value) {
            this._title = value;
            this.scheduleLayout();
        }
    }
    get title(): string | undefined {
        return this._title;
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

    protected _xName: string = '';
    set xName(value: string) {
        if (this._xName !== value) {
            this._xName = value;
            this.update();
        }
    }
    get xName(): string {
        return this._xName;
    }

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

    protected _yName: string = '';
    set yName(value: string) {
        if (this._yName !== value) {
            this._yName = value;
            this.update();
        }
    }
    get yName(): string {
        return this._yName;
    }

    processData(): boolean {
        const { xAxis, xKey, yKey } = this;
        const data = xKey && yKey ? this.data : [];

        if (!xAxis) {
            return false;
        }

        const isContinuousX = xAxis.scale instanceof ContinuousScale;

        this.xData = data.map(datum => datum[xKey]);
        this.yData = data.map(datum => datum[yKey]);

        this.xDomain = isContinuousX ? this.fixNumericExtent(numericExtent(this.xData), 'x') : this.xData;
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

    private _fill: string = palette.fills[0];
    set fill(value: string) {
        if (this._fill !== value) {
            this._fill = value;
            this.scheduleData();
        }
    }
    get fill(): string {
        return this._fill;
    }

    private _stroke: string = palette.strokes[0];
    set stroke(value: string) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.scheduleData();
        }
    }
    get stroke(): string {
        return this._stroke;
    }

    private _strokeWidth: number = 2;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.update();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    highlightStyle: {
        fill?: string,
        stroke?: string
    } = { fill: 'yellow' };

    private highlightedNode?: Marker;

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
        const { xAxis, yAxis } = this;

        this.group.visible = this.visible;

        if (!xAxis || !yAxis) {
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
            stroke,
            marker,
            lineNode,
            strokeWidth
        } = this;

        const linePath = lineNode.path;
        const markerSize = marker.size;
        const markerFill = this.getMarkerFill();
        const markerStroke = this.getMarkerStroke();
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;

        linePath.clear();

        const groupSelectionData: GroupSelectionDatum[] = [];

        xData.forEach((xDatum, i) => {
            const yDatum = yData[i];
            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(yDatum) + yOffset;

            if (i > 0) {
                linePath.lineTo(x, y);
            } else {
                linePath.moveTo(x, y);
            }

            if (marker) {
                groupSelectionData.push({
                    seriesDatum: data[i],
                    x,
                    y,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize
                });
            }
        });

        lineNode.stroke = stroke;
        lineNode.strokeWidth = this.strokeWidth;

        this.updateGroupSelection(groupSelectionData);
    }

    private updateGroupSelection(groupSelectionData: GroupSelectionDatum[]) {
        const { marker, xKey, yKey, highlightedNode } = this;
        const Marker = marker.type;
        let { groupSelection } = this;

        // Don't update markers if the marker type is undefined, but do update when it becomes undefined.
        if (!Marker) {
            if (!groupSelection.size) {
                this.groupSelection.remove();
            }
            return;
        }

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Marker);

        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;
        const markerFormatter = marker.formatter;

        groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByClass(Marker)
            .each((node, datum) => {
                node.translationX = datum.x;
                node.translationY = datum.y;
                node.fillOpacity = marker.fillOpacity;
                node.strokeOpacity = marker.strokeOpacity;

                const isHighlightedNode = node === highlightedNode;
                const fill = isHighlightedNode && highlightFill !== undefined ? highlightFill : datum.fill;
                const stroke = isHighlightedNode && highlightStroke !== undefined ? highlightStroke : datum.stroke;
                const { strokeWidth, size } = datum;

                if (markerFormatter) {
                    const style = markerFormatter({
                        datum: datum.seriesDatum,
                        xKey,
                        yKey,
                        fill,
                        stroke,
                        strokeWidth,
                        size,
                        highlighted: isHighlightedNode
                    });
                    node.fill = style.fill;
                    node.stroke = style.stroke;
                    node.strokeWidth = style.strokeWidth;
                    node.size = style.size;
                } else {
                    node.fill = fill;
                    node.stroke = stroke;
                    node.strokeWidth = strokeWidth;
                    node.size = size;
                }

                node.visible = marker.enabled && node.size > 0;
            });

        this.groupSelection = groupSelection;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        const { xKey, yKey } = this;

        if (!xKey || !yKey) {
            return '';
        }

        const { xName, yName, fill: color, title, tooltipRenderer } = this;

        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey,
                xName,
                yKey,
                yName,
                title,
                color,
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleString = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xKey];
            const yValue = seriesDatum[yKey];
            const xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);

            return `${titleString}<div class="content">${xString}: ${yString}</div>`;
        }
    }

    tooltipRenderer?: (params: LineTooltipRendererParams) => string;

    listSeriesItems(data: LegendDatum[]): void {
        const { id, xKey, yKey, yName, title, visible, marker } = this;

        if (this.data.length && xKey && yKey) {
            data.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    type: marker.type,
                    fill: this.getMarkerFill(),
                    stroke: this.getMarkerStroke(),
                    fillOpacity: marker.fillOpacity,
                    strokeOpacity: marker.strokeOpacity
                }
            });
        }
    }

    private getMarkerFill(): string {
        return this.marker.fill || this.fill;
    }

    private getMarkerStroke(): string {
        return this.marker.stroke || this.stroke;
    }
}
