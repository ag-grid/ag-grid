import { Group } from "../../scene/group";
import { Line } from "../../scene/shape/line";
import { Text } from "../../scene/shape/text";
import { Selection } from "../../scene/selection";
import { DropShadow } from "../../scene/dropShadow";
import scaleLinear, { LinearScale } from "../../scale/linearScale";
import { normalizeAngle180, toRadians } from "../../util/angle";
import palette from "../palettes";
import { Sector } from "../../scene/shape/sector";
import { Series, SeriesNodeDatum } from "./series";
import { PointerEvents } from "../../scene/node";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { PolarChart } from "../polarChart";
import { Caption } from "../../caption";
import { Shape } from "../../scene/shape/shape";
import { Color } from "ag-grid-community";

interface GroupSelectionDatum extends SeriesNodeDatum {
    index: number;
    radius: number; // in the [0, 1] range
    startAngle: number;
    endAngle: number;
    midAngle: number;
    midCos: number;
    midSin: number;

    label?: {
        text: string,
        textAlign: CanvasTextAlign,
        textBaseline: CanvasTextBaseline
    };
}

enum PieSeriesNodeTag {
    Sector,
    Callout,
    Label
}

export interface PieTooltipRendererParams {
    datum: any;
    angleField: string;
    radiusField?: string;
    labelField?: string;
    title?: string;
    color?: string;
}

export class PieSeries extends Series<PolarChart> {

    static className = 'PieSeries';

    private radiusScale: LinearScale<number> = scaleLinear();
    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: GroupSelectionDatum[] = [];

    readonly enabled: boolean[] = [];

    private angleScale: LinearScale<number> = (() => {
        const scale = scaleLinear();
        // Each slice is a ratio of the whole, where all ratios add up to 1.
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
        return scale;
    })();

    set data(data: any[]) {
        this._data = data;

        const enabled = this.enabled;
        enabled.length = data.length;
        for (let i = 0, ln = data.length; i < ln; i++) {
            enabled[i] = true;
        }

        this.scheduleData();
    }
    get data(): any[] {
        return this._data;
    }

