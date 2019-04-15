import { Chart } from "../chart";
import { PolarSeries } from "./polarSeries";
import { Group } from "../../scene/group";
import { Line } from "../../scene/shape/line";
import { Text } from "../../scene/shape/text";
import { Selection } from "../../scene/selection";
import { DropShadow } from "../../scene/dropShadow";
import scaleLinear, { LinearScale } from "../../scale/linearScale";
import { normalizeAngle180, toRadians } from "../../util/angle";
import colors from "../colors";
import { Color } from "../../util/color";
import { Sector } from "../../scene/shape/sector";
import { SeriesNodeDatum } from "./series";
import { PointerEvents } from "../../scene/node";
import { toFixed } from "../../util/number";
import { LegendDatum } from "../legend";

interface GroupSelectionDatum<T> extends SeriesNodeDatum<T> {
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    midAngle: number,

    fillStyle: string | null,
    strokeStyle: string | null,
    lineWidth: number,
    shadow: DropShadow | null,

    label?: {
        text: string,
        font: string,
        fillStyle: string,
        x: number,
        y: number
    },

    callout?: {
        start: {
            x: number,
            y: number
        },
        end: {
            x: number,
            y: number
        },
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
    _angleField: Extract<keyof D, string> | undefined = undefined;
    set angleField(value: Extract<keyof D, string> | undefined) {
        if (this._angleField !== value) {
            this._angleField = value;
            this.scheduleLayout();
        }
    }
    get angleField(): Extract<keyof D, string> | undefined {
        return this._angleField;
    }

    /**
     * The name of the numeric field to use to determine the radii of pie slices.
     */
    private _radiusField: Extract<keyof D, string> | undefined = undefined;
    set radiusField(value: Extract<keyof D, string> | undefined) {
        if (this._radiusField !== value) {
            this._radiusField = value;
            this.scheduleLayout();
        }
    }
    get radiusField(): Extract<keyof D, string> | undefined {
        return this._radiusField;
    }

    /**
     * The value of the label field is supposed to be a string.
     * If it isn't, it will be coerced to a string value.
     */
    _labelField: Extract<keyof D, string> | undefined = undefined;
    set labelField(value: Extract<keyof D, string> | undefined) {
        if (this._labelField !== value) {
            this._labelField = value;
            this.scheduleLayout();
        }
    }
    get labelField(): Extract<keyof D, string> | undefined {
        return this._labelField;
    }

    _label: boolean = true;
    set label(value: boolean) {
        if (this._label !== value) {
            this._label = value;
            this.scheduleLayout();
        }
    }
    get label(): boolean {
        return this._label;
    }

    labelFont: string = '12px Tahoma';
    labelColor: string = 'black';
    labelRotation: number = 0;
    labelMinAngle: number = 20; // in degrees

    /**
     * `null` means make the callout color the same as {@link strokeStyle}.
     */
    calloutColor: string | null = null;
    calloutWidth: number = 2;
    calloutLength: number = 10;
    calloutPadding: number = 3;

    colors: string[] = colors;
    private strokeColors = colors.map(color => Color.fromHexString(color).darker().toHexString());

    set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this.scheduleLayout();
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

    private radiusScale: LinearScale<number> = scaleLinear();

    private groupSelection: Selection<Group, Group, GroupSelectionDatum<D>, any> = Selection.select(this.group).selectAll<Group>();

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: GroupSelectionDatum<D>[] = [];

    getDomainX(): [number, number] {
        return this.angleScale.domain as [number, number];
    }

    getDomainY(): [number, number] {
        return this.radiusScale.domain as [number, number];
    }

    processData(): boolean {
        const data = this.data as any[];
        const centerX = this.centerX;
        const centerY = this.centerY;

        this.group.translationX = centerX;
        this.group.translationY = centerY;

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
            radiusData = data.map(datum => datum[radiusField]);
            this.radiusScale.domain = [0, Math.max(...radiusData, 1)];
            this.radiusScale.range = [0, this.radius];
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

        let datumIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce((start, end) => {
            const radius = radiusField ? this.radiusScale.convert(radiusData[datumIndex]) : this.radius;
            const outerRadius = Math.max(10, radius + this.outerRadiusOffset);
            const innerRadius = Math.max(0, this.innerRadiusOffset ? radius + this.innerRadiusOffset : 0);
            const startAngle = angleScale.convert(start + rotation);
            const endAngle = angleScale.convert(end + rotation);

            const midAngle = (startAngle + endAngle) / 2;
            const span = Math.abs(endAngle - startAngle);
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);
            const calloutLength = this.calloutLength;

            const labelMinAngle = toRadians(this.labelMinAngle);
            const labelVisible = labelField && span > labelMinAngle;
            const strokeStyle = strokeColor ? strokeColor : strokeColors[datumIndex % strokeColors.length];
            const calloutStrokeStyle = calloutColor ? calloutColor : strokeStyle;

            groupSelectionData.push({
                seriesDatum: data[datumIndex],
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                midAngle: normalizeAngle180(midAngle),

                fillStyle: colors[datumIndex % colors.length],
                strokeStyle,
                lineWidth: this.lineWidth,
                shadow: this.shadow,

                label: labelVisible ? {
                    text: labelData[datumIndex],
                    font: labelFont,
                    fillStyle: labelColor,
                    x: midCos * (outerRadius + calloutLength + this.calloutPadding),
                    y: midSin * (outerRadius + calloutLength + this.calloutPadding)
                } : undefined,

                callout: labelVisible ? {
                    start: {
                        x: midCos * outerRadius,
                        y: midSin * outerRadius
                    },
                    end: {
                        x: midCos * (outerRadius + calloutLength),
                        y: midSin * (outerRadius + calloutLength)
                    },
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

        if (!chart || chart && chart.layoutPending) {
            return;
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

        groupSelection.selectByTag<Sector>(PieSeriesNodeTag.Sector)
            .each((sector, datum) => {
                sector.innerRadius = datum.innerRadius;
                sector.outerRadius = datum.outerRadius;
                sector.startAngle = datum.startAngle;
                sector.endAngle = datum.endAngle;
                sector.fillStyle = datum.fillStyle;
                sector.strokeStyle = datum.strokeStyle;
                sector.shadow = datum.shadow;
                sector.lineWidth = datum.lineWidth;
                sector.lineJoin = 'round';
            });

        groupSelection.selectByTag<Line>(PieSeriesNodeTag.Callout)
            .each((line, datum) => {
                const callout = datum.callout;
                if (callout) {
                    line.lineWidth = this.calloutWidth;
                    line.strokeStyle = callout.strokeStyle;
                    line.x1 = callout.start.x;
                    line.y1 = callout.start.y;
                    line.x2 = callout.end.x;
                    line.y2 = callout.end.y;
                } else {
                    line.strokeStyle = null;
                }
            });

        const halfPi = Math.PI / 2;

        groupSelection.selectByTag<Text>(PieSeriesNodeTag.Label)
            .each((text, datum) => {
                const angle = datum.midAngle;
                // Split the circle into quadrants like so: ⊗
                let quadrantStart = -3 * Math.PI / 4; // same as `normalizeAngle180(toRadians(-135))`

                if (angle >= quadrantStart && angle < (quadrantStart += halfPi)) {
                    text.textAlign = 'center';
                    text.textBaseline = 'bottom';
                } else if (angle >= quadrantStart && angle < (quadrantStart += halfPi)) {
                    text.textAlign = 'left';
                    text.textBaseline = 'middle';
                } else if (angle >= quadrantStart && angle < (quadrantStart += halfPi)) {
                    text.textAlign = 'center';
                    text.textBaseline = 'hanging';
                } else {
                    text.textAlign = 'right';
                    text.textBaseline = 'middle';
                }

                const label = datum.label;
                if (label) {
                    text.font = label.font;
                    text.text = label.text;
                    text.x = label.x;
                    text.y = label.y;
                    text.fillStyle = label.fillStyle;
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
            const name = this.name && `<strong>${this.name}</strong><br>`;
            const label = this.labelField ? `${nodeDatum.seriesDatum[this.labelField]}: ` : '';
            const value = nodeDatum.seriesDatum[angleField];
            const formattedValue = typeof(value) === 'number' ? toFixed(value) : value.toString();
            html = `${name}${label}${formattedValue}`;
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
