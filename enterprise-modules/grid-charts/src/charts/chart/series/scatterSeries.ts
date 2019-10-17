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
import { ScatterTooltipRendererParams } from "../../chartOptions";
import { Marker } from "../marker/marker";

interface GroupSelectionDatum extends SeriesNodeDatum {
    x: number;
    y: number;
    size: number;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
}

export class ScatterSeries extends Series<CartesianChart> {

    static className = 'ScatterSeries';

    private domainX: number[] = [];
    private domainY: number[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private sizeData: number[] = [];
    private sizeScale = linearScale();

    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    constructor() {
        super();

        this.marker.onChange = this.update.bind(this);
        this.marker.onTypeChange = this.onMarkerTypeChange.bind(this);
    }

    onMarkerTypeChange() {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
    }

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

    private _sizeKey?: string;
    set sizeKey(value: string | undefined) {
        if (this._sizeKey !== value) {
            this._sizeKey = value;
            this.sizeData = [];
            this.scheduleData();
        }
    }
    get sizeKey(): string | undefined {
        return this._sizeKey;
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
    sizeKeyName?: string = 'Size';
    labelFieldName?: string = 'Label';

    processData(): boolean {
        const {
            chart,
            xField,
            yField,
            sizeKey,
            marker
        } = this;

        if (!(chart && chart.xAxis && chart.yAxis)) {
            return false;
        }

        if (!(xField && yField)) {
            this._data = [];
        }

        this.xData = this.data.map(d => d[xField]);
        this.yData = this.data.map(d => d[yField]);

        if (sizeKey) {
            this.sizeData = this.data.map(d => d[sizeKey]);
        }
        else {
            this.sizeData = [];
        }

        this.sizeScale.domain = numericExtent(this.sizeData) || [1, 1];
        this.domainX = this.calculateDomain(this.xData);
        this.domainY = this.calculateDomain(this.yData);

        return true;
    }

    private calculateDomain(data: any[]): [number, number] {
        const domain = numericExtent(data) || [0, 1];
        const [min, max] = domain;

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

        const { xAxis, yAxis } = chart;
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;

        const {
            data,
            xData,
            yData,
            sizeData,
            sizeScale,
            fill,
            stroke,
            marker,
            highlightedNode
        } = this;

        const Marker = marker.type;
        const markerSize = marker.size;
        const markerStrokeWidth = marker.strokeWidth;

        this.sizeScale.range = [marker.minSize / 2, marker.size / 2];

        const groupSelectionData: GroupSelectionDatum[] = xData.map((xDatum, i) => ({
            seriesDatum: data[i],
            x: xScale.convert(xDatum) + xOffset,
            y: yScale.convert(yData[i]) + yOffset,
            fill,
            stroke,
            strokeWidth: markerStrokeWidth,
            size: sizeData.length ? sizeScale.convert(sizeData[i]) : markerSize / 2,
        }));

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Marker);

        const groupSelection = updateGroups.merge(enterGroups);
        const { fill: highlightFill, stroke: highlightStroke } = this.highlightStyle;

        groupSelection.selectByClass(Marker)
            .each((node, datum) => {
                node.translationX = datum.x;
                node.translationY = datum.y;
                node.size = datum.size;
                node.fill = node === highlightedNode && highlightFill !== undefined ? highlightFill : marker.fill || datum.fill;
                node.stroke = node === highlightedNode && highlightStroke !== undefined ? highlightStroke : marker.stroke || datum.stroke;
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
        const { xField: xKey, yField: yKey } = this;

        if (!xKey || !yKey) {
            return '';
        }

        const {
            title,
            tooltipRenderer,
            xFieldName: xName,
            yFieldName: yName,
            sizeKey,
            sizeKeyName: sizeName,
            labelField: labelKey,
            labelFieldName: labelName,
            fill: color } = this;

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
            const titleHtml = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const seriesDatum = nodeDatum.seriesDatum;
            const xValue = seriesDatum[xKey];
            const yValue = seriesDatum[yKey];
            let fieldString = `<b>${xName}</b>: ${toFixed(xValue)}<br><b>${yName}</b>: ${toFixed(yValue)}`;

            if (sizeKey) {
                fieldString += `<br><b>${sizeName}</b>: ${seriesDatum[sizeKey]}`;
            }

            if (labelKey) {
                fieldString = `<b>${labelName}</b>: ${seriesDatum[labelKey]}<br>` + fieldString;
            }

            return `${titleHtml}<div class="content">${fieldString}</div>`;
        }
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
