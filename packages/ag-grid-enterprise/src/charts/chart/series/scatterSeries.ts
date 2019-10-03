import { CartesianChart } from "../cartesianChart";
import { Selection } from "../../scene/selection";
import { Group } from "../../scene/group";
import { Arc, ArcType } from "../../scene/shape/arc";
import palette from "../palettes";
import { Series, SeriesNodeDatum } from "./series";
import { numericExtent } from "../../util/array";
import { Color } from "../../util/color";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { Shape } from "../../scene/shape/shape";
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
    radiusField?: string;
    labelField?: string;
    xFieldName: string;
    yFieldName: string;
    radiusFieldName?: string;
    labelFieldName?: string;
    title?: string;
    color?: string;
}

export class ScatterSeries extends Series<CartesianChart> {

    static className = 'ScatterSeries';

    private domainX: number[] = [];
    private domainY: number[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private radiusData: number[] = [];
    private radiusScale = linearScale();

    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    set chart(chart: CartesianChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleData();
        }
    }
    get chart(): CartesianChart | undefined {
        return this._chart;
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

    private _radiusField?: string;
    set radiusField(value: string | undefined) {
        if (this._radiusField !== value) {
            this._radiusField = value;
            this.radiusData = [];
            this.scheduleData();
        }
    }
    get radiusField(): string | undefined {
        return this._radiusField;
    }

    private _labelField?: string;
    set labelField(value: string | undefined) {
        if (this._labelField !== value) {
            this._labelField = value;
            this.scheduleData();
        }
    }
    get labelField(): string | undefined {
        return this._labelField;
    }

    xFieldName: string = 'X';
    yFieldName: string = 'Y';
    radiusFieldName?: string = 'Radius';
    labelFieldName?: string = 'Label';

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
        const { 
            chart,
            xField,
            yField,
            radiusField,
            markerSize,
            minMarkerSize,
         } = this;

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(xField && yField)) {
            this._data = [];
        }
        
        this.xData = this.data.map(d => d[xField]);
        this.yData = this.data.map(d => d[yField]);

        if (radiusField) {
            this.radiusData = this.data.map(d => d[radiusField]);
        }
        else {
            this.radiusData = [];
        }

        this.radiusScale.domain = numericExtent(this.radiusData) || [ 1, 1 ];
        this.radiusScale.range = [ minMarkerSize / 2, markerSize / 2 ];
        this.domainX = this.calculateDomain(this.xData);
        this.domainY = this.calculateDomain(this.yData);

        return true;
    }

    private calculateDomain(data: any[]): [number, number] {
        const domain = numericExtent(data) || [0, 1];
        const [ min, max ] = domain;
        
        if (min === max) {
            domain[0] = min - 1;
            domain[1] = max + 1;
        }

        return domain;
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

        const { xAxis, yAxis } = chart;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;

        const {
            data,
            xData,
            yData,
            radiusData,
            radiusScale,
            fill,
            stroke,
            fillOpacity,
            strokeOpacity,
            markerStrokeWidth,
            markerSize,
            highlightedNode
        } = this;

        const groupSelectionData: GroupSelectionDatum[] = xData.map((xDatum, i) => ({
            seriesDatum: data[i],
            x: xScale.convert(xDatum) + xOffset,
            y: yScale.convert(yData[i]) + yOffset,
            fill,
            stroke,
            strokeWidth: markerStrokeWidth,
            radius: radiusData.length ? radiusScale.convert(radiusData[i]) : markerSize / 2,
        }));

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(arc => arc.type = ArcType.Chord);

        const groupSelection = updateGroups.merge(enterGroups);
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;

        groupSelection.selectByClass(Arc)
            .each((arc, datum) => {
                arc.centerX = datum.x;
                arc.centerY = datum.y;
                arc.radiusX = arc.radiusY = datum.radius;
                arc.fill = arc === highlightedNode && highlightFill !== undefined ? highlightFill : datum.fill;
                arc.stroke = arc === highlightedNode && highlightStroke !== undefined ? highlightStroke : datum.stroke;
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
        const {
            xField,
            yField,
            radiusField,
            labelField,
            xFieldName,
            yFieldName,
            radiusFieldName,
            labelFieldName,
            fill: color
         } = this;

        let html: string = '';

        if (!xField || !yField) {
            return html;
        }

        const title = this.title;
        
        if (this.tooltipRenderer && this.xField) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xField,
                yField,
                radiusField,
                labelField,
                xFieldName,
                yFieldName,
                radiusFieldName,
                labelFieldName,
                title,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            const titleHtml = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xField];
            const yValue = seriesDatum[yField];
            let fieldString = `<b>${xFieldName}</b>: ${toFixed(xValue)}<br><b>${yFieldName}</b>: ${toFixed(yValue)}`;

            if (radiusField) {
                fieldString += `<br><b>${radiusFieldName}</b>: ${seriesDatum[radiusField]}`;
            }

            if (labelField) {
                fieldString = `<b>${labelFieldName}</b>: ${seriesDatum[labelField]}<br>` + fieldString;
            }

            html = `${titleHtml}<div class="content">${fieldString}</div>`;
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
