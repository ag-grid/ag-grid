import { CartesianChart } from "../cartesianChart";
import { Path } from "../../scene/shape/path";
import ContinuousScale from "../../scale/continuousScale";
import { Selection } from "../../scene/selection";
import { Group } from "../../scene/group";
import palette from "../palettes";
import { Series, SeriesNodeDatum, CartesianTooltipRendererParams as LineTooltipRendererParams } from "./series";
import { numericExtent } from "../../util/array";
import { toFixed } from "../../util/number";
import { PointerEvents } from "../../scene/node";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Marker } from "../marker/marker";
import { SeriesMarker } from "./seriesMarker";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
}

export { LineTooltipRendererParams };

export class LineSeries extends Series<CartesianChart> {

    static className = 'LineSeries';

    private domainX: any[] = [];
    private domainY: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];

    private lineNode = new Path();

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    readonly marker = new SeriesMarker();

    constructor() {
        super();

        const lineNode = this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        this.group.append(lineNode);

        this.marker.addListener('type', this.onMarkerTypeChange.bind(this));
        this.marker.addCategoryListener('style', this.update.bind(this));
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
        const { chart, xKey, yKey } = this;
        const data = xKey && yKey ? this.data : [];

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        this.xData = data.map(datum => datum[xKey]);
        this.yData = data.map(datum => datum[yKey]);

        const isContinuousX = chart.xAxis.scale instanceof ContinuousScale;
        const domainX = isContinuousX ? (numericExtent(this.xData) || [0, 1]) : this.xData;
        const domainY = numericExtent(this.yData) || [0, 1];

        if (isContinuousX) {
            const [min, max] = domainX as number[];

            if (min === max) {
                domainX[0] = min - 1;
                domainX[1] = max + 1;
            }
        }

        const [min, max] = domainY;

        if (min === max) {
            domainY[0] = min - 1;
            domainY[1] = max + 1;
        }

        this.domainX = domainX;
        this.domainY = domainY;

        return true;
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

    private _strokeWidth: number = 3;
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
    } = {
            fill: 'yellow'
        };

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
        const chart = this.chart;
        const visible = this.group.visible = this.visible;

        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }

        const { xAxis: { scale: xScale }, yAxis: { scale: yScale } } = chart;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;

        const {
            data,
            xData,
            yData,
            fill,
            stroke,
            marker,
            lineNode
        } = this;

        const linePath = lineNode.path;
        const markerSize = marker.size;
        const markerFill = fill;
        const markerStroke = stroke;
        const markerStrokeWidth = marker.strokeWidth;

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
                    strokeWidth: markerStrokeWidth || 1,
                    size: markerSize
                });
            }
        });

        lineNode.stroke = stroke;
        lineNode.strokeWidth = this.strokeWidth;

        this.updateGroupSelection(groupSelectionData);
    }

    private updateGroupSelection(groupSelectionData: GroupSelectionDatum[]) {
        const { marker } = this;
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

        const highlightedNode = this.highlightedNode;
        groupSelection = updateGroups.merge(enterGroups);
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;

        groupSelection.selectByClass(Marker)
            .each((node, datum) => {
                node.translationX = datum.x;
                node.translationY = datum.y;
                node.size = datum.size;
                node.fill = node === highlightedNode && highlightFill !== undefined ? highlightFill : datum.fill;
                node.stroke = node === highlightedNode && highlightStroke !== undefined ? highlightStroke : datum.stroke;
                node.fillOpacity = marker.fillOpacity;
                node.strokeOpacity = marker.strokeOpacity;
                node.strokeWidth = datum.strokeWidth;
                node.visible = marker.enabled && datum.size > 0;
            });

        this.groupSelection = groupSelection;
    }

    getDomainX(): any[] {
        return this.domainX;
    }

    getDomainY(): any[] {
        return this.domainY;
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
        if (this.data.length && this.xKey && this.yKey) {
            const { marker } = this;
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.yKey
                },
                marker: {
                    type: marker.type,
                    fill: this.fill,
                    stroke: this.stroke,
                    fillOpacity: marker.fillOpacity,
                    strokeOpacity: marker.strokeOpacity
                }
            });
        }
    }
}
