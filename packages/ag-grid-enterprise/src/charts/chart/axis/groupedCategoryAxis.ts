import { Group } from "../../scene/group";
import { Selection } from "../../scene/selection";
import { Line } from "../../scene/shape/line";
import { normalizeAngle360, normalizeAngle360Inclusive, toDegrees, toRadians } from "../../util/angle";
import { Text } from "../../scene/shape/text";
import { BBox } from "../../scene/bbox";
import { Matrix } from "../../scene/matrix";
import { Caption } from "../../caption";
import { Rect } from "../../scene/shape/rect"; // debug (bbox)
import { BandScale } from "../../scale/bandScale";
import { ticksToTree, TreeLayout, treeLayout } from "../../layout/tree";

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
export class GroupedCategoryAxis {

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
    readonly scale = new BandScale<string>();
    readonly tickScale = new BandScale<string>();
    readonly group = new Group();
    private gridLineSelection: Selection<Line, Group, any, any>;
    private axisLineSelection: Selection<Line, Group, any, any>;
    private separatorSelection: Selection<Line, Group, any, any>;
    private labelSelection: Selection<Text, Group, any, any>;
    private tickTreeLayout?: TreeLayout;
    // onLayoutChange?: () => void;

    constructor() {
        const scale = this.scale;
        scale.paddingOuter = 0.1;
        scale.paddingInner = scale.paddingOuter * 2;

        const tickScale = this.tickScale;
        tickScale.paddingInner = 1;
        tickScale.paddingOuter = 0;

        this.gridLineSelection = Selection.select(this.group).selectAll<Line>();
        this.axisLineSelection = Selection.select(this.group).selectAll<Line>();
        this.separatorSelection = Selection.select(this.group).selectAll<Line>();
        this.labelSelection = Selection.select(this.group).selectAll<Text>();
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
                -layout.depth * lineHeight
            );
        }
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
     * The padding between the labels and the axis line.
     */
    labelPadding: number = 5;

    labelGrid: boolean = false;

    /**
     * The color of the axis ticks.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    tickColor?: string = 'rgba(195, 195, 195, 1)';

    labelFormatter?: (params: {value: any, index: number}) => string;

    labelFontStyle: string = '';
    labelFontWeight: string = '';
    labelFontSize: number = 12;
    labelFontFamily: string = 'Verdana, sans-serif';

    private get lineHeight() {
        return this.labelFontSize * 1.5;
    }

    title: Caption | undefined = undefined;

    /**
     * The color of the labels.
     * Use `null` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    labelColor?: string = 'rgba(87, 87, 87, 1)';

    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     */
    private _gridLength: number = 0;
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
        const tickScale = this.tickScale;
        const bandwidth = Math.abs(scale.range[1] - scale.range[0]) / scale.domain.length || 0;

        const parallelLabels = this.parallelLabels;
        const rotation = toRadians(this.rotation);
        const isHorizontal = Math.abs(Math.cos(rotation)) < 1e-8;
        const labelRotation = normalizeAngle360(toRadians(this.labelRotation));

        group.translationX = this.translationX;
        group.translationY = this.translationY;
        group.rotation = rotation;

        const title = this.title;
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

        const updateGridLines = this.gridLineSelection.setData(this.gridLength ? ticks : []);
        updateGridLines.exit.remove();
        const enterGridLines = updateGridLines.enter.append(Line);
        const gridLineSelection = updateGridLines.merge(enterGridLines);

        const updateLabels = this.labelSelection.setData(treeLabels);
        updateLabels.exit.remove();

        const enterLabels = updateLabels.enter.append(Text);
        const labelSelection = updateLabels.merge(enterLabels);

        const labelFormatter = this.labelFormatter;
        let maxLeafLabelWidth = 0;
        labelSelection
            .each((label, datum, index) => {
                label.fontStyle = this.labelFontStyle;
                label.fontWeight = this.labelFontWeight;
                label.fontSize = this.labelFontSize;
                label.fontFamily = this.labelFontFamily;
                label.fill = this.labelColor;
                label.textBaseline = parallelFlipFlag === -1 ? 'bottom' : 'hanging';
                // label.textBaseline = parallelLabels && !labelRotation
                //     ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
                //     : 'middle';
                if (title && index === 0) { // use the phantom root as the axis title
                    label.text = title.text;
                    label.fontSize = title.fontSize;
                    label.fontStyle = title.fontStyle;
                    label.fontWeight = title.fontWeight;
                    label.fontFamily = title.fontFamily;
                    label.textBaseline = 'hanging';
                } else {
                    label.text = labelFormatter
                        ? labelFormatter({
                            value: String(datum.label),
                            index
                        })
                        : String(datum.label);
                }
                label.textAlign = 'center';
                label.translationX = datum.screenY - this.labelFontSize * 0.25;
                label.translationY = datum.screenX;
                const bbox = label.getBBox();
                if (bbox && bbox.width > maxLeafLabelWidth) {
                    maxLeafLabelWidth = bbox.width;
                }
            });

        const labelX = sideFlag * this.labelPadding; // label padding from the axis line
        const autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);

        const labelGrid = this.labelGrid;
        const separatorData = [] as {y: number, x1: number, x2: number, toString: () => string}[];
        labelSelection.each((label, datum, index) => {
            label.x = labelX;
            label.rotationCenterX = labelX;
            if (!datum.children.length) {
                label.rotation = labelRotation;
                label.textAlign = 'end';
                label.textBaseline = 'middle';
            } else {
                label.translationX -= maxLeafLabelWidth - lineHeight + this.labelPadding;
                if (isHorizontal) {
                    label.rotation = autoRotation;
                } else {
                    label.rotation = -Math.PI / 2;
                }
            }
            // Calculate positions of label separators for all nodes except the root.
            // Each separator is placed to the top of the current label.
            if (datum.parent && isLabelTree) {
                const y = !datum.children.length
                    ? datum.screenX - bandwidth / 2
                    : datum.screenX - datum.leafCount * bandwidth / 2;

                if (!datum.children.length) {
                    if (!datum.number || labelGrid) {
                        separatorData.push({
                            y,
                            x1: 0,
                            x2: -maxLeafLabelWidth - this.labelPadding * 2,
                            toString: () => String(index)
                        });
                    }
                } else {
                    separatorData.push({
                        y,
                        x1: -maxLeafLabelWidth + datum.screenY + lineHeight / 2,
                        x2: -maxLeafLabelWidth + datum.screenY - lineHeight / 2,
                        toString: () => String(index)
                    });
                }
            }
        });

        // Calculate the position of the long separator on the far bottom of the axis.
        let minX = 0;
        separatorData.forEach(d => minX = Math.min(minX, d.x2));
        separatorData.push({
            y: Math.max(scale.range[0], scale.range[1]),
            x1: 0,
            x2: minX,
            toString: () => String(separatorData.length)
        });

        const updateSeparators = this.separatorSelection.setData(separatorData);
        updateSeparators.exit.remove();
        const enterSeparators = updateSeparators.enter.append(Line);
        const separatorSelection = updateSeparators.merge(enterSeparators);
        this.separatorSelection = separatorSelection;

        separatorSelection.each((line, datum, index) => {
            line.x1 = datum.x1;
            line.x2 = datum.x2;
            line.y1 = datum.y;
            line.y2 = datum.y;
            line.stroke = this.tickColor;
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

        axisLineSelection.each((line, datum, index) => {
            const x = index > 0 ? -maxLeafLabelWidth - this.labelPadding * 2 - (index - 1) * lineHeight : 0;
            line.x1 = x;
            line.x2 = x;
            line.y1 = scale.range[0];
            line.y2 = scale.range[1];
            line.strokeWidth = this.lineWidth;
            line.stroke = this.lineColor;
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
                    line.visible = Math.abs(line.parent!.translationY - scale.range[0]) > 1;

                    const style = styles[index % styleCount];
                    line.stroke = style.stroke;
                    line.strokeWidth = this.tickWidth;
                    line.lineDash = style.lineDash;
                    line.fill = undefined;
                });
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
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        this.labelSelection.each((label, datum, index) => {
            // The label itself is rotated, but not translated, the group that
            // contains it is. So to capture the group transform in the label bbox
            // calculation we combine the transform matrices of the label and the group.
            // Depending on the timing of the `axis.getBBox()` method call, we may
            // not have the group's and the label's transform matrices updated yet (because
            // the transform matrix is not recalculated whenever a node's transform attributes
            // change, instead it's marked for recalculation on the next frame by setting
            // the node's `dirtyTransform` flag to `true`), so we force them to update
            // right here by calling `computeTransformMatrix`.
            if (index > 0 || includeTitle) { // first node is the root (title)
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
            }
        });

        return new BBox(
            left,
            top,
            right - left,
            bottom - top
        );
    }
}
