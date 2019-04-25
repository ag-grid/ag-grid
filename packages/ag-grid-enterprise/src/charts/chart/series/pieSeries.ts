import { Chart } from "../chart";
import { PolarSeries } from "./polarSeries";
import { Group } from "../../scene/group";
import { Line } from "../../scene/shape/line";
import { Text } from "../../scene/shape/text";
import { Selection } from "../../scene/selection";
import { DropShadow } from "../../scene/dropShadow";
import scaleLinear, { LinearScale } from "../../scale/linearScale";
import { normalizeAngle180, toRadians } from "../../util/angle";
import colors from "../palettes";
import { Color } from "../../util/color";
import { Sector } from "../../scene/shape/sector";
import { SeriesNodeDatum } from "./series";
import { PointerEvents } from "../../scene/node";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";

interface GroupSelectionDatum<T> extends SeriesNodeDatum<T> {
    // innerRadius: number,
    // outerRadius: number,
    radius: number, // in the [0, 1] range
    startAngle: number,
    endAngle: number,
    midAngle: number,
    midCos: number,
    midSin: number,

    fillStyle: string | null,
    strokeStyle: string | null,
    lineWidth: number,
    shadow: DropShadow | null,

    label?: {
        text: string,
        font: string,
        fillStyle: string,
        textAlign: CanvasTextAlign,
        textBaseline: CanvasTextBaseline
    },

    callout?: {
        strokeStyle: string
    }
}

enum PieSeriesNodeTag {
    Sector,
    Callout,
    Label
}

export interface PieTooltipRendererParams<D> {
    datum: D,
    angleField: Extract<keyof D, string>,
    radiusField?: Extract<keyof D, string>,
    labelField?: Extract<keyof D, string>
}

export class PieSeries<D, X = number, Y = number> extends PolarSeries<D, X, Y> {

    private radiusScale: LinearScale<number> = scaleLinear();

    private groupSelection: Selection<Group, Group, GroupSelectionDatum<D>, any> = Selection.select(this.group).selectAll<Group>();

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: GroupSelectionDatum<D>[] = [];

    /**
     * `null` means make the callout color the same as {@link strokeStyle}.
     */
    calloutColor: string | null = null;
    calloutWidth: number = 2;
    calloutLength: number = 10;
    calloutPadding: number = 3;

    labelFont: string = '12px Tahoma';
    labelColor: string = 'black';
    labelRotation: number = 0;
    labelMinAngle: number = 20; // in degrees

    private titleNode = new Text();

    constructor() {
        super();

        const title = this.titleNode;
        title.pointerEvents = PointerEvents.None;
        title.textAlign = 'center';
        title.textBaseline = 'bottom';
        title.font = 'bold 12px Tahoma';
        this.group.appendChild(title);
    }

    set chart(chart: Chart<D, X, Y> | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): Chart<D, X, Y> | null {
        return this._chart;
    }

    /**
     * The name of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    private _angleField: Extract<keyof D, string> | undefined = undefined;
    set angleField(value: Extract<keyof D, string> | undefined) {
        if (this._angleField !== value) {
            this._angleField = value;
            this.scheduleData();
        }
    }
    get angleField(): Extract<keyof D, string> | undefined {
        return this._angleField;
    }

    /**
     * The name of the numeric field to use to determine the radii of pie slices.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    private _radiusField: Extract<keyof D, string> | undefined = undefined;
    set radiusField(value: Extract<keyof D, string> | undefined) {
        if (this._radiusField !== value) {
            this._radiusField = value;
            this.scheduleData();
        }
    }
    get radiusField(): Extract<keyof D, string> | undefined {
        return this._radiusField;
    }

    /**
     * The value of the label field is supposed to be a string.
     * If it isn't, it will be coerced to a string value.
     */
    private _labelField: Extract<keyof D, string> | undefined = undefined;
    set labelField(value: Extract<keyof D, string> | undefined) {
        if (this._labelField !== value) {
            this._labelField = value;
            this.scheduleData();
        }
    }
    get labelField(): Extract<keyof D, string> | undefined {
        return this._labelField;
    }

    private _label: boolean = true;
    set label(value: boolean) {
        if (this._label !== value) {
            this._label = value;
            this.scheduleData();
        }
    }
    get label(): boolean {
        return this._label;
    }

    private _colors: string[] = colors;
    set colors(values: string[]) {
        this._colors = values;
        this.strokeColors = values.map(color => Color.fromHexString(color).darker().toHexString());
        this.scheduleData();
    }
    get colors(): string[] {
        return this._colors;
    }

