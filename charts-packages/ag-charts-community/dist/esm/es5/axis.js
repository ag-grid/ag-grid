var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
var AxisTick = /** @class */ (function () {
    function AxisTick() {
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
    return AxisTick;
}());
export { AxisTick };
var AxisLabel = /** @class */ (function () {
    function AxisLabel() {
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
    Object.defineProperty(AxisLabel.prototype, "format", {
        get: function () {
            return this._format;
        },
        set: function (value) {
            // See `TimeLocaleObject` docs for the list of supported format directives.
            if (this._format !== value) {
                this._format = value;
                if (this.onFormatChange) {
                    this.onFormatChange(value);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    return AxisLabel;
}());
export { AxisLabel };
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
var Axis = /** @class */ (function () {
    function Axis(scale) {
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
    Object.defineProperty(Axis.prototype, "scale", {
        get: function () {
            return this._scale;
        },
        set: function (value) {
            this._scale = value;
            this.requestedRange = value.range.slice();
            this.onLabelFormatChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "ticks", {
        get: function () {
            return this._ticks;
        },
        set: function (values) {
            this._ticks = values;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "labelAutoRotated", {
        get: function () {
            return this._labelAutoRotated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "calculatedTickCount", {
        get: function () {
            var _a;
            return _a = this._calculatedTickCount, (_a !== null && _a !== void 0 ? _a : this.tick.count);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Overridden in ChartAxis subclass.
     * Sets an appropriate tick count based on the available range.
     */
    Axis.prototype.calculateTickCount = function (availableRange) { };
    /**
     * Meant to be overridden in subclasses to provide extra context the the label formatter.
     * The return value of this function will be passed to the laber.formatter as the `axis` parameter.
     */
    Axis.prototype.getMeta = function () { };
    Axis.prototype.updateRange = function () {
        var _a = this, rr = _a.requestedRange, vr = _a.visibleRange, scale = _a.scale;
        var span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        var shift = span * vr[0];
        var start = rr[0] - shift;
        scale.range = [start, start + span];
    };
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    Axis.prototype.inRange = function (x, width, tolerance) {
        if (width === void 0) { width = 0; }
        if (tolerance === void 0) { tolerance = 0; }
        return this.inRangeEx(x, width, tolerance) === 0;
    };
    Axis.prototype.inRangeEx = function (x, width, tolerance) {
        if (width === void 0) { width = 0; }
        if (tolerance === void 0) { tolerance = 0; }
        var range = this.range;
        // Account for inverted ranges, for example [500, 100] as well as [100, 500]
        var min = Math.min(range[0], range[1]);
        var max = Math.max(range[0], range[1]);
        if ((x + width) < (min - tolerance)) {
            return -1; // left of range
        }
        if (x > (max + tolerance)) {
            return 1; // right of range
        }
        return 0; // in range
    };
    Object.defineProperty(Axis.prototype, "range", {
        get: function () {
            return this.requestedRange.slice();
        },
        set: function (value) {
            this.requestedRange = value.slice();
            this.updateRange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "visibleRange", {
        get: function () {
            return this._visibleRange.slice();
        },
        set: function (value) {
            if (value && value.length === 2) {
                var _a = __read(value, 2), min = _a[0], max = _a[1];
                min = Math.max(0, min);
                max = Math.min(1, max);
                min = Math.min(min, max);
                max = Math.max(min, max);
                this._visibleRange = [min, max];
                this.updateRange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "domain", {
        get: function () {
            return this.scale.domain.slice();
        },
        set: function (value) {
            this.scale.domain = value.slice();
            this.onLabelFormatChange(this.label.format);
        },
        enumerable: true,
        configurable: true
    });
    Axis.prototype.onLabelFormatChange = function (format) {
        if (format && this.scale && this.scale.tickFormat) {
            try {
                this.labelFormatter = this.scale.tickFormat(this.calculatedTickCount, format);
            }
            catch (e) {
                this.labelFormatter = undefined;
                doOnce(function () { return console.warn("AG Charts - the axis label format string " + format + " is invalid. No formatting will be applied"); }, "invalid axis label format string " + format);
            }
        }
        else {
            this.labelFormatter = undefined;
        }
    };
    Object.defineProperty(Axis.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var oldTitle = this._title;
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "gridLength", {
        get: function () {
            return this._gridLength;
        },
        set: function (value) {
            // Was visible and now invisible, or was invisible and now visible.
            if (this._gridLength && !value || !this._gridLength && value) {
                this.groupSelection = this.groupSelection.remove().setData([]);
            }
            this._gridLength = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "radialGrid", {
        get: function () {
            return this._radialGrid;
        },
        set: function (value) {
            if (this._radialGrid !== value) {
                this._radialGrid = value;
                this.groupSelection = this.groupSelection.remove().setData([]);
            }
        },
        enumerable: true,
        configurable: true
    });
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
    Axis.prototype.update = function () {
        var _this = this;
        var _a = this, group = _a.group, scale = _a.scale, tick = _a.tick, label = _a.label, gridStyle = _a.gridStyle, requestedRange = _a.requestedRange;
        var requestedRangeMin = Math.min(requestedRange[0], requestedRange[1]);
        var requestedRangeMax = Math.max(requestedRange[0], requestedRange[1]);
        var rotation = toRadians(this.rotation);
        var labelRotation = label.rotation ? normalizeAngle360(toRadians(label.rotation)) : 0;
        var parallelLabels = label.parallel;
        var labelAutoRotation = 0;
        group.translationX = this.translation.x;
        group.translationY = this.translation.y;
        group.rotation = rotation;
        var halfBandwidth = (scale.bandwidth || 0) / 2;
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        var sideFlag = label.mirrored ? 1 : -1;
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        var parallelFlipRotation = normalizeAngle360(rotation);
        var parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        var regularFlipRotation = normalizeAngle360(rotation - Math.PI / 2);
        // Flip if the axis rotation angle is in the top hemisphere.
        var regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        var ticks = this.ticks || scale.ticks(this.calculatedTickCount);
        var update = this.groupSelection.setData(ticks);
        update.exit.remove();
        var enter = update.enter.append(Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enter.append(Line).each(function (node) { return node.tag = Tags.Tick; });
        if (this.gridLength) {
            if (this.radialGrid) {
                enter.append(Arc).each(function (node) { return node.tag = Tags.GridLine; });
            }
            else {
                enter.append(Line).each(function (node) { return node.tag = Tags.GridLine; });
            }
        }
        enter.append(Text);
        var groupSelection = update.merge(enter);
        var anyVisible = false;
        groupSelection
            .attrFn('translationY', function (_, datum) {
            return Math.round(scale.convert(datum) + halfBandwidth);
        })
            .attrFn('visible', function (node) {
            var min = Math.floor(requestedRangeMin);
            var max = Math.ceil(requestedRangeMax);
            var visible = (min !== max) && node.translationY >= min && node.translationY <= max;
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
        var labelBboxes = new Map();
        var labelCount = 0;
        var halfFirstLabelLength = false;
        var halfLastLabelLength = false;
        var availableRange = requestedRangeMax - requestedRangeMin;
        var labelSelection = groupSelection.selectByClass(Text)
            .each(function (node, datum, index) {
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = _this.formatTickDatum(datum, index);
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
        var labelX = sideFlag * (tick.size + label.padding);
        var step = availableRange / labelCount;
        var calculateLabelsLength = function (bboxes, useWidth) {
            var e_1, _a;
            var totalLength = 0;
            var rotate = false;
            var lastIdx = bboxes.size - 1;
            var padding = 12;
            try {
                for (var _b = __values(bboxes.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), i = _d[0], bbox = _d[1];
                    var divideBy = (i === 0 && halfFirstLabelLength) || (i === lastIdx && halfLastLabelLength) ? 2 : 1;
                    var length_1 = useWidth ? bbox.width / divideBy : bbox.height / divideBy;
                    var lengthWithPadding = length_1 <= 0 ? 0 : length_1 + padding;
                    totalLength += lengthWithPadding;
                    if (lengthWithPadding > step) {
                        rotate = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return { totalLength: totalLength, rotate: rotate };
        };
        var useWidth = parallelLabels; // When the labels are parallel to the axis line, use the width of the text to calculate the total length of all labels
        var _b = calculateLabelsLength(labelBboxes, useWidth), totalLabelLength = _b.totalLength, rotate = _b.rotate;
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
        var autoRotation = parallelLabels
            ? parallelFlipFlag * Math.PI / 2
            : (regularFlipFlag === -1 ? Math.PI : 0);
        var labelTextBaseline = parallelLabels && !labelRotation
            ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom')
            : 'middle';
        var alignFlag = (labelRotation > 0 && labelRotation <= Math.PI) || (labelAutoRotation > 0 && labelAutoRotation <= Math.PI) ? -1 : 1;
        var labelTextAlign = parallelLabels
            ? labelRotation || labelAutoRotation ? (sideFlag * alignFlag === -1 ? 'end' : 'start') : 'center'
            : sideFlag * regularFlipFlag === -1 ? 'end' : 'start';
        labelSelection.each(function (label) {
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
            var isContinuous_1 = scale instanceof ContinuousScale;
            var averageLabelLength = totalLabelLength / labelCount;
            var labelsToShow = Math.floor(availableRange / averageLabelLength);
            var showEvery_1 = labelsToShow > 2 ? Math.ceil(labelCount / labelsToShow) : labelCount;
            var visibleLabelIndex_1 = 0;
            labelSelection.each(function (label, _, index) {
                if (label.visible !== true) {
                    return;
                }
                var forceVisible = isContinuous_1 && _this.tick.count === undefined ? index === 0 || index === labelCount - 1 : false; // always show first and last labels for a continuous axis when tick count has not been specified by the user
                label.visible = forceVisible || visibleLabelIndex_1 % showEvery_1 === 0 ? true : false;
                visibleLabelIndex_1++;
                if (!label.visible) {
                    labelBboxes.delete(index);
                }
            });
        }
        groupSelection.selectByTag(Tags.Tick)
            .each(function (line, _, index) {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.visible = labelBboxes.has(index);
        })
            .attr('x1', sideFlag * tick.size)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);
        if (this.gridLength && gridStyle.length) {
            var styleCount_1 = gridStyle.length;
            var gridLines = void 0;
            if (this.radialGrid) {
                var angularGridLength_1 = normalizeAngle360Inclusive(toRadians(this.gridLength));
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each(function (arc, datum, index) {
                    var radius = Math.round(scale.convert(datum) + halfBandwidth);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength_1;
                    arc.radiusX = radius;
                    arc.radiusY = radius;
                    arc.visible = labelBboxes.has(index);
                });
            }
            else {
                gridLines = groupSelection.selectByTag(Tags.GridLine)
                    .each(function (line, _, index) {
                    line.x1 = 0;
                    line.x2 = -sideFlag * _this.gridLength;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent.translationY - scale.range[0]) > 1 && labelBboxes.has(index);
                });
            }
            gridLines.each(function (gridLine, _, index) {
                var style = gridStyle[index % styleCount_1];
                gridLine.stroke = style.stroke;
                gridLine.strokeWidth = tick.width;
                gridLine.lineDash = style.lineDash;
                gridLine.fill = undefined;
            });
        }
        this.groupSelection = groupSelection;
        // Render axis line.
        var lineNode = this.lineNode;
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
    };
    Axis.prototype.positionTitle = function () {
        var _a = this, title = _a.title, lineNode = _a.lineNode;
        if (!title) {
            return;
        }
        var titleVisible = false;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;
            var _b = this, label = _b.label, rotation = _b.rotation, requestedRange = _b.requestedRange;
            var sideFlag = label.mirrored ? 1 : -1;
            var parallelFlipRotation = normalizeAngle360(rotation);
            var padding = title.padding.bottom;
            var titleNode = title.node;
            var bbox = this.computeBBox({ excludeTitle: true });
            var titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
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
    };
    // For formatting (nice rounded) tick values.
    Axis.prototype.formatTickDatum = function (datum, index) {
        var _a = this, label = _a.label, labelFormatter = _a.labelFormatter, fractionDigits = _a.fractionDigits;
        var meta = this.getMeta();
        return label.formatter
            ? label.formatter({
                value: fractionDigits >= 0 ? datum : String(datum),
                index: index,
                fractionDigits: fractionDigits,
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
    };
    // For formatting arbitrary values between the ticks.
    Axis.prototype.formatDatum = function (datum) {
        return String(datum);
    };
    Axis.prototype.computeBBox = function (options) {
        var _a = this, title = _a.title, lineNode = _a.lineNode;
        var labels = this.groupSelection.selectByClass(Text);
        var left = Infinity;
        var right = -Infinity;
        var top = Infinity;
        var bottom = -Infinity;
        labels.each(function (label) {
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
            var matrix = Matrix.flyweight(label.matrix);
            var group = label.parent;
            group.computeTransformMatrix();
            matrix.preMultiplySelf(group.matrix);
            var labelBBox = label.computeBBox();
            if (labelBBox) {
                var bbox = matrix.transformBBox(labelBBox);
                left = Math.min(left, bbox.x);
                right = Math.max(right, bbox.x + bbox.width);
                top = Math.min(top, bbox.y);
                bottom = Math.max(bottom, bbox.y + bbox.height);
            }
        });
        if (title && title.enabled && lineNode.visible && (!options || !options.excludeTitle)) {
            var label = title.node;
            label.computeTransformMatrix();
            var matrix = Matrix.flyweight(label.matrix);
            var labelBBox = label.computeBBox();
            if (labelBBox) {
                var bbox = matrix.transformBBox(labelBBox);
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
    };
    return Axis;
}());
export { Axis };
//# sourceMappingURL=axis.js.map