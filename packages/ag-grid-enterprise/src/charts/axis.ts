import Scale from "./scale/scale";
import {Group} from "./scene/group";
import {Selection} from "./scene/selection";
import {Line} from "./scene/shape/line";
import {NumericTicks} from "./util/ticks";
import {normalizeAngle360, toRadians} from "./util/angle";
import {Text} from "./scene/shape/text";

/**
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default.
 */
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
    rotation: number = 0; // in degrees

    lineWidth: number = 1;
    tickWidth: number = 1;
    tickSize: number = 6;
    tickPadding: number = 5;
    lineColor: string = 'black';
    tickColor: string = 'black';
    labelFont: string = '14px Verdana';
    labelColor: string = 'black';
    labelRotation: number = 0; // in degrees

    /**
     * By default labels are positioned to the left of the axis line.
     * `true` positions the labels to the right of the axis line.
     * If the axis is rotated, its easier to think in terms of this side
     * or the opposite side, rather than left and right.
     */
    isMirrorLabels: boolean = false;
    /**
     * If the axis is rotated so that it is horizontal (by +/- 90 degrees),
     * the labels rotate with it and become vertical, `true` makes labels
     * horizontal again and center aligns labels' text at the ticks.
     */
    isFlipLabels: boolean = false;

    render() {
        const group = this.group;
        const scale = this.scale;

        const rotation = normalizeAngle360(toRadians(this.rotation));
        const labelRotation = normalizeAngle360(toRadians(this.labelRotation));

        group.translationX = this.translationX;
        group.translationY = this.translationY;
        group.rotation = rotation;

        // Render ticks and labels.
        const ticks = scale.ticks!(10);
        let decimalDigits = 0;
        if (ticks instanceof NumericTicks) {
            decimalDigits = ticks.decimalDigits;
        }
        const bandwidth = (scale.bandwidth || 0) / 2;
        const sideFlag = this.isMirrorLabels ? 1 : -1; // -1 = left, 1 = right
        const flipFlag = (rotation >= 0 && rotation <= Math.PI) ? -1 : 1;
        const flipFlag2 = (labelRotation >= 0 && labelRotation <= Math.PI) ? -1 : 1;

        const update = this.groupSelection.setData(ticks);
        update.exit.remove();

        const enter = update.enter.append(Group);
        enter.append(Line); // auto-snaps to pixel grid if vertical or horizontal
        enter.append(Text);

        const groupSelection = update.merge(enter);

        groupSelection
            .attrFn('translationY', (node, datum) => {
                return Math.round(scale.convert(datum) + bandwidth);
            });

        groupSelection.selectByClass(Line)
            .each(node => {
                node.lineWidth = this.tickWidth;
                node.strokeStyle = this.tickColor;
            })
            .attr('x1', sideFlag * this.tickSize)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);

        const labels = groupSelection.selectByClass(Text)
            .each((label, datum) => {
                label.font = this.labelFont;
                label.fillStyle = this.labelColor;
                label.textBaseline = 'middle';
                label.text = decimalDigits && typeof datum === 'number'
                    ? datum.toFixed(decimalDigits)
                    : datum.toString();
                label.textAlign = this.isFlipLabels
                    ? labelRotation ? (sideFlag * flipFlag2 === -1 ? 'end' : 'start') : 'center'
                    : sideFlag === -1 ? 'end' : 'start';
            });

        if (this.isFlipLabels) {
            const x = sideFlag * (this.tickSize + this.tickPadding);
            labels
                // .attr('rotationCenterX', x)
                // .attr('rotationCenterY', y)
                .attr('y', -sideFlag * flipFlag * this.tickPadding)
                .attr('translationX', sideFlag * (this.tickSize + this.tickPadding))
                .attr('rotation', flipFlag * Math.PI / 2 + labelRotation);
        } else {
            const x = sideFlag * (this.tickSize + this.tickPadding);
            labels
                .attr('x', x)
                .attr('rotationCenterX', x)
                .attr('rotation', labelRotation);
        }

        this.groupSelection = groupSelection;

        // Render axis line.
        const line = this.line;
        line.x1 = 0;
        line.x2 = 0;
        line.y1 = scale.range[0];
        line.y2 = scale.range[scale.range.length - 1];
        line.lineWidth = this.lineWidth;
        line.strokeStyle = this.lineColor;
    }
}
