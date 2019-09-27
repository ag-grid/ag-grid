// ag-grid-enterprise v21.2.2
import Scale from "./scale/scale";
import { Group } from "./scene/group";
import { BBox } from "./scene/bbox";
import { Caption } from "./caption";
export interface GridStyle {
    stroke?: string;
    lineDash?: number[];
}
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
export declare class Axis<S extends Scale<D, number>, D = any> {
    readonly scale: S;
    readonly group: Group;
    private groupSelection;
    private line;
    constructor(scale: S);
    range: number[];
    domain: D[];
    /**
     * The horizontal translation of the axis group.
     */
    translationX: number;
    /**
     * The vertical translation of the axis group.
     */
    translationY: number;
    /**
     * Axis rotation angle in degrees.
     */
    rotation: number;
    /**
     * The line width to be used by the axis line.
     */
    lineWidth: number;
    /**
     * The color of the axis line.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make the axis line invisible.
     */
    lineColor?: string;
    /**
     * The line width to be used by axis ticks.
     */
    tickWidth: number;
    /**
     * The line length to be used by axis ticks.
     */
    tickSize: number;
    /**
     * The padding between the ticks and the labels.
     */
    tickPadding: number;
    /**
     * The color of the axis ticks.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    tickColor?: string;
    /**
     * In case {@param value} is a number, the {@param fractionDigits} parameter will
     * be provided as well. The `fractionDigits` corresponds to the number of fraction
     * digits used by the tick step. For example, if the tick step is `0.0005`,
     * the `fractionDigits` is 4.
     */
    labelFormatter?: (params: {
        value: any;
        index: number;
        fractionDigits?: number;
    }) => string;
    labelFontStyle: string;
    labelFontWeight: string;
    labelFontSize: number;
    labelFontFamily: string;
    private _title;
    title: Caption | undefined;
    /**
     * The color of the labels.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    labelColor?: string;
    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     * In case {@link radialGrid} is `true`, the value is interpreted as an angle
     * (in degrees).
     */
    private _gridLength;
    gridLength: number;
    /**
     * The array of styles to cycle through when rendering grid lines.
     * For example, use two {@link GridStyle} objects for alternating styles.
     * Contains only one {@link GridStyle} object by default, meaning all grid lines
     * have the same style.
     */
    private _gridStyle;
    gridStyle: GridStyle[];
    /**
     * `false` - render grid as lines of {@link gridLength} that extend the ticks
     *           on the opposite side of the axis
     * `true` - render grid as concentric circles that go through the ticks
     */
    private _radialGrid;
    radialGrid: boolean;
    /**
     * Custom label rotation in degrees.
     * Labels are rendered perpendicular to the axis line by default.
     * Or parallel to the axis line, if the {@link parallelLabels} is set to `true`.
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
    mirrorLabels: boolean;
    /**
     * Labels are rendered perpendicular to the axis line by default.
     * Setting this config to `true` makes labels render parallel to the axis line
     * and center aligns labels' text at the ticks.
     */
    parallelLabels: boolean;
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     * Supposed to be called _manually_ after changing _any_ of the axis properties.
     * This allows to bulk set axis properties before updating the nodes.
     * The node changes made by this method are rendered on the next animation frame.
     * We could schedule this method call automatically on the next animation frame
     * when any of the axis properties change (the way we do when properties of scene graph's
     * nodes change), but this will mean that we first wait for the next animation
     * frame to make changes to the nodes of the axis, then wait for another animation
     * frame to render those changes. It's nice to have everything update automatically,
     * but this extra level of async indirection will not just introduce an unwanted delay,
     * it will also make it harder to reason about the program.
     */
    update(): void;
    getBBox(includeTitle?: boolean): BBox;
}