    private _title: Caption | undefined = undefined;
    set title(value: Caption | undefined) {
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                oldTitle.onLayoutChange = undefined;
                this.group.removeChild(oldTitle.node);
            }
            if (value) {
                value.node.textBaseline = 'bottom';
                value.onLayoutChange = () => this.scheduleLayout();
                this.group.appendChild(value.node);
            }
            this._title = value;
            this.scheduleLayout();
        }
    }
    get title(): Caption | undefined {
        return this._title;
    }

    /**
     * `null` means make the callout color the same as {@link strokeStyle}.
     */
    private _calloutColors: string[] = palette.strokes;
    set calloutColors(value: string[]) {
        if (this._calloutColors !== value) {
            this._calloutColors = value;
            this.scheduleLayout();
        }
    }
    get calloutColors(): string[] {
        return this._calloutColors;
    }

    private _calloutStrokeWidth: number = 1;
    set calloutStrokeWidth(value: number) {
        if (this._calloutStrokeWidth !== value) {
            this._calloutStrokeWidth = value;
            this.scheduleLayout();
        }
    }
    get calloutStrokeWidth(): number {
        return this._calloutStrokeWidth;
    }

    private _calloutLength: number = 10;
    set calloutLength(value: number) {
        if (this._calloutLength !== value) {
            this._calloutLength = value;
            this.scheduleLayout();
        }
    }
    get calloutLength(): number {
        return this._calloutLength;
    }

    private _labelOffset: number = 3; // from the callout line
    set labelOffset(value: number) {
        if (this._labelOffset !== value) {
            this._labelOffset = value;
            this.scheduleLayout();
        }
    }
    get labelOffset(): number {
        return this._labelOffset;
    }

    private _labelFontStyle: string | undefined = undefined;
    set labelFontStyle(value: string | undefined) {
        if (this._labelFontStyle !== value) {
            this._labelFontStyle = value;
            this.scheduleLayout();
        }
    }
    get labelFontStyle(): string | undefined {
        return this._labelFontStyle;
    }

    private _labelFontWeight: string | undefined = undefined;
    set labelFontWeight(value: string | undefined) {
        if (this._labelFontWeight !== value) {
            this._labelFontWeight = value;
            this.scheduleLayout();
        }
    }
    get labelFontWeight(): string | undefined {
        return this._labelFontWeight;
    }

    private _labelFontSize: number = 12;
    set labelFontSize(value: number) {
        if (this._labelFontSize !== value) {
            this._labelFontSize = value;
            this.scheduleLayout();
        }
    }
    get labelFontSize(): number {
        return this._labelFontSize;
    }

    private _labelFontFamily: string = 'Verdana, sans-serif';
    set labelFontFamily(value: string) {
        if (this._labelFontFamily !== value) {
            this._labelFontFamily = value;
            this.scheduleLayout();
        }
    }
    get labelFontFamily(): string {
        return this._labelFontFamily;
    }

    private _labelColor: string = 'black';
    set labelColor(value: string) {
        if (this._labelColor !== value) {
            this._labelColor = value;
            this.scheduleLayout();
        }
    }
    get labelColor(): string {
        return this._labelColor;
    }

    private _labelMinAngle: number = 20; // in degrees
    set labelMinAngle(value: number) {
        if (this._labelMinAngle !== value) {
            this._labelMinAngle = value;
            this.scheduleData();
        }
    }
    get labelMinAngle(): number {
        return this._labelMinAngle;
    }

    set chart(chart: PolarChart | undefined) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.scheduleLayout();
        }
    }
    get chart(): PolarChart | undefined {
        return this._chart;
    }

    /**
     * The name of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    private _angleField: string = '';
    set angleField(value: string) {
        if (this._angleField !== value) {
            this._angleField = value;
            this.scheduleData();
        }
    }
    get angleField(): string {
        return this._angleField;
    }

    /**
     * The name of the numeric field to use to determine the radii of pie slices.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii. To prevent confusing visuals, this config only works
     * if {@link innerRadiusOffset} is zero.
     */
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

    /**
     * The value of the label field is supposed to be a string.
     * If it isn't, it will be coerced to a string value.
     */
    private _labelField: string = '';
    set labelField(value: string) {
        if (this._labelField !== value) {
            this._labelField = value;
            this.scheduleData();
        }
    }
    get labelField(): string {
        return this._labelField;
    }

    private _labelEnabled: boolean = true;
    set labelEnabled(value: boolean) {
        if (this._labelEnabled !== value) {
            this._labelEnabled = value;
            this.scheduleData();
        }
    }
    get labelEnabled(): boolean {
        return this._labelEnabled;
    }

    private _fills: string[] = palette.fills;
    set fills(values: string[]) {
        this._fills = values;
        this.strokes = values.map(color => Color.fromString(color).darker().toHexString());
        this.scheduleData();
    }
    get fills(): string[] {
        return this._fills;
    }

    private _strokes: string[] = palette.strokes;
    set strokes(values: string[]) {
        this._strokes = values;
        this.calloutColors = values;
        this.scheduleData();
    }
    get strokes(): string[] {
        return this._strokes;
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

    /**
     * The series rotation in degrees.
     */
    private _rotation: number = 0;
    set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this.scheduleData();
        }
    }
    get rotation(): number {
        return this._rotation;
    }

    private _outerRadiusOffset: number = 0;
    set outerRadiusOffset(value: number) {
        if (this._outerRadiusOffset !== value) {
            this._outerRadiusOffset = value;
            this.scheduleLayout();
        }
    }
    get outerRadiusOffset(): number {
        return this._outerRadiusOffset;
    }

    private _innerRadiusOffset: number = 0;
    set innerRadiusOffset(value: number) {
        if (this._innerRadiusOffset !== value) {
            this._innerRadiusOffset = value;
            this.scheduleData();
        }
    }
    get innerRadiusOffset(): number {
        return this._innerRadiusOffset;
    }

    private _strokeWidth: number = 1;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.scheduleLayout();
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _shadow: DropShadow | undefined = undefined;
    set shadow(value: DropShadow | undefined) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.scheduleLayout();
        }
    }
    get shadow(): DropShadow | undefined {
        return this._shadow;
    }

    highlightStyle: {
        fill?: string,
        stroke?: string,
        centerOffset?: number
    } = {
        fill: 'yellow'
    };

    private highlightedNode?: Sector;

    highlightNode(node: Shape) {
        if (!(node instanceof Sector)) {
            return;
        }

        this.highlightedNode = node;
        this.scheduleLayout();
    }

    dehighlightNode() {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    }

    getDomainX(): [number, number] {
        return this.angleScale.domain as [number, number];
    }

    getDomainY(): [number, number] {
        return this.radiusScale.domain as [number, number];
    }

    processData(): boolean {
        const data = this.data as any[];
        const enabled = this.enabled;

        const angleData: number[] = data.map((datum, index) => enabled[index] && +datum[this.angleField] || 0);
        const angleDataTotal = angleData.reduce((a, b) => a + b, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        const angleDataRatios = (() => {
            let sum = 0;
            return angleData.map(datum => sum += datum / angleDataTotal);
        })();

        const labelField = this.labelEnabled && this.labelField;
        let labelData: string[] = [];
        if (labelField) {
            labelData = data.map(datum => String(datum[labelField]));
        }

        const radiusField = this.radiusField;
        const useRadiusField = !!radiusField && !this.innerRadiusOffset;
        let radiusData: number[] = [];
        if (useRadiusField) {
            radiusData = data.map(datum => Math.abs(datum[radiusField]));
            const maxDatum = Math.max(...radiusData);
            radiusData.forEach((value, index, array) => array[index] = value / maxDatum);
        }

        const angleScale = this.angleScale;
        const groupSelectionData = this.groupSelectionData;
        groupSelectionData.length = 0;

        const rotation = toRadians(this.rotation);
        const halfPi = Math.PI / 2;

        let datumIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce((start, end) => {
            const radius = useRadiusField ? radiusData[datumIndex] : 1;
            const startAngle = angleScale.convert(start) + rotation;
            const endAngle = angleScale.convert(end) + rotation;

            const midAngle = (startAngle + endAngle) / 2;
            const span = Math.abs(endAngle - startAngle);
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);

            const labelMinAngle = toRadians(this.labelMinAngle);
            const labelVisible = labelField && span > labelMinAngle;

            const midAngle180 = normalizeAngle180(midAngle);
            // Split the circle into quadrants like so: ⊗
            let quadrantStart = -3 * Math.PI / 4; // same as `normalizeAngle180(toRadians(-135))`
            let textAlign: CanvasTextAlign;
            let textBaseline: CanvasTextBaseline;

            if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
                textAlign = 'center';
                textBaseline = 'bottom';
            } else if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
                textAlign = 'left';
                textBaseline = 'middle';
            } else if (midAngle180 >= quadrantStart && midAngle180 < (quadrantStart += halfPi)) {
                textAlign = 'center';
                textBaseline = 'hanging';
            } else {
                textAlign = 'right';
                textBaseline = 'middle';
            }

            groupSelectionData.push({
                index: datumIndex,
                seriesDatum: data[datumIndex],
                radius,
                startAngle,
                endAngle,
                midAngle,
                midCos,
                midSin,

                label: labelVisible ? {
                    text: labelData[datumIndex],
                    textAlign,
                    textBaseline
                } : undefined
            });

            datumIndex++;

            return end;
        }, 0);

        return true;
    }

    update(): void {
        const chart = this.chart;
        const visible = this.group.visible = this.visible && this.enabled.indexOf(true) >= 0;

        if (!chart || !visible || chart.dataPending || chart.layoutPending) {
            return;
        }

        const fills = this.fills;
        const strokes = this.strokes;
        const fillOpacity = this.fillOpacity;
        const strokeOpacity = this.strokeOpacity;
        const calloutColors = this.calloutColors;

        const outerRadiusOffset = this.outerRadiusOffset;
        const innerRadiusOffset = this.innerRadiusOffset;
        const radiusScale = this.radiusScale;
        radiusScale.range = [0, chart.radius];

        this.group.translationX = chart.centerX;
        this.group.translationY = chart.centerY;

        const title = this.title;
        if (title) {
            title.node.translationY = -chart.radius - outerRadiusOffset - 2;
            title.node.visible = title.enabled;
        }

        const updateGroups = this.groupSelection.setData(this.groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Sector).each(node => node.tag = PieSeriesNodeTag.Sector);
        enterGroups.append(Line).each(node => {
            node.tag = PieSeriesNodeTag.Callout;
            node.pointerEvents = PointerEvents.None;
        });
        enterGroups.append(Text).each(node => {
            node.tag = PieSeriesNodeTag.Label;
            node.pointerEvents = PointerEvents.None;
        });

        const groupSelection = updateGroups.merge(enterGroups);

        let minOuterRadius = Infinity;
        const outerRadii: number[] = [];
        const centerOffsets: number[] = [];

        const highlightedNode = this.highlightedNode;

        groupSelection.selectByTag<Sector>(PieSeriesNodeTag.Sector)
            .each((sector, datum, index) => {
                const radius = radiusScale.convert(datum.radius);
                const outerRadius = Math.max(0, radius + outerRadiusOffset);
                if (minOuterRadius > outerRadius) {
                    minOuterRadius = outerRadius;
                }

                sector.outerRadius = outerRadius;
                sector.innerRadius = Math.max(0, innerRadiusOffset ? radius + innerRadiusOffset : 0);
                sector.startAngle = datum.startAngle;
                sector.endAngle = datum.endAngle;

                sector.fill = sector === highlightedNode && this.highlightStyle.fill !== undefined
                    ? this.highlightStyle.fill
                    : fills[index % fills.length];
                sector.stroke = sector === highlightedNode && this.highlightStyle.stroke !== undefined
                    ? this.highlightStyle.stroke
                    : strokes[index % strokes.length];
                sector.fillOpacity = fillOpacity;
                sector.strokeOpacity = strokeOpacity;
                sector.centerOffset = sector === highlightedNode && this.highlightStyle.centerOffset !== undefined
                    ? this.highlightStyle.centerOffset
                    : 0;

                sector.fillShadow = this.shadow;
                sector.strokeWidth = this.strokeWidth;
                sector.lineJoin = 'round';

                outerRadii.push(outerRadius);
                centerOffsets.push(sector.centerOffset);
            });

        const calloutLength = this.calloutLength;
        groupSelection.selectByTag<Line>(PieSeriesNodeTag.Callout)
            .each((line, datum, index) => {
                if (datum.label) {
                    const outerRadius = centerOffsets[index] + outerRadii[index];

                    line.strokeWidth = this.calloutStrokeWidth;
                    line.stroke = calloutColors[index % calloutColors.length];
                    line.x1 = datum.midCos * outerRadius;
                    line.y1 = datum.midSin * outerRadius;
                    line.x2 = datum.midCos * (outerRadius + calloutLength);
                    line.y2 = datum.midSin * (outerRadius + calloutLength);
                } else {
                    line.stroke = undefined;
                }
            });

        const labelOffset = this.labelOffset;
        groupSelection.selectByTag<Text>(PieSeriesNodeTag.Label)
            .each((text, datum, index) => {
                const label = datum.label;

                if (label) {
                    const outerRadius = outerRadii[index];
                    const labelRadius = centerOffsets[index] + outerRadius + calloutLength + labelOffset;

                    text.fontStyle = this.labelFontStyle;
                    text.fontWeight = this.labelFontWeight;
                    text.fontSize = this.labelFontSize;
                    text.fontFamily = this.labelFontFamily;
                    text.text = label.text;
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                    text.fill = this.labelColor;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                } else {
                    text.fill = undefined;
                }
            });

        this.groupSelection = groupSelection;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum): string {
        let html: string = '';
        const angleField = this.angleField;

        if (!angleField) {
            return html;
        }

        let title = this.title ? this.title.text : undefined;
        const color = this.fills[nodeDatum.index % this.fills.length];
        if (this.tooltipRenderer) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                angleField,
                radiusField: this.radiusField,
                labelField: this.labelField,
                title,
                color
            });
        } else {
            const titleStyle = `style="color: white; background-color: ${color}"`;
            title = title ? `<div class="title" ${titleStyle}>${title}</div>` : '';
            const label = this.labelField ? `${nodeDatum.seriesDatum[this.labelField]}: ` : '';
            const value = nodeDatum.seriesDatum[angleField];
            const formattedValue = typeof(value) === 'number' ? toFixed(value) : value.toString();
            html = `${title}<div class="content">${label}${formattedValue}</div>`;
        }
        return html;
    }

    tooltipRenderer?: (params: PieTooltipRendererParams) => string;

    listSeriesItems(data: LegendDatum[]): void {
        const labelField = this.labelField;
        if (this.data.length && labelField) {
            const fills = this.fills;
            const strokes = this.strokes;
            const id = this.id;

            this.data.forEach((datum, index) => {
                data.push({
                    id,
                    itemId: index,
                    enabled: this.enabled[index],
                    label: {
                        text: String(datum[labelField])
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length]
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: number, enabled: boolean): void {
        this.enabled[itemId] = enabled;
        this.scheduleData();
    }
}
