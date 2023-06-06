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
import { Group } from '../../../scene/group';
import { Line } from '../../../scene/shape/line';
import { Text } from '../../../scene/shape/text';
import { Circle } from '../../marker/circle';
import { Selection } from '../../../scene/selection';
import { LinearScale } from '../../../scale/linearScale';
import { Sector } from '../../../scene/shape/sector';
import { BBox } from '../../../scene/bbox';
import { HighlightStyle, SeriesTooltip, SeriesNodeBaseClickEvent, valueProperty, rangedValueProperty, accumulativeValueProperty, } from './../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { normalizeAngle180, toRadians } from '../../../util/angle';
import { toFixed, mod } from '../../../util/number';
import { Layers } from '../../layers';
import { Caption } from '../../../caption';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { isPointInSector, boxCollidesSector } from '../../../util/sector';
import { BOOLEAN, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, OPT_COLOR_STRING_ARRAY, Validate, COLOR_STRING, } from '../../../util/validation';
import { StateMachine } from '../../../motion/states';
import * as easing from '../../../motion/easing';
import { DataModel } from '../../data/dataModel';
import { normalisePropertyTo } from '../../data/processors';
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
    return PieSeriesNodeBaseClickEvent;
}(SeriesNodeBaseClickEvent));
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
        _this.minAngle = 0; // in degrees
        _this.formatter = undefined;
        _this.minSpacing = 4;
        _this.maxCollisionOffset = 50;
        return _this;
    }
    __decorate([
        Validate(NUMBER(0))
    ], PieSeriesCalloutLabel.prototype, "offset", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeriesCalloutLabel.prototype, "minAngle", void 0);
    __decorate([
        Validate(OPT_FUNCTION)
    ], PieSeriesCalloutLabel.prototype, "formatter", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeriesCalloutLabel.prototype, "minSpacing", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeriesCalloutLabel.prototype, "maxCollisionOffset", void 0);
    return PieSeriesCalloutLabel;
}(Label));
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
        Validate(NUMBER())
    ], PieSeriesSectorLabel.prototype, "positionOffset", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], PieSeriesSectorLabel.prototype, "positionRatio", void 0);
    __decorate([
        Validate(OPT_FUNCTION)
    ], PieSeriesSectorLabel.prototype, "formatter", void 0);
    return PieSeriesSectorLabel;
}(Label));
var PieSeriesCalloutLine = /** @class */ (function () {
    function PieSeriesCalloutLine() {
        this.colors = undefined;
        this.length = 10;
        this.strokeWidth = 1;
    }
    __decorate([
        Validate(OPT_COLOR_STRING_ARRAY)
    ], PieSeriesCalloutLine.prototype, "colors", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeriesCalloutLine.prototype, "length", void 0);
    __decorate([
        Validate(NUMBER(0))
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
        Validate(OPT_FUNCTION)
    ], PieSeriesTooltip.prototype, "renderer", void 0);
    return PieSeriesTooltip;
}(SeriesTooltip));
var PieTitle = /** @class */ (function (_super) {
    __extends(PieTitle, _super);
    function PieTitle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.showInLegend = false;
        return _this;
    }
    __decorate([
        Validate(BOOLEAN)
    ], PieTitle.prototype, "showInLegend", void 0);
    return PieTitle;
}(Caption));
export { PieTitle };
var DoughnutInnerLabel = /** @class */ (function (_super) {
    __extends(DoughnutInnerLabel, _super);
    function DoughnutInnerLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.text = '';
        _this.margin = 2;
        return _this;
    }
    __decorate([
        Validate(STRING)
    ], DoughnutInnerLabel.prototype, "text", void 0);
    __decorate([
        Validate(NUMBER())
    ], DoughnutInnerLabel.prototype, "margin", void 0);
    return DoughnutInnerLabel;
}(Label));
export { DoughnutInnerLabel };
var DoughnutInnerCircle = /** @class */ (function () {
    function DoughnutInnerCircle() {
        this.fill = 'transparent';
        this.fillOpacity = 1;
    }
    __decorate([
        Validate(COLOR_STRING)
    ], DoughnutInnerCircle.prototype, "fill", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1))
    ], DoughnutInnerCircle.prototype, "fillOpacity", void 0);
    return DoughnutInnerCircle;
}());
export { DoughnutInnerCircle };
var PieStateMachine = /** @class */ (function (_super) {
    __extends(PieStateMachine, _super);
    function PieStateMachine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PieStateMachine;
}(StateMachine));
var PieSeries = /** @class */ (function (_super) {
    __extends(PieSeries, _super);
    function PieSeries(moduleCtx) {
        var _this = _super.call(this, { moduleCtx: moduleCtx, useLabelLayer: true }) || this;
        _this.radiusScale = new LinearScale();
        _this.groupSelection = Selection.select(_this.contentGroup, Group);
        _this.highlightSelection = Selection.select(_this.highlightGroup, Group);
        _this.nodeData = [];
        // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
        _this.seriesItemEnabled = [];
        _this.title = undefined;
        _this.calloutLabel = new PieSeriesCalloutLabel();
        _this.sectorLabel = new PieSeriesSectorLabel();
        _this.calloutLine = new PieSeriesCalloutLine();
        _this.tooltip = new PieSeriesTooltip();
        /**
         * The key of the numeric field to use to determine the angle (for example,
         * a pie sector angle).
         */
        _this.angleKey = '';
        _this.angleName = '';
        _this.innerLabels = [];
        _this.innerCircle = undefined;
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
        _this.sectorLabelKey = undefined;
        _this.sectorLabelName = undefined;
        _this.legendItemKey = undefined;
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
        _this.highlightStyle = new HighlightStyle();
        _this.surroundingRadius = undefined;
        _this.angleScale = new LinearScale();
        // Each sector is a ratio of the whole, where all ratios add up to 1.
        _this.angleScale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        _this.angleScale.range = [-Math.PI, Math.PI].map(function (angle) { return angle + Math.PI / 2; });
        _this.backgroundGroup = _this.rootGroup.appendChild(new Group({
            name: _this.id + "-background",
            layer: true,
            zIndex: Layers.SERIES_BACKGROUND_ZINDEX,
        }));
        var pieCalloutLabels = new Group({ name: 'pieCalloutLabels' });
        var pieSectorLabels = new Group({ name: 'pieSectorLabels' });
        var innerLabels = new Group({ name: 'innerLabels' });
        _this.labelGroup.append(pieCalloutLabels);
        _this.labelGroup.append(pieSectorLabels);
        _this.labelGroup.append(innerLabels);
        _this.calloutLabelSelection = Selection.select(pieCalloutLabels, Group);
        _this.sectorLabelSelection = Selection.select(pieSectorLabels, Text);
        _this.innerLabelsSelection = Selection.select(innerLabels, Text);
        _this.animationState = new PieStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'ready',
                        action: function () { return _this.animateEmptyUpdateReady(); },
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: function () { return _this.animateReadyUpdateReady(); },
                    },
                },
            },
        });
        return _this;
    }
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
    PieSeries.prototype.addChartEventListeners = function () {
        var _this = this;
        var _a;
        (_a = this.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', function (event) { return _this.onLegendItemClick(event); });
    };
    PieSeries.prototype.visibleChanged = function () {
        this.processSeriesItemEnabled();
    };
    PieSeries.prototype.processSeriesItemEnabled = function () {
        var _a;
        var _b = this, data = _b.data, visible = _b.visible;
        this.seriesItemEnabled = (_a = data === null || data === void 0 ? void 0 : data.map(function () { return visible; })) !== null && _a !== void 0 ? _a : [];
    };
    PieSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.angleScale.domain;
        }
        else {
            return this.radiusScale.domain;
        }
    };
    PieSeries.prototype.processData = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, data, _d, angleKey, radiusKey, seriesItemEnabled, extraProps;
            return __generator(this, function (_e) {
                _c = this.data, data = _c === void 0 ? [] : _c;
                _d = this, angleKey = _d.angleKey, radiusKey = _d.radiusKey, seriesItemEnabled = _d.seriesItemEnabled;
                if (!angleKey)
                    return [2 /*return*/];
                extraProps = [];
                if (radiusKey) {
                    extraProps.push(rangedValueProperty(radiusKey, { id: 'radiusValue', min: (_a = this.radiusMin) !== null && _a !== void 0 ? _a : 0, max: this.radiusMax }), valueProperty(radiusKey, true, { id: "radiusRaw" }), // Raw value pass-through.
                    normalisePropertyTo({ id: 'radiusValue' }, [0, 1], (_b = this.radiusMin) !== null && _b !== void 0 ? _b : 0, this.radiusMax));
                    extraProps.push();
                }
                data = data.map(function (d, idx) {
                    var _a;
                    return (seriesItemEnabled[idx] ? d : __assign(__assign({}, d), (_a = {}, _a[angleKey] = 0, _a)));
                });
                this.dataModel = new DataModel({
                    props: __spreadArray([
                        accumulativeValueProperty(angleKey, true, { id: "angleValue" }),
                        valueProperty(angleKey, true, { id: "angleRaw" }),
                        normalisePropertyTo({ id: 'angleValue' }, [0, 1], 0)
                    ], __read(extraProps)),
                });
                this.processedData = this.dataModel.processData(data);
                return [2 /*return*/];
            });
        });
    };
    PieSeries.prototype.maybeRefreshNodeData = function () {
        if (!this.nodeDataRefresh)
            return;
        var _a = __read(this._createNodeData(), 1), _b = _a[0], _c = _b === void 0 ? {} : _b, _d = _c.nodeData, nodeData = _d === void 0 ? [] : _d;
        this.nodeData = nodeData;
        this.nodeDataRefresh = false;
    };
    PieSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._createNodeData()];
            });
        });
    };
    PieSeries.prototype._createNodeData = function () {
        var _this = this;
        var _a, _b, _c, _d;
        var _e = this, seriesId = _e.id, processedData = _e.processedData, dataModel = _e.dataModel, rotation = _e.rotation, angleScale = _e.angleScale;
        if (!processedData || !dataModel || processedData.type !== 'ungrouped')
            return [];
        var angleIdx = (_b = (_a = dataModel.resolveProcessedDataIndexById("angleValue")) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1;
        var radiusIdx = (_d = (_c = dataModel.resolveProcessedDataIndexById("radiusValue")) === null || _c === void 0 ? void 0 : _c.index) !== null && _d !== void 0 ? _d : -1;
        if (angleIdx < 0)
            return [];
        var currentStart = 0;
        var nodeData = processedData.data.map(function (group, index) {
            var _a;
            var datum = group.datum, values = group.values;
            var currentValue = values[angleIdx];
            var startAngle = angleScale.convert(currentStart) + toRadians(rotation);
            currentStart = currentValue;
            var endAngle = angleScale.convert(currentStart) + toRadians(rotation);
            var span = Math.abs(endAngle - startAngle);
            var midAngle = startAngle + span / 2;
            var angleValue = values[angleIdx + 1];
            var radius = radiusIdx >= 0 ? (_a = values[radiusIdx]) !== null && _a !== void 0 ? _a : 1 : 1;
            var radiusValue = radiusIdx >= 0 ? values[radiusIdx + 1] : undefined;
            var labels = _this.getLabels(datum, midAngle, span, true);
            var sectorFormat = _this.getSectorFormat(datum, index, index, false);
            return __assign({ itemId: index, series: _this, datum: datum, index: index, angleValue: angleValue, midAngle: midAngle, midCos: Math.cos(midAngle), midSin: Math.sin(midAngle), startAngle: startAngle, endAngle: endAngle, sectorFormat: sectorFormat, radius: radius, radiusValue: radiusValue }, labels);
        });
        return [
            {
                itemId: seriesId,
                nodeData: nodeData,
                labelData: nodeData,
            },
        ];
    };
    PieSeries.prototype.getLabels = function (datum, midAngle, span, skipDisabled) {
        var _a = this, calloutLabel = _a.calloutLabel, sectorLabel = _a.sectorLabel, legendItemKey = _a.legendItemKey, callbackCache = _a.ctx.callbackCache;
        var calloutLabelKey = !skipDisabled || calloutLabel.enabled ? this.calloutLabelKey : undefined;
        var sectorLabelKey = !skipDisabled || sectorLabel.enabled ? this.sectorLabelKey : undefined;
        if (!calloutLabelKey && !sectorLabelKey && !legendItemKey)
            return {};
        var labelFormatterParams = this.getLabelFormatterParams(datum);
        var calloutLabelText;
        if (calloutLabelKey) {
            var calloutLabelMinAngle = toRadians(calloutLabel.minAngle);
            var calloutLabelVisible = span > calloutLabelMinAngle;
            if (!calloutLabelVisible) {
                calloutLabelText = undefined;
            }
            else if (calloutLabel.formatter) {
                calloutLabelText = callbackCache.call(calloutLabel.formatter, labelFormatterParams);
            }
            else {
                calloutLabelText = String(datum[calloutLabelKey]);
            }
        }
        var sectorLabelText;
        if (sectorLabelKey) {
            if (sectorLabel.formatter) {
                sectorLabelText = callbackCache.call(sectorLabel.formatter, labelFormatterParams);
            }
            else {
                sectorLabelText = String(datum[sectorLabelKey]);
            }
        }
        var legendItemText;
        if (legendItemKey) {
            legendItemText = String(datum[legendItemKey]);
        }
        return __assign(__assign(__assign({}, (calloutLabelText != null
            ? {
                calloutLabel: __assign(__assign({}, this.getTextAlignment(midAngle)), { text: calloutLabelText, hidden: false, collisionTextAlign: undefined, collisionOffsetY: 0, box: undefined }),
            }
            : {})), (sectorLabelText != null ? { sectorLabel: { text: sectorLabelText } } : {})), (legendItemKey != null && legendItemText != null
            ? { legendItem: { key: legendItemKey, text: legendItemText } }
            : {}));
    };
    PieSeries.prototype.getLabelFormatterParams = function (datum) {
        var _a = this, seriesId = _a.id, radiusKey = _a.radiusKey, radiusName = _a.radiusName, angleKey = _a.angleKey, angleName = _a.angleName, calloutLabelKey = _a.calloutLabelKey, calloutLabelName = _a.calloutLabelName, sectorLabelKey = _a.sectorLabelKey, sectorLabelName = _a.sectorLabelName;
        return {
            datum: datum,
            angleKey: angleKey,
            angleValue: datum[angleKey],
            angleName: angleName,
            radiusKey: radiusKey,
            radiusValue: radiusKey ? datum[radiusKey] : undefined,
            radiusName: radiusName,
            calloutLabelKey: calloutLabelKey,
            calloutLabelValue: calloutLabelKey ? datum[calloutLabelKey] : undefined,
            calloutLabelName: calloutLabelName,
            sectorLabelKey: sectorLabelKey,
            sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
            sectorLabelName: sectorLabelName,
            seriesId: seriesId,
        };
    };
    PieSeries.prototype.getTextAlignment = function (midAngle) {
        var quadrantTextOpts = [
            { textAlign: 'center', textBaseline: 'bottom' },
            { textAlign: 'left', textBaseline: 'middle' },
            { textAlign: 'center', textBaseline: 'hanging' },
            { textAlign: 'right', textBaseline: 'middle' },
        ];
        var midAngle180 = normalizeAngle180(midAngle);
        // Split the circle into quadrants like so: ⊗
        var quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
        var quadrantOffset = midAngle180 - quadrantStart;
        var quadrant = Math.floor(quadrantOffset / (Math.PI / 2));
        var quadrantIndex = mod(quadrant, quadrantTextOpts.length);
        return quadrantTextOpts[quadrantIndex];
    };
    PieSeries.prototype.getSectorFormat = function (datum, itemId, index, highlight) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var _k = this, angleKey = _k.angleKey, radiusKey = _k.radiusKey, fills = _k.fills, strokes = _k.strokes, seriesFillOpacity = _k.fillOpacity, formatter = _k.formatter, seriesId = _k.id, callbackCache = _k.ctx.callbackCache;
        var highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        var isDatumHighlighted = highlight && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.series) === this && itemId === highlightedDatum.itemId;
        var highlightedStyle = isDatumHighlighted ? this.highlightStyle.item : null;
        var fill = (_b = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fill) !== null && _b !== void 0 ? _b : fills[index % fills.length];
        var fillOpacity = (_c = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.fillOpacity) !== null && _c !== void 0 ? _c : seriesFillOpacity;
        var stroke = (_d = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.stroke) !== null && _d !== void 0 ? _d : strokes[index % strokes.length];
        var strokeWidth = (_e = highlightedStyle === null || highlightedStyle === void 0 ? void 0 : highlightedStyle.strokeWidth) !== null && _e !== void 0 ? _e : this.getStrokeWidth(this.strokeWidth);
        var format;
        if (formatter) {
            format = callbackCache.call(formatter, {
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
            fill: (_f = format === null || format === void 0 ? void 0 : format.fill) !== null && _f !== void 0 ? _f : fill,
            fillOpacity: (_g = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _g !== void 0 ? _g : fillOpacity,
            stroke: (_h = format === null || format === void 0 ? void 0 : format.stroke) !== null && _h !== void 0 ? _h : stroke,
            strokeWidth: (_j = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _j !== void 0 ? _j : strokeWidth,
        };
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
        var _a, _b;
        var outerRadius = Math.max(0, this.radiusScale.range[1]);
        if (outerRadius === 0) {
            return NaN;
        }
        var spacing = (_b = (_a = this.title) === null || _a === void 0 ? void 0 : _a.spacing) !== null && _b !== void 0 ? _b : 0;
        var titleOffset = 2 + spacing;
        var dy = Math.max(0, -outerRadius);
        return -outerRadius - titleOffset - dy;
    };
    PieSeries.prototype.update = function (_a) {
        var seriesRect = _a.seriesRect;
        return __awaiter(this, void 0, void 0, function () {
            var title, dy, titleBox;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        title = this.title;
                        this.maybeRefreshNodeData();
                        this.updateTitleNodes();
                        this.updateRadiusScale();
                        this.updateInnerCircleNodes();
                        this.rootGroup.translationX = this.centerX;
                        this.rootGroup.translationY = this.centerY;
                        if (title) {
                            dy = this.getTitleTranslationY();
                            titleBox = title.node.computeBBox();
                            title.node.visible =
                                title.enabled && isFinite(dy) && !this.bboxIntersectsSurroundingSeries(titleBox, 0, dy);
                            title.node.translationY = isFinite(dy) ? dy : 0;
                        }
                        this.updateNodeMidPoint();
                        return [4 /*yield*/, this.updateSelections()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.updateNodes(seriesRect)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PieSeries.prototype.updateTitleNodes = function () {
        var _a, _b;
        var _c = this, title = _c.title, oldTitle = _c.oldTitle;
        if (oldTitle !== title) {
            if (oldTitle) {
                (_a = this.labelGroup) === null || _a === void 0 ? void 0 : _a.removeChild(oldTitle.node);
            }
            if (title) {
                title.node.textBaseline = 'bottom';
                (_b = this.labelGroup) === null || _b === void 0 ? void 0 : _b.appendChild(title.node);
            }
            this.oldTitle = title;
        }
    };
    PieSeries.prototype.updateInnerCircleNodes = function () {
        var _a;
        var _b = this, innerCircle = _b.innerCircle, oldInnerCircle = _b.oldInnerCircle, oldNode = _b.innerCircleNode;
        if (oldInnerCircle !== innerCircle) {
            var circle = void 0;
            if (oldNode) {
                this.backgroundGroup.removeChild(oldNode);
            }
            if (innerCircle) {
                circle = new Circle();
                circle.fill = innerCircle.fill;
                circle.fillOpacity = (_a = innerCircle.fillOpacity) !== null && _a !== void 0 ? _a : 1;
                this.backgroundGroup.appendChild(circle);
            }
            this.oldInnerCircle = innerCircle;
            this.innerCircleNode = circle;
        }
    };
    PieSeries.prototype.updateNodeMidPoint = function () {
        var _this = this;
        this.nodeData.forEach(function (d) {
            var radius = _this.radiusScale.convert(d.radius);
            d.nodeMidPoint = {
                x: d.midCos * Math.max(0, radius / 2),
                y: d.midSin * Math.max(0, radius / 2),
            };
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
                    return selection.update(_this.nodeData, function (group) {
                        var sector = new Sector();
                        sector.tag = PieNodeTag.Sector;
                        group.appendChild(sector);
                    });
                };
                this.groupSelection = update(groupSelection);
                this.highlightSelection = update(highlightSelection);
                calloutLabelSelection.update(this.nodeData, function (group) {
                    var line = new Line();
                    line.tag = PieNodeTag.Callout;
                    line.pointerEvents = PointerEvents.None;
                    group.appendChild(line);
                    var text = new Text();
                    text.tag = PieNodeTag.Label;
                    text.pointerEvents = PointerEvents.None;
                    group.appendChild(text);
                });
                sectorLabelSelection.update(this.nodeData, function (node) {
                    node.pointerEvents = PointerEvents.None;
                });
                innerLabelsSelection.update(this.innerLabels, function (node) {
                    node.pointerEvents = PointerEvents.None;
                });
                return [2 /*return*/];
            });
        });
    };
    PieSeries.prototype.updateNodes = function (seriesRect) {
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
                    if (isDatumHighlighted) {
                        sector.startAngle = datum.startAngle;
                        sector.endAngle = datum.endAngle;
                    }
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
                this.animationState.transition('update');
                this.updateCalloutLineNodes();
                this.updateCalloutLabelNodes(seriesRect);
                this.updateSectorLabelNodes();
                this.updateInnerLabelNodes();
                return [2 /*return*/];
            });
        });
    };
    PieSeries.prototype.updateCalloutLineNodes = function () {
        var _a;
        var _b = this, radiusScale = _b.radiusScale, calloutLine = _b.calloutLine;
        var calloutLength = calloutLine.length;
        var calloutStrokeWidth = calloutLine.strokeWidth;
        var calloutColors = (_a = calloutLine.colors) !== null && _a !== void 0 ? _a : this.strokes;
        var offset = this.calloutLabel.offset;
        this.calloutLabelSelection.selectByTag(PieNodeTag.Callout).forEach(function (line, index) {
            var datum = line.datum;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            var label = datum.calloutLabel;
            if ((label === null || label === void 0 ? void 0 : label.text) && !label.hidden && outerRadius !== 0) {
                line.visible = true;
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.fill = undefined;
                var x1 = datum.midCos * outerRadius;
                var y1 = datum.midSin * outerRadius;
                var x2 = datum.midCos * (outerRadius + calloutLength);
                var y2 = datum.midSin * (outerRadius + calloutLength);
                if (label.collisionTextAlign || label.collisionOffsetY !== 0) {
                    // Get the closest point to the text bounding box
                    var box = label.box;
                    var cx = x2;
                    var cy = y2;
                    if (x2 < box.x) {
                        cx = box.x;
                    }
                    else if (x2 > box.x + box.width) {
                        cx = box.x + box.width;
                    }
                    if (y2 < box.y) {
                        cy = box.y;
                    }
                    else if (y2 > box.y + box.height) {
                        cy = box.y + box.height;
                    }
                    // Apply label offset
                    var dx = cx - x2;
                    var dy = cy - y2;
                    var length_1 = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    var paddedLength = length_1 - offset;
                    if (paddedLength > 0) {
                        x2 = x2 + (dx * paddedLength) / length_1;
                        y2 = y2 + (dy * paddedLength) / length_1;
                    }
                }
                line.x1 = x1;
                line.y1 = y1;
                line.x2 = x2;
                line.y2 = y2;
            }
            else {
                line.visible = false;
            }
        });
    };
    PieSeries.prototype.getLabelOverflow = function (text, box, seriesRect) {
        var seriesLeft = seriesRect.x - this.centerX;
        var seriesRight = seriesRect.x + seriesRect.width - this.centerX;
        var seriesTop = seriesRect.y - this.centerY;
        var seriesBottom = seriesRect.y + seriesRect.height - this.centerY;
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
        var hasSurroundingSeriesOverflow = this.bboxIntersectsSurroundingSeries(box);
        return { visibleTextPart: visibleTextPart, textLength: textLength, hasVerticalOverflow: hasVerticalOverflow, hasSurroundingSeriesOverflow: hasSurroundingSeriesOverflow };
    };
    PieSeries.prototype.bboxIntersectsSurroundingSeries = function (box, dx, dy) {
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        var surroundingRadius = this.surroundingRadius;
        if (surroundingRadius == null) {
            return false;
        }
        var corners = [
            { x: box.x + dx, y: box.y + dy },
            { x: box.x + box.width + dx, y: box.y + dy },
            { x: box.x + box.width + dx, y: box.y + box.height + dy },
            { x: box.x + dx, y: box.y + box.height + dy },
        ];
        var sur2 = Math.pow(surroundingRadius, 2);
        return corners.some(function (corner) { return Math.pow(corner.x, 2) + Math.pow(corner.y, 2) > sur2; });
    };
    PieSeries.prototype.computeCalloutLabelCollisionOffsets = function () {
        var _this = this;
        var _a = this, radiusScale = _a.radiusScale, calloutLabel = _a.calloutLabel, calloutLine = _a.calloutLine;
        var offset = calloutLabel.offset, minSpacing = calloutLabel.minSpacing;
        var innerRadius = radiusScale.convert(0);
        var shouldSkip = function (datum) {
            var label = datum.calloutLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            return !label || outerRadius === 0;
        };
        var fullData = this.nodeData;
        var data = this.nodeData.filter(function (text) { return !shouldSkip(text); });
        data.forEach(function (datum) {
            var label = datum.calloutLabel;
            label.hidden = false;
            label.collisionTextAlign = undefined;
            label.collisionOffsetY = 0;
        });
        if (data.length <= 1) {
            return;
        }
        var leftLabels = data.filter(function (d) { return d.midCos < 0; }).sort(function (a, b) { return a.midSin - b.midSin; });
        var rightLabels = data.filter(function (d) { return d.midCos >= 0; }).sort(function (a, b) { return a.midSin - b.midSin; });
        var topLabels = data
            .filter(function (d) { return d.midSin < 0 && d.calloutLabel.textAlign === 'center'; })
            .sort(function (a, b) { return a.midCos - b.midCos; });
        var bottomLabels = data
            .filter(function (d) { return d.midSin >= 0 && d.calloutLabel.textAlign === 'center'; })
            .sort(function (a, b) { return a.midCos - b.midCos; });
        var tempTextNode = new Text();
        var getTextBBox = function (datum) {
            var label = datum.calloutLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            var labelRadius = outerRadius + calloutLine.length + offset;
            var x = datum.midCos * labelRadius;
            var y = datum.midSin * labelRadius + label.collisionOffsetY;
            _this.setTextDimensionalProps(tempTextNode, x, y, _this.calloutLabel, label);
            return tempTextNode.computeBBox();
        };
        var avoidNeighbourYCollision = function (label, next, direction) {
            var box = getTextBBox(label).grow(minSpacing / 2);
            var other = getTextBBox(next).grow(minSpacing / 2);
            // The full collision is not detected, because sometimes
            // the next label can appear behind the label with offset
            var collidesOrBehind = box.x < other.x + other.width &&
                box.x + box.width > other.x &&
                (direction === 'to-top' ? box.y < other.y + other.height : box.y + box.height > other.y);
            if (collidesOrBehind) {
                var dy = direction === 'to-top' ? box.y - other.y - other.height : box.y + box.height - other.y;
                next.calloutLabel.collisionOffsetY = dy;
            }
        };
        var avoidYCollisions = function (labels) {
            var midLabel = labels.slice().sort(function (a, b) { return Math.abs(a.midSin) - Math.abs(b.midSin); })[0];
            var midIndex = labels.indexOf(midLabel);
            for (var i = midIndex - 1; i >= 0; i--) {
                var prev = labels[i + 1];
                var next = labels[i];
                avoidNeighbourYCollision(prev, next, 'to-top');
            }
            for (var i = midIndex + 1; i < labels.length; i++) {
                var prev = labels[i - 1];
                var next = labels[i];
                avoidNeighbourYCollision(prev, next, 'to-bottom');
            }
        };
        var avoidXCollisions = function (labels) {
            var labelsCollideLabelsByY = data.some(function (datum) { return datum.calloutLabel.collisionOffsetY !== 0; });
            var boxes = labels.map(function (label) { return getTextBBox(label); });
            var paddedBoxes = boxes.map(function (box) { return box.clone().grow(minSpacing / 2); });
            var labelsCollideLabelsByX = false;
            for (var i = 0; i < paddedBoxes.length && !labelsCollideLabelsByX; i++) {
                var box = paddedBoxes[i];
                for (var j = i + 1; j < labels.length; j++) {
                    var other = paddedBoxes[j];
                    if (box.collidesBBox(other)) {
                        labelsCollideLabelsByX = true;
                        break;
                    }
                }
            }
            var sectors = fullData.map(function (datum) {
                var startAngle = datum.startAngle, endAngle = datum.endAngle;
                var radius = radiusScale.convert(datum.radius);
                var outerRadius = Math.max(0, radius);
                return { startAngle: startAngle, endAngle: endAngle, innerRadius: innerRadius, outerRadius: outerRadius };
            });
            var labelsCollideSectors = boxes.some(function (box) {
                return sectors.some(function (sector) { return boxCollidesSector(box, sector); });
            });
            if (!labelsCollideLabelsByX && !labelsCollideLabelsByY && !labelsCollideSectors) {
                return;
            }
            labels
                .filter(function (datum) { return datum.calloutLabel.textAlign === 'center'; })
                .forEach(function (datum) {
                var label = datum.calloutLabel;
                if (datum.midCos < 0) {
                    label.collisionTextAlign = 'right';
                }
                else if (datum.midCos > 0) {
                    label.collisionTextAlign = 'left';
                }
                else {
                    label.collisionTextAlign = 'center';
                }
            });
        };
        avoidYCollisions(leftLabels);
        avoidYCollisions(rightLabels);
        avoidXCollisions(topLabels);
        avoidXCollisions(bottomLabels);
    };
    PieSeries.prototype.updateCalloutLabelNodes = function (seriesRect) {
        var _this = this;
        var _a = this, radiusScale = _a.radiusScale, calloutLabel = _a.calloutLabel, calloutLine = _a.calloutLine;
        var calloutLength = calloutLine.length;
        var offset = calloutLabel.offset, color = calloutLabel.color;
        var tempTextNode = new Text();
        this.calloutLabelSelection.selectByTag(PieNodeTag.Label).forEach(function (text) {
            var datum = text.datum;
            var label = datum.calloutLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            if (!(label === null || label === void 0 ? void 0 : label.text) || outerRadius === 0 || label.hidden) {
                text.visible = false;
                return;
            }
            var labelRadius = outerRadius + calloutLength + offset;
            var x = datum.midCos * labelRadius;
            var y = datum.midSin * labelRadius + label.collisionOffsetY;
            // Detect text overflow
            _this.setTextDimensionalProps(tempTextNode, x, y, _this.calloutLabel, label);
            var box = tempTextNode.computeBBox();
            var _a = _this.getLabelOverflow(label.text, box, seriesRect), visibleTextPart = _a.visibleTextPart, textLength = _a.textLength, hasVerticalOverflow = _a.hasVerticalOverflow;
            var displayText = visibleTextPart === 1 ? label.text : label.text.substring(0, textLength) + "\u2026";
            _this.setTextDimensionalProps(text, x, y, _this.calloutLabel, __assign(__assign({}, label), { text: displayText }));
            text.fill = color;
            text.visible = !hasVerticalOverflow;
        });
    };
    PieSeries.prototype.computeLabelsBBox = function (options, seriesRect) {
        var _this = this;
        var _a;
        var _b = this, radiusScale = _b.radiusScale, calloutLabel = _b.calloutLabel, calloutLine = _b.calloutLine;
        var calloutLength = calloutLine.length;
        var offset = calloutLabel.offset, maxCollisionOffset = calloutLabel.maxCollisionOffset, minSpacing = calloutLabel.minSpacing;
        this.maybeRefreshNodeData();
        this.updateRadiusScale();
        this.computeCalloutLabelCollisionOffsets();
        var textBoxes = [];
        var text = new Text();
        var titleBox;
        if (((_a = this.title) === null || _a === void 0 ? void 0 : _a.text) && this.title.enabled) {
            var dy = this.getTitleTranslationY();
            if (isFinite(dy)) {
                this.setTextDimensionalProps(text, 0, dy, this.title, {
                    text: this.title.text,
                    textBaseline: 'bottom',
                    textAlign: 'center',
                    hidden: false,
                    collisionTextAlign: undefined,
                    collisionOffsetY: 0,
                });
                titleBox = text.computeBBox();
                textBoxes.push(titleBox);
            }
        }
        this.nodeData.forEach(function (datum) {
            var label = datum.calloutLabel;
            var radius = radiusScale.convert(datum.radius);
            var outerRadius = Math.max(0, radius);
            if (!label || outerRadius === 0) {
                return null;
            }
            var labelRadius = outerRadius + calloutLength + offset;
            var x = datum.midCos * labelRadius;
            var y = datum.midSin * labelRadius + label.collisionOffsetY;
            _this.setTextDimensionalProps(text, x, y, _this.calloutLabel, label);
            var box = text.computeBBox();
            label.box = box;
            // Hide labels that where pushed to far by the collision avoidance algorithm
            if (Math.abs(label.collisionOffsetY) > maxCollisionOffset) {
                label.hidden = true;
                return;
            }
            // Hide labels intersecting or above the title
            if (titleBox) {
                var seriesTop = seriesRect.y - _this.centerY;
                var titleCleanArea = new BBox(titleBox.x - minSpacing, seriesTop, titleBox.width + 2 * minSpacing, titleBox.y + titleBox.height + minSpacing - seriesTop);
                if (box.collidesBBox(titleCleanArea)) {
                    label.hidden = true;
                    return;
                }
            }
            if (options.hideWhenNecessary) {
                var _a = _this.getLabelOverflow(label.text, box, seriesRect), textLength = _a.textLength, hasVerticalOverflow = _a.hasVerticalOverflow, hasSurroundingSeriesOverflow = _a.hasSurroundingSeriesOverflow;
                var isTooShort = label.text.length > 2 && textLength < 2;
                if (hasVerticalOverflow || isTooShort || hasSurroundingSeriesOverflow) {
                    label.hidden = true;
                    return;
                }
            }
            label.hidden = false;
            textBoxes.push(box);
        });
        if (textBoxes.length === 0) {
            return null;
        }
        return BBox.merge(textBoxes);
    };
    PieSeries.prototype.setTextDimensionalProps = function (textNode, x, y, style, label) {
        var _a, _b;
        var fontStyle = style.fontStyle, fontWeight = style.fontWeight, fontSize = style.fontSize, fontFamily = style.fontFamily;
        textNode.fontStyle = fontStyle;
        textNode.fontWeight = fontWeight;
        textNode.fontSize = fontSize;
        textNode.fontFamily = fontFamily;
        textNode.text = label.text;
        textNode.x = x;
        textNode.y = y;
        textNode.textAlign = (_b = (_a = label === null || label === void 0 ? void 0 : label.collisionTextAlign) !== null && _a !== void 0 ? _a : label === null || label === void 0 ? void 0 : label.textAlign) !== null && _b !== void 0 ? _b : 'center';
        textNode.textBaseline = label.textBaseline;
    };
    PieSeries.prototype.updateSectorLabelNodes = function () {
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
                    return isPointInSector(x, y, sectorBounds_1);
                })) {
                    isTextVisible = true;
                }
            }
            text.visible = isTextVisible;
        });
    };
    PieSeries.prototype.updateInnerCircle = function () {
        var circle = this.innerCircleNode;
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
        var totalWidth = Math.max.apply(Math, __spreadArray([], __read(textBBoxes.map(function (bbox) { return bbox.width; }))));
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
        var _a;
        var angleKey = this.angleKey;
        if (!angleKey) {
            return '';
        }
        var _b = this, tooltip = _b.tooltip, angleName = _b.angleName, radiusKey = _b.radiusKey, radiusName = _b.radiusName, calloutLabelKey = _b.calloutLabelKey, sectorLabelKey = _b.sectorLabelKey, calloutLabelName = _b.calloutLabelName, sectorLabelName = _b.sectorLabelName, seriesId = _b.id;
        var tooltipRenderer = tooltip.renderer;
        var datum = nodeDatum.datum, angleValue = nodeDatum.angleValue, radiusValue = nodeDatum.radiusValue, color = nodeDatum.sectorFormat.fill, _c = nodeDatum.calloutLabel, _d = _c === void 0 ? {} : _c, _e = _d.text, label = _e === void 0 ? '' : _e;
        var formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : String(angleValue);
        var title = (_a = this.title) === null || _a === void 0 ? void 0 : _a.text;
        var content = "" + (label ? label + ": " : '') + formattedAngleValue;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: datum,
                angleKey: angleKey,
                angleValue: angleValue,
                angleName: angleName,
                radiusKey: radiusKey,
                radiusValue: radiusValue,
                radiusName: radiusName,
                calloutLabelKey: calloutLabelKey,
                calloutLabelName: calloutLabelName,
                sectorLabelKey: sectorLabelKey,
                sectorLabelName: sectorLabelName,
                title: title,
                color: color,
                seriesId: seriesId,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    PieSeries.prototype.getLegendData = function () {
        var _a, _b, _c;
        var _d = this, calloutLabelKey = _d.calloutLabelKey, legendItemKey = _d.legendItemKey, id = _d.id, data = _d.data;
        if (!data || data.length === 0)
            return [];
        if (!legendItemKey && !calloutLabelKey)
            return [];
        var titleText = ((_a = this.title) === null || _a === void 0 ? void 0 : _a.showInLegend) && this.title.text;
        var legendData = [];
        for (var index = 0; index < data.length; index++) {
            var datum = data[index];
            var labelParts = [];
            if (titleText) {
                labelParts.push(titleText);
            }
            var labels = this.getLabels(datum, 2 * Math.PI, 2 * Math.PI, false);
            if (legendItemKey && labels.legendItem !== undefined) {
                labelParts.push(labels.legendItem.text);
            }
            else if (calloutLabelKey && ((_b = labels.calloutLabel) === null || _b === void 0 ? void 0 : _b.text) !== undefined) {
                labelParts.push((_c = labels.calloutLabel) === null || _c === void 0 ? void 0 : _c.text);
            }
            if (labelParts.length === 0)
                continue;
            var sectorFormat = this.getSectorFormat(datum, index, index, false);
            legendData.push({
                legendType: 'category',
                id: id,
                itemId: index,
                seriesId: id,
                enabled: this.seriesItemEnabled[index],
                label: {
                    text: labelParts.join(' - '),
                },
                marker: {
                    fill: sectorFormat.fill,
                    stroke: sectorFormat.stroke,
                    fillOpacity: this.fillOpacity,
                    strokeOpacity: this.strokeOpacity,
                },
            });
        }
        return legendData;
    };
    PieSeries.prototype.onLegendItemClick = function (event) {
        var enabled = event.enabled, itemId = event.itemId, series = event.series;
        if (series.id === this.id) {
            this.toggleSeriesItem(itemId, enabled);
        }
        else if (series.type === 'pie') {
            this.toggleOtherSeriesItems(series, itemId, enabled);
        }
    };
    PieSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    };
    PieSeries.prototype.toggleOtherSeriesItems = function (series, itemId, enabled) {
        var _this = this;
        var _a, _b;
        var legendItemKey = this.legendItemKey;
        if (!legendItemKey)
            return;
        var datumToggledLegendItemValue = series.legendItemKey && ((_a = series.data) === null || _a === void 0 ? void 0 : _a.find(function (_, index) { return index === itemId; })[series.legendItemKey]);
        if (!datumToggledLegendItemValue)
            return;
        (_b = this.data) === null || _b === void 0 ? void 0 : _b.forEach(function (datum, datumItemId) {
            if (datum[legendItemKey] === datumToggledLegendItemValue) {
                _this.toggleSeriesItem(datumItemId, enabled);
            }
        });
    };
    PieSeries.prototype.animateEmptyUpdateReady = function () {
        var _this = this;
        var duration = 1000;
        var labelDuration = 200;
        var rotation = Math.PI / -2 + toRadians(this.rotation);
        this.groupSelection.selectByTag(PieNodeTag.Sector).forEach(function (node) {
            var _a;
            var datum = node.datum;
            (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(_this.id + "_empty-update-ready_" + node.id, [
                { from: rotation, to: datum.startAngle },
                { from: rotation, to: datum.endAngle },
            ], {
                disableInteractions: true,
                duration: duration,
                ease: easing.easeOut,
                repeat: 0,
                onUpdate: function (_a) {
                    var _b = __read(_a, 2), startAngle = _b[0], endAngle = _b[1];
                    node.startAngle = startAngle;
                    node.endAngle = endAngle;
                },
            });
        });
        var labelAnimationOptions = {
            from: 0,
            to: 1,
            delay: duration,
            duration: labelDuration,
            ease: easing.linear,
            repeat: 0,
        };
        this.calloutLabelSelection.each(function (label) {
            var _a;
            (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, __assign(__assign({}, labelAnimationOptions), { onUpdate: function (opacity) {
                    label.opacity = opacity;
                } }));
        });
        this.sectorLabelSelection.each(function (label) {
            var _a;
            (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, __assign(__assign({}, labelAnimationOptions), { onUpdate: function (opacity) {
                    label.opacity = opacity;
                } }));
        });
        this.innerLabelsSelection.each(function (label) {
            var _a;
            (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, __assign(__assign({}, labelAnimationOptions), { onUpdate: function (opacity) {
                    label.opacity = opacity;
                } }));
        });
    };
    PieSeries.prototype.animateReadyUpdateReady = function () {
        this.groupSelection.selectByTag(PieNodeTag.Sector).forEach(function (node) {
            var datum = node.datum;
            node.startAngle = datum.startAngle;
            node.endAngle = datum.endAngle;
        });
    };
    PieSeries.className = 'PieSeries';
    PieSeries.type = 'pie';
    __decorate([
        Validate(STRING)
    ], PieSeries.prototype, "angleKey", void 0);
    __decorate([
        Validate(STRING)
    ], PieSeries.prototype, "angleName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "radiusKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "radiusName", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], PieSeries.prototype, "radiusMin", void 0);
    __decorate([
        Validate(OPT_NUMBER(0))
    ], PieSeries.prototype, "radiusMax", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "calloutLabelKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "calloutLabelName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "sectorLabelKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "sectorLabelName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], PieSeries.prototype, "legendItemKey", void 0);
    __decorate([
        Validate(COLOR_STRING_ARRAY)
    ], PieSeries.prototype, "fills", void 0);
    __decorate([
        Validate(COLOR_STRING_ARRAY)
    ], PieSeries.prototype, "strokes", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], PieSeries.prototype, "fillOpacity", void 0);
    __decorate([
        Validate(NUMBER(0, 1))
    ], PieSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        Validate(OPT_LINE_DASH)
    ], PieSeries.prototype, "lineDash", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        Validate(OPT_FUNCTION)
    ], PieSeries.prototype, "formatter", void 0);
    __decorate([
        Validate(NUMBER(-360, 360))
    ], PieSeries.prototype, "rotation", void 0);
    __decorate([
        Validate(NUMBER())
    ], PieSeries.prototype, "outerRadiusOffset", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeries.prototype, "outerRadiusRatio", void 0);
    __decorate([
        Validate(NUMBER())
    ], PieSeries.prototype, "innerRadiusOffset", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeries.prototype, "innerRadiusRatio", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], PieSeries.prototype, "strokeWidth", void 0);
    return PieSeries;
}(PolarSeries));
export { PieSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9wb2xhci9waWVTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXJELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFFSCxjQUFjLEVBQ2QsYUFBYSxFQUNiLHdCQUF3QixFQUN4QixhQUFhLEVBQ2IsbUJBQW1CLEVBQ25CLHlCQUF5QixHQUM1QixNQUFNLGFBQWEsQ0FBQztBQUNyQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FB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