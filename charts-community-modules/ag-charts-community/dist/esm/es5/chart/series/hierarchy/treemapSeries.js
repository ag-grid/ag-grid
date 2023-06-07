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
        var _a;
        var _b = this, title = _b.title, subtitle = _b.subtitle, nodePadding = _b.nodePadding;
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
        return textSize.height + nodePadding + ((_a = font.padding) !== null && _a !== void 0 ? _a : 0);
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