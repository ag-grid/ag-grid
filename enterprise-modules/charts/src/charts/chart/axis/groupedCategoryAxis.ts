import { Group } from "../../scene/group";
import { Selection } from "../../scene/selection";
import { Line } from "../../scene/shape/line";
import { normalizeAngle360, toRadians } from "../../util/angle";
import { Text } from "../../scene/shape/text";
import { BBox } from "../../scene/bbox";
import { Matrix } from "../../scene/matrix";
// import { Rect } from "../../scene/shape/rect"; debug (bbox)
import { BandScale } from "../../scale/bandScale";
import { ticksToTree, TreeLayout, treeLayout } from "../../layout/tree";
import { ILinearAxis, AxisLabel } from "../../axis";
import { ChartAxis } from "../chartAxis";

class GroupedCategoryAxisLabel extends AxisLabel {
    grid: boolean = false;
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
export class GroupedCategoryAxis extends ChartAxis implements ILinearAxis<BandScale<string | number>, string | number> {
    // debug (bbox)
    // private bboxRect = (() => {
    //     const rect = new Rect();
    //     rect.fill = undefined;
    //     rect.stroke = 'red';
    //     rect.strokeWidth = 1;
    //     rect.strokeOpacity = 0.7;
    //     return rect;
    // })();

    static className = 'GroupedCategoryAxis';
    readonly id: string = this.createId();
    // Label scale (labels are positionsed between ticks, tick count = label count + 1).
    // We don't call is `labelScale` for consistency with other axes.
    readonly scale: BandScale<string | number>;
    readonly tickScale = new BandScale<string | number>();
    readonly group = new Group();

    private gridLineSelection: Selection<Line, Group, any, any>;
    private axisLineSelection: Selection<Line, Group, any, any>;
    private separatorSelection: Selection<Line, Group, any, any>;
    private labelSelection: Selection<Text, Group, any, any>;
    private tickTreeLayout?: TreeLayout;
    private longestSeparatorLength = 0;

    constructor() {
        super(new BandScale<string | number>());

        const { group, scale, tickScale } = this;

        scale.paddingOuter = 0.1;
        scale.paddingInner = scale.paddingOuter * 2;

        tickScale.paddingInner = 1;
        tickScale.paddingOuter = 0;


        this.gridLineSelection = Selection.select(group).selectAll<Line>();
        this.axisLineSelection = Selection.select(group).selectAll<Line>();
        this.separatorSelection = Selection.select(group).selectAll<Line>();
        this.labelSelection = Selection.select(group).selectAll<Text>();
        // this.group.append(this.bboxRect); // debug (bbox)
    }

