// ag-grid-enterprise v20.1.0
import Scale from "./scale/scale";
import { Group } from "./scene/group";
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be rotated by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 */
export declare class Axis<D> {
    constructor(scale: Scale<D, number>, group: Group);
    readonly scale: Scale<D, number>;
    readonly group: Group;
    private groupSelection;
    private line;
    translationX: number;
    translationY: number;
    rotation: number;
    lineWidth: number;
    tickWidth: number;
    tickSize: number;
    tickPadding: number;
    lineColor: string;
    tickColor: string;
    labelFont: string;
    labelColor: string;
    /**
     * Custom label rotation in degrees.
     * Labels are rendered perpendicular to the axis line by default.
     * Or parallel to the axis line, if the {@link isParallelLabels} is set to `true`.
     * The value of this config is used as the angular offset/deflection
     * from the default rotation.
     */
    labelRotation: number;
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
    isMirrorLabels: boolean;
    /**
     * Labels are rendered perpendicular to the axis line by default.
     * Setting this config to `true` makes labels render parallel to the axis line
     * and center aligns labels' text at the ticks.
     * If the axis is rotated so that it is horizontal (by +/- 90 degrees),
     * the labels rotate with it and become vertical,
     */
    isParallelLabels: boolean;
    render(): void;
}
