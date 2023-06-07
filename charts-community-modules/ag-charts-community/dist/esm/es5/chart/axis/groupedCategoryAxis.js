var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Selection } from '../../scene/selection';
import { Line } from '../../scene/shape/line';
import { normalizeAngle360, toRadians } from '../../util/angle';
import { Text } from '../../scene/shape/text';
import { BandScale } from '../../scale/bandScale';
import { ticksToTree, treeLayout } from '../../layout/tree';
import { AxisLabel, AxisLine } from '../../axis';
import { ChartAxis } from '../chartAxis';
import { ChartAxisDirection } from '../chartAxisDirection';
import { extent } from '../../util/array';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../../util/validation';
import { calculateLabelRotation } from '../label';
var GroupedCategoryAxisLabel = /** @class */ (function (_super) {
    __extends(GroupedCategoryAxisLabel, _super);
    function GroupedCategoryAxisLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.grid = false;
        return _this;
    }
    __decorate([
        Validate(BOOLEAN)
    ], GroupedCategoryAxisLabel.prototype, "grid", void 0);
    return GroupedCategoryAxisLabel;
}(AxisLabel));
var GroupedCategoryAxis = /** @class */ (function (_super) {
    __extends(GroupedCategoryAxis, _super);
    function GroupedCategoryAxis(moduleCtx) {
        var _this = _super.call(this, moduleCtx, new BandScale()) || this;
        // Label scale (labels are positioned between ticks, tick count = label count + 1).
        // We don't call is `labelScale` for consistency with other axes.
        _this.tickScale = new BandScale();
        _this.translation = {
            x: 0,
            y: 0,
        };
        _this.line = new AxisLine();
        _this.label = new GroupedCategoryAxisLabel();
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        _this.labelColor = 'rgba(87, 87, 87, 1)';
        _this.includeInvisibleDomains = true;
        var _a = _this, tickLineGroup = _a.tickLineGroup, tickLabelGroup = _a.tickLabelGroup, gridLineGroup = _a.gridLineGroup, tickScale = _a.tickScale, scale = _a.scale;
        scale.paddingOuter = 0.1;
        scale.paddingInner = scale.paddingOuter * 2;
        _this.range = scale.range.slice();
        _this.refreshScale();
        tickScale.paddingInner = 1;
        tickScale.paddingOuter = 0;
        _this.gridLineSelection = Selection.select(gridLineGroup, Line);
        _this.axisLineSelection = Selection.select(tickLineGroup, Line);
        _this.separatorSelection = Selection.select(tickLineGroup, Line);
        _this.labelSelection = Selection.select(tickLabelGroup, Text);
        return _this;
    }
    GroupedCategoryAxis.prototype.updateRange = function () {
        var _a = this, rr = _a.range, vr = _a.visibleRange, scale = _a.scale;
        var span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        var shift = span * vr[0];
        var start = rr[0] - shift;
        this.tickScale.range = scale.range = [start, start + span];
        this.resizeTickTree();
    };
    GroupedCategoryAxis.prototype.resizeTickTree = function () {
        var _a;
        var s = this.scale;
        var range = s.domain.length ? [s.convert(s.domain[0]), s.convert(s.domain[s.domain.length - 1])] : s.range;
        var layout = this.tickTreeLayout;
        var lineHeight = this.lineHeight;
        if (layout) {
            layout.resize(Math.abs(range[1] - range[0]), layout.depth * lineHeight, (Math.min(range[0], range[1]) || 0) + ((_a = s.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2, -layout.depth * lineHeight, range[1] - range[0] < 0);
        }
    };
    Object.defineProperty(GroupedCategoryAxis.prototype, "lineHeight", {
        get: function () {
            return this.label.fontSize * 1.5;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GroupedCategoryAxis.prototype, "gridLength", {
        get: function () {
            return this._gridLength;
        },
        /**
         * The length of the grid. The grid is only visible in case of a non-zero value.
         */
        set: function (value) {
            // Was visible and now invisible, or was invisible and now visible.
            if ((this._gridLength && !value) || (!this._gridLength && value)) {
                this.gridLineSelection.clear();
                this.labelSelection.clear();
            }
            this._gridLength = value;
        },
        enumerable: false,
        configurable: true
    });
    GroupedCategoryAxis.prototype.calculateDomain = function () {
        var _a;
        var _b;
        var _c = this, direction = _c.direction, boundSeries = _c.boundSeries;
        var domains = [];
        var isNumericX = undefined;
        boundSeries
            .filter(function (s) { return s.visible; })
            .forEach(function (series) {
            if (direction === ChartAxisDirection.X) {
                if (isNumericX === undefined) {
                    // always add first X domain
                    var domain_1 = series.getDomain(direction);
                    domains.push(domain_1);
                    isNumericX = typeof domain_1[0] === 'number';
                }
                else if (isNumericX) {
                    // only add further X domains if the axis is numeric
                    domains.push(series.getDomain(direction));
                }
            }
            else {
                domains.push(series.getDomain(direction));
            }
        });
        var domain = (_a = new Array()).concat.apply(_a, __spreadArray([], __read(domains)));
        var values = (_b = extent(domain)) !== null && _b !== void 0 ? _b : domain;
        this.dataDomain = this.normaliseDataDomain(values);
        this.scale.domain = this.dataDomain;
    };
    GroupedCategoryAxis.prototype.normaliseDataDomain = function (d) {
        // Prevent duplicate categories.
        var values = d.filter(function (s, i, arr) { return arr.indexOf(s) === i; });
        var tickTree = ticksToTree(values);
        this.tickTreeLayout = treeLayout(tickTree);
        var tickScaleDomain = values.slice();
        tickScaleDomain.push('');
        this.tickScale.domain = tickScaleDomain;
        this.resizeTickTree();
        return values;
    };
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
    GroupedCategoryAxis.prototype.update = function (primaryTickCount) {
        var _this = this;
        this.updateDirection();
        this.calculateDomain();
        this.updateRange();
        var _a = this, scale = _a.scale, label = _a.label, parallel = _a.label.parallel, callbackCache = _a.moduleCtx.callbackCache, tickScale = _a.tickScale, requestedRange = _a.range, title = _a.title, _b = _a.title, _c = _b === void 0 ? {} : _b, _d = _c.formatter, formatter = _d === void 0 ? function (p) { return p.defaultValue; } : _d, _titleCaption = _a._titleCaption;
        var rangeStart = scale.range[0];
        var rangeEnd = scale.range[1];
        var rangeLength = Math.abs(rangeEnd - rangeStart);
        var bandwidth = rangeLength / scale.domain.length || 0;
        var rotation = toRadians(this.rotation);
        var isHorizontal = Math.abs(Math.cos(rotation)) < 1e-8;
        var sideFlag = label.getSideFlag();
        this.updatePosition({ rotation: rotation, sideFlag: sideFlag });
        // The Text `node` of the Caption is not used to render the title of the grouped category axis.
        // The phantom root of the tree layout is used instead.
        _titleCaption.node.visible = false;
        var lineHeight = this.lineHeight;
        // Render ticks and labels.
        var tickTreeLayout = this.tickTreeLayout;
        var labels = scale.ticks();
        var treeLabels = tickTreeLayout ? tickTreeLayout.nodes : [];
        var isLabelTree = tickTreeLayout ? tickTreeLayout.depth > 1 : false;
        var ticks = tickScale.ticks();
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        var _e = calculateLabelRotation({
            rotation: label.rotation,
            parallel: parallel,
            regularFlipRotation: normalizeAngle360(rotation - Math.PI / 2),
            parallelFlipRotation: normalizeAngle360(rotation),
        }), defaultRotation = _e.defaultRotation, configuredRotation = _e.configuredRotation, parallelFlipFlag = _e.parallelFlipFlag;
        var gridLineSelection = this.gridLineSelection.update(this.gridLength ? ticks : []);
        var labelSelection = this.labelSelection.update(treeLabels);
        var labelFormatter = label.formatter;
        var labelBBoxes = new Map();
        var maxLeafLabelWidth = 0;
        labelSelection.each(function (node, datum, index) {
            var _a;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.textBaseline = parallelFlipFlag === -1 ? 'bottom' : 'hanging';
            node.textAlign = 'center';
            node.translationX = datum.screenY - label.fontSize * 0.25;
            node.translationY = datum.screenX;
            if (index === 0) {
                // use the phantom root as the axis title
                if ((title === null || title === void 0 ? void 0 : title.enabled) && labels.length > 0) {
                    node.visible = true;
                    node.text = callbackCache.call(formatter, _this.getTitleFormatterParams());
                    node.fontSize = title.fontSize;
                    node.fontStyle = title.fontStyle;
                    node.fontWeight = title.fontWeight;
                    node.fontFamily = title.fontFamily;
                    node.textBaseline = 'hanging';
                }
                else {
                    node.visible = false;
                }
            }
            else if (labelFormatter) {
                node.text =
                    (_a = callbackCache.call(labelFormatter, {
                        value: String(datum.label),
                        index: index,
                    })) !== null && _a !== void 0 ? _a : String(datum.label);
                node.visible = datum.screenX >= requestedRange[0] && datum.screenX <= requestedRange[1];
            }
            else {
                node.text = String(datum.label);
                node.visible = datum.screenX >= requestedRange[0] && datum.screenX <= requestedRange[1];
            }
            var bbox = node.computeBBox();
            labelBBoxes.set(node.id, bbox);
            if (bbox.width > maxLeafLabelWidth) {
                maxLeafLabelWidth = bbox.width;
            }
        });
        var labelX = sideFlag * label.padding;
        var labelGrid = this.label.grid;
        var separatorData = [];
        labelSelection.each(function (label, datum, index) {
            label.x = labelX;
            label.rotationCenterX = labelX;
            if (!datum.children.length) {
                label.rotation = configuredRotation;
                label.textAlign = 'end';
                label.textBaseline = 'middle';
                var bbox = labelBBoxes.get(label.id);
                if (bbox && bbox.height > bandwidth) {
                    label.visible = false;
                }
            }
            else {
                label.translationX -= maxLeafLabelWidth - lineHeight + _this.label.padding;
                var availableRange = datum.leafCount * bandwidth;
                var bbox = labelBBoxes.get(label.id);
                if (bbox && bbox.width > availableRange) {
                    label.visible = false;
                }
                else if (isHorizontal) {
                    label.rotation = defaultRotation;
                }
                else {
                    label.rotation = -Math.PI / 2;
                }
            }
            // Calculate positions of label separators for all nodes except the root.
            // Each separator is placed to the top of the current label.
            if (datum.parent && isLabelTree) {
                var y = !datum.children.length
                    ? datum.screenX - bandwidth / 2
                    : datum.screenX - (datum.leafCount * bandwidth) / 2;
                if (!datum.children.length) {
                    if (datum.number !== datum.children.length - 1 || labelGrid) {
                        separatorData.push({
                            y: y,
                            x1: 0,
                            x2: -maxLeafLabelWidth - _this.label.padding * 2,
                            toString: function () { return String(index); },
                        });
                    }
                }
                else {
                    var x = -maxLeafLabelWidth - _this.label.padding * 2 + datum.screenY;
                    separatorData.push({
                        y: y,
                        x1: x + lineHeight,
                        x2: x,
                        toString: function () { return String(index); },
                    });
                }
            }
        });
        // Calculate the position of the long separator on the far bottom of the axis.
        var minX = 0;
        separatorData.forEach(function (d) { return (minX = Math.min(minX, d.x2)); });
        separatorData.push({
            y: Math.max(rangeStart, rangeEnd),
            x1: 0,
            x2: minX,
            toString: function () { return String(separatorData.length); },
        });
        var separatorSelection = this.separatorSelection.update(separatorData);
        var epsilon = 0.0000001;
        separatorSelection.each(function (line, datum) {
            line.x1 = datum.x1;
            line.x2 = datum.x2;
            line.y1 = datum.y;
            line.y2 = datum.y;
            line.visible = datum.y >= requestedRange[0] - epsilon && datum.y <= requestedRange[1] + epsilon;
            line.stroke = _this.tick.color;
            line.fill = undefined;
            line.strokeWidth = 1;
        });
        this.gridLineSelection = gridLineSelection;
        this.labelSelection = labelSelection;
        // Render axis lines.
        var lineCount = tickTreeLayout ? tickTreeLayout.depth + 1 : 1;
        var lines = [];
        for (var i = 0; i < lineCount; i++) {
            lines.push(i);
        }
        var axisLineSelection = this.axisLineSelection.update(lines);
        axisLineSelection.each(function (line, _, index) {
            var x = index > 0 ? -maxLeafLabelWidth - _this.label.padding * 2 - (index - 1) * lineHeight : 0;
            line.x1 = x;
            line.x2 = x;
            line.y1 = requestedRange[0];
            line.y2 = requestedRange[1];
            line.strokeWidth = _this.line.width;
            line.stroke = _this.line.color;
            line.visible = labels.length > 0 && (index === 0 || (labelGrid && isLabelTree));
        });
        if (this.gridLength) {
            var styles_1 = this.gridStyle;
            var styleCount_1 = styles_1.length;
            gridLineSelection.each(function (line, datum, index) {
                var y = Math.round(tickScale.convert(datum));
                line.x1 = 0;
                line.x2 = -sideFlag * _this.gridLength;
                line.y1 = y;
                line.y2 = y;
                line.visible = y >= requestedRange[0] && y <= requestedRange[1];
                var style = styles_1[index % styleCount_1];
                line.stroke = style.stroke;
                line.strokeWidth = _this.tick.width;
                line.lineDash = style.lineDash;
                line.fill = undefined;
            });
        }
        return primaryTickCount;
    };
    GroupedCategoryAxis.className = 'GroupedCategoryAxis';
    GroupedCategoryAxis.type = 'groupedCategory';
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], GroupedCategoryAxis.prototype, "labelColor", void 0);
    return GroupedCategoryAxis;
}(ChartAxis));
export { GroupedCategoryAxis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBlZENhdGVnb3J5QXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9heGlzL2dyb3VwZWRDYXRlZ29yeUF4aXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDaEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTlDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFjLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2pELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxEO0lBQXVDLDRDQUFTO0lBQWhEO1FBQUEscUVBR0M7UUFERyxVQUFJLEdBQVksS0FBSyxDQUFDOztJQUMxQixDQUFDO0lBREc7UUFEQyxRQUFRLENBQUMsT0FBTyxDQUFDOzBEQUNJO0lBQzFCLCtCQUFDO0NBQUEsQUFIRCxDQUF1QyxTQUFT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