    private createId(): string {
        const constructor = this.constructor as any;
        const className = constructor.className;
        if (!className) {
            throw new Error(`The ${constructor} is missing the 'className' property.`);
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    }

    set domain(value: any[]) {
        this.scale.domain = value;
        const tickTree = ticksToTree(value);
        this.tickTreeLayout = treeLayout(tickTree);

        const domain = value.slice();
        domain.push('');
        this.tickScale.domain = domain;

        this.resizeTickTree();
    }
    get domain(): any[] {
        return this.scale.domain;
    }

    set range(value: [number, number]) {
        this.scale.range = value;
        this.tickScale.range = value;
        this.resizeTickTree();
    }
    get range(): [number, number] {
        return this.scale.range;
    }

    private resizeTickTree() {
        const s = this.scale;
        const range = s.domain.length ? [s.convert(s.domain[0]), s.convert(s.domain[s.domain.length - 1])] : s.range;
        const layout = this.tickTreeLayout;
        const lineHeight = this.lineHeight;

        if (layout) {
            layout.resize(
                Math.abs(range[1] - range[0]),
                layout.depth * lineHeight,
                (Math.min(range[0], range[1]) || 0) + (s.bandwidth || 0) / 2,
                -layout.depth * lineHeight,
                (range[1] - range[0]) < 0
            );
        }
    }

    readonly translation: {
        /**
         * The horizontal translation of the axis group.
         */
        x: number,
        /**
         * The vertical translation of the axis group.
         */
        y: number
    } = {
            x: 0,
            y: 0
        };

    /**
     * Axis rotation angle in degrees.
     */
    rotation: number = 0;

    readonly line: {
        /**
         * The line width to be used by the axis line.
         */
        width: number,
        /**
         * The color of the axis line.
         * Use `null` rather than `rgba(0, 0, 0, 0)` to make the axis line invisible.
         */
        color?: string
    } = {
            width: 1,
            color: 'rgba(195, 195, 195, 1)'
        };

    // readonly tick = new AxisTick();

    readonly label = new GroupedCategoryAxisLabel();

    private get lineHeight() {
        return this.label.fontSize * 1.5;
    }

    /**
     * The color of the labels.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    labelColor?: string = 'rgba(87, 87, 87, 1)';

    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     */
    set gridLength(value: number) {
        // Was visible and now invisible, or was invisible and now visible.
        if (this._gridLength && !value || !this._gridLength && value) {
            this.gridLineSelection = this.gridLineSelection.remove().setData([]);
            this.labelSelection = this.labelSelection.remove().setData([]);
        }
        this._gridLength = value;
    }
    get gridLength(): number {
        return this._gridLength;
    }

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
        const { group, scale, label, tickScale } = this;
        const rangeStart = scale.range[0];
        const rangeEnd = scale.range[1];
        const rangeLength = Math.abs(rangeEnd - rangeStart);
        const bandwidth = (rangeLength / scale.domain.length) || 0;
        const parallelLabels = label.parallel;
        const rotation = toRadians(this.rotation);
        const isHorizontal = Math.abs(Math.cos(rotation)) < 1e-8;
        const labelRotation = normalizeAngle360(toRadians(this.label.rotation));

        group.translationX = this.translation.x;
        group.translationY = this.translation.y;
        group.rotation = rotation;

        const title = this.title;
        // The Text `node` of the Caption is not used to render the title of the grouped category axis.
        // The phantom root of the tree layout is used instead.
        if (title) {
            title.node.visible = false;
        }
        const lineHeight = this.lineHeight;

        // Render ticks and labels.
        const tickTreeLayout = this.tickTreeLayout;
        const labels = scale.ticks();
        const treeLabels = tickTreeLayout ? tickTreeLayout.nodes : [];
        const isLabelTree = tickTreeLayout ? tickTreeLayout.depth > 1 : false;
        const ticks = tickScale.ticks();
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        const sideFlag = label.mirrored ? 1 : -1;
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

        const updateGridLines = this.gridLineSelection.setData(this.gridLength ? ticks : []);
        updateGridLines.exit.remove();
        const enterGridLines = updateGridLines.enter.append(Line);
        const gridLineSelection = updateGridLines.merge(enterGridLines);

        const updateLabels = this.labelSelection.setData(treeLabels);
        updateLabels.exit.remove();

        const enterLabels = updateLabels.enter.append(Text);
        const labelSelection = updateLabels.merge(enterLabels);

        const labelFormatter = label.formatter;
        let maxLeafLabelWidth = 0;
        labelSelection
            .each((node, datum, index) => {
                node.fontStyle = label.fontStyle;
                node.fontWeight = label.fontWeight;
                node.fontSize = label.fontSize;
                node.fontFamily = label.fontFamily;
                node.fill = label.color;
                node.textBaseline = parallelFlipFlag === -1 ? 'bottom' : 'hanging';
                // label.textBaseline = parallelLabels && !labelRotation
                //     ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                //     : 'middle';
                if (title && index === 0) { // use the phantom root as the axis title
                    node.text = title.text;
                    node.fontSize = title.fontSize;
                    node.fontStyle = title.fontStyle;
                    node.fontWeight = title.fontWeight;
                    node.fontFamily = title.fontFamily;
                    node.textBaseline = 'hanging';
                    node.visible = labels.length > 0;
                } else {
                    node.text = labelFormatter
                        ? labelFormatter({
                            value: String(datum.label),
                            index
                        })
                        : String(datum.label);
                }
                node.textAlign = 'center';
                node.translationX = datum.screenY - label.fontSize * 0.25;
                node.translationY = datum.screenX;
                const bbox = node.computeBBox();
                if (bbox && bbox.width > maxLeafLabelWidth) {
                    maxLeafLabelWidth = bbox.width;
                }
            });

        const labelX = sideFlag * label.padding;
        const autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);

        const labelGrid = this.label.grid;
        const separatorData = [] as { y: number, x1: number, x2: number, toString: () => string }[];
        labelSelection.each((label, datum, index) => {
            label.x = labelX;
            label.rotationCenterX = labelX;
            if (!datum.children.length) {
                label.rotation = labelRotation;
                label.textAlign = 'end';
                label.textBaseline = 'middle';
            } else {
                label.translationX -= maxLeafLabelWidth - lineHeight + this.label.padding;
                if (isHorizontal) {
                    label.rotation = autoRotation;
                } else {
                    label.rotation = -Math.PI / 2;
                }
            }
            // Calculate positions of label separators for all nodes except the root.
            // Each separator is placed to the top of the current label.
            if (datum.parent && isLabelTree) {
                let y = !datum.children.length
                    ? datum.screenX - bandwidth / 2
                    : datum.screenX - datum.leafCount * bandwidth / 2;

                if (!datum.children.length) {
                    if ((datum.number !== datum.children.length - 1) || labelGrid) {
                        separatorData.push({
                            y,
                            x1: 0,
                            x2: -maxLeafLabelWidth - this.label.padding * 2,
                            toString: () => String(index)
                        });
                    }
                } else {
                    const x = -maxLeafLabelWidth - this.label.padding * 2 + datum.screenY;
                    separatorData.push({
                        y,
                        x1: x + lineHeight,
                        x2: x,
                        toString: () => String(index)
                    });
                }
            }
        });

