import { Group } from "./scene/group";
import { Selection } from "./scene/selection";
import { Line } from "./scene/shape/line";
import { Text } from "./scene/shape/text";
import { Arc } from "./scene/shape/arc";
import { BBox } from "./scene/bbox";
import { Matrix } from "./scene/matrix";
import { createId } from "./util/id";
import { normalizeAngle360, normalizeAngle360Inclusive, toRadians } from "./util/angle";
import { doOnce } from "./util/function";
import { ContinuousScale } from "./scale/continuousScale";
// import { Rect } from "./scene/shape/rect"; // debug (bbox)
var Tags;
(function (Tags) {
    Tags[Tags["Tick"] = 0] = "Tick";
    Tags[Tags["GridLine"] = 1] = "GridLine";
})(Tags || (Tags = {}));
export class AxisTick {
    constructor() {
        /**
         * The line width to be used by axis ticks.
         */
        this.width = 1;
        /**
         * The line length to be used by axis ticks.
         */
        this.size = 6;
        /**
         * The color of the axis ticks.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
         */
        this.color = 'rgba(195, 195, 195, 1)';
        /**
         * A hint of how many ticks to use (the exact number of ticks might differ),
         * a `TimeInterval` or a `CountableTimeInterval`.
         * For example:
         *
         *     axis.tick.count = 5;
         *     axis.tick.count = year;
         *     axis.tick.count = month.every(6);
         */
        this.count = undefined;
    }
}
export class AxisLabel {
    constructor() {
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        /**
         * The padding between the labels and the ticks.
         */
        this.padding = 5;
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.color = 'rgba(87, 87, 87, 1)';
        /**
         * Custom label rotation in degrees.
         * Labels are rendered perpendicular to the axis line by default.
         * Or parallel to the axis line, if the {@link parallel} is set to `true`.
         * The value of this config is used as the angular offset/deflection
         * from the default rotation.
         */
        this.rotation = undefined;
        /**
         * If specified and axis labels may collide, they are rotated to reduce collisions. If the
         * `rotation` property is specified, it takes precedence.
         */
        this.autoRotate = undefined;
        /**
         * Rotation angle to use when autoRotate is applied.
         */
        this.autoRotateAngle = 335;
        /**
         * By default labels and ticks are positioned to the left of the axis line.
         * `true` positions the labels to the right of the axis line.
         * However, if the axis is rotated, it's easier to think in terms
         * of this side or the opposite side, rather than left and right.
         * We use the term `mirror` for conciseness, although it's not
         * true mirroring - for example, when a label is rotated, so that
         * it is inclined at the 45 degree angle, text flowing from north-west
         * to south-east, ending at the tick to the left of the axis line,
         * and then we set this config to `true`, the text will still be flowing
         * from north-west to south-east, _starting_ at the tick to the right
         * of the axis line.
         */
        this.mirrored = false;
        /**
         * Labels are rendered perpendicular to the axis line by default.
         * Setting this config to `true` makes labels render parallel to the axis line
         * and center aligns labels' text at the ticks.
         */
        this.parallel = false;
        /**
         * In case {@param value} is a number, the {@param fractionDigits} parameter will
         * be provided as well. The `fractionDigits` corresponds to the number of fraction
         * digits used by the tick step. For example, if the tick step is `0.0005`,
         * the `fractionDigits` is 4.
         */
        this.formatter = undefined;
        this.onFormatChange = undefined;
    }
    set format(value) {
        // See `TimeLocaleObject` docs for the list of supported format directives.
        if (this._format !== value) {
            this._format = value;
            if (this.onFormatChange) {
                this.onFormatChange(value);
            }
        }
    }
    get format() {
        return this._format;
    }
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
export class Axis {
    constructor(scale) {
        // debug (bbox)
        // private bboxRect = (() => {
        //     const rect = new Rect();
        //     rect.fill = undefined;
        //     rect.stroke = 'red';
        //     rect.strokeWidth = 1;
        //     rect.strokeOpacity = 0.2;
        //     return rect;
        // })();
        this.id = createId(this);
        this.lineNode = new Line();
        this.group = new Group();
        this.line = {
            width: 1,
            color: 'rgba(195, 195, 195, 1)'
        };
        this.tick = new AxisTick();
        this.label = new AxisLabel();
        this.translation = { x: 0, y: 0 };
        this.rotation = 0; // axis rotation angle in degrees
        this._labelAutoRotated = false;
        /**
         * This will be assigned a value when `this.calculateTickCount` is invoked.
         * If the user has specified a tick count, it will be used, otherwise a tick count will be calculated based on the available range.
         */
        this._calculatedTickCount = undefined;
        this.requestedRange = [0, 1];
        this._visibleRange = [0, 1];
        this._title = undefined;
        /**
         * The length of the grid. The grid is only visible in case of a non-zero value.
         * In case {@link radialGrid} is `true`, the value is interpreted as an angle
         * (in degrees).
         */
        this._gridLength = 0;
        /**
         * The array of styles to cycle through when rendering grid lines.
         * For example, use two {@link GridStyle} objects for alternating styles.
         * Contains only one {@link GridStyle} object by default, meaning all grid lines
         * have the same style.
         */
        this.gridStyle = [{
                stroke: 'rgba(219, 219, 219, 1)',
                lineDash: [4, 2]
            }];
        /**
         * `false` - render grid as lines of {@link gridLength} that extend the ticks
         *           on the opposite side of the axis
         * `true` - render grid as concentric circles that go through the ticks
         */
        this._radialGrid = false;
        this.fractionDigits = 0;
        this.thickness = 0;
        this.scale = scale;
        this.groupSelection = Selection.select(this.group).selectAll();
        this.label.onFormatChange = this.onLabelFormatChange.bind(this);
        this.group.append(this.lineNode);
        // this.group.append(this.bboxRect); // debug (bbox)
    }
    set scale(value) {
        this._scale = value;
        this.requestedRange = value.range.slice();
        this.onLabelFormatChange();
    }
    get scale() {
        return this._scale;
    }
    set ticks(values) {
        this._ticks = values;
    }
    get ticks() {
        return this._ticks;
    }
    get labelAutoRotated() {
        return this._labelAutoRotated;
    }
    get calculatedTickCount() {
        var _a;
        return _a = this._calculatedTickCount, (_a !== null && _a !== void 0 ? _a : this.tick.count);
    }
    /**
     * Overridden in ChartAxis subclass.
     * Sets an appropriate tick count based on the available range.
     */
    calculateTickCount(availableRange) { }
    /**
     * Meant to be overridden in subclasses to provide extra context the the label formatter.
     * The return value of this function will be passed to the laber.formatter as the `axis` parameter.
     */
    getMeta() { }
    updateRange() {
        const { requestedRange: rr, visibleRange: vr, scale } = this;
        const span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        const shift = span * vr[0];
        const start = rr[0] - shift;
        scale.range = [start, start + span];
    }
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x, width = 0, tolerance = 0) {
        return this.inRangeEx(x, width, tolerance) === 0;
    }
    inRangeEx(x, width = 0, tolerance = 0) {
        const { range } = this;
        // Account for inverted ranges, for example [500, 100] as well as [100, 500]
        const min = Math.min(range[0], range[1]);
        const max = Math.max(range[0], range[1]);
        if ((x + width) < (min - tolerance)) {
            return -1; // left of range
        }
        if (x > (max + tolerance)) {
            return 1; // right of range
        }
        return 0; // in range
    }
    set range(value) {
        this.requestedRange = value.slice();
        this.updateRange();
    }
    get range() {
        return this.requestedRange.slice();
    }
    set visibleRange(value) {
        if (value && value.length === 2) {
            let [min, max] = value;
            min = Math.max(0, min);
            max = Math.min(1, max);
            min = Math.min(min, max);
            max = Math.max(min, max);
            this._visibleRange = [min, max];
            this.updateRange();
        }
    }
    get visibleRange() {
        return this._visibleRange.slice();
    }
    set domain(value) {
        this.scale.domain = value.slice();
        this.onLabelFormatChange(this.label.format);
    }
    get domain() {
        return this.scale.domain.slice();
    }
    onLabelFormatChange(format) {
        if (format && this.scale && this.scale.tickFormat) {
            try {
                this.labelFormatter = this.scale.tickFormat(this.calculatedTickCount, format);
            }
            catch (e) {
                this.labelFormatter = undefined;
                doOnce(() => console.warn(`AG Charts - the axis label format string ${format} is invalid. No formatting will be applied`), `invalid axis label format string ${format}`);
            }
        }
        else {
            this.labelFormatter = undefined;
        }
    }
    set title(value) {
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                this.group.removeChild(oldTitle.node);
            }
            if (value) {
                value.node.rotation = -Math.PI / 2;
                this.group.appendChild(value.node);
            }
            this._title = value;
            // position title so that it doesn't briefly get rendered in the top left hand corner of the canvas before update is called.
            this.positionTitle();
        }
    }
    get title() {
        return this._title;
    }
    set gridLength(value) {
        // Was visible and now invisible, or was invisible and now visible.
        if (this._gridLength && !value || !this._gridLength && value) {
            this.groupSelection = this.groupSelection.remove().setData([]);
        }
        this._gridLength = value;
    }
    get gridLength() {
        return this._gridLength;
    }
    set radialGrid(value) {
        if (this._radialGrid !== value) {
            this._radialGrid = value;
            this.groupSelection = this.groupSelection.remove().setData([]);
        }
    }
    get radialGrid() {
        return this._radialGrid;
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
        const { group, scale, tick, label, gridStyle, requestedRange } = this;
        const requestedRangeMin = Math.min(requestedRange[0], requestedRange[1]);
        const requestedRangeMax = Math.max(requestedRange[0], requestedRange[1]);
        const rotation = toRadians(this.rotation);
        const labelRotation = label.rotation ? normalizeAngle360(toRadians(label.rotation)) : 0;
        const parallelLabels = label.parallel;
        let labelAutoRotation = 0;
        group.translationX = this.translation.x;
        group.translationY = this.translation.y;
        group.rotation = rotation;
        const halfBandwidth = (scale.bandwidth || 0) / 2;
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
        const parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        const regularFlipRotation = normalizeAngle360(rotation - Math.PI / 2);
        // Flip if the axis rotation angle is in the top hemisphere.
        const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        const ticks = this.ticks || scale.ticks(this.calculatedTickCount);
        const update = this.groupSelection.setData(ticks);
        update.exit.remove();
        const enter = update.enter.append(Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enter.append(Line).each(node => node.tag = Tags.Tick);
        if (this.gridLength) {
            if (this.radialGrid) {
                enter.append(Arc).each(node => node.tag = Tags.GridLine);
            }
            else {
                enter.append(Line).each(node => node.tag = Tags.GridLine);
            }
        }
        enter.append(Text);
        const groupSelection = update.merge(enter);
        let anyVisible = false;
        groupSelection
            .attrFn('translationY', function (_, datum) {
            return Math.round(scale.convert(datum) + halfBandwidth);
        })
            .attrFn('visible', function (node) {
            const min = Math.floor(requestedRangeMin);
            const max = Math.ceil(requestedRangeMax);
            const visible = (min !== max) && node.translationY >= min && node.translationY <= max;
            anyVisible = visible || anyVisible;
            return visible;
        });
        this.group.visible = anyVisible;
        if (!anyVisible) {
            this.groupSelection = groupSelection;
            return;
        }
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = ticks.fractionDigits >= 0 ? ticks.fractionDigits : 0;
        // Update properties that affect the size of the axis labels and measure the labels
        const labelBboxes = new Map();
        let labelCount = 0;
        let halfFirstLabelLength = false;
        let halfLastLabelLength = false;
        const availableRange = requestedRangeMax - requestedRangeMin;
        const labelSelection = groupSelection.selectByClass(Text)
            .each((node, datum, index) => {
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = this.formatTickDatum(datum, index);
            node.visible = node.parent.visible;
            if (node.visible !== true) {
                return;
            }
            labelBboxes.set(index, node.computeBBox());
            if (node.text === '' || node.text == undefined) {
                return;
            }
            labelCount++;
            if (index === 0 && (node.translationY === scale.range[0])) {
                halfFirstLabelLength = true; // first label protrudes axis line
            }
            else if (index === ticks.length - 1 && (node.translationY === scale.range[1])) {
                halfLastLabelLength = true; // last label protrudes axis line
            }
        });
        const labelX = sideFlag * (tick.size + label.padding);
        const step = availableRange / labelCount;
        const calculateLabelsLength = (bboxes, useWidth) => {
            let totalLength = 0;
            let rotate = false;
            const lastIdx = bboxes.size - 1;
            const padding = 12;
            for (let [i, bbox] of bboxes.entries()) {
                const divideBy = (i === 0 && halfFirstLabelLength) || (i === lastIdx && halfLastLabelLength) ? 2 : 1;
                const length = useWidth ? bbox.width / divideBy : bbox.height / divideBy;
                const lengthWithPadding = length <= 0 ? 0 : length + padding;
                totalLength += lengthWithPadding;
                if (lengthWithPadding > step) {
                    rotate = true;
                }
            }
            return { totalLength, rotate };
        };
        let useWidth = parallelLabels; // When the labels are parallel to the axis line, use the width of the text to calculate the total length of all labels
        let { totalLength: totalLabelLength, rotate } = calculateLabelsLength(labelBboxes, useWidth);
        this._labelAutoRotated = false;
        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = normalizeAngle360(toRadians(label.autoRotateAngle));
            this._labelAutoRotated = true;
        }
        if (labelRotation || labelAutoRotation) {
            // If the label rotation angle results in a non-parallel orientation, use the height of the texts to calculate the total length of all labels
            if (parallelLabels) {
                useWidth = (labelRotation === Math.PI) || (labelAutoRotation === Math.PI) ? true : false;
            }
            else {
                useWidth = labelRotation === Math.PI / 2 || labelRotation === (Math.PI + Math.PI / 2) || labelAutoRotation === Math.PI / 2 || labelAutoRotation === (Math.PI + Math.PI / 2) ? true : false;
            }
            totalLabelLength = calculateLabelsLength(labelBboxes, useWidth).totalLength;
        }
        const autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);
        const labelTextBaseline = parallelLabels && !labelRotation
            ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
            : 'middle';
        const alignFlag = (labelRotation > 0 && labelRotation <= Math.PI) || (labelAutoRotation > 0 && labelAutoRotation <= Math.PI) ? -1 : 1;
        const labelTextAlign = parallelLabels
            ? labelRotation || labelAutoRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
            : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
        labelSelection.each(label => {
            if (label.text === '' || label.text == undefined) {
                label.visible = false; // hide empty labels
                return;
            }
            label.textBaseline = labelTextBaseline;
            label.textAlign = labelTextAlign;
            label.x = labelX;
            label.rotationCenterX = labelX;
            label.rotation = autoRotation + labelRotation + labelAutoRotation;
        });
        if (totalLabelLength > availableRange) {
            const isContinuous = scale instanceof ContinuousScale;
            const averageLabelLength = totalLabelLength / labelCount;
            const labelsToShow = Math.floor(availableRange / averageLabelLength);
            const showEvery = labelsToShow > 2 ? Math.ceil(labelCount / labelsToShow) : labelCount;
            let visibleLabelIndex = 0;
            labelSelection.each((label, _, index) => {
                if (label.visible !== true) {
                    return;
                }
                const forceVisible = isContinuous && this.tick.count === undefined ? index === 0 || index === labelCount - 1 : false; // always show first and last labels for a continuous axis when tick count has not been specified by the user
                label.visible = forceVisible || visibleLabelIndex % showEvery === 0 ? true : false;
                visibleLabelIndex++;
                if (!label.visible) {
                    labelBboxes.delete(index);
                }
            });
        }
        groupSelection.selectByTag(Tags.Tick)
            .each((line, _, index) => {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.visible = labelBboxes.has(index);
        })
            .attr('x1', sideFlag * tick.size)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);
        if (this.gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let gridLines;
            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(this.gridLength));
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each((arc, datum, index) => {
                    const radius = Math.round(scale.convert(datum) + halfBandwidth);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength;
                    arc.radiusX = radius;
                    arc.radiusY = radius;
                    arc.visible = labelBboxes.has(index);
                });
            }
            else {
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each((line, _, index) => {
                    line.x1 = 0;
                    line.x2 = -sideFlag * this.gridLength;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent.translationY - scale.range[0]) > 1 && labelBboxes.has(index);
                });
            }
            gridLines.each((gridLine, _, index) => {
                const style = gridStyle[index % styleCount];
                gridLine.stroke = style.stroke;
                gridLine.strokeWidth = tick.width;
                gridLine.lineDash = style.lineDash;
                gridLine.fill = undefined;
            });
        }
        this.groupSelection = groupSelection;
        // Render axis line.
        const lineNode = this.lineNode;
        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = ticks.length > 0;
        this.positionTitle();
        // debug (bbox)
        // const bbox = this.computeBBox();
        // const bboxRect = this.bboxRect;
        // bboxRect.x = bbox.x;
        // bboxRect.y = bbox.y;
        // bboxRect.width = bbox.width;
        // bboxRect.height = bbox.height;
    }
    positionTitle() {
        const { title, lineNode } = this;
        if (!title) {
            return;
        }
        let titleVisible = false;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;
            const { label, rotation, requestedRange } = this;
            const sideFlag = label.mirrored ? 1 : -1;
            const parallelFlipRotation = normalizeAngle360(rotation);
            const padding = title.padding.bottom;
            const titleNode = title.node;
            const bbox = this.computeBBox({ excludeTitle: true });
            const titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = titleRotationFlag * sideFlag * Math.PI / 2;
            // titleNode.x = titleRotationFlag * sideFlag * (lineNode.y1 + lineNode.y2) / 2; // TODO: remove?
            titleNode.x = titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1]) / 2;
            if (sideFlag === -1) {
                titleNode.y = titleRotationFlag * (-padding - bbox.width + Math.max(bbox.x + bbox.width, 0));
            }
            else {
                titleNode.y = -padding - bbox.width - Math.min(bbox.x, 0);
            }
            titleNode.textBaseline = titleRotationFlag === 1 ? 'bottom' : 'top';
        }
        title.node.visible = titleVisible;
    }
    // For formatting (nice rounded) tick values.
    formatTickDatum(datum, index) {
        const { label, labelFormatter, fractionDigits } = this;
        const meta = this.getMeta();
        return label.formatter
            ? label.formatter({
                value: fractionDigits >= 0 ? datum : String(datum),
                index,
                fractionDigits,
                formatter: labelFormatter,
                axis: meta
            })
            : labelFormatter
                ? labelFormatter(datum)
                : typeof datum === 'number' && fractionDigits >= 0
                    // the `datum` is a floating point number
                    ? datum.toFixed(fractionDigits)
                    // the`datum` is an integer, a string or an object
                    : String(datum);
    }
    // For formatting arbitrary values between the ticks.
    formatDatum(datum) {
        return String(datum);
    }
    computeBBox(options) {
        const { title, lineNode } = this;
        const labels = this.groupSelection.selectByClass(Text);
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        labels.each(label => {
            // The label itself is rotated, but not translated, the group that
            // contains it is. So to capture the group transform in the label bbox
            // calculation we combine the transform matrices of the label and the group.
            // Depending on the timing of the `axis.computeBBox()` method call, we may
            // not have the group's and the label's transform matrices updated yet (because
            // the transform matrix is not recalculated whenever a node's transform attributes
            // change, instead it's marked for recalculation on the next frame by setting
            // the node's `dirtyTransform` flag to `true`), so we force them to update
            // right here by calling `computeTransformMatrix`.
            label.computeTransformMatrix();
            const matrix = Matrix.flyweight(label.matrix);
            const group = label.parent;
            group.computeTransformMatrix();
            matrix.preMultiplySelf(group.matrix);
            const labelBBox = label.computeBBox();
            if (labelBBox) {
                const bbox = matrix.transformBBox(labelBBox);
                left = Math.min(left, bbox.x);
                right = Math.max(right, bbox.x + bbox.width);
                top = Math.min(top, bbox.y);
                bottom = Math.max(bottom, bbox.y + bbox.height);
            }
        });
        if (title && title.enabled && lineNode.visible && (!options || !options.excludeTitle)) {
            const label = title.node;
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
        left = Math.min(left, 0);
        right = Math.max(right, 0);
        top = Math.min(top, lineNode.y1, lineNode.y2);
        bottom = Math.max(bottom, lineNode.y1, lineNode.y2);
        return new BBox(left, top, right - left, bottom - top);
    }
}
//# sourceMappingURL=axis.js.map