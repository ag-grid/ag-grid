import { Group } from "../../scene/group";
import { Line } from "../../scene/shape/line";
import { Text } from "../../scene/shape/text";
import { Selection } from "../../scene/selection";
import { DropShadow } from "../../scene/dropShadow";
import scaleLinear, { LinearScale } from "../../scale/linearScale";
import { normalizeAngle180, toRadians } from "../../util/angle";
import palette from "../palettes";
import { Color } from "../../util/color";
import { Sector } from "../../scene/shape/sector";
import { Series, SeriesNodeDatum } from "./series";
import { PointerEvents } from "../../scene/node";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";
import { PolarChart } from "../polarChart";

interface GroupSelectionDatum extends SeriesNodeDatum {
    radius: number, // in the [0, 1] range
    startAngle: number,
    endAngle: number,
    midAngle: number,
    midCos: number,
    midSin: number,

    label?: {
        text: string,
        textAlign: CanvasTextAlign,
        textBaseline: CanvasTextBaseline
    }
}

enum PieSeriesNodeTag {
    Sector,
    Callout,
    Label
}

export interface PieTooltipRendererParams {
    datum: any,
    angleField: string,
    radiusField?: string,
    labelField?: string
}

export class PieSeries extends Series<PolarChart> {
    private titleNode = new Text();
    private radiusScale: LinearScale<number> = scaleLinear();
    private groupSelection: Selection<Group, Group, GroupSelectionDatum, any> = Selection.select(this.group).selectAll<Group>();

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: GroupSelectionDatum[] = [];

    protected readonly enabled: boolean[] = [];

    private angleScale: LinearScale<number> = (() => {
        const scale = scaleLinear();
        // Each slice is a ratio of the whole, where all ratios add up to 1.
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
        return scale;
    })();

    constructor() {
        super();

        const title = this.titleNode;
        title.pointerEvents = PointerEvents.None;
        title.fillStyle = this.labelColor;
        title.textAlign = 'center';
        title.textBaseline = 'bottom';

        this.group.appendChild(title);
    }

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

    /**
     * `null` means make the callout color the same as {@link strokeStyle}.
     */
    private _calloutColors: string[] = palette.strokes;
    set calloutColors(value: string[]) {
        if (this._calloutColors !== value) {
            this._calloutColors = value;
            this.update();
        }
    }
    get calloutColors(): string[] {
        return this._calloutColors;
    }

    private _calloutWidth: number = 2;
    set calloutWidth(value: number) {
        if (this._calloutWidth !== value) {
            this._calloutWidth = value;
            this.update();
        }
    }
    get calloutWidth(): number {
        return this._calloutWidth;
    }

    private _calloutLength: number = 10;
    set calloutLength(value: number) {
        if (this._calloutLength !== value) {
            this._calloutLength = value;
            this.update();
        }
    }
    get calloutLength(): number {
        return this._calloutLength;
    }

    private _calloutPadding: number = 3;
    set calloutPadding(value: number) {
        if (this._calloutPadding !== value) {
            this._calloutPadding = value;
            this.update();
        }
    }
    get calloutPadding(): number {
        return this._calloutPadding;
    }

    private _labelFont: string = '12px Verdana, sans-serif';
    set labelFont(value: string) {
        if (this._labelFont !== value) {
            this._labelFont = value;
            this.update();
        }
    }
    get labelFont(): string {
        return this._labelFont;
    }

    private _labelColor: string = 'black';
    set labelColor(value: string) {
        if (this._labelColor !== value) {
            this._labelColor = value;
            this.update();
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

    set chart(chart: PolarChart | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): PolarChart | null {
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

    private _lineWidth: number = 1;
    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.update();
        }
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    private _shadow: DropShadow | null = null;
    set shadow(value: DropShadow | null) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.update();
        }
    }
    get shadow(): DropShadow | null {
        return this._shadow;
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
            const startAngle = angleScale.convert(start + rotation);
            const endAngle = angleScale.convert(end + rotation);

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
                seriesDatum: data[datumIndex],
                radius,
                startAngle,
                endAngle,
                midAngle: normalizeAngle180(midAngle),
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
        const calloutColors = this.calloutColors;

        const outerRadiusOffset = this.outerRadiusOffset;
        const innerRadiusOffset = this.innerRadiusOffset;
        const radiusScale = this.radiusScale;
        radiusScale.range = [0, chart.radius];

        this.group.translationX = chart.centerX;
        this.group.translationY = chart.centerY;

        const title = this.titleNode;
        title.visible = this.titleEnabled;
        title.translationY = -chart.radius - outerRadiusOffset - 2;
        title.text = this.title;
        title.fillStyle = this.labelColor;
        title.font = this.titleFont;

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

        groupSelection.selectByTag<Sector>(PieSeriesNodeTag.Sector)
            .each((sector, datum, index) => {
                const radius = radiusScale.convert(datum.radius);
                const outerRadius = Math.max(0, radius + outerRadiusOffset);
                if (minOuterRadius > outerRadius) {
                    minOuterRadius = outerRadius;
                }
                outerRadii.push(outerRadius);

                sector.outerRadius = outerRadius;
                sector.innerRadius = Math.max(0, innerRadiusOffset ? radius + innerRadiusOffset : 0);
                sector.startAngle = datum.startAngle;
                sector.endAngle = datum.endAngle;
                sector.fillStyle = fills[index % fills.length];
                sector.strokeStyle = strokes[index % strokes.length];
                sector.shadow = this.shadow;
                sector.lineWidth = this.lineWidth;
                sector.lineJoin = 'round';
            });

        const calloutLength = this.calloutLength;
        groupSelection.selectByTag<Line>(PieSeriesNodeTag.Callout)
            .each((line, datum, index) => {
                if (datum.label) {
                    const outerRadius = outerRadii[index];

                    line.lineWidth = this.calloutWidth;
                    line.strokeStyle = calloutColors[index % calloutColors.length];
                    line.x1 = datum.midCos * outerRadius;
                    line.y1 = datum.midSin * outerRadius;
                    line.x2 = datum.midCos * (outerRadius + calloutLength);
                    line.y2 = datum.midSin * (outerRadius + calloutLength);
                } else {
                    line.strokeStyle = null;
                }
            });

        const calloutPadding = this.calloutPadding;
        groupSelection.selectByTag<Text>(PieSeriesNodeTag.Label)
            .each((text, datum, i) => {
                const label = datum.label;

                if (label) {
                    const outerRadius = outerRadii[i];
                    const labelRadius = outerRadius + calloutLength + calloutPadding;

                    text.font = this.labelFont;
                    text.text = label.text;
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                    text.fillStyle = this.labelColor;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                } else {
                    text.fillStyle = null;
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

        if (this.tooltipRenderer) {
            html = this.tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                angleField,
                radiusField: this.radiusField,
                labelField: this.labelField
            });
        } else {
            const title = this.title ? this.title + '<br>' : '';
            const label = this.labelField ? `${nodeDatum.seriesDatum[this.labelField]}: ` : '';
            const value = nodeDatum.seriesDatum[angleField];
            const formattedValue = typeof(value) === 'number' ? toFixed(value) : value.toString();
            html = `${title}${label}${formattedValue}`;
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
                        fillStyle: fills[index % fills.length],
                        strokeStyle: strokes[index % strokes.length]
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