        // Calculate the position of the long separator on the far bottom of the axis.
        let minX = 0;
        separatorData.forEach(d => minX = Math.min(minX, d.x2));
        this.longestSeparatorLength = Math.abs(minX);
        separatorData.push({
            y: Math.max(rangeStart, rangeEnd),
            x1: 0,
            x2: minX,
            toString: () => String(separatorData.length)
        });

        const updateSeparators = this.separatorSelection.setData(separatorData);
        updateSeparators.exit.remove();
        const enterSeparators = updateSeparators.enter.append(Line);
        const separatorSelection = updateSeparators.merge(enterSeparators);
        this.separatorSelection = separatorSelection;

        separatorSelection.each((line, datum) => {
            line.x1 = datum.x1;
            line.x2 = datum.x2;
            line.y1 = datum.y;
            line.y2 = datum.y;
            line.stroke = this.tick.color;
            line.fill = undefined;
            line.strokeWidth = 1;
        });

        this.gridLineSelection = gridLineSelection;
        this.labelSelection = labelSelection;

        // Render axis lines.
        const lineCount = tickTreeLayout ? tickTreeLayout.depth + 1 : 1;
        const lines = [];
        for (let i = 0; i < lineCount; i++) {
            lines.push(i);
        }

        const updateAxisLines = this.axisLineSelection.setData(lines);
        updateAxisLines.exit.remove();
        const enterAxisLines = updateAxisLines.enter.append(Line);
        const axisLineSelection = updateAxisLines.merge(enterAxisLines);
        this.axisLineSelection = axisLineSelection;

        axisLineSelection.each((line, _, index) => {
            const x = index > 0 ? -maxLeafLabelWidth - this.label.padding * 2 - (index - 1) * lineHeight : 0;
            line.x1 = x;
            line.x2 = x;
            line.y1 = rangeStart;
            line.y2 = rangeEnd;
            line.strokeWidth = this.line.width;
            line.stroke = this.line.color;
            line.visible = labels.length > 0 && (index === 0 || (labelGrid && isLabelTree));
        });

        if (this.gridLength) {
            const styles = this.gridStyle;
            const styleCount = styles.length;

            gridLineSelection
                .each((line, datum, index) => {
                    const y = Math.round(tickScale.convert(datum));
                    line.x1 = 0;
                    line.x2 = -sideFlag * this.gridLength;
                    line.y1 = y;
                    line.y2 = y;
                    line.visible = Math.abs(line.parent!.translationY - rangeStart) > 1;

                    const style = styles[index % styleCount];
                    line.stroke = style.stroke;
                    line.strokeWidth = this.tick.width;
                    line.lineDash = style.lineDash;
                    line.fill = undefined;
                });
        }

        // debug (bbox)
        // const bbox = this.computeBBox();
        // const bboxRect = this.bboxRect;
        // bboxRect.x = bbox.x;
        // bboxRect.y = bbox.y;
        // bboxRect.width = bbox.width;
        // bboxRect.height = bbox.height;
    }

    computeBBox(options?: { excludeTitle: boolean }): BBox {
        const includeTitle = !options || !options.excludeTitle;
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        this.labelSelection.each((label, _, index) => {
            // The label itself is rotated, but not translated, the group that
            // contains it is. So to capture the group transform in the label bbox
            // calculation we combine the transform matrices of the label and the group.
            // Depending on the timing of the `axis.computeBBox()` method call, we may
            // not have the group's and the label's transform matrices updated yet (because
            // the transform matrix is not recalculated whenever a node's transform attributes
            // change, instead it's marked for recalculation on the next frame by setting
            // the node's `dirtyTransform` flag to `true`), so we force them to update
            // right here by calling `computeTransformMatrix`.
            if (index > 0 || includeTitle) { // first node is the root (title)
                label.computeTransformMatrix();
                const matrix = Matrix.flyweight(label.matrix);
                const labelBBox = label.computeBBox();

                if (labelBBox) {
                    const bbox = matrix.transformBBox(labelBBox);

                    left = Math.min(left, bbox.x);
                    right = Math.max(right, bbox.x + bbox.width);
                    top = Math.min(top, bbox.y);
                    bottom = Math.max(bottom, bbox.y + bbox.height);
                }
            }
        });

        return new BBox(
            left,
            top,
            Math.max(right - left, this.longestSeparatorLength),
            bottom - top
        );
    }
}
