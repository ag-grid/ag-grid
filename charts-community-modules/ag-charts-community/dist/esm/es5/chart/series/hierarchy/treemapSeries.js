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
import { Selection } from '../../../scene/selection';
import { Label } from '../../label';
import { SeriesTooltip, HighlightStyle, SeriesNodeBaseClickEvent } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Rect } from '../../../scene/shape/rect';
import { DropShadow } from '../../../scene/dropShadow';
import { ColorScale } from '../../../scale/colorScale';
import { toFixed, isEqual } from '../../../util/number';
import { BBox } from '../../../scene/bbox';
import { Color } from '../../../util/color';
import { BOOLEAN, NUMBER, NUMBER_ARRAY, OPT_BOOLEAN, OPT_COLOR_STRING, OPT_FUNCTION, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, Validate, TEXT_WRAP, } from '../../../util/validation';
import { Logger } from '../../../util/logger';
var TreemapSeriesTooltip = /** @class */ (function (_super) {
    __extends(TreemapSeriesTooltip, _super);
    function TreemapSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], TreemapSeriesTooltip.prototype, "renderer", void 0);
    return TreemapSeriesTooltip;
}(SeriesTooltip));
var TreemapSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(TreemapSeriesNodeBaseClickEvent, _super);
    function TreemapSeriesNodeBaseClickEvent(labelKey, sizeKey, colorKey, nativeEvent, datum, series) {
        var _this = _super.call(this, nativeEvent, datum, series) || this;
        _this.labelKey = labelKey;
        _this.sizeKey = sizeKey;
        _this.colorKey = colorKey;
        return _this;
    }
    return TreemapSeriesNodeBaseClickEvent;
}(SeriesNodeBaseClickEvent));
var TreemapSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(TreemapSeriesNodeClickEvent, _super);
    function TreemapSeriesNodeClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeClick';
        return _this;
    }
    return TreemapSeriesNodeClickEvent;
}(TreemapSeriesNodeBaseClickEvent));
var TreemapSeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(TreemapSeriesNodeDoubleClickEvent, _super);
    function TreemapSeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return TreemapSeriesNodeDoubleClickEvent;
}(TreemapSeriesNodeBaseClickEvent));
var TreemapSeriesLabel = /** @class */ (function (_super) {
    __extends(TreemapSeriesLabel, _super);
    function TreemapSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.padding = 10;
        return _this;
    }
    __decorate([
        Validate(NUMBER(0))
    ], TreemapSeriesLabel.prototype, "padding", void 0);
    return TreemapSeriesLabel;
}(Label));
var TreemapSeriesTileLabel = /** @class */ (function (_super) {
    __extends(TreemapSeriesTileLabel, _super);
    function TreemapSeriesTileLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wrapping = 'on-space';
        return _this;
    }
    __decorate([
        Validate(TEXT_WRAP)
    ], TreemapSeriesTileLabel.prototype, "wrapping", void 0);
    return TreemapSeriesTileLabel;
}(Label));
var TreemapValueLabel = /** @class */ (function () {
    function TreemapValueLabel() {
        this.style = (function () {
            var label = new Label();
            label.color = 'white';
            return label;
        })();
    }
    __decorate([
        Validate(OPT_STRING)
    ], TreemapValueLabel.prototype, "key", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], TreemapValueLabel.prototype, "name", void 0);
    __decorate([
        Validate(OPT_FUNCTION)
    ], TreemapValueLabel.prototype, "formatter", void 0);
    return TreemapValueLabel;
}());
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
var tempText = new Text();
function getTextSize(text, style) {
    var fontStyle = style.fontStyle, fontWeight = style.fontWeight, fontSize = style.fontSize, fontFamily = style.fontFamily;
    tempText.fontStyle = fontStyle;
    tempText.fontWeight = fontWeight;
    tempText.fontSize = fontSize;
    tempText.fontFamily = fontFamily;
    tempText.text = text;
    tempText.x = 0;
    tempText.y = 0;
    tempText.textAlign = 'left';
    tempText.textBaseline = 'top';
    var _a = tempText.computeBBox(), width = _a.width, height = _a.height;
    return { width: width, height: height };
}
function validateColor(color) {
    if (typeof color === 'string' && !Color.validColorString(color)) {
        var fallbackColor = 'black';
        Logger.warnOnce("invalid Treemap tile colour string \"" + color + "\". Affected treemap tiles will be coloured " + fallbackColor + ".");
        return 'black';
    }
    return color;
}
var TreemapTextHighlightStyle = /** @class */ (function () {
    function TreemapTextHighlightStyle() {
        this.color = 'black';
    }
    __decorate([
        Validate(OPT_COLOR_STRING)
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
}(HighlightStyle));
var TreemapSeries = /** @class */ (function (_super) {
    __extends(TreemapSeries, _super);
    function TreemapSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groupSelection = Selection.select(_this.contentGroup, Group);
        _this.highlightSelection = Selection.select(_this.highlightGroup, Group);
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
                var label = new TreemapSeriesTileLabel();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (function () {
                var label = new TreemapSeriesTileLabel();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (function () {
                var label = new TreemapSeriesTileLabel();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            formatter: undefined,
            value: new TreemapValueLabel(),
        };
        _this.nodePadding = 2;
        _this.nodeGap = 0;
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
        _this.tileShadow = new DropShadow();
        _this.labelShadow = new DropShadow();
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
        if (bbox.width <= 0 || bbox.height <= 0) {
            return outputNodesBoxes;
        }
        outputNodesBoxes.set(nodeDatum, bbox);
        var targetTileAspectRatio = 1; // The width and height will tend to this ratio
        var padding = this.getNodePadding(nodeDatum, bbox);
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
        var innerBox = new BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);
        var partition = innerBox.clone();
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
                var childBox = new BBox(x, y, width_1, height_1);
                this.applyGap(innerBox, childBox);
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
            var childBox = new BBox(x, y, width_2, height_2);
            this.applyGap(innerBox, childBox);
            this.squarify(children[i], childBox, outputNodesBoxes);
            start += isVertical ? width_2 : height_2;
        }
        return outputNodesBoxes;
    };
    TreemapSeries.prototype.applyGap = function (innerBox, childBox) {
        var gap = this.nodeGap / 2;
        var getBounds = function (box) {
            return {
                left: box.x,
                top: box.y,
                right: box.x + box.width,
                bottom: box.y + box.height,
            };
        };
        var innerBounds = getBounds(innerBox);
        var childBounds = getBounds(childBox);
        var sides = Object.keys(innerBounds);
        sides.forEach(function (side) {
            if (!isEqual(innerBounds[side], childBounds[side])) {
                childBox.shrink(gap, side);
            }
        });
    };
    TreemapSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, sizeKey, labelKey, colorKey, colorDomain, colorRange, groupFill, labelFormatter, colorScale, createTreeNodeDatum;
            var _this = this;
            return __generator(this, function (_b) {
                if (!this.data) {
                    return [2 /*return*/];
                }
                _a = this, data = _a.data, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorDomain = _a.colorDomain, colorRange = _a.colorRange, groupFill = _a.groupFill;
                labelFormatter = this.labels.formatter;
                colorScale = new ColorScale();
                colorScale.domain = colorDomain;
                colorScale.range = colorRange;
                colorScale.update();
                createTreeNodeDatum = function (datum, depth, parent) {
                    var _a, _b, _c;
                    if (depth === void 0) { depth = 0; }
                    var label;
                    if (labelFormatter) {
                        label = _this.ctx.callbackCache.call(labelFormatter, { datum: datum });
                    }
                    if (label !== undefined) {
                        // Label retrieved from formatter successfully.
                    }
                    else if (labelKey) {
                        label = (_a = datum[labelKey]) !== null && _a !== void 0 ? _a : '';
                    }
                    else {
                        label = '';
                    }
                    var colorScaleValue = colorKey ? (_b = datum[colorKey]) !== null && _b !== void 0 ? _b : depth : depth;
                    colorScaleValue = validateColor(colorScaleValue);
                    var isLeaf = !datum.children;
                    var fill = groupFill;
                    if (typeof colorScaleValue === 'string') {
                        fill = colorScaleValue;
                    }
                    else if (isLeaf || !groupFill) {
                        fill = colorScale.convert(colorScaleValue);
                    }
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
                        nodeDatum.value = sizeKey ? (_c = datum[sizeKey]) !== null && _c !== void 0 ? _c : 1 : 1;
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
                    return selection.update(descendants, function (group) {
                        var rect = new Rect();
                        var nameLabel = new Text();
                        nameLabel.tag = TextNodeTag.Name;
                        var valueLabel = new Text();
                        valueLabel.tag = TextNodeTag.Value;
                        group.append([rect, nameLabel, valueLabel]);
                    });
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
        var _b = this, formatter = _b.formatter, callbackCache = _b.ctx.callbackCache;
        if (!formatter) {
            return {};
        }
        var _c = this, gradient = _c.gradient, colorKey = _c.colorKey, labelKey = _c.labelKey, sizeKey = _c.sizeKey, tileStroke = _c.tileStroke, tileStrokeWidth = _c.tileStrokeWidth, groupStroke = _c.groupStroke, groupStrokeWidth = _c.groupStrokeWidth;
        var stroke = datum.isLeaf ? tileStroke : groupStroke;
        var strokeWidth = datum.isLeaf ? tileStrokeWidth : groupStrokeWidth;
        var result = callbackCache.call(formatter, {
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
        return result !== null && result !== void 0 ? result : {};
    };
    TreemapSeries.prototype.updateNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gradient, _b, _c, highlightedFill, highlightedFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, highlightedTextColor, tileStroke, tileStrokeWidth, groupStroke, groupStrokeWidth, tileShadow, labelShadow, seriesRect, boxes, labelMeta, highlightedSubtree, updateRectFn, updateLabelFn;
            var _this = this;
            return __generator(this, function (_d) {
                if (!this.chart) {
                    return [2 /*return*/];
                }
                _a = this, gradient = _a.gradient, _b = _a.highlightStyle, _c = _b.item, highlightedFill = _c.fill, highlightedFillOpacity = _c.fillOpacity, highlightedStroke = _c.stroke, highlightedDatumStrokeWidth = _c.strokeWidth, highlightedTextColor = _b.text.color, tileStroke = _a.tileStroke, tileStrokeWidth = _a.tileStrokeWidth, groupStroke = _a.groupStroke, groupStrokeWidth = _a.groupStrokeWidth, tileShadow = _a.tileShadow, labelShadow = _a.labelShadow;
                seriesRect = this.chart.getSeriesRect();
                boxes = this.squarify(this.dataRoot, new BBox(0, 0, seriesRect.width, seriesRect.height));
                labelMeta = this.buildLabelMeta(boxes);
                highlightedSubtree = this.getHighlightedSubtree();
                this.updateNodeMidPoint(boxes);
                updateRectFn = function (rect, datum, isDatumHighlighted) {
                    var _a, _b, _c, _d, _e, _f;
                    var box = boxes.get(datum);
                    if (!box) {
                        rect.visible = false;
                        return;
                    }
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                    var fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1)) !== null && _a !== void 0 ? _a : 1;
                    var stroke = groupStroke;
                    if (isDatumHighlighted && highlightedStroke !== undefined) {
                        stroke = highlightedStroke;
                    }
                    else if (datum.isLeaf) {
                        stroke = tileStroke;
                    }
                    var strokeWidth = groupStrokeWidth;
                    if (isDatumHighlighted && highlightedDatumStrokeWidth !== undefined) {
                        strokeWidth = highlightedDatumStrokeWidth;
                    }
                    else if (datum.isLeaf) {
                        strokeWidth = tileStrokeWidth;
                    }
                    var format = _this.getTileFormat(datum, isDatumHighlighted);
                    var fillColor = validateColor((_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill);
                    if ((_c = format === null || format === void 0 ? void 0 : format.gradient) !== null && _c !== void 0 ? _c : gradient) {
                        var start = Color.tryParseFromString(fill).brighter().toString();
                        var end = Color.tryParseFromString(fill).darker().toString();
                        rect.fill = "linear-gradient(180deg, " + start + ", " + end + ")";
                    }
                    else {
                        rect.fill = fillColor;
                    }
                    rect.fillOpacity = (_d = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _d !== void 0 ? _d : fillOpacity;
                    rect.stroke = validateColor((_e = format === null || format === void 0 ? void 0 : format.stroke) !== null && _e !== void 0 ? _e : stroke);
                    rect.strokeWidth = (_f = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _f !== void 0 ? _f : strokeWidth;
                    rect.fillShadow = tileShadow;
                    rect.crisp = true;
                    rect.x = box.x;
                    rect.y = box.y;
                    rect.width = box.width;
                    rect.height = box.height;
                    rect.visible = true;
                };
                this.groupSelection.selectByClass(Rect).forEach(function (rect) { return updateRectFn(rect, rect.datum, false); });
                this.highlightSelection.selectByClass(Rect).forEach(function (rect) {
                    var isDatumHighlighted = _this.isDatumHighlighted(rect.datum);
                    rect.visible = isDatumHighlighted || highlightedSubtree.has(rect.datum);
                    if (rect.visible) {
                        updateRectFn(rect, rect.datum, isDatumHighlighted);
                    }
                });
                updateLabelFn = function (text, datum, highlighted, key) {
                    var meta = labelMeta.get(datum);
                    var label = meta === null || meta === void 0 ? void 0 : meta[key];
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
                    .forEach(function (text) { return updateLabelFn(text, text.datum, false, 'label'); });
                this.highlightSelection.selectByTag(TextNodeTag.Name).forEach(function (text) {
                    var isDatumHighlighted = _this.isDatumHighlighted(text.datum);
                    text.visible = isDatumHighlighted || highlightedSubtree.has(text.datum);
                    if (text.visible) {
                        updateLabelFn(text, text.datum, isDatumHighlighted, 'label');
                    }
                });
                this.groupSelection
                    .selectByTag(TextNodeTag.Value)
                    .forEach(function (text) { return updateLabelFn(text, text.datum, false, 'value'); });
                this.highlightSelection.selectByTag(TextNodeTag.Value).forEach(function (text) {
                    var isDatumHighlighted = _this.isDatumHighlighted(text.datum);
                    text.visible = isDatumHighlighted || highlightedSubtree.has(text.datum);
                    if (text.visible) {
                        updateLabelFn(text, text.datum, isDatumHighlighted, 'value');
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    TreemapSeries.prototype.updateNodeMidPoint = function (boxes) {
        boxes.forEach(function (box, treeNodeDatum) {
            treeNodeDatum.nodeMidPoint = {
                x: box.x + box.width / 2,
                y: box.y,
            };
        });
    };
    TreemapSeries.prototype.getHighlightedSubtree = function () {
        var _this = this;
        var items = new Set();
        var traverse = function (datum) {
            var _a;
            if (_this.isDatumHighlighted(datum) || (datum.parent && items.has(datum.parent))) {
                items.add(datum);
            }
            (_a = datum.children) === null || _a === void 0 ? void 0 : _a.forEach(traverse);
        };
        traverse(this.dataRoot);
        return items;
    };
    TreemapSeries.prototype.buildLabelMeta = function (boxes) {
        var _a = this, labels = _a.labels, title = _a.title, subtitle = _a.subtitle, nodePadding = _a.nodePadding, labelKey = _a.labelKey, callbackCache = _a.ctx.callbackCache;
        var wrappedRegExp = /-$/m;
        var labelMeta = new Map();
        boxes.forEach(function (box, datum) {
            var _a, _b, _c;
            if (!labelKey || datum.depth === 0) {
                return;
            }
            var availTextWidth = box.width - 2 * nodePadding;
            var availTextHeight = box.height - 2 * nodePadding;
            var isBoxTooSmall = function (labelStyle) {
                var minSizeRatio = 3;
                return (labelStyle.fontSize > box.width / minSizeRatio || labelStyle.fontSize > box.height / minSizeRatio);
            };
            var labelText = datum.isLeaf ? datum.label : datum.label.toUpperCase();
            var valueText = '';
            var valueConfig = labels.value;
            var valueStyle = valueConfig.style;
            var valueMargin = Math.ceil(valueStyle.fontSize * 2 * (Text.defaultLineHeightRatio - 1));
            if (datum.isLeaf) {
                if (valueConfig.formatter) {
                    valueText = (_a = callbackCache.call(valueConfig.formatter, { datum: datum.datum })) !== null && _a !== void 0 ? _a : '';
                }
                else if (valueConfig.key) {
                    valueText = datum.datum[valueConfig.key];
                }
            }
            var valueSize = getTextSize(valueText, valueStyle);
            if (valueText && valueSize.width > availTextWidth) {
                valueText = '';
            }
            var labelStyle;
            var wrappedText = '';
            if (datum.isLeaf) {
                labelStyle = labels.small;
                var pickStyle = function () {
                    var e_1, _a;
                    var availHeight = availTextHeight - (valueText ? valueStyle.fontSize + valueMargin : 0);
                    var labelStyles = [labels.large, labels.medium, labels.small];
                    try {
                        for (var labelStyles_1 = __values(labelStyles), labelStyles_1_1 = labelStyles_1.next(); !labelStyles_1_1.done; labelStyles_1_1 = labelStyles_1.next()) {
                            var style = labelStyles_1_1.value;
                            var _b = getTextSize(labelText, style), width = _b.width, height = _b.height;
                            if (height > availHeight || isBoxTooSmall(style)) {
                                continue;
                            }
                            if (width <= availTextWidth) {
                                return { style: style, wrappedText: undefined };
                            }
                            // Avoid hyphens and ellipsis for large and medium label styles
                            var wrapped = Text.wrap(labelText, availTextWidth, availHeight, style, style.wrapping);
                            if (wrapped &&
                                wrapped !== '\u2026' &&
                                (style === labels.small || !(wrappedRegExp.exec(wrapped) || wrapped.endsWith('\u2026')))) {
                                return { style: style, wrappedText: wrapped };
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (labelStyles_1_1 && !labelStyles_1_1.done && (_a = labelStyles_1.return)) _a.call(labelStyles_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    // Check if small font fits by height
                    var smallSize = getTextSize(labelText, labels.small);
                    if (smallSize.height <= availHeight && !isBoxTooSmall(labels.small)) {
                        return { style: labels.small, wrappedText: undefined };
                    }
                    return { style: undefined, wrappedText: undefined };
                };
                var result = pickStyle();
                if (!result.style && valueText) {
                    valueText = '';
                    result = pickStyle();
                }
                labelStyle = (_b = result.style) !== null && _b !== void 0 ? _b : labels.small;
                wrappedText = (_c = result.wrappedText) !== null && _c !== void 0 ? _c : '';
            }
            else if (datum.depth === 1) {
                labelStyle = title;
            }
            else {
                labelStyle = subtitle;
            }
            var labelSize = getTextSize(wrappedText || labelText, labelStyle);
            if (isBoxTooSmall(labelStyle)) {
                // Avoid labels on too small tiles
                return;
            }
            // Crop text if not enough space
            if (labelSize.width > availTextWidth) {
                var textLength = Math.floor((labelText.length * availTextWidth) / labelSize.width) - 1;
                labelText = labelText.substring(0, textLength).trim() + "\u2026";
            }
            valueSize = getTextSize(valueText, valueStyle);
            var hasValueText = valueText &&
                valueSize.width < availTextWidth &&
                valueSize.height + labelSize.height + valueMargin < availTextHeight;
            labelMeta.set(datum, {
                label: __assign({ text: wrappedText || labelText, style: labelStyle }, (datum.isLeaf
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
    TreemapSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        return new TreemapSeriesNodeDoubleClickEvent(this.labelKey, this.sizeKey, this.colorKey, event, datum, this);
    };
    TreemapSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b, _c, _d;
        if (!this.highlightGroups && !nodeDatum.isLeaf) {
            return '';
        }
        var _e = this, tooltip = _e.tooltip, sizeKey = _e.sizeKey, labelKey = _e.labelKey, colorKey = _e.colorKey, rootName = _e.rootName, seriesId = _e.id, labels = _e.labels, callbackCache = _e.ctx.callbackCache;
        var datum = nodeDatum.datum;
        var tooltipRenderer = tooltip.renderer;
        var title = nodeDatum.depth ? datum[labelKey] : (_a = datum[labelKey]) !== null && _a !== void 0 ? _a : rootName;
        var content = '';
        var format = this.getTileFormat(nodeDatum, false);
        var color = (_c = (_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : nodeDatum.fill) !== null && _c !== void 0 ? _c : 'gray';
        var valueKey = labels.value.key;
        var valueFormatter = labels.value.formatter;
        if (valueKey || valueFormatter) {
            var valueText = '';
            if (valueFormatter) {
                valueText = callbackCache.call(valueFormatter, { datum: datum });
            }
            else {
                var value = datum[valueKey];
                if (typeof value === 'number' && isFinite(value)) {
                    valueText = toFixed(value);
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
            return toTooltipHtml(tooltipRenderer({
                datum: nodeDatum.datum,
                parent: (_d = nodeDatum.parent) === null || _d === void 0 ? void 0 : _d.datum,
                depth: nodeDatum.depth,
                sizeKey: sizeKey,
                labelKey: labelKey,
                colorKey: colorKey,
                title: title,
                color: color,
                seriesId: seriesId,
            }), defaults);
        }
        if (!title && !content) {
            return '';
        }
        return toTooltipHtml(defaults);
    };
    TreemapSeries.prototype.getLegendData = function () {
        // Override point for subclasses.
        return [];
    };
    TreemapSeries.className = 'TreemapSeries';
    TreemapSeries.type = 'treemap';
    __decorate([
        Validate(NUMBER(0))
    ], TreemapSeries.prototype, "nodePadding", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], TreemapSeries.prototype, "nodeGap", void 0);
    __decorate([
        Validate(STRING)
    ], TreemapSeries.prototype, "labelKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], TreemapSeries.prototype, "sizeKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], TreemapSeries.prototype, "colorKey", void 0);
    __decorate([
        Validate(NUMBER_ARRAY)
    ], TreemapSeries.prototype, "colorDomain", void 0);
    __decorate([
        Validate(COLOR_STRING_ARRAY)
    ], TreemapSeries.prototype, "colorRange", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], TreemapSeries.prototype, "groupFill", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], TreemapSeries.prototype, "groupStroke", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], TreemapSeries.prototype, "groupStrokeWidth", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], TreemapSeries.prototype, "tileStroke", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], TreemapSeries.prototype, "tileStrokeWidth", void 0);
    __decorate([
        Validate(BOOLEAN)
    ], TreemapSeries.prototype, "gradient", void 0);
    __decorate([
        Validate(OPT_FUNCTION)
    ], TreemapSeries.prototype, "formatter", void 0);
    __decorate([
        Validate(STRING)
    ], TreemapSeries.prototype, "colorName", void 0);
    __decorate([
        Validate(STRING)
    ], TreemapSeries.prototype, "rootName", void 0);
    __decorate([
        Validate(OPT_BOOLEAN)
    ], TreemapSeries.prototype, "highlightGroups", void 0);
    return TreemapSeries;
}(HierarchySeries));
export { TreemapSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZW1hcFNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvaGllcmFyY2h5L3RyZWVtYXBTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBbUIsYUFBYSxFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNyRyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHdkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzVDLE9BQU8sRUFDSCxPQUFPLEVBQ1AsTUFBTSxFQUNOLFlBQVksRUFDWixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLFlBQVksRUFDWixV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