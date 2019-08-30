import Scale from "./scale/scale";
import { Group } from "./scene/group";
import { Selection } from "./scene/selection";
import { Line } from "./scene/shape/line";
import { NumericTicks } from "./util/ticks";
import { normalizeAngle360, normalizeAngle360Inclusive, toDegrees, toRadians } from "./util/angle";
import { Text } from "./scene/shape/text";
import { Arc } from "./scene/shape/arc";
import { Shape } from "./scene/shape/shape";
import { BBox } from "./scene/bbox";
import { Matrix } from "./scene/matrix";
import { Caption } from "./caption";
import { Rect } from "./scene/shape/rect";
// import { Rect } from "./scene/shape/rect"; // debug (bbox)

enum Tags {
    Tick,
    GridLine
}

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
export class Axis<S extends Scale<D, number>, D = any> {

    // debug (bbox)
    // private bboxRect = (() => {
    //     const rect = new Rect();
    //     rect.fill = undefined;
    //     rect.stroke = 'red';
    //     rect.strokeWidth = 1;
    //     rect.strokeOpacity = 0.2;
    //     return rect;
    // })();

    readonly scale: S;
    readonly group = new Group();
    private groupSelection: Selection<Group, Group, D, D>;
    private line = new Line();
    // onLayoutChange?: () => void;

    constructor(scale: S) {
        this.scale = scale;
        this.groupSelection = Selection.select(this.group).selectAll<Group>();
        this.group.append(this.line);
        // this.group.append(this.bboxRect); // debug (bbox)
    }

    set range(value: number[]) {
        this.scale.range = value;
    }
    get range(): number[] {
        return this.scale.range;
    }

    set domain(value: D[]) {
        this.scale.domain = value;
    }
    get domain(): D[] {
        return this.scale.domain;
    }

    /**
     * The horizontal translation of the axis group.
     */
    translationX: number = 0;

    /**
     * The vertical translation of the axis group.
     */
    translationY: number = 0;

    /**
     * Axis rotation angle in degrees.
     */
    rotation: number = 0;

    /**
     * The line width to be used by the axis line.
     */
    lineWidth: number = 1;

    /**
     * The color of the axis line.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make the axis line invisible.
     */
    lineColor?: string = 'rgba(195, 195, 195, 1)';

    /**
     * The line width to be used by axis ticks.
     */
    tickWidth: number = 1;

    /**
     * The line length to be used by axis ticks.
     */
    tickSize: number = 6;

    /**
     * The padding between the ticks and the labels.
     */
    tickPadding: number = 5;

    /**
     * The color of the axis ticks.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    tickColor?: string = 'rgba(195, 195, 195, 1)';

    /**
     * In case {@param value} is a number, the {@param fractionDigits} parameter will
     * be provided as well. The `fractionDigits` corresponds to the number of fraction
     * digits used by the tick step. For example, if the tick step is `0.0005`,
     * the `fractionDigits` is 4.
     */
    labelFormatter?: (params: {value: any, index: number, fractionDigits?: number}) => string;

    labelFontStyle: string = '';
    labelFontWeight: string = '';
    labelFontSize: number = 12;
    labelFontFamily: string = 'Verdana, sans-serif';

