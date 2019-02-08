import Scale from "./scale/scale";
import {Group} from "./scene/group";
import {Selection} from "./scene/selection";
import {Line} from "./scene/shape/line";
import {NumericTicks} from "./util/ticks";
import {pixelSnap, PixelSnapBias} from "./canvas/canvas";
import {normalizeAngle} from "./util/angle";
import {Text} from "./scene/shape/text";

export class Axis<D> {
    constructor(scale: Scale<D, number>, group: Group) {
        this.scale = scale;
        this.group = group;
        this.groupSelection = Selection.select(group).selectAll<Group>();
        group.append(this.line);
    }

    readonly scale: Scale<D, number>;
    readonly group: Group;
    private groupSelection: Selection<Group, Group, D, D>;
    private line = new Line();

    translationX: number = 0;
    translationY: number = 0;
    rotation: number = 0; // radians

    lineWidth: number = 1;
    tickWidth: number = 1;
    tickSize: number = 6;
    tickPadding: number = 5;
    lineColor: string = 'black';
    tickColor: string = 'black';
    labelFont: string = '14px Verdana';
    labelColor: string = 'black';
    flippedLabels: boolean = false;
    mirroredLabels: boolean = false;

    // By default, the axis is vertical, with horizontal labels positioned to the left
    // of the axis line.

    render() {
        const group = this.group;
        const scale = this.scale;

        group.translationX = this.translationX;
        group.translationY = this.translationY;
        group.rotation = this.rotation;

        // Render ticks and labels.
        const ticks = scale.ticks!(10);
        let decimalDigits = 0;
        if (ticks instanceof NumericTicks) {
            decimalDigits = ticks.decimalDigits;
        }
        const bandwidth = (scale.bandwidth || 0) / 2;
        const tickShift = pixelSnap(this.tickWidth);
        const sideFlag = this.mirroredLabels ? 1 : -1;
        const rotation = normalizeAngle(this.rotation);
        const flipFlag = (rotation >= 0 && rotation <= Math.PI) ? -1 : 1;

        const update = this.groupSelection.setData(ticks);
        update.exit.remove();

        const enter = update.enter.append(Group);
        enter.append(Line);
        enter.append(Text);

        const groupSelection = update.merge(enter);

        groupSelection
            .attrFn('translationY', (node, datum) => {
                return scale.convert(datum) - this.tickWidth / 2 + bandwidth;
            });

        groupSelection.selectByClass(Line)
            .each(node => {
                node.lineWidth = this.tickWidth;
                node.strokeStyle = this.tickColor;
            })
            .attr('x1', sideFlag * this.tickSize)
            .attr('x2', 0)
            .attr('y1', tickShift)
            .attr('y2', tickShift);

        const labels = groupSelection.selectByClass(Text)
            .each((label, datum) => {
                label.font = this.labelFont;
                label.fillStyle = this.labelColor;
                label.textBaseline = 'middle';
                label.text = decimalDigits && typeof datum === 'number'
                    ? datum.toFixed(decimalDigits)
                    : datum.toString();
                label.textAlign = this.flippedLabels
                    ? 'center'
                    : sideFlag === -1 ? 'end' : 'start';
            });

        if (this.flippedLabels) {
            labels
                .attr('x', 0)
                .attr('y', -sideFlag * flipFlag * this.tickPadding)
                .attr('translationX', sideFlag * (this.tickSize + this.tickPadding))
                .attr('rotation', flipFlag * Math.PI / 2);
        }
        else {
            labels
                .attr('x', sideFlag * (this.tickSize + this.tickPadding));
        }

        this.groupSelection = groupSelection;

        // Render axis line.
        const lineShift = pixelSnap(this.lineWidth, PixelSnapBias.Negative);
        const line = this.line;
        line.x1 = lineShift;
        line.y1 = scale.range[0];
        line.x2 = lineShift;
        line.y2 = scale.range[scale.range.length - 1];
        line.lineWidth = this.lineWidth;
        line.strokeStyle = this.lineColor;
    }
}
