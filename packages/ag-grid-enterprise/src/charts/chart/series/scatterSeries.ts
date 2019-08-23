import { CartesianChart } from "../cartesianChart";
import ContinuousScale from "../../scale/continuousScale";
import { Selection } from "../../scene/selection";
import { Group } from "../../scene/group";
import { Arc, ArcType } from "../../scene/shape/arc";
import { numericExtent } from "../../util/array";
import palette from "../palettes";
import { Series, SeriesNodeDatum } from "./series";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
import { Color } from "ag-grid-community";
import linearScale from "../../scale/linearScale";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    radius: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
}

export interface ScatterTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
    radiusField: string;
    xFieldName: string;
    yFieldName: string;
    radiusFieldName: string;
    title?: string;
    color?: string;
}

export class ScatterSeries extends Series<CartesianChart> {

    static className = 'ScatterSeries';

    private domainX: any[] = [];
    private domainY: any[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private radiusData: number[] = [];
    private radiusScale = linearScale();

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
        return this._chart as CartesianChart;
    }

    protected _title: string = '';
    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
            this.scheduleLayout();
        }
    }
    get title(): string {
        return this._title;
    }

    protected _xField: string = '';
    set xField(value: string) {
        if (this._xField !== value) {
            this._xField = value;
            this.xData = [];
            this.scheduleData();
        }
    }
    get xField(): string {
        return this._xField;
    }

    protected _yField: string = '';
    set yField(value: string) {
        if (this._yField !== value) {
            this._yField = value;
            this.yData = [];
            this.scheduleData();
        }
    }
    get yField(): string {
        return this._yField;
    }

    private _radiusField: string = '';
    set radiusField(value: string) {
        if (this._radiusField !== value) {
            this._radiusField = value;
            this.scheduleData();
        }
    }
    get radiusField(): string {
        return this._radiusField;
    }

    xFieldName: string = 'X';
    yFieldName: string = 'Y';
    radiusFieldName: string = 'Radius';

    private _marker: boolean = false;
    set marker(value: boolean) {
        if (this._marker !== value) {
            this._marker = value;
            this.update();
        }
    }
    get marker(): boolean {
        return this._marker;
    }

    private _markerSize: number = 8;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = Math.abs(value);
            this.update();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    private _minMarkerSize: number = 4;
    set minMarkerSize(value: number) {
        if (this._minMarkerSize !== value) {
            this._minMarkerSize = value;
            this.update();
        }
    }
    get minMarkerSize(): number {
        return this._minMarkerSize;
    }

    private _markerStrokeWidth: number = 2;
    set markerStrokeWidth(value: number) {
        if (this._markerStrokeWidth !== value) {
            this._markerStrokeWidth = value;
            this.update();
        }
    }
    get markerStrokeWidth(): number {
        return this._markerStrokeWidth;
    }

    processData(): boolean {
        const chart = this.chart;
        const xField = this.xField;
        const yField = this.yField;
        const radiusField = this.radiusField;
        const markerSize = this.markerSize;
        const minMarkerSize = this.minMarkerSize;
        let data = this.data as any[];

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(xField && yField)) {
            this._data = data = [];
        }

        const xData = [] as any[];
        const yData = [] as any[];
        const radiusData = [] as number[];

        data.forEach(datum => {
            xData.push(datum[xField]);
            yData.push(datum[yField]);
            if (radiusField) {
                radiusData.push(datum[radiusField]);
            }
        });

        this.xData = xData;
        this.yData = yData;
        this.radiusData = radiusData;
        this.radiusScale.domain = numericExtent(radiusData) || [1, 1];
        this.radiusScale.range = [minMarkerSize / 2, markerSize / 2];

        const continuousX = chart.xAxis.scale instanceof ContinuousScale;
        const domainX = continuousX ? (numericExtent(this.xData) || [0, 1]) : this.xData;
        const domainY = numericExtent(this.yData) || [0, 1];

        if (continuousX) {
            const [min, max] = domainX as number[];
            if (min === max) {
                domainX[0] = min - 1;
                domainX[1] = max + 1;
            }
        }

        {
            const [min, max] = domainY as number[];
            if (min === max) {
                domainY[0] = min - 1;
                domainY[1] = max + 1;
            }
        }

        this.domainX = domainX;
        this.domainY = domainY;

        return true;
    }

    private _fill: string = palette.fills[0];
    set fill(value: string) {
        if (this._fill !== value) {
            this._fill = value;
            this.stroke = Color.fromString(value).darker().toHexString();
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

    private _fillOpacity: number = 1;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.scheduleLayout();
        }
    }
    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = 1;
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
    } = {
        fill: 'yellow'
    };

    private highlightedNode?: Arc;

    highlightNode(node: Shape) {
        if (!(node instanceof Arc)) {
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

        const xAxis = chart.xAxis;
        const yAxis = chart.yAxis;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const data = this.data;
        const xData = this.xData;
        const yData = this.yData;
        const radiusData = this.radiusData;
        const n = xData.length;
        const fill = this.fill;
        const stroke = this.stroke;
        const fillOpacity = this.fillOpacity;
        const strokeOpacity = this.strokeOpacity;
        const markerStrokeWidth = this.markerStrokeWidth;
        const markerSize = this.markerSize;

        const groupSelectionData: GroupSelectionDatum[] = [];

        for (let i = 0; i < n; i++) {
            const xDatum = xData[i];
            const yDatum = yData[i];
            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(yDatum) + yOffset;

            groupSelectionData.push({
                seriesDatum: data[i],
                x,
                y,
                fill,
                stroke,
                strokeWidth: markerStrokeWidth,
                radius: this.radiusField ? this.radiusScale.convert(radiusData[i]) : markerSize / 2
            });
        }

        // ------------------------------------------

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(arc => arc.type = ArcType.Chord);

        const highlightedNode = this.highlightedNode;
        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByClass(Arc)
            .each((arc, datum) => {
                arc.centerX = datum.x;
                arc.centerY = datum.y;
                arc.radiusX = datum.radius;
                arc.radiusY = datum.radius;
                arc.fill = arc === highlightedNode && this.highlightStyle.fill !== undefined
                    ? this.highlightStyle.fill
                    : datum.fill;
                arc.stroke = arc === highlightedNode && this.highlightStyle.stroke !== undefined
                    ? this.highlightStyle.stroke
                    : datum.stroke;
                arc.fillOpacity = fillOpacity;
                arc.strokeOpacity = strokeOpacity;
                arc.strokeWidth = datum.strokeWidth;
                arc.visible = datum.radius > 0;
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
        const xField = this.xField;
        const yField = this.yField;
        const radiusField = this.radiusField;
        const xFieldName = this.xFieldName;
        const yFieldName = this.yFieldName;
        const radiusFieldName = this.radiusFieldName;
        const color = this.fill;
        let html: string = '';

        if (!xField || !yField) {
            return html;
        }

        let title = this.title;
        if (this.tooltipRenderer && this.xField) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xField,
                yField,
                radiusField,
                xFieldName,
                yFieldName,
                radiusFieldName,
                title,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            title = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xField];
            const yValue = seriesDatum[yField];
            const xString = typeof(xValue) === 'number' ? toFixed(xValue) : String(xValue);
            const yString = typeof(yValue) === 'number' ? toFixed(yValue) : String(yValue);
            let fieldString = `<b>${xFieldName}</b>: ${xString}<br><b>${yFieldName}</b>: ${yString}`;

            if (radiusField) {
                fieldString += `<br><b>${radiusFieldName}</b>: ${seriesDatum[radiusField]}`;
            }

            html = `${title}<div class="content">${fieldString}</div>`;
            // html = `${title}<div class="content">${xField}: ${xString}<br>${yField}: ${yString}</div>`;
        }
        return html;
    }

    tooltipRenderer?: (params: ScatterTooltipRendererParams) => string;

    listSeriesItems(data: LegendDatum[]): void {
        if (this.data.length && this.xField && this.yField) {
            data.push({
                id: this.id,
                itemId: undefined,
                enabled: this.visible,
                label: {
                    text: this.title || this.yField
                },
                marker: {
                    fill: this.fill,
                    stroke: this.stroke
                }
            });
        }
    }
}