    private strokeColors = colors.map(color => Color.fromHexString(color).darker().toHexString());

    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.group.visible = value;
        }
    }
    get visible(): boolean {
        return this._visible;
    }

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
            this.scheduleLayout();
        }
    }
    get innerRadiusOffset(): number {
        return this._innerRadiusOffset;
    }

    /**
     * The stroke style to use for all pie sectors.
     * `null` value here doesn't mean invisible stroke, as it normally would
     * (see `Shape.strokeStyle` comments), it means derive stroke colors from fill
     * colors by darkening them. To make the stroke appear invisible use the same
     * color as the background of the chart (such as 'white').
     */
    strokeStyle: string | null = null;
    lineWidth: number = 2;
    shadow: DropShadow | null = null;

    private angleScale: LinearScale<number> = (() => {
        const scale = scaleLinear();
        // Each slice is a ratio of the whole, where all ratios add up to 1.
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
        return scale;
    })();

    getDomainX(): [number, number] {
        return this.angleScale.domain as [number, number];
    }

    getDomainY(): [number, number] {
        return this.radiusScale.domain as [number, number];
    }

    minOuterRadius = 15;

    processData(): boolean {
        const data = this.data as any[];

        const angleData: number[] = data.map(datum => +datum[this.angleField] || 0);
        const angleDataTotal = angleData.reduce((a, b) => a + b, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        const angleDataRatios = (() => {
            let sum = 0;
            return angleData.map(datum => sum += datum / angleDataTotal);
        })();

        const labelField = this.label && this.labelField;
        let labelData: string[] = [];
        if (labelField) {
            labelData = data.map(datum => String(datum[labelField]));
        }

        const radiusField = this.radiusField;
        let radiusData: number[] = [];
        if (radiusField) {
            radiusData = data.map(datum => Math.abs(datum[radiusField]));
            const maxDatum = Math.max(...radiusData);
            radiusData.forEach((value, index, array) => array[index] = value / maxDatum);
        }

        const angleScale = this.angleScale;

        const labelFont = this.labelFont;
        const labelColor = this.labelColor;

        const groupSelectionData = this.groupSelectionData;
        groupSelectionData.length = 0;

        const rotation = toRadians(this.rotation);
        const colors = this.colors;
        const strokeColor = this.strokeStyle;
        const strokeColors = this.strokeColors;
        const calloutColor = this.calloutColor;
        const halfPi = Math.PI / 2;

        let datumIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce((start, end) => {
            const radius = radiusField ? radiusData[datumIndex] : 1;
            const startAngle = angleScale.convert(start + rotation);
            const endAngle = angleScale.convert(end + rotation);

            const midAngle = (startAngle + endAngle) / 2;
            const span = Math.abs(endAngle - startAngle);
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);

            const labelMinAngle = toRadians(this.labelMinAngle);
            const labelVisible = labelField && span > labelMinAngle;
            const strokeStyle = strokeColor ? strokeColor : strokeColors[datumIndex % strokeColors.length];
            const calloutStrokeStyle = calloutColor ? calloutColor : strokeStyle;

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

                fillStyle: colors[datumIndex % colors.length],
                strokeStyle,
                lineWidth: this.lineWidth,
                shadow: this.shadow,

                label: labelVisible ? {
                    text: labelData[datumIndex],
                    font: labelFont,
                    fillStyle: labelColor,
                    textAlign,
                    textBaseline
                } : undefined,

                callout: labelVisible ? {
                    strokeStyle: calloutStrokeStyle
                } : undefined
            });

            datumIndex++;

            return end;
        }, 0);

        return true;
    }

    update(): void {
        const chart = this.chart;

        if (!chart || chart.dataPending || chart.layoutPending) {
            return;
        }

        const outerRadiusOffset = this.outerRadiusOffset;
        const innerRadiusOffset = this.innerRadiusOffset;
        const radiusScale = this.radiusScale;
        radiusScale.range = [0, this.radius];

        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;

        this.titleNode.translationY = -this.radius - outerRadiusOffset - 2;
        this.titleNode.text = this.title;

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
            .each((sector, datum) => {
                const radius = radiusScale.convert(datum.radius);
                const outerRadius = radius + outerRadiusOffset;
                if (minOuterRadius > outerRadius) {
                    minOuterRadius = outerRadius;
                }
                outerRadii.push(outerRadius);

                sector.outerRadius = outerRadius;
                sector.innerRadius = Math.max(0, innerRadiusOffset ? radius + innerRadiusOffset : 0);
                sector.startAngle = datum.startAngle;
                sector.endAngle = datum.endAngle;
                sector.fillStyle = datum.fillStyle;
                sector.strokeStyle = datum.strokeStyle;
                sector.shadow = datum.shadow;
                sector.lineWidth = datum.lineWidth;
                sector.lineJoin = 'round';
            });

        this.visible = minOuterRadius >= this.minOuterRadius;

        const calloutLength = this.calloutLength;
        groupSelection.selectByTag<Line>(PieSeriesNodeTag.Callout)
            .each((line, datum, i) => {
                const callout = datum.callout;

                if (callout) {
                    const outerRadius = outerRadii[i];

                    line.lineWidth = this.calloutWidth;
                    line.strokeStyle = callout.strokeStyle;
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

                    text.font = label.font;
                    text.text = label.text;
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                    text.fillStyle = label.fillStyle;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                } else {
                    text.fillStyle = null;
                }
            });

        this.groupSelection = groupSelection;
    }

    getTooltipHtml(nodeDatum: GroupSelectionDatum<D>): string {
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
            const label = this.labelField ? `${nodeDatum.seriesDatum[this.labelField]}: ` : '';
            const value = nodeDatum.seriesDatum[angleField];
            const formattedValue = typeof(value) === 'number' ? toFixed(value) : value.toString();
            html = `${label}${formattedValue}`;
        }
        return html;
    }

    tooltipRenderer?: (params: PieTooltipRendererParams<D>) => string;

    provideLegendData(data: LegendDatum[]): void {
        const labelField = this.labelField;
        if (this.data.length && labelField) {
            this.data.forEach((datum, index) => {
                data.push({
                    id: this.id,
                    tag: index,
                    name: String(datum[labelField]),
                    marker: {
                        fillStyle: this.colors[index % this.colors.length],
                        strokeStyle: this.strokeColors[index % this.strokeColors.length]
                    },
                    enabled: this.visible
                });
            });
        }
    }
}
