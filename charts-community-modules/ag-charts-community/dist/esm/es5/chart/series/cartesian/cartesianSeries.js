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
var _a, _b;
import { Series, SeriesNodeBaseClickEvent, } from '../series';
import { SeriesMarker } from '../seriesMarker';
import { isContinuous, isDiscrete } from '../../../util/value';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
import { CategoryAxis } from '../../axis/categoryAxis';
import { Layers } from '../../layers';
import { OPT_FUNCTION, Validate } from '../../../util/validation';
import { jsonDiff } from '../../../util/json';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { StateMachine } from '../../../motion/states';
var DEFAULT_DIRECTION_KEYS = (_a = {},
    _a[ChartAxisDirection.X] = ['xKey'],
    _a[ChartAxisDirection.Y] = ['yKey'],
    _a);
var DEFAULT_DIRECTION_NAMES = (_b = {},
    _b[ChartAxisDirection.X] = ['xName'],
    _b[ChartAxisDirection.Y] = ['yName'],
    _b);
var CartesianSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeBaseClickEvent, _super);
    function CartesianSeriesNodeBaseClickEvent(xKey, yKey, nativeEvent, datum, series) {
        var _this = _super.call(this, nativeEvent, datum, series) || this;
        _this.xKey = xKey;
        _this.yKey = yKey;
        return _this;
    }
    return CartesianSeriesNodeBaseClickEvent;
}(SeriesNodeBaseClickEvent));
export { CartesianSeriesNodeBaseClickEvent };
var CartesianSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeClickEvent, _super);
    function CartesianSeriesNodeClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeClick';
        return _this;
    }
    return CartesianSeriesNodeClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
export { CartesianSeriesNodeClickEvent };
var CartesianSeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeDoubleClickEvent, _super);
    function CartesianSeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return CartesianSeriesNodeDoubleClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
