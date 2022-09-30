"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
Object.defineProperty(exports, "__esModule", { value: true });
var selection_1 = require("../../../scene/selection");
var hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
var label_1 = require("../../label");
var series_1 = require("../series");
var hierarchySeries_1 = require("./hierarchySeries");
var chart_1 = require("../../chart");
var group_1 = require("../../../scene/group");
var text_1 = require("../../../scene/shape/text");
var rect_1 = require("../../../scene/shape/rect");
var dropShadow_1 = require("../../../scene/dropShadow");
var linearScale_1 = require("../../../scale/linearScale");
var treemap_1 = require("../../../layout/treemap");
var hierarchy_1 = require("../../../layout/hierarchy");
var number_1 = require("../../../util/number");
var path2D_1 = require("../../../scene/path2D");
var validation_1 = require("../../../util/validation");
var TreemapSeriesTooltip = /** @class */ (function (_super) {
    __extends(TreemapSeriesTooltip, _super);
    function TreemapSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], TreemapSeriesTooltip.prototype, "renderer", void 0);
    return TreemapSeriesTooltip;
}(series_1.SeriesTooltip));
exports.TreemapSeriesTooltip = TreemapSeriesTooltip;
var TreemapSeriesLabel = /** @class */ (function (_super) {
    __extends(TreemapSeriesLabel, _super);
    function TreemapSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.padding = 10;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], TreemapSeriesLabel.prototype, "padding", void 0);
    return TreemapSeriesLabel;
}(label_1.Label));
exports.TreemapSeriesLabel = TreemapSeriesLabel;
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
var TreemapSeries = /** @class */ (function (_super) {
    __extends(TreemapSeries, _super);
    function TreemapSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groupSelection = selection_1.Selection.select(_this.pickGroup).selectAll();
        _this.highlightSelection = selection_1.Selection.select(_this.highlightGroup).selectAll();
        _this.layout = new treemap_1.Treemap();
        _this.title = (function () {
            var label = new TreemapSeriesLabel();
            label.color = 'white';
            label.fontWeight = 'bold';
            label.fontSize = 12;
            label.fontFamily = 'Verdana, sans-serif';
            label.padding = 15;
            return label;
        })();
        _this.subtitle = (function () {
            var label = new TreemapSeriesLabel();
            label.color = 'white';
            label.fontSize = 9;
            label.fontFamily = 'Verdana, sans-serif';
            label.padding = 13;
            return label;
        })();
        _this.labels = {
            large: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            color: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                return label;
            })(),
        };
        _this._nodePadding = 2;
        _this.labelKey = 'label';
        _this.sizeKey = 'size';
        _this.colorKey = 'color';
        _this.colorDomain = [-5, 5];
        _this.colorRange = ['#cb4b3f', '#6acb64'];
        _this.colorParents = false;
        _this.gradient = true;
        _this.formatter = undefined;
        _this.colorName = 'Change';
        _this.rootName = 'Root';
        _this.shadow = (function () {
            var shadow = new dropShadow_1.DropShadow();
            shadow.color = 'rgba(0, 0, 0, 0.4)';
            shadow.xOffset = 1.5;
            shadow.yOffset = 1.5;
            return shadow;
        })();
        _this.tooltip = new TreemapSeriesTooltip();
        return _this;
    }
    Object.defineProperty(TreemapSeries.prototype, "nodePadding", {
        get: function () {
            return this._nodePadding;
        },
        set: function (value) {
            if (this._nodePadding !== value) {
                this._nodePadding = value;
                this.updateLayoutPadding();
            }
        },
        enumerable: true,
        configurable: true
    });
    TreemapSeries.prototype.updateLayoutPadding = function () {
        var _a = this, title = _a.title, subtitle = _a.subtitle, nodePadding = _a.nodePadding, labelKey = _a.labelKey;
        this.layout.paddingRight = function (_) { return nodePadding; };
        this.layout.paddingBottom = function (_) { return nodePadding; };
        this.layout.paddingLeft = function (_) { return nodePadding; };
        this.layout.paddingTop = function (node) {
            var name = node.datum[labelKey] || '';
            if (node.children) {
                name = name.toUpperCase();
            }
            var font = node.depth > 1 ? subtitle : title;
            var textSize = hdpiCanvas_1.HdpiCanvas.getTextSize(name, [font.fontWeight, font.fontSize + 'px', font.fontFamily].join(' ').trim());
            var innerNodeWidth = node.x1 - node.x0 - nodePadding * 2;
            var hasTitle = node.depth > 0 && node.children && textSize.width <= innerNodeWidth;
            node.hasTitle = !!hasTitle;
            return hasTitle ? textSize.height + nodePadding * 2 : nodePadding;
        };
    };
    TreemapSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            function traverse(root, depth) {
                if (depth === void 0) { depth = 0; }
                var children = root.children, datum = root.datum;
                var label = datum[labelKey];
                var colorValue = colorKey ? datum[colorKey] : depth;
                Object.assign(root, { series: series });
                root.fill = !children || colorParents ? colorScale.convert(colorValue) : '#272931';
                root.colorValue = colorValue;
                if (label) {
                    root.label = children ? label.toUpperCase() : label;
                }
                else {
                    root.label = '';
                }
                if (children) {
                    children.forEach(function (child) { return traverse(child, depth + 1); });
                }
            }
            var _a, data, sizeKey, labelKey, colorKey, colorDomain, colorRange, colorParents, dataRoot, colorScale, series;
            return __generator(this, function (_b) {
                if (!this.data) {
                    return [2 /*return*/];
                }
                _a = this, data = _a.data, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorDomain = _a.colorDomain, colorRange = _a.colorRange, colorParents = _a.colorParents;
                if (sizeKey) {
                    dataRoot = hierarchy_1.hierarchy(data).sum(function (datum) { return (datum.children ? 1 : datum[sizeKey]); });
                }
                else {
                    dataRoot = hierarchy_1.hierarchy(data).sum(function (datum) { return (datum.children ? 0 : 1); });
                }
                this.dataRoot = dataRoot;
                colorScale = new linearScale_1.LinearScale();
                colorScale.domain = colorDomain;
                colorScale.range = colorRange;
                series = this;
                traverse(this.dataRoot);
                return [2 /*return*/];
            });
        });
    };
    TreemapSeries.prototype.getLabelCenterX = function (datum) {
        return (datum.x0 + datum.x1) / 2;
    };
    TreemapSeries.prototype.getLabelCenterY = function (datum) {
        return (datum.y0 + datum.y1) / 2 + 2;
    };
    TreemapSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    TreemapSeries.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateSelections()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.updateNodes()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TreemapSeries.prototype.updateSelections = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, chart, dataRoot, seriesRect, descendants, _b, groupSelection, highlightSelection, update;
            return __generator(this, function (_c) {
                if (!this.nodeDataRefresh) {
                    return [2 /*return*/];
                }
                this.nodeDataRefresh = false;
                _a = this, chart = _a.chart, dataRoot = _a.dataRoot;
                if (!chart || !dataRoot) {
                    return [2 /*return*/];
                }
                seriesRect = chart.getSeriesRect();
                if (!seriesRect) {
                    return [2 /*return*/];
                }
                this.layout.size = [seriesRect.width, seriesRect.height];
                this.updateLayoutPadding();
                descendants = this.layout.processData(dataRoot).descendants();
                _b = this, groupSelection = _b.groupSelection, highlightSelection = _b.highlightSelection;
                update = function (selection) {
                    var updateGroups = selection.setData(descendants);
                    updateGroups.exit.remove();
                    var enterGroups = updateGroups.enter.append(group_1.Group);
                    enterGroups.append(rect_1.Rect);
                    enterGroups.append(text_1.Text).each(function (node) { return (node.tag = TextNodeTag.Name); });
                    enterGroups.append(text_1.Text).each(function (node) { return (node.tag = TextNodeTag.Value); });
                    return updateGroups.merge(enterGroups);
                };
                this.groupSelection = update(groupSelection);
                this.highlightSelection = update(highlightSelection);
                return [2 /*return*/];
            });
        });
    };
    TreemapSeries.prototype.updateNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, nodePadding, labels, shadow, gradient, highlightedDatum, _b, deprecatedFill, deprecatedStroke, deprecatedStrokeWidth, _c, _d, highlightedFill, highlightedFillOpacity, _e, highlightedStroke, _f, highlightedDatumStrokeWidth, formatter, colorKey, labelKey, sizeKey, labelMeta, updateRectFn, updateNodeFn, updateValueFn;
            var _this = this;
            return __generator(this, function (_g) {
                if (!this.chart) {
                    return [2 /*return*/];
                }
                _a = this, nodePadding = _a.nodePadding, labels = _a.labels, shadow = _a.shadow, gradient = _a.gradient, highlightedDatum = _a.chart.highlightedDatum, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, highlightedFillOpacity = _c.fillOpacity, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f, formatter = _a.formatter, colorKey = _a.colorKey, labelKey = _a.labelKey, sizeKey = _a.sizeKey;
                labelMeta = this.buildLabelMeta(this.groupSelection.data);
                updateRectFn = function (rect, datum, isDatumHighlighted) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                    var fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1), (_a !== null && _a !== void 0 ? _a : 1));
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined
                        ? highlightedStroke
                        : datum.depth < 2
                            ? undefined
                            : 'black';
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined ? highlightedDatumStrokeWidth : 1;
                    var format;
                    if (formatter) {
                        format = formatter({
                            datum: datum.datum,
                            colorKey: colorKey,
                            sizeKey: sizeKey,
                            labelKey: labelKey,
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: strokeWidth,
                            gradient: gradient,
                            highlighted: isDatumHighlighted,
                        });
                    }
                    rect.fill = (_c = (_b = format) === null || _b === void 0 ? void 0 : _b.fill, (_c !== null && _c !== void 0 ? _c : fill));
                    rect.fillOpacity = (_e = (_d = format) === null || _d === void 0 ? void 0 : _d.fillOpacity, (_e !== null && _e !== void 0 ? _e : fillOpacity));
                    rect.stroke = (_g = (_f = format) === null || _f === void 0 ? void 0 : _f.stroke, (_g !== null && _g !== void 0 ? _g : stroke));
                    rect.strokeWidth = (_j = (_h = format) === null || _h === void 0 ? void 0 : _h.strokeWidth, (_j !== null && _j !== void 0 ? _j : strokeWidth));
                    rect.gradient = (_l = (_k = format) === null || _k === void 0 ? void 0 : _k.gradient, (_l !== null && _l !== void 0 ? _l : gradient));
                    rect.crisp = true;
                    rect.x = datum.x0;
                    rect.y = datum.y0;
                    rect.width = datum.x1 - datum.x0;
                    rect.height = datum.y1 - datum.y0;
                    if (isDatumHighlighted && datum.children) {
                        var x0 = datum.x0, x1 = datum.x1, y0 = datum.y0, y1 = datum.y1;
                        var pLeft = _this.layout.paddingLeft(datum);
                        var pRight = _this.layout.paddingRight(datum);
                        var pTop = _this.layout.paddingTop(datum);
                        var pBottom = _this.layout.paddingBottom(datum);
                        if (rect.clipPath) {
                            rect.clipPath.clear();
                        }
                        else {
                            rect.clipPath = new path2D_1.Path2D();
                        }
                        rect.clipMode = 'punch-out';
                        rect.clipPath.moveTo(x0 + pLeft, y0 + pTop);
                        rect.clipPath.lineTo(x1 - pRight, y0 + pTop);
                        rect.clipPath.lineTo(x1 - pRight, y1 - pBottom);
                        rect.clipPath.lineTo(x0 + pLeft, y1 - pBottom);
                        rect.clipPath.lineTo(x0 + pLeft, y0 + pTop);
                        rect.clipPath.closePath();
                    }
                };
                this.groupSelection.selectByClass(rect_1.Rect).each(function (rect, datum) { return updateRectFn(rect, datum, false); });
                this.highlightSelection.selectByClass(rect_1.Rect).each(function (rect, datum) {
                    var isDatumHighlighted = datum === highlightedDatum;
                    rect.visible = isDatumHighlighted;
                    if (rect.visible) {
                        updateRectFn(rect, datum, isDatumHighlighted);
                    }
                });
                updateNodeFn = function (text, datum, index, highlighted) {
                    var _a;
                    var hasTitle = datum.hasTitle;
                    var _b = (_a = labelMeta[index], (_a !== null && _a !== void 0 ? _a : {})), label = _b.label, textBaseline = _b.nodeBaseline;
                    if (label != null && textBaseline != null) {
                        text.textBaseline = textBaseline;
                        text.fontWeight = label.fontWeight;
                        text.fontSize = label.fontSize;
                        text.fontFamily = label.fontFamily;
                        text.textAlign = hasTitle ? 'left' : 'center';
                        text.text = datum.label;
                        text.fill = highlighted ? 'black' : label.color;
                        text.fillShadow = !highlighted ? shadow : undefined;
                        text.visible = true;
                    }
                    else {
                        text.visible = false;
                    }
                    if (hasTitle) {
                        text.x = datum.x0 + nodePadding;
                        text.y = datum.y0 + nodePadding;
                    }
                    else {
                        text.x = _this.getLabelCenterX(datum);
                        text.y = _this.getLabelCenterY(datum);
                    }
                };
                this.groupSelection
                    .selectByTag(TextNodeTag.Name)
                    .each(function (text, datum, index) { return updateNodeFn(text, datum, index, false); });
                this.highlightSelection.selectByTag(TextNodeTag.Name).each(function (text, datum, index) {
                    var isDatumHighlighted = datum === highlightedDatum;
                    text.visible = isDatumHighlighted;
                    if (text.visible) {
                        updateNodeFn(text, datum, index, isDatumHighlighted);
                    }
                });
                updateValueFn = function (text, datum, index, highlighted) {
                    var _a;
                    var _b = (_a = labelMeta[index], (_a !== null && _a !== void 0 ? _a : {})), textBaseline = _b.valueBaseline, valueText = _b.valueText;
                    var label = labels.color;
                    if (label.enabled && textBaseline != null && valueText) {
                        text.fontSize = label.fontSize;
                        text.fontFamily = label.fontFamily;
                        text.fontStyle = label.fontStyle;
                        text.fontWeight = label.fontWeight;
                        text.textBaseline = textBaseline;
                        text.textAlign = 'center';
                        text.text = valueText;
                        text.fill = highlighted ? 'black' : label.color;
                        text.fillShadow = highlighted ? undefined : shadow;
                        text.visible = true;
                        text.x = _this.getLabelCenterX(datum);
                        text.y = _this.getLabelCenterY(datum);
                    }
                    else {
                        text.visible = false;
                    }
                };
                this.groupSelection
                    .selectByTag(TextNodeTag.Value)
                    .each(function (text, datum, index) { return updateValueFn(text, datum, index, false); });
                this.highlightSelection.selectByTag(TextNodeTag.Value).each(function (text, datum, index) {
                    var isDatumHighlighted = datum === highlightedDatum;
                    text.visible = isDatumHighlighted;
                    if (text.visible) {
                        updateValueFn(text, datum, index, isDatumHighlighted);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    TreemapSeries.prototype.buildLabelMeta = function (data) {
        var e_1, _a;
        var _b = this, labels = _b.labels, title = _b.title, subtitle = _b.subtitle, nodePadding = _b.nodePadding, colorKey = _b.colorKey;
        var labelMeta = [];
        labelMeta.length = this.groupSelection.data.length;
        var text = new text_1.Text();
        var index = 0;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                var value = datum.value;
                var isLeaf = !datum.children;
                var innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
                var innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
                var hasTitle = datum.hasTitle;
                var label = void 0;
                if (isLeaf) {
                    if (innerNodeWidth > 40 && innerNodeHeight > 40) {
                        label = labels.large;
                    }
                    else if (innerNodeWidth > 20 && innerNodeHeight > 20) {
                        label = labels.medium;
                    }
                    else {
                        label = labels.small;
                    }
                }
                else if (datum.depth > 1) {
                    label = subtitle;
                }
                else {
                    label = title;
                }
                if (!label.enabled) {
                    labelMeta[index++] = undefined;
                    continue;
                }
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.textAlign = hasTitle ? 'left' : 'center';
                text.text = datum.label;
                var nodeBBox = text.computeBBox();
                var hasNode = isLeaf && !!nodeBBox && nodeBBox.width <= innerNodeWidth && nodeBBox.height * 2 + 8 <= innerNodeHeight;
                var valueText = typeof value === 'number' && isFinite(value) ? String(number_1.toFixed(datum.colorValue)) + '%' : '';
                text.fontSize = labels.color.fontSize;
                text.fontFamily = labels.color.fontFamily;
                text.fontStyle = labels.color.fontStyle;
                text.fontWeight = labels.color.fontWeight;
                text.text = valueText;
                var valueBBox = text.computeBBox();
                var hasValue = isLeaf && !!colorKey && hasNode && !!valueBBox && valueBBox.width < innerNodeWidth;
                var nodeBaseline = hasValue ? 'bottom' : isLeaf ? 'middle' : hasTitle ? 'top' : 'middle';
                labelMeta[index++] = {
                    label: label,
                    nodeBaseline: hasTitle || hasNode ? nodeBaseline : undefined,
                    valueBaseline: hasValue ? 'top' : undefined,
                    valueText: valueText,
                };
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return labelMeta;
    };
    TreemapSeries.prototype.getDomain = function (_direction) {
        return [0, 1];
    };
    TreemapSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            labelKey: this.labelKey,
            sizeKey: this.sizeKey,
            colorKey: this.colorKey,
        });
    };
    TreemapSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, tooltip = _a.tooltip, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorName = _a.colorName, rootName = _a.rootName;
        var datum = nodeDatum.datum;
        var tooltipRenderer = tooltip.renderer;
        var title = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        var content = undefined;
        var color = nodeDatum.fill || 'gray';
        if (colorKey && colorName) {
            var colorValue = datum[colorKey];
            if (typeof colorValue === 'number' && isFinite(colorValue)) {
                content = "<b>" + colorName + "</b>: " + number_1.toFixed(datum[colorKey]);
            }
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum: nodeDatum,
                sizeKey: sizeKey,
                labelKey: labelKey,
                colorKey: colorKey,
                title: title,
                color: color,
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    };
    TreemapSeries.prototype.listSeriesItems = function (_legendData) {
        // Override point for subclasses.
    };
    TreemapSeries.className = 'TreemapSeries';
    TreemapSeries.type = 'treemap';
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], TreemapSeries.prototype, "labelKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], TreemapSeries.prototype, "sizeKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], TreemapSeries.prototype, "colorKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER_ARRAY)
    ], TreemapSeries.prototype, "colorDomain", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
    ], TreemapSeries.prototype, "colorRange", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], TreemapSeries.prototype, "colorParents", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], TreemapSeries.prototype, "gradient", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], TreemapSeries.prototype, "formatter", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], TreemapSeries.prototype, "colorName", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], TreemapSeries.prototype, "rootName", void 0);
    return TreemapSeries;
}(hierarchySeries_1.HierarchySeries));
exports.TreemapSeries = TreemapSeries;