    private _title: Caption | undefined = undefined;
    set title(value: Caption | undefined) {
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                // oldTitle.onLayoutChange = undefined;
                this.group.removeChild(oldTitle.node);
            }
            if (value) {
                value.node.rotation = -Math.PI / 2;
                // value.onLayoutChange = this.onLayoutChange;
                this.group.appendChild(value.node);
            }
            this._title = value;
            // this.requestLayout();
        }
    }
    get title(): Caption | undefined {
        return this._title;
    }

    /**
     * The color of the labels.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    labelColor?: string = 'rgba(87, 87, 87, 1)';

    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     * In case {@link radialGrid} is `true`, the value is interpreted as an angle
     * (in degrees).
     */
    private _gridLength: number = 0;
    set gridLength(value: number) {
        // Was visible and now invisible, or was invisible and now visible.
        if (this._gridLength && !value || !this._gridLength && value) {
            this.groupSelection = this.groupSelection.remove().setData([]);
        }
        this._gridLength = value;
    }
    get gridLength(): number {
        return this._gridLength;
    }

    /**
     * The array of styles to cycle through when rendering grid lines.
     * For example, use two {@link GridStyle} objects for alternating styles.
     * Contains only one {@link GridStyle} object by default, meaning all grid lines
     * have the same style.
     */
    private _gridStyle: GridStyle[] = [{
        stroke: 'rgba(219, 219, 219, 1)',
        lineDash: [4, 2]
    }];
    set gridStyle(value: GridStyle[]) {
        if (value.length) {
            this._gridStyle = value;
        }
    }
    get gridStyle(): GridStyle[] {
        return this._gridStyle;
    }

    /**
     * `false` - render grid as lines of {@link gridLength} that extend the ticks
     *           on the opposite side of the axis
     * `true` - render grid as concentric circles that go through the ticks
     */
    private _radialGrid: boolean = false;
    set radialGrid(value: boolean) {
        if (this._radialGrid !== value) {
            this._radialGrid = value;
            this.groupSelection = this.groupSelection.remove().setData([]);
        }
    }
    get radialGrid(): boolean {
        return this._radialGrid;
    }

    /**
     * Custom label rotation in degrees.
     * Labels are rendered perpendicular to the axis line by default.
     * Or parallel to the axis line, if the {@link parallelLabels} is set to `true`.
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
    mirrorLabels: boolean = false;

    /**
     * Labels are rendered perpendicular to the axis line by default.
     * Setting this config to `true` makes labels render parallel to the axis line
     * and center aligns labels' text at the ticks.
     */
    parallelLabels: boolean = false;

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
    update() {
        const group = this.group;
        const scale = this.scale;

        const rotation = toRadians(this.rotation);
        const labelRotation = normalizeAngle360(toRadians(this.labelRotation));

        group.translationX = this.translationX;
        group.translationY = this.translationY;
        group.rotation = rotation;

        // Render ticks and labels.
        const ticks = scale.ticks!(10);
        let fractionDigits = 0;
        if (ticks instanceof NumericTicks) {
            fractionDigits = ticks.fractionDigits;
        }
        const bandwidth = (scale.bandwidth || 0) / 2;
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        const sideFlag = this.mirrorLabels ? 1 : -1;
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
        const parallelLabels = this.parallelLabels;

        const update = this.groupSelection.setData(ticks);
        update.exit.remove();

        const enter = update.enter.append(Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enter.append(Line).each(node => node.tag = Tags.Tick);
        if (this.gridLength) {
            if (this.radialGrid) {
                enter.append(Arc).each(node => node.tag = Tags.GridLine);
            } else {
                enter.append(Line).each(node => node.tag = Tags.GridLine);
            }
        }
        enter.append(Text);

        const groupSelection = update.merge(enter);

        groupSelection
            .attrFn('translationY', (_, datum) => {
                return Math.round(scale.convert(datum) + bandwidth);
            });

        groupSelection.selectByTag<Line>(Tags.Tick)
            .each(line => {
                line.strokeWidth = this.tickWidth;
                line.stroke = this.tickColor;
            })
            .attr('x1', sideFlag * this.tickSize)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);

        if (this.gridLength) {
            const styles = this.gridStyle;
            const styleCount = styles.length;
            let gridLines: Selection<Shape, Group, D, D>;

            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(this.gridLength));
                gridLines = groupSelection.selectByTag<Arc>(Tags.GridLine)
                    .each((arc, datum) => {
                        const radius = Math.round(scale.convert(datum) + bandwidth);
                        arc.centerX = 0;
                        arc.centerY = this.scale.range[0] - radius;
                        arc.endAngle = angularGridLength;
                        arc.radiusX = radius;
                        arc.radiusY = radius;
                    });
            } else {
                gridLines = groupSelection.selectByTag<Line>(Tags.GridLine)
                    .each(line => {
                        line.x1 = 0;
                        line.x2 = -sideFlag * this.gridLength;
                        line.y1 = 0;
                        line.y2 = 0;
                        line.visible = Math.abs(line.parent!.translationY - scale.range[0]) > 1;
                    });
            }
            gridLines.each((gridLine, datum, index) => {
                const style = styles[index % styleCount];
                gridLine.stroke = style.stroke;
                gridLine.strokeWidth = this.tickWidth;
                gridLine.lineDash = style.lineDash;
                gridLine.fill = undefined;
            });
        }

        const labelFormatter = this.labelFormatter;
        const labels = groupSelection.selectByClass(Text)
            .each((label, datum, index) => {
                label.fontStyle = this.labelFontStyle;
                label.fontWeight = this.labelFontWeight;
                label.fontSize = this.labelFontSize;
                label.fontFamily = this.labelFontFamily;
                label.fill = this.labelColor;
                label.textBaseline = parallelLabels && !labelRotation
                    ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                    : 'middle';
                label.text = labelFormatter
                    ? labelFormatter({
                        value: fractionDigits >= 0 ? datum : String(datum),
                        index,
                        fractionDigits
                    })
                    : fractionDigits
                        // the `datum` is a floating point number
                        ? (datum as any as number).toFixed(fractionDigits)
                        // the `datum` is an integer, a string or an object
                        : String(datum);
                label.textAlign = parallelLabels
                    ? labelRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
                    : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
            });

        const labelX = sideFlag * (this.tickSize + this.tickPadding);
        const autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);

        labels.each(label => {
            label.x = labelX;
            label.rotationCenterX = labelX;
            label.rotation = autoRotation + labelRotation;
        });

        this.groupSelection = groupSelection;

        // Render axis line.
        const line = this.line;
        line.x1 = 0;
        line.x2 = 0;
        line.y1 = scale.range[0];
        line.y2 = scale.range[scale.range.length - 1];
        line.strokeWidth = this.lineWidth;
        line.stroke = this.lineColor;
        line.visible = ticks.length > 0;

        const title = this.title;
        if (title) {
            const padding = title.padding.bottom;
            const node = title.node;
            const bbox = this.getBBox(false);
            const titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;

            node.rotation = titleRotationFlag * sideFlag * Math.PI / 2;
            node.x = titleRotationFlag * sideFlag * (line.y1 + line.y2) / 2;
            if (sideFlag === -1) {
                node.y = titleRotationFlag * (-padding - bbox.width + Math.max(bbox.x + bbox.width, 0));
            } else {
                node.y = -padding - bbox.width - Math.min(bbox.x, 0);
            }
            // title.text = `Axis Title: ${sideFlag} ${toDegrees(parallelFlipRotation).toFixed(0)} ${titleRotationFlag}`;
            node.textBaseline = titleRotationFlag === 1 ? 'bottom' : 'top';
        }

        // debug (bbox)
        // const bbox = this.getBBox();
        // const bboxRect = this.bboxRect;
        // bboxRect.x = bbox.x;
        // bboxRect.y = bbox.y;
        // bboxRect.width = bbox.width;
        // bboxRect.height = bbox.height;
    }

    getBBox(includeTitle = true): BBox {
        const line = this.line;
        const labels = this.groupSelection.selectByClass(Text);

        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        labels.each(label => {
            // The label itself is rotated, but not translated, the group that
            // contains it is. So to capture the group transform in the label bbox
            // calculation we combine the transform matrices of the label and the group.
            // Depending on the timing of the `axis.getBBox()` method call, we may
            // not have the group's and the label's transform matrices updated yet (because
            // the transform matrix is not recalculated whenever a node's transform attributes
            // change, instead it's marked for recalculation on the next frame by setting
            // the node's `dirtyTransform` flag to `true`), so we force them to update
            // right here by calling `computeTransformMatrix`.
            label.computeTransformMatrix();
            const matrix = Matrix.flyweight(label.matrix);
            const group = label.parent!;
            group.computeTransformMatrix();
            matrix.preMultiplySelf(group.matrix);
            const labelBBox = label.getBBox();
            if (labelBBox) {
                const bbox = matrix.transformBBox(labelBBox);
                left = Math.min(left, bbox.x);
                right = Math.max(right, bbox.x + bbox.width);
                top = Math.min(top, bbox.y);
                bottom = Math.max(bottom, bbox.y + bbox.height);
            }
        });

        if (includeTitle && this.title) {
            const label = this.title.node;
            label.computeTransformMatrix();
            const matrix = Matrix.flyweight(label.matrix);
            const labelBBox = label.getBBox();
            if (labelBBox) {
                const bbox = matrix.transformBBox(labelBBox);
                left = Math.min(left, bbox.x);
                right = Math.max(right, bbox.x + bbox.width);
                top = Math.min(top, bbox.y);
                bottom = Math.max(bottom, bbox.y + bbox.height);
            }
        }

        left = Math.min(left, 0);
        right = Math.max(right, 0);
        top = Math.min(top, line.y1, line.y2);
        bottom = Math.max(bottom, line.y1, line.y2);

        return new BBox(
            left,
            top,
            right - left,
            bottom - top
        );
    }

    // private requestLayout() {
    //     if (this.onLayoutChange) {
    //         this.onLayoutChange();
    //     }
    // }
}
