"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreemapSeries = exports.TreemapHighlightStyle = void 0;
var selection_1 = require("../../../scene/selection");
var hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
var label_1 = require("../../label");
var series_1 = require("../series");
var hierarchySeries_1 = require("./hierarchySeries");
var tooltip_1 = require("../../tooltip/tooltip");
var group_1 = require("../../../scene/group");
var text_1 = require("../../../scene/shape/text");
var rect_1 = require("../../../scene/shape/rect");
var dropShadow_1 = require("../../../scene/dropShadow");
var colorScale_1 = require("../../../scale/colorScale");
var number_1 = require("../../../util/number");
var path2D_1 = require("../../../scene/path2D");
var bbox_1 = require("../../../scene/bbox");
var color_1 = require("../../../util/color");
var function_1 = require("../../../util/function");
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
var TreemapSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(TreemapSeriesNodeClickEvent, _super);
    function TreemapSeriesNodeClickEvent(labelKey, sizeKey, colorKey, nativeEvent, datum, series) {
        var _this = _super.call(this, nativeEvent, datum, series) || this;
        _this.labelKey = labelKey;
        _this.sizeKey = sizeKey;
        _this.colorKey = colorKey;
        return _this;
    }
    return TreemapSeriesNodeClickEvent;
}(series_1.SeriesNodeClickEvent));
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
var TreemapValueLabel = /** @class */ (function () {
    function TreemapValueLabel() {
        this.style = (function () {
            var label = new label_1.Label();
            label.color = 'white';
            return label;
        })();
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], TreemapValueLabel.prototype, "key", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], TreemapValueLabel.prototype, "name", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], TreemapValueLabel.prototype, "formatter", void 0);
    return TreemapValueLabel;
}());
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
function getTextSize(text, style) {
    return hdpiCanvas_1.HdpiCanvas.getTextSize(text, [style.fontWeight, style.fontSize + "px", style.fontFamily].join(' '));
}
function validateColor(color) {
    if (typeof color === 'string' && !color_1.Color.validColorString(color)) {
        var fallbackColor_1 = 'black';
        function_1.doOnce(function () {
            return console.warn("AG Charts - Invalid Treemap tile colour string \"" + color + "\". Affected treemap tiles will be coloured " + fallbackColor_1 + ".");
        }, 'treemap node color invalid');
        return 'black';
    }
    return color;
}
var TreemapTextHighlightStyle = /** @class */ (function () {
    function TreemapTextHighlightStyle() {
        this.color = 'black';
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], TreemapTextHighlightStyle.prototype, "color", void 0);
    return TreemapTextHighlightStyle;
}());
var TreemapHighlightStyle = /** @class */ (function (_super) {
    __extends(TreemapHighlightStyle, _super);
    function TreemapHighlightStyle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.text = new TreemapTextHighlightStyle();
        return _this;
    }
    return TreemapHighlightStyle;
}(series_1.HighlightStyle));
exports.TreemapHighlightStyle = TreemapHighlightStyle;
var TreemapSeries = /** @class */ (function (_super) {
    __extends(TreemapSeries, _super);
    function TreemapSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groupSelection = selection_1.Selection.select(_this.contentGroup).selectAll();
        _this.highlightSelection = selection_1.Selection.select(_this.highlightGroup).selectAll();
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
            value: new TreemapValueLabel(),
        };
        _this.nodePadding = 2;
        _this.labelKey = 'label';
        _this.sizeKey = 'size';
        _this.colorKey = 'color';
        _this.colorDomain = [-5, 5];
        _this.colorRange = ['#cb4b3f', '#6acb64'];
        _this.groupFill = '#272931';
        _this.groupStroke = 'black';
        _this.groupStrokeWidth = 1;
        _this.tileStroke = 'black';
        _this.tileStrokeWidth = 1;
        _this.gradient = true;
        _this.formatter = undefined;
        _this.colorName = 'Change';
        _this.rootName = 'Root';
        _this.highlightGroups = true;
        _this.tileShadow = new dropShadow_1.DropShadow();
        _this.labelShadow = new dropShadow_1.DropShadow();
        _this.tooltip = new TreemapSeriesTooltip();
        _this.highlightStyle = new TreemapHighlightStyle();
        return _this;
    }
    TreemapSeries.prototype.getNodePaddingTop = function (nodeDatum, bbox) {
        var _a = this, title = _a.title, subtitle = _a.subtitle, nodePadding = _a.nodePadding;
        var label = nodeDatum.label;
        if (nodeDatum.isLeaf || !label || nodeDatum.depth === 0) {
            return nodePadding;
        }
        var font = nodeDatum.depth > 1 ? subtitle : title;
        var textSize = getTextSize(label, font);
        var heightRatioThreshold = 3;
        if (font.fontSize > bbox.width / heightRatioThreshold || font.fontSize > bbox.height / heightRatioThreshold) {
            return nodePadding;
        }
        if (textSize.height >= bbox.height) {
            return nodePadding;
        }
        return textSize.height + nodePadding * 2;
    };
    TreemapSeries.prototype.getNodePadding = function (nodeDatum, bbox) {
        var nodePadding = this.nodePadding;
        var top = this.getNodePaddingTop(nodeDatum, bbox);
        return {
            top: top,
            right: nodePadding,
            bottom: nodePadding,
            left: nodePadding,
        };
    };
    /**
     * Squarified Treemap algorithm
     * https://www.win.tue.nl/~vanwijk/stm.pdf
     */
    TreemapSeries.prototype.squarify = function (nodeDatum, bbox, outputNodesBoxes) {
        if (outputNodesBoxes === void 0) { outputNodesBoxes = new Map(); }
        var targetTileAspectRatio = 1; // The width and height will tend to this ratio
        var padding = this.getNodePadding(nodeDatum, bbox);
        outputNodesBoxes.set(nodeDatum, bbox);
        var width = bbox.width - padding.left - padding.right;
        var height = bbox.height - padding.top - padding.bottom;
        if (width <= 0 || height <= 0 || nodeDatum.value <= 0) {
            return outputNodesBoxes;
        }
        var stackSum = 0;
        var startIndex = 0;
        var minRatioDiff = Infinity;
        var partitionSum = nodeDatum.value;
        var children = nodeDatum.children;
        var partition = new bbox_1.BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);
        for (var i = 0; i < children.length; i++) {
            var value = children[i].value;
            var firstValue = children[startIndex].value;
            var isVertical_1 = partition.width < partition.height;
            stackSum += value;
            var partThickness = isVertical_1 ? partition.height : partition.width;
            var partLength = isVertical_1 ? partition.width : partition.height;
            var firstTileLength = (partLength * firstValue) / stackSum;
            var stackThickness = (partThickness * stackSum) / partitionSum;
            var ratio = Math.max(firstTileLength, stackThickness) / Math.min(firstTileLength, stackThickness);
            var diff = Math.abs(targetTileAspectRatio - ratio);
            if (diff < minRatioDiff) {
                minRatioDiff = diff;
                continue;
            }
            // Go one step back and process the best match
            stackSum -= value;
            stackThickness = (partThickness * stackSum) / partitionSum;
            var start_1 = isVertical_1 ? partition.x : partition.y;
            for (var j = startIndex; j < i; j++) {
                var child = children[j];
                var x = isVertical_1 ? start_1 : partition.x;
                var y = isVertical_1 ? partition.y : start_1;
                var length_1 = (partLength * child.value) / stackSum;
                var width_1 = isVertical_1 ? length_1 : stackThickness;
                var height_1 = isVertical_1 ? stackThickness : length_1;
                var childBox = new bbox_1.BBox(x, y, width_1, height_1);
                this.squarify(child, childBox, outputNodesBoxes);
                partitionSum -= child.value;
                start_1 += length_1;
            }
            if (isVertical_1) {
                partition.y += stackThickness;
                partition.height -= stackThickness;
            }
            else {
                partition.x += stackThickness;
                partition.width -= stackThickness;
            }
            startIndex = i;
            stackSum = 0;
            minRatioDiff = Infinity;
            i--;
        }
        // Process remaining space
        var isVertical = partition.width < partition.height;
        var start = isVertical ? partition.x : partition.y;
        for (var i = startIndex; i < children.length; i++) {
            var x = isVertical ? start : partition.x;
            var y = isVertical ? partition.y : start;
            var part = children[i].value / partitionSum;
            var width_2 = partition.width * (isVertical ? part : 1);
            var height_2 = partition.height * (isVertical ? 1 : part);
            var childBox = new bbox_1.BBox(x, y, width_2, height_2);
            this.squarify(children[i], childBox, outputNodesBoxes);
            start += isVertical ? width_2 : height_2;
        }
        return outputNodesBoxes;
    };
    TreemapSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, sizeKey, labelKey, colorKey, colorDomain, colorRange, groupFill, colorScale, createTreeNodeDatum;
            var _this = this;
            return __generator(this, function (_b) {
                if (!this.data) {
                    return [2 /*return*/];
                }
                _a = this, data = _a.data, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorDomain = _a.colorDomain, colorRange = _a.colorRange, groupFill = _a.groupFill;
                colorScale = new colorScale_1.ColorScale();
                colorScale.domain = colorDomain;
                colorScale.range = colorRange;
                createTreeNodeDatum = function (datum, depth, parent) {
                    var _a;
                    if (depth === void 0) { depth = 0; }
                    var label = (labelKey && datum[labelKey]) || '';
                    var colorScaleValue = colorKey ? (_a = datum[colorKey]) !== null && _a !== void 0 ? _a : depth : depth;
                    colorScaleValue = validateColor(colorScaleValue);
                    var isLeaf = !datum.children;
                    var fill = typeof colorScaleValue === 'string'
                        ? colorScaleValue
                        : isLeaf || !groupFill
                            ? colorScale.convert(colorScaleValue)
                            : groupFill;
                    var nodeDatum = {
                        datum: datum,
                        depth: depth,
                        parent: parent,
                        value: 0,
                        label: label,
                        fill: fill,
                        series: _this,
                        isLeaf: isLeaf,
                        children: [],
                    };
                    if (isLeaf) {
                        nodeDatum.value = sizeKey ? datum[sizeKey] : 1;
                    }
                    else {
                        datum.children.forEach(function (child) {
                            var childNodeDatum = createTreeNodeDatum(child, depth + 1, nodeDatum);
                            var value = childNodeDatum.value;
                            if (isNaN(value) || !isFinite(value) || value === 0) {
                                return;
                            }
                            nodeDatum.value += value;
                            nodeDatum.children.push(childNodeDatum);
                        });
                        nodeDatum.children.sort(function (a, b) {
                            return b.value - a.value;
                        });
                    }
                    return nodeDatum;
                };
                this.dataRoot = createTreeNodeDatum(data);
                return [2 /*return*/];
            });
        });
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
            var _a, chart, dataRoot, seriesRect, descendants, traverse, _b, groupSelection, highlightSelection, update;
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
                descendants = [];
                traverse = function (datum) {
                    var _a;
                    descendants.push(datum);
                    (_a = datum.children) === null || _a === void 0 ? void 0 : _a.forEach(traverse);
                };
                traverse(this.dataRoot);
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
    TreemapSeries.prototype.isDatumHighlighted = function (datum) {
        var _a;
        var highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        return datum === highlightedDatum && (datum.isLeaf || this.highlightGroups);
    };
    TreemapSeries.prototype.getTileFormat = function (datum, isHighlighted) {
        var _a;
        var formatter = this.formatter;
        if (!formatter) {
            return {};
        }
        var _b = this, gradient = _b.gradient, colorKey = _b.colorKey, labelKey = _b.labelKey, sizeKey = _b.sizeKey, tileStroke = _b.tileStroke, tileStrokeWidth = _b.tileStrokeWidth, groupStroke = _b.groupStroke, groupStrokeWidth = _b.groupStrokeWidth;
        var stroke = datum.isLeaf ? tileStroke : groupStroke;
        var strokeWidth = datum.isLeaf ? tileStrokeWidth : groupStrokeWidth;
        return formatter({
            seriesId: this.id,
            datum: datum.datum,
            depth: datum.depth,
            parent: (_a = datum.parent) === null || _a === void 0 ? void 0 : _a.datum,
            colorKey: colorKey,
            sizeKey: sizeKey,
            labelKey: labelKey,
            fill: datum.fill,
            stroke: stroke,
            strokeWidth: strokeWidth,
            gradient: gradient,
            highlighted: isHighlighted,
        });
    };
    TreemapSeries.prototype.updateNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gradient, _b, _c, highlightedFill, highlightedFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, highlightedTextColor, tileStroke, tileStrokeWidth, groupStroke, groupStrokeWidth, tileShadow, labelShadow, seriesRect, boxes, labelMeta, updateRectFn, updateLabelFn, updateValueFn;
            var _this = this;
            return __generator(this, function (_d) {
                if (!this.chart) {
                    return [2 /*return*/];
                }
                _a = this, gradient = _a.gradient, _b = _a.highlightStyle, _c = _b.item, highlightedFill = _c.fill, highlightedFillOpacity = _c.fillOpacity, highlightedStroke = _c.stroke, highlightedDatumStrokeWidth = _c.strokeWidth, highlightedTextColor = _b.text.color, tileStroke = _a.tileStroke, tileStrokeWidth = _a.tileStrokeWidth, groupStroke = _a.groupStroke, groupStrokeWidth = _a.groupStrokeWidth, tileShadow = _a.tileShadow, labelShadow = _a.labelShadow;
                seriesRect = this.chart.getSeriesRect();
                boxes = this.squarify(this.dataRoot, new bbox_1.BBox(0, 0, seriesRect.width, seriesRect.height));
                labelMeta = this.buildLabelMeta(boxes);
                updateRectFn = function (rect, datum, isDatumHighlighted) {
                    var _a, _b, _c, _d, _e, _f;
                    var box = boxes.get(datum);
                    if (!box) {
                        rect.visible = false;
                        return;
                    }
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                    var fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1)) !== null && _a !== void 0 ? _a : 1;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined
                        ? highlightedStroke
                        : datum.isLeaf
                            ? tileStroke
                            : groupStroke;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : datum.isLeaf
                            ? tileStrokeWidth
                            : groupStrokeWidth;
                    var format = _this.getTileFormat(datum, isDatumHighlighted);
                    rect.fill = validateColor((_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill);
                    rect.fillOpacity = (_c = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _c !== void 0 ? _c : fillOpacity;
                    rect.stroke = validateColor((_d = format === null || format === void 0 ? void 0 : format.stroke) !== null && _d !== void 0 ? _d : stroke);
                    rect.strokeWidth = (_e = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _e !== void 0 ? _e : strokeWidth;
                    rect.gradient = (_f = format === null || format === void 0 ? void 0 : format.gradient) !== null && _f !== void 0 ? _f : gradient;
                    rect.fillShadow = tileShadow;
                    rect.crisp = true;
                    rect.x = box.x;
                    rect.y = box.y;
                    rect.width = box.width;
                    rect.height = box.height;
                    rect.visible = true;
                    if (isDatumHighlighted && !datum.isLeaf) {
                        var padding = _this.getNodePadding(datum, box);
                        var x0 = box.x + padding.left;
                        var x1 = box.x + box.width - padding.right;
                        var y0 = box.y + padding.top;
                        var y1 = box.y + box.height - padding.bottom;
                        if (rect.clipPath) {
                            rect.clipPath.clear();
                        }
                        else {
                            rect.clipPath = new path2D_1.Path2D();
                        }
                        rect.clipMode = 'punch-out';
                        rect.clipPath.moveTo(x0, y0);
                        rect.clipPath.lineTo(x1, y0);
                        rect.clipPath.lineTo(x1, y1);
                        rect.clipPath.lineTo(x0, y1);
                        rect.clipPath.lineTo(x0, y0);
                        rect.clipPath.closePath();
                    }
                };
                this.groupSelection.selectByClass(rect_1.Rect).each(function (rect, datum) { return updateRectFn(rect, datum, false); });
                this.highlightSelection.selectByClass(rect_1.Rect).each(function (rect, datum) {
                    var isDatumHighlighted = _this.isDatumHighlighted(datum);
                    rect.visible = isDatumHighlighted;
                    if (rect.visible) {
                        updateRectFn(rect, datum, isDatumHighlighted);
                    }
                });
                updateLabelFn = function (text, datum, highlighted) {
                    var meta = labelMeta.get(datum);
                    var label = meta === null || meta === void 0 ? void 0 : meta.label;
                    if (!label) {
                        text.visible = false;
                        return;
                    }
                    text.text = label.text;
                    text.fontFamily = label.style.fontFamily;
                    text.fontSize = label.style.fontSize;
                    text.fontWeight = label.style.fontWeight;
                    text.fill = highlighted ? highlightedTextColor !== null && highlightedTextColor !== void 0 ? highlightedTextColor : label.style.color : label.style.color;
                    text.fillShadow = highlighted ? undefined : labelShadow;
                    text.textAlign = label.hAlign;
                    text.textBaseline = label.vAlign;
                    text.x = label.x;
                    text.y = label.y;
                    text.visible = true;
                };
                this.groupSelection
                    .selectByTag(TextNodeTag.Name)
                    .each(function (text, datum) { return updateLabelFn(text, datum, false); });
                this.highlightSelection.selectByTag(TextNodeTag.Name).each(function (text, datum) {
                    var isDatumHighlighted = _this.isDatumHighlighted(datum);
                    text.visible = isDatumHighlighted;
                    if (text.visible) {
                        updateLabelFn(text, datum, isDatumHighlighted);
                    }
                });
                updateValueFn = function (text, datum, highlighted) {
                    var meta = labelMeta.get(datum);
                    var label = meta === null || meta === void 0 ? void 0 : meta.value;
                    if (!label) {
                        text.visible = false;
                        return;
                    }
                    text.text = label.text;
                    text.fontFamily = label.style.fontFamily;
                    text.fontSize = label.style.fontSize;
                    text.fontWeight = label.style.fontWeight;
                    text.fill = highlighted ? highlightedTextColor !== null && highlightedTextColor !== void 0 ? highlightedTextColor : label.style.color : label.style.color;
                    text.fillShadow = highlighted ? undefined : labelShadow;
                    text.textAlign = label.hAlign;
                    text.textBaseline = label.vAlign;
                    text.x = label.x;
                    text.y = label.y;
                    text.visible = true;
                };
                this.groupSelection
                    .selectByTag(TextNodeTag.Value)
                    .each(function (text, datum) { return updateValueFn(text, datum, false); });
                this.highlightSelection.selectByTag(TextNodeTag.Value).each(function (text, datum) {
                    var isDatumHighlighted = _this.isDatumHighlighted(datum);
                    text.visible = isDatumHighlighted;
                    if (text.visible) {
                        updateValueFn(text, datum, isDatumHighlighted);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    TreemapSeries.prototype.buildLabelMeta = function (boxes) {
        var _a = this, labels = _a.labels, title = _a.title, subtitle = _a.subtitle, nodePadding = _a.nodePadding, labelKey = _a.labelKey;
        var labelMeta = new Map();
        boxes.forEach(function (box, datum) {
            if (!labelKey || datum.depth === 0) {
                return;
            }
            var labelText = datum.isLeaf ? datum.label : datum.label.toUpperCase();
            var labelStyle;
            if (datum.isLeaf) {
                // Choose the font size that fits
                labelStyle =
                    [labels.large, labels.medium, labels.small].find(function (s) {
                        var _a = getTextSize(labelText, s), width = _a.width, height = _a.height;
                        return width < box.width && height < box.height;
                    }) || labels.small;
            }
            else if (datum.depth === 1) {
                labelStyle = title;
            }
            else {
                labelStyle = subtitle;
            }
            var labelSize = getTextSize(labelText, labelStyle);
            var availTextWidth = box.width - 2 * nodePadding;
            var availTextHeight = box.height - 2 * nodePadding;
            var minSizeRatio = 3;
            if (labelStyle.fontSize > box.width / minSizeRatio || labelStyle.fontSize > box.height / minSizeRatio) {
                // Avoid labels on too small tiles
                return;
            }
            // Crop text if not enough space
            if (labelSize.width > availTextWidth) {
                var textLength = Math.floor((labelText.length * availTextWidth) / labelSize.width) - 1;
                labelText = labelText.substring(0, textLength) + "\u2026";
            }
            var valueConfig = labels.value;
            var valueStyle = valueConfig.style;
            var valueMargin = (labelStyle.fontSize + valueStyle.fontSize) / 8;
            var valueText = String(datum.isLeaf
                ? valueConfig.formatter
                    ? valueConfig.formatter({ datum: datum.datum })
                    : valueConfig.key
                        ? datum.datum[valueConfig.key]
                        : ''
                : '');
            var valueSize = getTextSize(valueText, valueStyle);
            var hasValueText = valueText &&
                valueSize.width < availTextWidth &&
                valueSize.height + labelSize.height + valueMargin < availTextHeight;
            labelMeta.set(datum, {
                label: __assign({ text: labelText, style: labelStyle }, (datum.isLeaf
                    ? {
                        hAlign: 'center',
                        vAlign: 'middle',
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2 - (hasValueText ? valueSize.height / 2 + valueMargin / 2 : 0),
                    }
                    : {
                        hAlign: 'left',
                        vAlign: 'top',
                        x: box.x + nodePadding,
                        y: box.y + nodePadding,
                    })),
                value: hasValueText
                    ? {
                        text: valueText,
                        style: valueStyle,
                        hAlign: 'center',
                        vAlign: 'middle',
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2 + labelSize.height / 2 + valueMargin / 2,
                    }
                    : undefined,
            });
        });
        return labelMeta;
    };
    TreemapSeries.prototype.getDomain = function (_direction) {
        return [0, 1];
    };
    TreemapSeries.prototype.getNodeClickEvent = function (event, datum) {
        return new TreemapSeriesNodeClickEvent(this.labelKey, this.sizeKey, this.colorKey, event, datum, this);
    };
    TreemapSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a;
        if (!this.highlightGroups && !nodeDatum.isLeaf) {
            return '';
        }
        var _b = this, tooltip = _b.tooltip, sizeKey = _b.sizeKey, labelKey = _b.labelKey, colorKey = _b.colorKey, rootName = _b.rootName, seriesId = _b.id, labels = _b.labels;
        var datum = nodeDatum.datum;
        var tooltipRenderer = tooltip.renderer;
        var title = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        var content = '';
        var format = this.getTileFormat(nodeDatum, false);
        var color = (format === null || format === void 0 ? void 0 : format.fill) || nodeDatum.fill || 'gray';
        var valueKey = labels.value.key;
        var valueFormatter = labels.value.formatter;
        if (valueKey || valueFormatter) {
            var valueText = '';
            if (valueFormatter) {
                valueText = valueFormatter({ datum: datum });
            }
            else {
                var value = datum[valueKey];
                if (typeof value === 'number' && isFinite(value)) {
                    valueText = number_1.toFixed(value);
                }
            }
            if (valueText) {
                if (labels.value.name) {
                    content += "<b>" + labels.value.name + ":</b> ";
                }
                content += valueText;
            }
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
                datum: nodeDatum.datum,
                parent: (_a = nodeDatum.parent) === null || _a === void 0 ? void 0 : _a.datum,
                depth: nodeDatum.depth,
                sizeKey: sizeKey,
                labelKey: labelKey,
                colorKey: colorKey,
                title: title,
                color: color,
                seriesId: seriesId,
            }), defaults);
        }
        return tooltip_1.toTooltipHtml(defaults);
    };
    TreemapSeries.prototype.getLegendData = function () {
        // Override point for subclasses.
        return [];
    };
    TreemapSeries.className = 'TreemapSeries';
    TreemapSeries.type = 'treemap';
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], TreemapSeries.prototype, "nodePadding", void 0);
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
        validation_1.Validate(validation_1.OPT_STRING)
    ], TreemapSeries.prototype, "groupFill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], TreemapSeries.prototype, "groupStroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], TreemapSeries.prototype, "groupStrokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], TreemapSeries.prototype, "tileStroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], TreemapSeries.prototype, "tileStrokeWidth", void 0);
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
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], TreemapSeries.prototype, "highlightGroups", void 0);
    return TreemapSeries;
}(hierarchySeries_1.HierarchySeries));
exports.TreemapSeries = TreemapSeries;