export { CartesianSeriesNodeDoubleClickEvent };
var CartesianStateMachine = /** @class */ (function (_super) {
    __extends(CartesianStateMachine, _super);
    function CartesianStateMachine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CartesianStateMachine;
}(StateMachine));
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries(opts) {
        var _a, _b;
        var _this = _super.call(this, __assign(__assign({}, opts), { useSeriesGroupLayer: true, directionKeys: (_a = opts.directionKeys) !== null && _a !== void 0 ? _a : DEFAULT_DIRECTION_KEYS, directionNames: (_b = opts.directionNames) !== null && _b !== void 0 ? _b : DEFAULT_DIRECTION_NAMES })) || this;
        _this._contextNodeData = [];
        _this.nodeDataDependencies = {};
        _this.highlightSelection = Selection.select(_this.highlightNode, function () {
            return _this.opts.hasMarkers ? _this.markerFactory() : _this.nodeFactory();
        });
        _this.highlightLabelSelection = Selection.select(_this.highlightLabel, Text);
        _this.subGroups = [];
        _this.subGroupId = 0;
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        var _c = opts.pathsPerSeries, pathsPerSeries = _c === void 0 ? 1 : _c, _d = opts.hasMarkers, hasMarkers = _d === void 0 ? false : _d, _e = opts.pathsZIndexSubOrderOffset, pathsZIndexSubOrderOffset = _e === void 0 ? [] : _e;
        _this.opts = { pathsPerSeries: pathsPerSeries, hasMarkers: hasMarkers, pathsZIndexSubOrderOffset: pathsZIndexSubOrderOffset };
        _this.animationState = new CartesianStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'ready',
                        action: function (data) { return _this.animateEmptyUpdateReady(data); },
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyUpdate(data); },
                    },
                    highlight: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyHighlight(data); },
                    },
                    highlightMarkers: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyHighlightMarkers(data); },
                    },
                    resize: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyResize(data); },
                    },
                },
            },
        });
        return _this;
    }
    Object.defineProperty(CartesianSeries.prototype, "contextNodeData", {
        get: function () {
            var _a;
            return (_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.slice();
        },
        enumerable: false,
        configurable: true
    });
    CartesianSeries.prototype.addChartEventListeners = function () {
        var _this = this;
        var _a, _b;
        (_a = this.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', function (event) { return _this.onLegendItemClick(event); });
        (_b = this.chartEventManager) === null || _b === void 0 ? void 0 : _b.addListener('legend-item-double-click', function (event) { return _this.onLegendItemDoubleClick(event); });
    };
    CartesianSeries.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._contextNodeData.splice(0, this._contextNodeData.length);
        this.subGroups.splice(0, this.subGroups.length);
    };
    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    CartesianSeries.prototype.checkDomainXY = function (x, y, isContinuousX, isContinuousY) {
        var isValidDatum = ((isContinuousX && isContinuous(x)) || (!isContinuousX && isDiscrete(x))) &&
            ((isContinuousY && isContinuous(y)) || (!isContinuousY && isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    };
    /**
     * Note: we are passing the xAxis and yAxis because the calling code is supposed to make sure
     *       that series has both of them defined, and also to avoid one level of indirection,
     *       e.g. `this.xAxis!.inRange(x)`, both of which are suboptimal in tight loops where this method is used.
     * @param x A range value to be plotted along the x-axis.
     * @param y A range value to be plotted along the y-axis.
     * @param xAxis The series' x-axis.
     * @param yAxis The series' y-axis.
     * @returns
     */
    CartesianSeries.prototype.checkRangeXY = function (x, y, xAxis, yAxis) {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    };
    CartesianSeries.prototype.update = function (_a) {
        var _b, _c;
        var seriesRect = _a.seriesRect;
        return __awaiter(this, void 0, void 0, function () {
            var _d, seriesItemEnabled, visible, series, seriesHighlighted, anySeriesItemEnabled, newNodeDataDependencies;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _d = this, seriesItemEnabled = _d.seriesItemEnabled, visible = _d.visible;
                        series = ((_c = (_b = this.highlightManager) === null || _b === void 0 ? void 0 : _b.getActiveHighlight()) !== null && _c !== void 0 ? _c : {}).series;
                        seriesHighlighted = series ? series === this : undefined;
                        anySeriesItemEnabled = (visible && seriesItemEnabled.size === 0) || __spreadArray([], __read(seriesItemEnabled.values())).some(function (v) { return v === true; });
                        newNodeDataDependencies = {
                            seriesRectWidth: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width,
                            seriesRectHeight: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.height,
                        };
                        if (jsonDiff(this.nodeDataDependencies, newNodeDataDependencies) != null) {
                            this.nodeDataDependencies = newNodeDataDependencies;
                            this.markNodeDataDirty();
                            this.animationState.transition('resize', {
                                datumSelections: this.subGroups.map(function (_a) {
                                    var datumSelection = _a.datumSelection;
                                    return datumSelection;
                                }),
                                markerSelections: this.subGroups.map(function (_a) {
                                    var markerSelection = _a.markerSelection;
                                    return markerSelection;
                                }),
                                contextData: this._contextNodeData,
                                paths: this.subGroups.map(function (_a) {
                                    var paths = _a.paths;
                                    return paths;
                                }),
                            });
                        }
                        return [4 /*yield*/, this.updateSelections(seriesHighlighted, anySeriesItemEnabled)];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, this.updateNodes(seriesHighlighted, anySeriesItemEnabled)];
                    case 2:
                        _e.sent();
                        this.animationState.transition('update', {
                            datumSelections: this.subGroups.map(function (_a) {
                                var datumSelection = _a.datumSelection;
                                return datumSelection;
                            }),
                            markerSelections: this.subGroups.map(function (_a) {
                                var markerSelection = _a.markerSelection;
                                return markerSelection;
                            }),
                            labelSelections: this.subGroups.map(function (_a) {
                                var labelSelection = _a.labelSelection;
                                return labelSelection;
                            }),
                            contextData: this._contextNodeData,
                            paths: this.subGroups.map(function (_a) {
                                var paths = _a.paths;
                                return paths;
                            }),
                            seriesRect: seriesRect,
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateSelections = function (seriesHighlighted, anySeriesItemEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.updateHighlightSelection(seriesHighlighted)];
                    case 1:
                        _b.sent();
                        if (!anySeriesItemEnabled) {
                            return [2 /*return*/];
                        }
                        if (!this.nodeDataRefresh && !this.isPathOrSelectionDirty()) {
                            return [2 /*return*/];
                        }
                        if (!this.nodeDataRefresh) return [3 /*break*/, 4];
                        this.nodeDataRefresh = false;
                        _a = this;
                        return [4 /*yield*/, this.createNodeData()];
                    case 2:
                        _a._contextNodeData = _b.sent();
                        return [4 /*yield*/, this.updateSeriesGroups()];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, Promise.all(this.subGroups.map(function (g, i) { return _this.updateSeriesGroupSelections(g, i); }))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateSeriesGroupSelections = function (subGroup, seriesIdx) {
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, labelSelection, markerSelection, contextData, nodeData, labelData, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection;
                        contextData = this._contextNodeData[seriesIdx];
                        nodeData = contextData.nodeData, labelData = contextData.labelData;
                        _a = subGroup;
                        return [4 /*yield*/, this.updateDatumSelection({ nodeData: nodeData, datumSelection: datumSelection, seriesIdx: seriesIdx })];
                    case 1:
                        _a.datumSelection = _d.sent();
                        _b = subGroup;
                        return [4 /*yield*/, this.updateLabelSelection({ labelData: labelData, labelSelection: labelSelection, seriesIdx: seriesIdx })];
                    case 2:
                        _b.labelSelection = _d.sent();
                        if (!markerSelection) return [3 /*break*/, 4];
                        _c = subGroup;
                        return [4 /*yield*/, this.updateMarkerSelection({
                                nodeData: nodeData,
                                markerSelection: markerSelection,
                                seriesIdx: seriesIdx,
                            })];
                    case 3:
                        _c.markerSelection = _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.nodeFactory = function () {
        return new Group();
    };
    CartesianSeries.prototype.markerFactory = function () {
        var MarkerShape = getMarker();
        return new MarkerShape();
    };
    CartesianSeries.prototype.updateSeriesGroups = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, contextNodeData, contentGroup, subGroups, _c, pathsPerSeries, hasMarkers, pathsZIndexSubOrderOffset, totalGroups, layer, subGroupId, subGroupZOffset, dataNodeGroup, markerGroup, labelGroup, paths, index;
            var _this = this;
            return __generator(this, function (_d) {
                _b = this, contextNodeData = _b._contextNodeData, contentGroup = _b.contentGroup, subGroups = _b.subGroups, _c = _b.opts, pathsPerSeries = _c.pathsPerSeries, hasMarkers = _c.hasMarkers, pathsZIndexSubOrderOffset = _c.pathsZIndexSubOrderOffset;
                if (contextNodeData.length === subGroups.length) {
                    return [2 /*return*/];
                }
                if (contextNodeData.length < subGroups.length) {
                    subGroups.splice(contextNodeData.length).forEach(function (_a) {
                        var e_1, _b;
                        var dataNodeGroup = _a.dataNodeGroup, markerGroup = _a.markerGroup, labelGroup = _a.labelGroup, paths = _a.paths;
                        contentGroup.removeChild(dataNodeGroup);
                        if (markerGroup) {
                            contentGroup.removeChild(markerGroup);
                        }
                        if (labelGroup) {
                            contentGroup.removeChild(labelGroup);
                        }
                        try {
                            for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                                var path = paths_1_1.value;
                                contentGroup.removeChild(path);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (paths_1_1 && !paths_1_1.done && (_b = paths_1.return)) _b.call(paths_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    });
                }
                totalGroups = contextNodeData.length;
                while (totalGroups > subGroups.length) {
                    layer = false;
                    subGroupId = this.subGroupId++;
                    subGroupZOffset = subGroupId;
                    dataNodeGroup = new Group({
                        name: this.id + "-series-sub" + subGroupId + "-dataNodes",
                        layer: layer,
                        zIndex: Layers.SERIES_LAYER_ZINDEX,
                        zIndexSubOrder: [function () { return _this._declarationOrder; }, subGroupZOffset],
                    });
                    markerGroup = hasMarkers
                        ? new Group({
                            name: this.id + "-series-sub" + this.subGroupId++ + "-markers",
                            layer: layer,
                            zIndex: Layers.SERIES_LAYER_ZINDEX,
                            zIndexSubOrder: [function () { return _this._declarationOrder; }, 10000 + subGroupId],
                        })
                        : undefined;
                    labelGroup = new Group({
                        name: this.id + "-series-sub" + this.subGroupId++ + "-labels",
                        layer: layer,
                        zIndex: Layers.SERIES_LABEL_ZINDEX,
                        zIndexSubOrder: [function () { return _this._declarationOrder; }, subGroupId],
                    });
                    contentGroup.appendChild(dataNodeGroup);
                    contentGroup.appendChild(labelGroup);
                    if (markerGroup) {
                        contentGroup.appendChild(markerGroup);
                    }
                    paths = [];
                    for (index = 0; index < pathsPerSeries; index++) {
                        paths[index] = new Path();
                        paths[index].zIndex = Layers.SERIES_LAYER_ZINDEX;
                        paths[index].zIndexSubOrder = [
                            function () { return _this._declarationOrder; },
                            ((_a = pathsZIndexSubOrderOffset[index]) !== null && _a !== void 0 ? _a : 0) + subGroupZOffset,
                        ];
                        contentGroup.appendChild(paths[index]);
                    }
                    subGroups.push({
                        paths: paths,
                        dataNodeGroup: dataNodeGroup,
                        markerGroup: markerGroup,
                        labelGroup: labelGroup,
                        labelSelection: Selection.select(labelGroup, Text),
                        datumSelection: Selection.select(dataNodeGroup, function () { return _this.nodeFactory(); }),
                        markerSelection: markerGroup ? Selection.select(markerGroup, function () { return _this.markerFactory(); }) : undefined,
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updateNodes = function (seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, highlightSelection, highlightLabelSelection, contextNodeData, seriesItemEnabled, hasMarkers, visible, seriesOpacity, subGroupOpacities, isSubGroupOpacityDifferent;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData, seriesItemEnabled = _b.seriesItemEnabled, hasMarkers = _b.opts.hasMarkers;
                        visible = this.visible && ((_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
                        this.rootGroup.visible = visible;
                        this.contentGroup.visible = visible;
                        this.highlightGroup.visible = visible && !!seriesHighlighted;
                        seriesOpacity = this.getOpacity();
                        subGroupOpacities = this.subGroups.map(function (_, index) {
                            var itemId = contextNodeData[index].itemId;
                            return _this.getOpacity({ itemId: itemId });
                        });
                        isSubGroupOpacityDifferent = subGroupOpacities.some(function (subOp) { return subOp !== seriesOpacity; });
                        this.contentGroup.opacity = isSubGroupOpacityDifferent ? 1 : seriesOpacity;
                        if (!hasMarkers) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateMarkerNodes({
                                markerSelection: highlightSelection,
                                isHighlight: true,
                                seriesIdx: -1,
                            })];
                    case 1:
                        _c.sent();
                        this.animationState.transition('highlightMarkers', highlightSelection);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 })];
                    case 3:
                        _c.sent();
                        this.animationState.transition('highlight', highlightSelection);
                        _c.label = 4;
                    case 4: return [4 /*yield*/, this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 })];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, Promise.all(this.subGroups.map(function (subGroup, seriesIdx) { return __awaiter(_this, void 0, void 0, function () {
                                var dataNodeGroup, markerGroup, datumSelection, labelSelection, markerSelection, paths, labelGroup, itemId, subGroupVisible, subGroupOpacity, paths_2, paths_2_1, path;
                                var e_2, _a;
                                var _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            dataNodeGroup = subGroup.dataNodeGroup, markerGroup = subGroup.markerGroup, datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths, labelGroup = subGroup.labelGroup;
                                            itemId = contextNodeData[seriesIdx].itemId;
                                            subGroupVisible = visible && ((_b = seriesItemEnabled.get(itemId)) !== null && _b !== void 0 ? _b : true);
                                            subGroupOpacity = isSubGroupOpacityDifferent ? subGroupOpacities[seriesIdx] : 1;
                                            dataNodeGroup.opacity = subGroupOpacity;
                                            dataNodeGroup.visible = subGroupVisible;
                                            labelGroup.visible = subGroupVisible;
                                            if (markerGroup) {
                                                markerGroup.opacity = subGroupOpacity;
                                                markerGroup.zIndex =
                                                    dataNodeGroup.zIndex >= Layers.SERIES_LAYER_ZINDEX
                                                        ? dataNodeGroup.zIndex
                                                        : dataNodeGroup.zIndex + 1;
                                                markerGroup.visible = subGroupVisible;
                                            }
                                            if (labelGroup) {
                                                labelGroup.opacity = subGroupOpacity;
                                            }
                                            try {
                                                for (paths_2 = __values(paths), paths_2_1 = paths_2.next(); !paths_2_1.done; paths_2_1 = paths_2.next()) {
                                                    path = paths_2_1.value;
                                                    path.opacity = subGroupOpacity;
                                                    path.visible = subGroupVisible;
                                                }
                                            }
                                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                            finally {
                                                try {
                                                    if (paths_2_1 && !paths_2_1.done && (_a = paths_2.return)) _a.call(paths_2);
                                                }
                                                finally { if (e_2) throw e_2.error; }
                                            }
                                            if (!dataNodeGroup.visible) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, this.updateDatumNodes({ datumSelection: datumSelection, isHighlight: false, seriesIdx: seriesIdx })];
                                        case 1:
                                            _c.sent();
                                            return [4 /*yield*/, this.updateLabelNodes({ labelSelection: labelSelection, seriesIdx: seriesIdx })];
                                        case 2:
                                            _c.sent();
                                            if (!(hasMarkers && markerSelection)) return [3 /*break*/, 4];
                                            return [4 /*yield*/, this.updateMarkerNodes({ markerSelection: markerSelection, isHighlight: false, seriesIdx: seriesIdx })];
                                        case 3:
                                            _c.sent();
                                            _c.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateHighlightSelection = function (seriesHighlighted) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, highlightSelection, highlightLabelSelection, contextNodeData, highlightedDatum, item, _c, labelItem, _d, itemId_1, contextNodeData_1, contextNodeData_1_1, labelData, _e;
            var e_3, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _b = this, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData;
                        highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
                        item = seriesHighlighted && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.datum) ? highlightedDatum : undefined;
                        _c = this;
                        return [4 /*yield*/, this.updateHighlightSelectionItem({ item: item, highlightSelection: highlightSelection })];
                    case 1:
                        _c.highlightSelection = _g.sent();
                        if (this.isLabelEnabled() && item != null) {
                            _d = item.itemId, itemId_1 = _d === void 0 ? undefined : _d;
                            try {
                                for (contextNodeData_1 = __values(contextNodeData), contextNodeData_1_1 = contextNodeData_1.next(); !contextNodeData_1_1.done; contextNodeData_1_1 = contextNodeData_1.next()) {
                                    labelData = contextNodeData_1_1.value.labelData;
                                    labelItem = labelData.find(function (ld) { return ld.datum === item.datum && ld.itemId === itemId_1; });
                                    if (labelItem != null) {
                                        break;
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (contextNodeData_1_1 && !contextNodeData_1_1.done && (_f = contextNodeData_1.return)) _f.call(contextNodeData_1);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                        _e = this;
                        return [4 /*yield*/, this.updateHighlightSelectionLabel({
                                item: labelItem,
                                highlightLabelSelection: highlightLabelSelection,
                            })];
                    case 2:
                        _e.highlightLabelSelection = _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.pickNodeExactShape = function (point) {
        var e_4, _a;
        var result = _super.prototype.pickNodeExactShape.call(this, point);
        if (result) {
            return result;
        }
        var x = point.x, y = point.y;
        var hasMarkers = this.opts.hasMarkers;
        try {
            for (var _b = __values(this.subGroups), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = _c.value, dataNodeGroup = _d.dataNodeGroup, markerGroup = _d.markerGroup;
                var match = dataNodeGroup.pickNode(x, y);
                if (!match && hasMarkers) {
                    match = markerGroup === null || markerGroup === void 0 ? void 0 : markerGroup.pickNode(x, y);
                }
                if (match) {
                    return { datum: match.datum, distance: 0 };
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    CartesianSeries.prototype.pickNodeClosestDatum = function (point) {
        var e_5, _a, e_6, _b;
        var _c, _d;
        var x = point.x, y = point.y;
        var _e = this, xAxis = _e.xAxis, yAxis = _e.yAxis, rootGroup = _e.rootGroup, contextNodeData = _e._contextNodeData;
        var hitPoint = rootGroup.transformPoint(x, y);
        var minDistance = Infinity;
        var closestDatum;
        try {
            for (var contextNodeData_2 = __values(contextNodeData), contextNodeData_2_1 = contextNodeData_2.next(); !contextNodeData_2_1.done; contextNodeData_2_1 = contextNodeData_2.next()) {
                var context = contextNodeData_2_1.value;
                try {
                    for (var _f = (e_6 = void 0, __values(context.nodeData)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var datum = _g.value;
                        var _h = datum.point, _j = _h === void 0 ? {} : _h, _k = _j.x, datumX = _k === void 0 ? NaN : _k, _l = _j.y, datumY = _l === void 0 ? NaN : _l;
                        if (isNaN(datumX) || isNaN(datumY)) {
                            continue;
                        }
                        var isInRange = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.inRange(datumX)) && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.inRange(datumY));
                        if (!isInRange) {
                            continue;
                        }
                        // No need to use Math.sqrt() since x < y implies Math.sqrt(x) < Math.sqrt(y) for
                        // values > 1
                        var distance = Math.max(Math.pow((hitPoint.x - datumX), 2) + Math.pow((hitPoint.y - datumY), 2), 0);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestDatum = datum;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (contextNodeData_2_1 && !contextNodeData_2_1.done && (_a = contextNodeData_2.return)) _a.call(contextNodeData_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (closestDatum) {
            var distance = Math.max(Math.sqrt(minDistance) - ((_d = (_c = closestDatum.point) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0), 0);
            return { datum: closestDatum, distance: distance };
        }
    };
    CartesianSeries.prototype.pickNodeMainAxisFirst = function (point, requireCategoryAxis) {
        var e_7, _a, e_8, _b;
        var _c, _d;
        var x = point.x, y = point.y;
        var _e = this, xAxis = _e.xAxis, yAxis = _e.yAxis, rootGroup = _e.rootGroup, contextNodeData = _e._contextNodeData;
        // Prefer to start search with any available category axis.
        var directions = [xAxis, yAxis]
            .filter(function (a) { return a instanceof CategoryAxis; })
            .map(function (a) { return a.direction; });
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        var _f = __read(directions, 1), _g = _f[0], primaryDirection = _g === void 0 ? ChartAxisDirection.X : _g;
        var hitPoint = rootGroup.transformPoint(x, y);
        var hitPointCoords = primaryDirection === ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
        var minDistance = [Infinity, Infinity];
        var closestDatum = undefined;
        try {
            for (var contextNodeData_3 = __values(contextNodeData), contextNodeData_3_1 = contextNodeData_3.next(); !contextNodeData_3_1.done; contextNodeData_3_1 = contextNodeData_3.next()) {
                var context = contextNodeData_3_1.value;
                try {
                    for (var _h = (e_8 = void 0, __values(context.nodeData)), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var datum = _j.value;
                        var _k = datum.point, _l = _k === void 0 ? {} : _k, _m = _l.x, datumX = _m === void 0 ? NaN : _m, _o = _l.y, datumY = _o === void 0 ? NaN : _o;
                        if (isNaN(datumX) || isNaN(datumY)) {
                            continue;
                        }
                        var isInRange = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.inRange(datumX)) && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.inRange(datumY));
                        if (!isInRange) {
                            continue;
                        }
                        var point_1 = primaryDirection === ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
                        // Compare distances from most significant dimension to least.
                        var newMinDistance = true;
                        for (var i = 0; i < point_1.length; i++) {
                            var dist = Math.abs(point_1[i] - hitPointCoords[i]);
                            if (dist > minDistance[i]) {
                                newMinDistance = false;
                                break;
                            }
                            if (dist < minDistance[i]) {
                                minDistance[i] = dist;
                                minDistance.fill(Infinity, i + 1, minDistance.length);
                            }
                        }
                        if (newMinDistance) {
                            closestDatum = datum;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (contextNodeData_3_1 && !contextNodeData_3_1.done && (_a = contextNodeData_3.return)) _a.call(contextNodeData_3);
            }
            finally { if (e_7) throw e_7.error; }
        }
        if (closestDatum) {
            var distance = Math.max(Math.sqrt(Math.pow(minDistance[0], 2) + Math.pow(minDistance[1], 2)) - ((_d = (_c = closestDatum.point) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0), 0);
            return { datum: closestDatum, distance: distance };
        }
    };
    CartesianSeries.prototype.onLegendItemClick = function (event) {
        var enabled = event.enabled, itemId = event.itemId, series = event.series;
        if (series.id !== this.id)
            return;
        this.toggleSeriesItem(itemId, enabled);
    };
    CartesianSeries.prototype.onLegendItemDoubleClick = function (event) {
        var enabled = event.enabled, itemId = event.itemId, series = event.series, numVisibleItems = event.numVisibleItems;
        var totalVisibleItems = Object.values(numVisibleItems).reduce(function (p, v) { return p + v; }, 0);
        var wasClicked = series.id === this.id;
        var newEnabled = wasClicked || (enabled && totalVisibleItems === 1);
        this.toggleSeriesItem(itemId, newEnabled);
    };
    CartesianSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        if (this.seriesItemEnabled.size > 0) {
            this.seriesItemEnabled.set(itemId, enabled);
            this.nodeDataRefresh = true;
        }
        else {
            _super.prototype.toggleSeriesItem.call(this, itemId, enabled);
        }
    };
    CartesianSeries.prototype.isEnabled = function () {
        var e_9, _a;
        if (this.seriesItemEnabled.size > 0) {
            try {
                for (var _b = __values(this.seriesItemEnabled), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), enabled = _d[1];
                    if (enabled) {
                        return true;
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
            return false;
        }
        return _super.prototype.isEnabled.call(this);
    };
    CartesianSeries.prototype.isPathOrSelectionDirty = function () {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    };
    CartesianSeries.prototype.getLabelData = function () {
        return [];
    };
    CartesianSeries.prototype.isAnySeriesVisible = function () {
        var e_10, _a;
        try {
            for (var _b = __values(this.seriesItemEnabled.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var visible = _c.value;
                if (visible) {
                    return true;
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return false;
    };
    CartesianSeries.prototype.updateHighlightSelectionItem = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var hasMarkers, item, highlightSelection, nodeData, markerSelection;
            return __generator(this, function (_a) {
                hasMarkers = this.opts.hasMarkers;
                item = opts.item, highlightSelection = opts.highlightSelection;
                nodeData = item ? [item] : [];
                if (hasMarkers) {
                    markerSelection = highlightSelection;
                    return [2 /*return*/, this.updateMarkerSelection({ nodeData: nodeData, markerSelection: markerSelection, seriesIdx: -1 })];
                }
                else {
                    return [2 /*return*/, this.updateDatumSelection({ nodeData: nodeData, datumSelection: highlightSelection, seriesIdx: -1 })];
                }
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updateHighlightSelectionLabel = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var item, highlightLabelSelection, labelData;
            return __generator(this, function (_a) {
                item = opts.item, highlightLabelSelection = opts.highlightLabelSelection;
                labelData = item ? [item] : [];
                return [2 /*return*/, this.updateLabelSelection({ labelData: labelData, labelSelection: highlightLabelSelection, seriesIdx: -1 })];
            });
        });
    };
    CartesianSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Override point for sub-classes.
                return [2 /*return*/, opts.datumSelection];
            });
        });
    };
    CartesianSeries.prototype.updateDatumNodes = function (_opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Override point for sub-classes.
                return [2 /*return*/, opts.markerSelection];
            });
        });
    };
    CartesianSeries.prototype.updateMarkerNodes = function (_opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.animateEmptyUpdateReady = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyUpdate = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyHighlight = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyHighlightMarkers = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyResize = function (_data) {
        // Override point for sub-classes.
    };
    return CartesianSeries;
}(Series));
export { CartesianSeries };
var CartesianSeriesMarker = /** @class */ (function (_super) {
    __extends(CartesianSeriesMarker, _super);
    function CartesianSeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], CartesianSeriesMarker.prototype, "formatter", void 0);
    return CartesianSeriesMarker;
}(SeriesMarker));
export { CartesianSeriesMarker };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vY2FydGVzaWFuU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILE1BQU0sRUFLTix3QkFBd0IsR0FDM0IsTUFBTSxXQUFXLENBQUM7QUFFbkIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDL0QsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVyRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWpELE9BQU8sRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUc5QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENB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