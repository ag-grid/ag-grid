import {Chart} from "../chart";
import {PolarSeries} from "./polarSeries";
import {Group} from "../../scene/group";
import {Arc, ArcType} from "../../scene/shape/arc";
import {Line} from "../../scene/shape/line";
import {Text} from "../../scene/shape/text";
import {Selection} from "../../scene/selection";
import {DropShadow} from "../../scene/dropShadow";
import scaleLinear, {LinearScale} from "../../scale/linearScale";
import {normalizeAngle180, toRadians} from "../../util/angle";
import colors from "../colors";
import {Color} from "../../util/color";

type SectorDatum = {
    index: number,
    radius: number,
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
};

enum PieSeriesNodeTag {
    Sector,
    Callout,
    Label
}

export class PieSeries<D, X = number, Y = number> extends PolarSeries<D, X, Y> {

    protected fieldPropertiesX: (keyof this)[] = ['angleField'];
    protected fieldPropertiesY: (keyof this)[] = ['radiusField'];

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
    _angleField: Extract<keyof D, string> | null = null;
    set angleField(value: Extract<keyof D, string> | null) {
        if (this._angleField !== value) {
            this._angleField = value;
            if (this.processData()) {
                this.update();
            }
        }
    }
    get angleField(): Extract<keyof D, string> | null {
        return this._angleField;
    }

    _labelField: Extract<keyof D, string> | null = null;
    set labelField(value: Extract<keyof D, string> | null) {
        if (this._labelField !== value) {
            this._labelField = value;
            this.processData();
            this.update();
        }
    }
    get labelField(): Extract<keyof D, string> | null {
        return this._labelField;
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
            if (this.processData()) {
                this.update();
            }
        }
    }
    get rotation(): number {
        return this._rotation;
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

    /**
     * The name of the numeric field to use to determine the radii of pie slices.
     */
    private _radiusField: string = '';
    set radiusField(value: string) {
        if (this._radiusField !== value) {
            this._radiusField = value;
            if (this.processData()) {
                this.update();
            }
        }
    }
    get radiusField(): string {
        return this._radiusField;
    }

    private angleScale: LinearScale<number> = (() => {
        const scale = scaleLinear();
        // Each slice is a ratio of the whole, where all ratios add up to 1.
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
        return scale;
    })();

    private radiusScale: LinearScale<number> = scaleLinear();

    private groupSelection: Selection<Group, Group, SectorDatum, any> = Selection.select(this.group).selectAll<Group>();

    /**
     * The processed data that gets visualized.
     */
    private sectorsData: SectorDatum[] = [];

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        if (this.processData()) {
            this.update();
        }
    }
    get data(): any[] {
        return this._data;
    }

    getDomainX(): [number, number] {
        return this.angleScale.domain as [number, number];
    }

    getDomainY(): [number, number] {
        return this.radiusScale.domain as [number, number];
    }

    processData(): boolean {
        const data = this.data;
        const centerX = this.centerX + this.offsetX;
        const centerY = this.centerY + this.offsetY;

        this.group.translationX = centerX;
        this.group.translationY = centerY;

        const angleData: number[] = data.map(datum => datum[this.angleField]);
        const angleDataTotal = angleData.reduce((a, b) => a + b, 0);
        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        const angleDataRatios = (() => {
            let sum = 0;
            return angleData.map(datum => sum += datum / angleDataTotal);
        })();

        const labelField = this.labelField;
        let labelData: string[] = [];
        if (labelField) {
            labelData = data.map(datum => datum[labelField]);
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

        const sectorsData = this.sectorsData;
        sectorsData.length = 0;

        const rotation = toRadians(this.rotation);
        const colors = this.colors;
        const strokeColor = this.strokeStyle;
        const strokeColors = this.strokeColors;
        const calloutColor = this.calloutColor;

        let sectorIndex = 0;
        // Simply use reduce here to pair up adjacent ratios.
        angleDataRatios.reduce((start, end) => {
            const radius = radiusField ? this.radiusScale.convert(radiusData[sectorIndex]) : this.radius;
            const startAngle = angleScale.convert(start + rotation);
            const endAngle = angleScale.convert(end + rotation);

            const midAngle = (startAngle + endAngle) / 2;
            const span = Math.abs(endAngle - startAngle);
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);
            const calloutLength = this.calloutLength;

            const labelMinAngle = toRadians(this.labelMinAngle);
            const labelVisible = labelField && span > labelMinAngle;
            const strokeStyle = strokeColor ? strokeColor : strokeColors[sectorIndex % strokeColors.length];
            const calloutStrokeStyle = calloutColor ? calloutColor : strokeStyle;

            sectorsData.push({
                index: sectorIndex,
                radius,
                startAngle,
                endAngle,
                midAngle: normalizeAngle180(midAngle),

                fillStyle: colors[sectorIndex % colors.length],
                strokeStyle,
                lineWidth: this.lineWidth,
                shadow: this.shadow,

                label: labelVisible ? {
                    text: labelData[sectorIndex],
                    font: labelFont,
                    fillStyle: labelColor,
                    x: midCos * (radius + calloutLength + this.calloutPadding),
                    y: midSin * (radius + calloutLength + this.calloutPadding)
                } : undefined,

                callout: labelVisible ? {
                    start: {
                        x: midCos * radius,
                        y: midSin * radius
                    },
                    end: {
                        x: midCos * (radius + calloutLength),
                        y: midSin * (radius + calloutLength)
                    },
                    strokeStyle: calloutStrokeStyle
                } : undefined
            });

            sectorIndex++;

            return end;
        }, 0);

        return true;
    }

    update(): void {
        const chart = this.chart;

        if (!chart || chart && chart.layoutPending) {
            return;
        }

        const updateGroups = this.groupSelection.setData(this.sectorsData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(node => node.tag = PieSeriesNodeTag.Sector);
        enterGroups.append(Line).each(node => node.tag = PieSeriesNodeTag.Callout);
        enterGroups.append(Text).each(node => node.tag = PieSeriesNodeTag.Label);

        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.selectByTag<Arc>(PieSeriesNodeTag.Sector)
            .each((arc, datum) => {
                arc.type = ArcType.Round;
                arc.radiusX = datum.radius;
                arc.radiusY = datum.radius;
                arc.startAngle = datum.startAngle;
                arc.endAngle = datum.endAngle;
                arc.fillStyle = datum.fillStyle;
                arc.strokeStyle = datum.strokeStyle;
                arc.shadow = datum.shadow;
                arc.lineWidth = datum.lineWidth;
                arc.lineJoin = 'round';
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
}
