import {Chart} from "../chart";
import {PolarSeries} from "./polarSeries";
import {Group} from "../../scene/group";
import {Arc, ArcType} from "../../scene/shape/arc";
import {Line} from "../../scene/shape/line";
import {Text} from "../../scene/shape/text";
import {Selection} from "../../scene/selection";
import scaleLinear, {LinearScale} from "../../scale/linearScale";
import {normalizeAngle180, toRadians} from "../../util/angle";

type PieSectorData = {
    index: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    midAngle: number,

    fillStyle: string,
    strokeStyle: string,

    label?: {
        text: string,
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
        }
    }
};

enum PieSeriesNodeTag {
    Sector,
    Callout,
    Label
}

export class PieSeries extends PolarSeries {
    _labelField: string = '';
    set labelField(value: string) {
        if (this._labelField !== value) {
            this._labelField = value;
            this.processData();
            this.update();
        }
    }
    get labelField(): string {
        return this._labelField;
    }

    labelFont: string = '14px Verdana';
    labelColor: string = 'black';
    labelRotation: number = 0;
    labelMinAngle: number = 20; // in degrees

    calloutColor: string = 'black';
    calloutWidth: number = 2;
    calloutLength: number = 10;
    calloutPadding: number = 3;

    colors: string[] = [
        '#5BC0EB',
        '#FDE74C',
        '#9BC53D',
        '#E55934',
        '#FA7921',
        '#fa3081'
    ];

    set chart(chart: Chart | null) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.update();
        }
    }
    get chart(): Chart | null {
        return this._chart;
    }

    set angleField(value: string) {
        if (this._angleField !== value) {
            this._angleField = value;
            this.processData();
            this.update();
        }
    }
    get angleField(): string {
        return this._angleField;
    }

    set rotation(value: number) {
        if (this._rotation !== value) {
            this._rotation = value;
            this.processData();
            this.update();
        }
    }
    get rotation(): number {
        return this._rotation;
    }

    strokeStyle: string = 'black';
    lineWidth: number = 2;

    /**
     * The name of the numeric field to use to determine the radii of pie slices.
     */
    _radiusField: string = '';
    set radiusField(value: string) {
        if (this._radiusField !== value) {
            this._radiusField = value;
            this.processData();
            this.update();
        }
    }
    get radiusField(): string {
        return this._radiusField;
    }

    private angleScale: LinearScale<number> = (() => {
        const scale = scaleLinear();
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
        return scale;
    })();

    private radiusScale: LinearScale<number> = scaleLinear();

    private groupSelection: Selection<Group, Group, PieSectorData, any> = Selection.select(this.group).selectAll<Group>();

    private sectorsData: PieSectorData[] = [];

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.processData();

        if (this.chart && this.chart.isLayoutPending) {
            return;
        }

        this.update();
    }
    get data(): any[] {
        return this._data;
    }

    processData(): void {
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

        const sectorsData = this.sectorsData;
        sectorsData.length = 0;

        const rotation = toRadians(this.rotation);
        const colors = this.colors;

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
            const isLabelVisible = labelField && span > labelMinAngle;

            sectorsData.push({
                index: sectorIndex,
                radius,
                startAngle,
                endAngle,
                midAngle: normalizeAngle180(midAngle),

                fillStyle: colors[sectorIndex % colors.length],
                strokeStyle: 'black',

                label: isLabelVisible ? {
                    text: labelData[sectorIndex],
                    x: midCos * (radius + calloutLength + this.calloutPadding),
                    y: midSin * (radius + calloutLength + this.calloutPadding)
                } : undefined,

                callout: isLabelVisible ? {
                    start: {
                        x: midCos * radius,
                        y: midSin * radius
                    },
                    end: {
                        x: midCos * (radius + calloutLength),
                        y: midSin * (radius + calloutLength)
                    }
                } : undefined
            });

            sectorIndex++;

            return end;
        }, 0);
    }

    update(): void {
        if (this.chart && this.chart.isLayoutPending) {
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
                arc.strokeStyle = this.strokeStyle;
                arc.lineWidth = this.lineWidth;
                arc.lineJoin = 'round';
            });

        groupSelection.selectByTag<Line>(PieSeriesNodeTag.Callout)
            .each((line, datum) => {
                const callout = datum.callout;
                if (callout) {
                    line.lineWidth = this.calloutWidth;
                    line.strokeStyle = this.calloutColor;
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
                    text.fillStyle = 'black';
                    text.font = this.labelFont;
                    text.fillStyle = this.labelColor;
                    text.text = label.text;
                    text.x = label.x;
                    text.y = label.y;
                } else {
                    text.fillStyle = null;
                }
            });

        this.groupSelection = groupSelection;
    }
}
