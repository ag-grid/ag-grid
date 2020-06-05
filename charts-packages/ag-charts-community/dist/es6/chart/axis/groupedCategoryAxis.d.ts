import { Group } from "../../scene/group";
import { BBox } from "../../scene/bbox";
import { BandScale } from "../../scale/bandScale";
import { AxisLabel } from "../../axis";
import { ChartAxis } from "../chartAxis";
declare class GroupedCategoryAxisLabel extends AxisLabel {
    grid: boolean;
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
export declare class GroupedCategoryAxis extends ChartAxis {
    static className: string;
    static type: string;
    readonly id: string;
    readonly scale: BandScale<string | number>;
    readonly tickScale: BandScale<string | number>;
    readonly group: Group;
    private gridLineSelection;
    private axisLineSelection;
    private separatorSelection;
    private labelSelection;
    private tickTreeLayout?;
    private longestSeparatorLength;
    constructor();
    domain: any[];
    range: number[];
    protected updateRange(): void;
    private resizeTickTree;
    readonly translation: {
        /**
         * The horizontal translation of the axis group.
         */
        x: number;
        /**
         * The vertical translation of the axis group.
         */
        y: number;
    };
    /**
     * Axis rotation angle in degrees.
     */
    rotation: number;
    readonly line: {
        /**
         * The line width to be used by the axis line.
         */
        width: number;
        /**
         * The color of the axis line.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the axis line invisible.
         */
        color?: string;
    };
    readonly label: GroupedCategoryAxisLabel;
    private readonly lineHeight;
    /**
     * The color of the labels.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    labelColor?: string;
    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     */
    gridLength: number;
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
    computeBBox(options?: {
        excludeTitle: boolean;
    }): BBox;
}
export {};
