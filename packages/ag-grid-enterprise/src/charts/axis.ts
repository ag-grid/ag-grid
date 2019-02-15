import Scale from "./scale/scale";
import {Group} from "./scene/group";
import {Selection} from "./scene/selection";
import {Line} from "./scene/shape/line";
import {NumericTicks} from "./util/ticks";
import {normalizeAngle360, toRadians} from "./util/angle";
import {Text} from "./scene/shape/text";

/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be rotated by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
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

    /**
     * Custom label rotation in degrees.
     * Labels are rendered perpendicular to the axis line by default.
     * Or parallel to the axis line, if the {@link isParallelLabels} is set to `true`.
     * The value of this config is used as the angular offset/deflection
     * from the default rotation.
     */
    labelRotation: number = 0;

    /**
     * By default labels and ticks are positioned to the left of the axis line.
     * `true` positions the labels to the right of the axis line.
     * However, if the axis is rotated, its easier to think in terms
     * of this side or the opposite side, rather than left and right.
     * We use the term `mirror` for conciseness, although it's not
     * true mirroring - for example, when a label is rotated, so that
     * it is inclined at the 45 degree angle, text flowing from north-west
     * to south-east, ending at the tick to the left of the axis line,
     * and then we set this config to `true`, the text will still be flowing
     * from north-west to south-east, _starting_ at the tick to the right
     * of the axis line.
     */
    isMirrorLabels: boolean = false;

    /**
     * Labels are rendered perpendicular to the axis line by default.
     * Setting this config to `true` makes labels render parallel to the axis line
     * and center aligns labels' text at the ticks.
     * If the axis is rotated so that it is horizontal (by +/- 90 degrees),
     * the labels rotate with it and become vertical,
     */
    isParallelLabels: boolean = false;

    render() {
        const group = this.group;
        const scale = this.scale;

        const rotation = toRadians(this.rotation);
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
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        const sideFlag = this.isMirrorLabels ? 1 : -1;
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        const parallelFlipRotation = normalizeAngle360(rotation);
        const parallelFlipFlag = (!labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI) ? -1 : 1;

        const regularFlipRotation = normalizeAngle360(rotation - Math.PI / 2);
        // Flip if the axis rotation angle is in the top hemisphere.
        const regularFlipFlag = (!labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI) ? -1 : 1;

        const alignFlag = (labelRotation >= 0 && labelRotation <= Math.PI) ? -1 : 1;
        const isParallelLabels = this.isParallelLabels;

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
                label.textBaseline = isParallelLabels && !labelRotation
                    ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                    : 'middle';
                label.text = decimalDigits && typeof datum === 'number'
                    ? datum.toFixed(decimalDigits)
                    : datum.toString();
                label.textAlign = isParallelLabels
                    ? labelRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
                    : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
            });

        const labelX = sideFlag * (this.tickSize + this.tickPadding);
        const autoRotation = isParallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);

        labels
            .attr('x', labelX)
            .attr('rotationCenterX', labelX)
            .attr('rotation', autoRotation + labelRotation);

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
