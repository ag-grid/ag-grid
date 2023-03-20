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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieSeries = exports.DoughnutInnerCircle = exports.DoughnutInnerLabel = exports.PieTitle = void 0;
var group_1 = require("../../../scene/group");
var line_1 = require("../../../scene/shape/line");
var text_1 = require("../../../scene/shape/text");
var circle_1 = require("../../marker/circle");
var selection_1 = require("../../../scene/selection");
var linearScale_1 = require("../../../scale/linearScale");
var sector_1 = require("../../../scene/shape/sector");
var bbox_1 = require("../../../scene/bbox");
var series_1 = require("./../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var angle_1 = require("../../../util/angle");
var number_1 = require("../../../util/number");
var layers_1 = require("../../layers");
var caption_1 = require("../../../caption");
var polarSeries_1 = require("./polarSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var tooltip_1 = require("../../tooltip/tooltip");
var deprecation_1 = require("../../../util/deprecation");
var validation_1 = require("../../../util/validation");
var logger_1 = require("../../../util/logger");
var PieSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(PieSeriesNodeBaseClickEvent, _super);
    function PieSeriesNodeBaseClickEvent(angleKey, calloutLabelKey, sectorLabelKey, radiusKey, nativeEvent, datum, series) {
        var _this = _super.call(this, nativeEvent, datum, series) || this;
        _this.angleKey = angleKey;
        _this.calloutLabelKey = calloutLabelKey;
        _this.sectorLabelKey = sectorLabelKey;
        _this.radiusKey = radiusKey;
        return _this;
    }
    __decorate([
        deprecation_1.DeprecatedAndRenamedTo('calloutLabelKey')
    ], PieSeriesNodeBaseClickEvent.prototype, "labelKey", void 0);
    return PieSeriesNodeBaseClickEvent;
}(series_1.SeriesNodeBaseClickEvent));
var PieSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(PieSeriesNodeClickEvent, _super);
    function PieSeriesNodeClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeClick';
        return _this;
    }
    return PieSeriesNodeClickEvent;
}(PieSeriesNodeBaseClickEvent));
var PieSeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(PieSeriesNodeDoubleClickEvent, _super);
    function PieSeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return PieSeriesNodeDoubleClickEvent;
}(PieSeriesNodeBaseClickEvent));
var PieNodeTag;
(function (PieNodeTag) {
    PieNodeTag[PieNodeTag["Sector"] = 0] = "Sector";
    PieNodeTag[PieNodeTag["Callout"] = 1] = "Callout";
    PieNodeTag[PieNodeTag["Label"] = 2] = "Label";
})(PieNodeTag || (PieNodeTag = {}));
var PieSeriesCalloutLabel = /** @class */ (function (_super) {
    __extends(PieSeriesCalloutLabel, _super);
    function PieSeriesCalloutLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.offset = 3; // from the callout line
        _this.minAngle = 20; // in degrees
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeriesCalloutLabel.prototype, "offset", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeriesCalloutLabel.prototype, "minAngle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], PieSeriesCalloutLabel.prototype, "formatter", void 0);
    return PieSeriesCalloutLabel;
}(label_1.Label));
var PieSeriesSectorLabel = /** @class */ (function (_super) {
    __extends(PieSeriesSectorLabel, _super);
    function PieSeriesSectorLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.positionOffset = 0;
        _this.positionRatio = 0.5;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], PieSeriesSectorLabel.prototype, "positionOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], PieSeriesSectorLabel.prototype, "positionRatio", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], PieSeriesSectorLabel.prototype, "formatter", void 0);
    return PieSeriesSectorLabel;
}(label_1.Label));
var PieSeriesCalloutLine = /** @class */ (function () {
    function PieSeriesCalloutLine() {
        this.colors = undefined;
        this.length = 10;
        this.strokeWidth = 1;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING_ARRAY)
    ], PieSeriesCalloutLine.prototype, "colors", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeriesCalloutLine.prototype, "length", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeriesCalloutLine.prototype, "strokeWidth", void 0);
    return PieSeriesCalloutLine;
}());
var PieSeriesTooltip = /** @class */ (function (_super) {
    __extends(PieSeriesTooltip, _super);
    function PieSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], PieSeriesTooltip.prototype, "renderer", void 0);
    return PieSeriesTooltip;
}(series_1.SeriesTooltip));
var PieTitle = /** @class */ (function (_super) {
    __extends(PieTitle, _super);
    function PieTitle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.showInLegend = false;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], PieTitle.prototype, "showInLegend", void 0);
    return PieTitle;
}(caption_1.Caption));
exports.PieTitle = PieTitle;
var DoughnutInnerLabel = /** @class */ (function (_super) {
    __extends(DoughnutInnerLabel, _super);
    function DoughnutInnerLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.text = '';
        _this.margin = 2;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], DoughnutInnerLabel.prototype, "text", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], DoughnutInnerLabel.prototype, "margin", void 0);
    return DoughnutInnerLabel;
}(label_1.Label));
exports.DoughnutInnerLabel = DoughnutInnerLabel;
var DoughnutInnerCircle = /** @class */ (function () {
    function DoughnutInnerCircle() {
        this.fill = 'transparent';
        this.fillOpacity = 1;
    }
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], DoughnutInnerCircle.prototype, "fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
    ], DoughnutInnerCircle.prototype, "fillOpacity", void 0);
    return DoughnutInnerCircle;
}());
exports.DoughnutInnerCircle = DoughnutInnerCircle;
function isPointInArc(x, y, sector) {
    var radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var innerRadius = sector.innerRadius, outerRadius = sector.outerRadius;
    if (radius < Math.min(innerRadius, outerRadius) || radius > Math.max(innerRadius, outerRadius)) {
        return false;
    }
    // Start and End angles are expected to be [-90, 270]
    // while Math.atan2 returns [-180, 180]
    var angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) {
        angle += 2 * Math.PI;
    }
    // Start is actually bigger than End clock-wise
    var startAngle = sector.startAngle, endAngle = sector.endAngle;
    if (endAngle === -Math.PI / 2) {
        return angle < startAngle;
    }
    if (startAngle === (3 * Math.PI) / 2) {
        return angle > endAngle;
    }
    return angle >= endAngle && angle <= startAngle;
}
var PieSeries = /** @class */ (function (_super) {
    __extends(PieSeries, _super);
    function PieSeries() {
        var _this = _super.call(this, { useLabelLayer: true }) || this;
        _this.radiusScale = new linearScale_1.LinearScale();
        _this.groupSelection = selection_1.Selection.select(_this.contentGroup, group_1.Group);
        _this.highlightSelection = selection_1.Selection.select(_this.highlightGroup, group_1.Group);
        /**
         * The processed data that gets visualized.
         */
        _this.groupSelectionData = [];
        _this.sectorFormatData = [];
        _this.angleScale = (function () {
            var scale = new linearScale_1.LinearScale();
            // Each sector is a ratio of the whole, where all ratios add up to 1.
            scale.domain = [0, 1];
            // Add 90 deg to start the first pie at 12 o'clock.
            scale.range = [-Math.PI, Math.PI].map(function (angle) { return angle + Math.PI / 2; });
            return scale;
        })();
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        _this.seriesItemEnabled = [];
        _this.calloutLabel = new PieSeriesCalloutLabel();
        _this.label = _this.calloutLabel;
        _this.sectorLabel = new PieSeriesSectorLabel();
        _this.calloutLine = new PieSeriesCalloutLine();
        _this.callout = _this.calloutLine;
        _this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie sector angle).
         */
        _this.angleKey = '';
        _this.angleName = '';
        _this.innerLabels = [];
        /**
         * The key of the numeric field to use to determine the radii of pie sectors.
         * The largest value will correspond to the full radius and smaller values to
         * proportionally smaller radii.
         */
        _this.radiusKey = undefined;
        _this.radiusName = undefined;
        _this.radiusMin = undefined;
        _this.radiusMax = undefined;
        _this.calloutLabelKey = undefined;
        _this.calloutLabelName = undefined;
        _this.labelKey = undefined;
        _this.labelName = undefined;
        _this.sectorLabelKey = undefined;
        _this.sectorLabelName = undefined;
        _this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        _this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.formatter = undefined;
        /**
         * The series rotation in degrees.
         */
        _this.rotation = 0;
        _this.outerRadiusOffset = 0;
        _this.outerRadiusRatio = 1;
        _this.innerRadiusOffset = 0;
        _this.innerRadiusRatio = 1;
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.highlightStyle = new series_1.HighlightStyle();
        _this.datumSectorRefs = new WeakMap();
        _this.backgroundGroup = _this.rootGroup.appendChild(new group_1.Group({
            name: _this.id + "-background",
            layer: true,
            zIndex: layers_1.Layers.SERIES_BACKGROUND_ZINDEX,
        }));
        var pieCalloutLabels = new group_1.Group({ name: 'pieCalloutLabels' });
        var pieSectorLabels = new group_1.Group({ name: 'pieSectorLabels' });
        var innerLabels = new group_1.Group({ name: 'innerLabels' });
        _this.labelGroup.append(pieCalloutLabels);
        _this.labelGroup.append(pieSectorLabels);
        _this.labelGroup.append(innerLabels);
        _this.calloutLabelSelection = selection_1.Selection.select(pieCalloutLabels, group_1.Group);
        _this.sectorLabelSelection = selection_1.Selection.select(pieSectorLabels, text_1.Text);
        _this.innerLabelsSelection = selection_1.Selection.select(innerLabels, text_1.Text);
        return _this;
    }
    Object.defineProperty(PieSeries.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var _a, _b;
            var oldTitle = this._title;
            if (oldTitle !== value) {
                if (oldTitle) {
                    (_a = this.labelGroup) === null || _a === void 0 ? void 0 : _a.removeChild(oldTitle.node);
                }
                if (value) {
                    value.node.textBaseline = 'bottom';
                    (_b = this.labelGroup) === null || _b === void 0 ? void 0 : _b.appendChild(value.node);
                }
                this._title = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (input) {
            this._data = input;
            this.processSeriesItemEnabled();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PieSeries.prototype, "innerCircle", {
        get: function () {
            return this._innerCircleConfig;
        },
        set: function (value) {
            var _a;
            var oldCircleCfg = this._innerCircleConfig;
            if (oldCircleCfg !== value) {
                var oldNode = this._innerCircleNode;
                var circle = void 0;
                if (oldNode) {
                    this.backgroundGroup.removeChild(oldNode);
                }
                if (value) {
                    circle = new circle_1.Circle();
                    circle.fill = value.fill;
                    circle.fillOpacity = (_a = value.fillOpacity) !== null && _a !== void 0 ? _a : 1;
                    this.backgroundGroup.appendChild(circle);
                }
                this._innerCircleConfig = value;
                this._innerCircleNode = circle;
            }
        },
        enumerable: false,
        configurable: true
    });
    PieSeries.prototype.visibleChanged = function () {
        this.processSeriesItemEnabled();
    };
    PieSeries.prototype.processSeriesItemEnabled = function () {
        var _a = this, data = _a.data, visible = _a.visible;
        this.seriesItemEnabled = (data === null || data === void 0 ? void 0 : data.map(function () { return visible; })) || [];
    };
    PieSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            return this.angleScale.domain;
        }
        else {
            return this.radiusScale.domain;
        }
    };
    PieSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, sectorFormatData, calloutLabel, sectorLabel, seriesId, data, angleData, angleDataTotal, angleDataRatios, labelFormatter, labelKey, sectorLabelKey, labelData, sectorLabelData, radiusData, getLabelFormatterParams, showValueDeprecationWarning_1, sectorLabelFormatter, _b, radiusMin, radiusMax, radii, min_1, max, delta_1, rotation, halfPi, datumIndex, quadrantTextOpts, end;
            var _this = this;
            return __generator(this, function (_c) {
                _a = this, angleKey = _a.angleKey, radiusKey = _a.radiusKey, seriesItemEnabled = _a.seriesItemEnabled, angleScale = _a.angleScale, groupSelectionData = _a.groupSelectionData, sectorFormatData = _a.sectorFormatData, calloutLabel = _a.calloutLabel, sectorLabel = _a.sectorLabel, seriesId = _a.id;
                data = angleKey && this.data ? this.data : [];
                angleData = data.map(function (datum, index) { return (seriesItemEnabled[index] && Math.abs(+datum[angleKey])) || 0; });
                angleDataTotal = angleData.reduce(function (a, b) { return a + b; }, 0);
                angleDataRatios = (function () {
                    var sum = 0;
                    return angleData.map(function (datum) { return (sum += datum / angleDataTotal); });
                })();
                labelFormatter = calloutLabel.formatter;
                labelKey = calloutLabel.enabled ? this.calloutLabelKey : undefined;
                sectorLabelKey = sectorLabel.enabled ? this.sectorLabelKey : undefined;
                labelData = [];
                sectorLabelData = [];
                radiusData = [];
                getLabelFormatterParams = function (datum) {
                    return {
                        datum: datum,
                        angleKey: angleKey,
                        angleValue: datum[angleKey],
                        angleName: _this.angleName,
                        radiusKey: radiusKey,
                        radiusValue: radiusKey ? datum[radiusKey] : undefined,
                        radiusName: _this.radiusName,
                        labelKey: labelKey,
                        labelValue: labelKey ? datum[labelKey] : undefined,
                        labelName: _this.calloutLabelName,
                        calloutLabelKey: labelKey,
                        calloutLabelValue: labelKey ? datum[labelKey] : undefined,
                        calloutLabelName: _this.calloutLabelName,
                        sectorLabelKey: sectorLabelKey,
                        sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
                        sectorLabelName: _this.sectorLabelName,
                        seriesId: seriesId,
                    };
                };
                if (labelKey) {
                    if (labelFormatter) {
                        showValueDeprecationWarning_1 = function () {
                            return logger_1.Logger.warnOnce('the use of { value } in the pie chart label formatter function is deprecated. Please use { datum, labelKey, ... } instead.');
                        };
                        labelData = data.map(function (datum) {
                            var deprecatedValue = datum[labelKey];
                            var formatterParams = __assign(__assign({}, getLabelFormatterParams(datum)), { get value() {
                                    showValueDeprecationWarning_1();
                                    return deprecatedValue;
                                },
                                set value(v) {
                                    showValueDeprecationWarning_1();
                                    deprecatedValue = v;
                                } });
                            return labelFormatter(formatterParams);
                        });
                    }
                    else {
                        labelData = data.map(function (datum) { return String(datum[labelKey]); });
                    }
                }
                sectorLabelFormatter = sectorLabel.formatter;
                if (sectorLabelKey) {
                    if (sectorLabelFormatter) {
                        sectorLabelData = data.map(function (datum) {
                            var formatterParams = getLabelFormatterParams(datum);
                            return sectorLabelFormatter(formatterParams);
                        });
                    }
                    else {
                        sectorLabelData = data.map(function (datum) { return String(datum[sectorLabelKey]); });
                    }
                }
                if (radiusKey) {
                    _b = this, radiusMin = _b.radiusMin, radiusMax = _b.radiusMax;
                    radii = data.map(function (datum) { return Math.abs(datum[radiusKey]); });
                    min_1 = radiusMin !== null && radiusMin !== void 0 ? radiusMin : 0;
                    max = radiusMax ? radiusMax : Math.max.apply(Math, __spread(radii));
                    delta_1 = max - min_1;
                    radiusData = radii.map(function (value) { return (delta_1 ? (value - min_1) / delta_1 : 1); });
                }
                groupSelectionData.length = 0;
                sectorFormatData.length = 0;
                sectorFormatData.push.apply(sectorFormatData, __spread(data.map(function (datum, datumIdx) { return _this.getSectorFormat(datum, datumIdx, datumIdx, false); })));
                rotation = angle_1.toRadians(this.rotation);
                halfPi = Math.PI / 2;
                datumIndex = 0;
                quadrantTextOpts = [
                    { textAlign: 'center', textBaseline: 'bottom' },
                    { textAlign: 'left', textBaseline: 'middle' },
                    { textAlign: 'center', textBaseline: 'hanging' },
                    { textAlign: 'right', textBaseline: 'middle' },
                ];
                end = 0;
                angleDataRatios.forEach(function (start) {
                    if (isNaN(start)) {
                        return;
                    } // No sectors displayed - nothing to do.
                    var radius = radiusKey ? radiusData[datumIndex] : 1;
                    var startAngle = angleScale.convert(start) + rotation;
                    var endAngle = angleScale.convert(end) + rotation;
                    var midAngle = (startAngle + endAngle) / 2;
                    var span = Math.abs(endAngle - startAngle);
                    var midCos = Math.cos(midAngle);
                    var midSin = Math.sin(midAngle);
                    var labelMinAngle = angle_1.toRadians(calloutLabel.minAngle);
                    var labelVisible = labelKey && span > labelMinAngle;
                    var midAngle180 = angle_1.normalizeAngle180(midAngle);
                    // Split the circle into quadrants like so: ⊗
                    var quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
                    var quadrantOffset = midAngle180 - quadrantStart;
                    var quadrant = Math.floor(quadrantOffset / halfPi);
                    var quadrantIndex = number_1.mod(quadrant, quadrantTextOpts.length);
                    var _a = quadrantTextOpts[quadrantIndex], textAlign = _a.textAlign, textBaseline = _a.textBaseline;
                    var datum = data[datumIndex];
                    var itemId = datumIndex;
                    groupSelectionData.push({
                        series: _this,
                        datum: datum,
                        itemId: itemId,
                        index: datumIndex,
                        radius: radius,
                        startAngle: startAngle,
                        endAngle: endAngle,
                        midAngle: midAngle,
                        midCos: midCos,
                        midSin: midSin,
                        calloutLabel: labelVisible
                            ? {
                                text: labelData[datumIndex],
                                textAlign: textAlign,
                                textBaseline: textBaseline,
                                hidden: false,
                            }
                            : undefined,
                        sectorLabel: sectorLabelKey
                            ? {
                                text: sectorLabelData[datumIndex],
                            }
                            : undefined,
                        sectorFormat: sectorFormatData[datumIndex],
                    });
                    datumIndex++;
                    end = start; // Update for next iteration.
                });
                return [2 /*return*/];
            });
        });
    };
    PieSeries.prototype.getSectorFormat = function (datum, itemId, index, highlight) {
        var _a, _b, _c, _d, _e;
        var _f = this, angleKey = _f.angleKey, radiusKey = _f.radiusKey, fills = _f.fills, strokes = _f.strokes, seriesFillOpacity = _f.fillOpacity, formatter = _f.formatter, seriesId = _f.id;
        var highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        var isDatumHighlighted = highlight && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && itemId === highlightedDatum.itemId;
        var highlightedStyle = isDatumHighlighted ? this.highlightStyle.item : null;
        var fill = (highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fill) || fills[index % fills.length];
        var fillOpacity = (_b = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fillOpacity) !== null && _b !== void 0 ? _b : seriesFillOpacity;
        var stroke = (highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.stroke) || strokes[index % strokes.length];
        var strokeWidth = (_c = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.strokeWidth) !== null && _c !== void 0 ? _c : this.getStrokeWidth(this.strokeWidth);
        var format;
        if (formatter) {
            format = formatter({
                datum: datum,
                angleKey: angleKey,
                radiusKey: radiusKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                highlighted: isDatumHighlighted,
                seriesId: seriesId,
            });
        }
        return {
            fill: (format === null || format === void 0 ? void 0 : format.fill) || fill,
            fillOpacity: (_d = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _d !== void 0 ? _d : fillOpacity,
            stroke: (format === null || format === void 0 ? void 0 : format.stroke) || stroke,
            strokeWidth: (_e = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _e !== void 0 ? _e : strokeWidth,
        };
    };
    PieSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    PieSeries.prototype.getInnerRadius = function () {
        var _a = this, radius = _a.radius, innerRadiusRatio = _a.innerRadiusRatio, innerRadiusOffset = _a.innerRadiusOffset;
        var innerRadius = radius * (innerRadiusRatio !== null && innerRadiusRatio !== void 0 ? innerRadiusRatio : 1) + (innerRadiusOffset ? innerRadiusOffset : 0);
        if (innerRadius === radius || innerRadius < 0) {
            return 0;
        }
        return innerRadius;
    };
    PieSeries.prototype.getOuterRadius = function () {
        var _a = this, radius = _a.radius, outerRadiusRatio = _a.outerRadiusRatio, outerRadiusOffset = _a.outerRadiusOffset;
        var outerRadius = radius * (outerRadiusRatio !== null && outerRadiusRatio !== void 0 ? outerRadiusRatio : 1) + (outerRadiusOffset ? outerRadiusOffset : 0);
        if (outerRadius < 0) {
            return 0;
        }
        return outerRadius;
    };
    PieSeries.prototype.updateRadiusScale = function () {
        var innerRadius = this.getInnerRadius();
        var outerRadius = this.getOuterRadius();
        this.radiusScale.range = [innerRadius, outerRadius];
    };
    PieSeries.prototype.getTitleTranslationY = function () {
        var outerRadius = Math.max(0, this.radiusScale.range[1]);
        if (outerRadius === 0) {
            return NaN;
        }
        var titleOffset = 2;
        return -outerRadius - titleOffset;
    };
    PieSeries.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var title, dy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        title = this.title;
                        this.updateRadiusScale();
                        this.rootGroup.translationX = this.centerX;
                        this.rootGroup.translationY = this.centerY;
                        if (title) {
                            dy = this.getTitleTranslationY();
                            if (isFinite(dy)) {
                                title.node.visible = title.enabled;
                                title.node.translationY = dy;
                            }
                            else {
                                title.node.visible = false;
                            }
                        }
                        return [4 /*yield*/, this.updateSelections()];
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
    PieSeries.prototype.updateSelections = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateGroupSelection()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PieSeries.prototype.updateGroupSelection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, groupSelection, highlightSelection, calloutLabelSelection, sectorLabelSelection, innerLabelsSelection, update;
            var _this = this;
            return __generator(this, function (_b) {
                _a = this, groupSelection = _a.groupSelection, highlightSelection = _a.highlightSelection, calloutLabelSelection = _a.calloutLabelSelection, sectorLabelSelection = _a.sectorLabelSelection, innerLabelsSelection = _a.innerLabelsSelection;
                update = function (selection) {
                    return selection.update(_this.groupSelectionData, function (group) {
                        var sector = new sector_1.Sector();
                        sector.tag = PieNodeTag.Sector;
                        group.appendChild(sector);
                    });
                };
                this.groupSelection = update(groupSelection);
                this.highlightSelection = update(highlightSelection);
                calloutLabelSelection.update(this.groupSelectionData, function (group) {
                    var line = new line_1.Line();
                    line.tag = PieNodeTag.Callout;
                    line.pointerEvents = node_1.PointerEvents.None;
                    group.appendChild(line);
                    var text = new text_1.Text();
                    text.tag = PieNodeTag.Label;
                    text.pointerEvents = node_1.PointerEvents.None;
                    group.appendChild(text);
                });
                sectorLabelSelection.update(this.groupSelectionData, function (node) {
                    node.pointerEvents = node_1.PointerEvents.None;
                });
                innerLabelsSelection.update(this.innerLabels, function (node) {
                    node.pointerEvents = node_1.PointerEvents.None;
                });
                return [2 /*return*/];
            });
        });
    };
    PieSeries.prototype.updateNodes = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var highlightedDatum, isVisible, radiusScale, innerRadius, updateSectorFn;
            var _this = this;
            return __generator(this, function (_b) {
                highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
                isVisible = this.seriesItemEnabled.indexOf(true) >= 0;
                this.rootGroup.visible = isVisible;
                this.backgroundGroup.visible = isVisible;
                this.contentGroup.visible = isVisible;
                this.highlightGroup.visible = isVisible && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this;
                this.labelGroup.visible = isVisible;
                this.contentGroup.opacity = this.getOpacity();
                this.updateInnerCircle();
                radiusScale = this.radiusScale;
                innerRadius = radiusScale.convert(0);
                updateSectorFn = function (sector, datum, index, isDatumHighlighted) {
                    var radius = radiusScale.convert(datum.radius);
                    // Bring highlighted sector's parent group to front.
                    var sectorParent = sector.parent;
                    var sectorGrandParent = sectorParent === null || sectorParent === void 0 ? void 0 : sectorParent.parent;
                    if (isDatumHighlighted && sectorParent && sectorGrandParent) {
                        sectorGrandParent.removeChild(sectorParent);
                        sectorGrandParent.appendChild(sectorParent);
                    }
                    sector.innerRadius = Math.max(0, innerRadius);
                    sector.outerRadius = Math.max(0, radius);
                    sector.startAngle = datum.startAngle;
                    sector.endAngle = datum.endAngle;
                    var format = _this.getSectorFormat(datum.datum, datum.itemId, index, isDatumHighlighted);
                    sector.fill = format.fill;
                    sector.stroke = format.stroke;
                    sector.strokeWidth = format.strokeWidth;
                    sector.fillOpacity = format.fillOpacity;
                    sector.strokeOpacity = _this.strokeOpacity;
                    sector.lineDash = _this.lineDash;
                    sector.lineDashOffset = _this.lineDashOffset;
                    sector.fillShadow = _this.shadow;
                    sector.lineJoin = 'round';
                    sector.visible = _this.seriesItemEnabled[index];
                    _this.datumSectorRefs.set(datum, sector);
                };
                this.groupSelection
                    .selectByTag(PieNodeTag.Sector)
                    .forEach(function (node, index) { return updateSectorFn(node, node.datum, index, false); });
                this.highlightSelection.selectByTag(PieNodeTag.Sector).forEach(function (node, index) {
                    var isDatumHighlighted = (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === _this && node.datum.itemId === highlightedDatum.itemId;
                    node.visible = isDatumHighlighted;
                    if (node.visible) {
                        updateSectorFn(node, node.datum, index, isDatumHighlighted);
                    }
                });
                this.updateCalloutLineNodes();
                this.updateCalloutLabelNodes();
                this.updateSectorLabelNodes();
                this.updateInnerLabelNodes();
                return [2 /*return*/];
            });
        });
    };
    PieSeries.prototype.updateCalloutLineNodes = function () {
        var _a = this, radiusScale = _a.radiusScale, calloutLine = _a.calloutLine;
        var calloutLength = calloutLine.length;
        var calloutStrokeWidth = calloutLine.strokeWidth;
        var calloutColors = calloutLine.colors || this.strokes;
        this.calloutLabelSelection.selectByTag(PieNodeTag.Callout).forEach(function (line, index) {
            var datum = line.datum;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            if (datum.calloutLabel && outerRadius !== 0 && !datum.calloutLabel.hidden) {
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.x1 = datum.midCos * outerRadius;
                line.y1 = datum.midSin * outerRadius;
                line.x2 = datum.midCos * (outerRadius + calloutLength);
                line.y2 = datum.midSin * (outerRadius + calloutLength);
                line.visible = true;
            }
            else {
                line.visible = false;
            }
        });
    };
    PieSeries.prototype.getLabelOverflow = function (text, box) {
        var seriesBox = this.chart.getSeriesRect();
        var seriesLeft = seriesBox.x - this.centerX;
        var seriesRight = seriesBox.x + seriesBox.width - this.centerX;
        var seriesTop = seriesBox.y - this.centerY;
        var seriesBottom = seriesBox.y + seriesBox.height - this.centerY;
        var errPx = 1; // Prevents errors related to floating point calculations
        var visibleTextPart = 1;
        if (box.x + errPx < seriesLeft) {
            visibleTextPart = (box.x + box.width - seriesLeft) / box.width;
        }
        else if (box.x + box.width - errPx > seriesRight) {
            visibleTextPart = (seriesRight - box.x) / box.width;
        }
        var hasVerticalOverflow = box.y + errPx < seriesTop || box.y + box.height - errPx > seriesBottom;
        var textLength = Math.floor(text.length * visibleTextPart) - 1;
        return { visibleTextPart: visibleTextPart, textLength: textLength, hasVerticalOverflow: hasVerticalOverflow };
    };
    PieSeries.prototype.updateCalloutLabelNodes = function () {
        var _this = this;
        var _a = this, radiusScale = _a.radiusScale, calloutLabel = _a.calloutLabel, calloutLine = _a.calloutLine;
        var calloutLength = calloutLine.length;
        var offset = calloutLabel.offset, color = calloutLabel.color;
        var tempTextNode = new text_1.Text();
        this.calloutLabelSelection.selectByTag(PieNodeTag.Label).forEach(function (text) {
            var datum = text.datum;
            var label = datum.calloutLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0 || label.hidden) {
                text.visible = false;
                return;
            }
            var labelRadius = outerRadius + calloutLength + offset;
            var x = datum.midCos * labelRadius;
            var y = datum.midSin * labelRadius;
            // Detect text overflow
            _this.setTextDimensionalProps(tempTextNode, x, y, _this.calloutLabel, label);
            var box = tempTextNode.computeBBox();
            var _a = _this.getLabelOverflow(label.text, box), visibleTextPart = _a.visibleTextPart, textLength = _a.textLength, hasVerticalOverflow = _a.hasVerticalOverflow;
            var displayText = visibleTextPart === 1 ? label.text : label.text.substring(0, textLength) + "\u2026";
            _this.setTextDimensionalProps(text, x, y, _this.calloutLabel, __assign(__assign({}, label), { text: displayText }));
            text.fill = color;
            text.visible = !hasVerticalOverflow;
        });
    };
    PieSeries.prototype.computeLabelsBBox = function (options) {
        var _this = this;
        var _a = this, radiusScale = _a.radiusScale, calloutLabel = _a.calloutLabel, calloutLine = _a.calloutLine;
        var calloutLength = calloutLine.length;
        var offset = calloutLabel.offset;
        this.updateRadiusScale();
        var text = new text_1.Text();
        var textBoxes = this.groupSelectionData
            .map(function (datum) {
            var label = datum.calloutLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0) {
                return null;
            }
            var labelRadius = outerRadius + calloutLength + offset;
            var x = datum.midCos * labelRadius;
            var y = datum.midSin * labelRadius;
            _this.setTextDimensionalProps(text, x, y, _this.calloutLabel, label);
            var box = text.computeBBox();
            if (options.hideWhenNecessary) {
                var _a = _this.getLabelOverflow(label.text, box), textLength = _a.textLength, hasVerticalOverflow = _a.hasVerticalOverflow;
                var isTooShort = textLength < 2;
                if (hasVerticalOverflow || isTooShort) {
                    label.hidden = true;
                    return null;
                }
            }
            label.hidden = false;
            return box;
        })
            .filter(function (box) { return box != null; });
        if (this.title && this.title.text) {
            var dy = this.getTitleTranslationY();
            if (isFinite(dy)) {
                this.setTextDimensionalProps(text, 0, dy, this.title, {
                    text: this.title.text,
                    textBaseline: 'bottom',
                    textAlign: 'center',
                    hidden: false,
                });
                var box = text.computeBBox();
                textBoxes.push(box);
            }
        }
        if (textBoxes.length === 0) {
            return null;
        }
        return bbox_1.BBox.merge(textBoxes);
    };
    PieSeries.prototype.setTextDimensionalProps = function (textNode, x, y, style, label) {
        var fontStyle = style.fontStyle, fontWeight = style.fontWeight, fontSize = style.fontSize, fontFamily = style.fontFamily;
        textNode.fontStyle = fontStyle;
        textNode.fontWeight = fontWeight;
        textNode.fontSize = fontSize;
        textNode.fontFamily = fontFamily;
        textNode.text = label.text;
        textNode.x = x;
        textNode.y = y;
        textNode.textAlign = label.textAlign;
        textNode.textBaseline = label.textBaseline;
    };
    PieSeries.prototype.updateSectorLabelNodes = function () {
        var _this = this;
        var radiusScale = this.radiusScale;
        var innerRadius = radiusScale.convert(0);
        var _a = this.sectorLabel, fontSize = _a.fontSize, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontFamily = _a.fontFamily, positionOffset = _a.positionOffset, positionRatio = _a.positionRatio, color = _a.color;
        var isDoughnut = innerRadius > 0;
        var singleVisibleSector = this.seriesItemEnabled.filter(Boolean).length === 1;
        this.sectorLabelSelection.each(function (text, datum) {
            var sectorLabel = datum.sectorLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            var isTextVisible = false;
            if (sectorLabel && outerRadius !== 0) {
                var labelRadius = innerRadius * (1 - positionRatio) + radius * positionRatio + positionOffset;
                text.fill = color;
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.text = sectorLabel.text;
                var shouldPutTextInCenter = !isDoughnut && singleVisibleSector;
                if (shouldPutTextInCenter) {
                    text.x = 0;
                    text.y = 0;
                }
                else {
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                }
                text.textAlign = 'center';
                text.textBaseline = 'middle';
                var sector = _this.datumSectorRefs.get(datum);
                if (sector) {
                    var bbox = text.computeBBox();
                    var corners = [
                        [bbox.x, bbox.y],
                        [bbox.x + bbox.width, bbox.y],
                        [bbox.x + bbox.width, bbox.y + bbox.height],
                        [bbox.x, bbox.y + bbox.height],
                    ];
                    var startAngle = datum.startAngle, endAngle = datum.endAngle;
                    var sectorBounds_1 = { startAngle: startAngle, endAngle: endAngle, innerRadius: innerRadius, outerRadius: outerRadius };
                    if (corners.every(function (_a) {
                        var _b = __read(_a, 2), x = _b[0], y = _b[1];
                        return isPointInArc(x, y, sectorBounds_1);
                    })) {
                        isTextVisible = true;
                    }
                }
            }
            text.visible = isTextVisible;
        });
    };
    PieSeries.prototype.updateInnerCircle = function () {
        var circle = this._innerCircleNode;
        if (!circle) {
            return;
        }
        var innerRadius = this.getInnerRadius();
        if (innerRadius === 0) {
            circle.size = 0;
        }
        else {
            var circleRadius = Math.min(innerRadius, this.getOuterRadius());
            var antiAliasingPadding = 1;
            circle.size = Math.ceil(circleRadius * 2 + antiAliasingPadding);
        }
    };
    PieSeries.prototype.updateInnerLabelNodes = function () {
        var textBBoxes = [];
        var margins = [];
        this.innerLabelsSelection.each(function (text, datum) {
            var fontStyle = datum.fontStyle, fontWeight = datum.fontWeight, fontSize = datum.fontSize, fontFamily = datum.fontFamily, color = datum.color;
            text.fontStyle = fontStyle;
            text.fontWeight = fontWeight;
            text.fontSize = fontSize;
            text.fontFamily = fontFamily;
            text.text = datum.text;
            text.x = 0;
            text.y = 0;
            text.fill = color;
            text.textAlign = 'center';
            text.textBaseline = 'alphabetic';
            textBBoxes.push(text.computeBBox());
            margins.push(datum.margin);
        });
        var getMarginTop = function (index) { return (index === 0 ? 0 : margins[index]); };
        var getMarginBottom = function (index) { return (index === margins.length - 1 ? 0 : margins[index]); };
        var totalHeight = textBBoxes.reduce(function (sum, bbox, i) {
            return sum + bbox.height + getMarginTop(i) + getMarginBottom(i);
        }, 0);
        var totalWidth = Math.max.apply(Math, __spread(textBBoxes.map(function (bbox) { return bbox.width; })));
        var innerRadius = this.getInnerRadius();
        var labelRadius = Math.sqrt(Math.pow(totalWidth / 2, 2) + Math.pow(totalHeight / 2, 2));
        var labelsVisible = labelRadius <= (innerRadius > 0 ? innerRadius : this.getOuterRadius());
        var textBottoms = [];
        for (var i = 0, prev = -totalHeight / 2; i < textBBoxes.length; i++) {
            var bbox = textBBoxes[i];
            var bottom = bbox.height + prev + getMarginTop(i);
            textBottoms.push(bottom);
            prev = bottom + getMarginBottom(i);
        }
        this.innerLabelsSelection.each(function (text, _datum, index) {
            text.y = textBottoms[index];
            text.visible = labelsVisible;
        });
    };
    PieSeries.prototype.getNodeClickEvent = function (event, datum) {
        return new PieSeriesNodeClickEvent(this.angleKey, this.calloutLabelKey, this.sectorLabelKey, this.radiusKey, event, datum, this);
    };
    PieSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        return new PieSeriesNodeDoubleClickEvent(this.angleKey, this.calloutLabelKey, this.sectorLabelKey, this.radiusKey, event, datum, this);
    };
    PieSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var angleKey = this.angleKey;
        if (!angleKey) {
            return '';
        }
        var _a = this, tooltip = _a.tooltip, angleName = _a.angleName, radiusKey = _a.radiusKey, radiusName = _a.radiusName, calloutLabelKey = _a.calloutLabelKey, sectorLabelKey = _a.sectorLabelKey, calloutLabelName = _a.calloutLabelName, sectorLabelName = _a.sectorLabelName, seriesId = _a.id;
        var tooltipRenderer = tooltip.renderer;
        var color = nodeDatum.sectorFormat.fill;
        var datum = nodeDatum.datum;
        var label = calloutLabelKey ? datum[calloutLabelKey] + ": " : '';
        var angleValue = datum[angleKey];
        var formattedAngleValue = typeof angleValue === 'number' ? number_1.toFixed(angleValue) : angleValue.toString();
        var title = this.title ? this.title.text : undefined;
        var content = label + formattedAngleValue;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
                datum: datum,
                angleKey: angleKey,
                angleValue: angleValue,
                angleName: angleName,
                radiusKey: radiusKey,
                radiusValue: radiusKey ? datum[radiusKey] : undefined,
                radiusName: radiusName,
                labelKey: calloutLabelKey,
                labelName: calloutLabelName,
                calloutLabelKey: calloutLabelKey,
                calloutLabelName: calloutLabelName,
                sectorLabelKey: sectorLabelKey,
                sectorLabelName: sectorLabelName,
                title: title,
                color: color,
                seriesId: seriesId,
            }), defaults);
        }
        return tooltip_1.toTooltipHtml(defaults);
    };
    PieSeries.prototype.getLegendData = function () {
        var _this = this;
        var _a = this, calloutLabelKey = _a.calloutLabelKey, data = _a.data, sectorFormatData = _a.sectorFormatData;
        if (data && data.length && calloutLabelKey) {
            var id_1 = this.id;
            var legendData_1 = [];
            var titleText_1 = this.title && this.title.showInLegend && this.title.text;
            data.forEach(function (datum, index) {
                var labelParts = [];
                titleText_1 && labelParts.push(titleText_1);
                labelParts.push(String(datum[calloutLabelKey]));
                legendData_1.push({
                    id: id_1,
                    itemId: index,
                    seriesId: id_1,
                    enabled: _this.seriesItemEnabled[index],
                    label: {
                        text: labelParts.join(' - '),
                    },
                    marker: {
                        fill: sectorFormatData[index].fill,
                        stroke: sectorFormatData[index].stroke,
                        fillOpacity: _this.fillOpacity,
                        strokeOpacity: _this.strokeOpacity,
                    },
                });
            });
            return legendData_1;
        }
        return [];
    };
    PieSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    };
    PieSeries.className = 'PieSeries';
    PieSeries.type = 'pie';
    __decorate([
        deprecation_1.DeprecatedAndRenamedTo('calloutLabel')
    ], PieSeries.prototype, "label", void 0);
    __decorate([
        deprecation_1.DeprecatedAndRenamedTo('calloutLine')
    ], PieSeries.prototype, "callout", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], PieSeries.prototype, "angleKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], PieSeries.prototype, "angleName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], PieSeries.prototype, "radiusKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], PieSeries.prototype, "radiusName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], PieSeries.prototype, "radiusMin", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], PieSeries.prototype, "radiusMax", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], PieSeries.prototype, "calloutLabelKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], PieSeries.prototype, "calloutLabelName", void 0);
    __decorate([
        deprecation_1.DeprecatedAndRenamedTo('calloutLabelKey')
    ], PieSeries.prototype, "labelKey", void 0);
    __decorate([
        deprecation_1.DeprecatedAndRenamedTo('calloutLabelName')
    ], PieSeries.prototype, "labelName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], PieSeries.prototype, "sectorLabelKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], PieSeries.prototype, "sectorLabelName", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
    ], PieSeries.prototype, "fills", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
    ], PieSeries.prototype, "strokes", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], PieSeries.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], PieSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_LINE_DASH)
    ], PieSeries.prototype, "lineDash", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], PieSeries.prototype, "formatter", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(-360, 360))
    ], PieSeries.prototype, "rotation", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], PieSeries.prototype, "outerRadiusOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeries.prototype, "outerRadiusRatio", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], PieSeries.prototype, "innerRadiusOffset", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeries.prototype, "innerRadiusRatio", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], PieSeries.prototype, "strokeWidth", void 0);
    return PieSeries;
}(polarSeries_1.PolarSeries));
exports.PieSeries = PieSeries;
