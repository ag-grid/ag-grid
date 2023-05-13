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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianSeriesMarker = exports.CartesianSeries = exports.CartesianSeriesNodeDoubleClickEvent = exports.CartesianSeriesNodeClickEvent = exports.CartesianSeriesNodeBaseClickEvent = void 0;
var series_1 = require("../series");
var seriesMarker_1 = require("../seriesMarker");
var value_1 = require("../../../util/value");
var continuousScale_1 = require("../../../scale/continuousScale");
var path_1 = require("../../../scene/shape/path");
var selection_1 = require("../../../scene/selection");
var group_1 = require("../../../scene/group");
var text_1 = require("../../../scene/shape/text");
var changeDetectable_1 = require("../../../scene/changeDetectable");
var categoryAxis_1 = require("../../axis/categoryAxis");
var layers_1 = require("../../layers");
var validation_1 = require("../../../util/validation");
var json_1 = require("../../../util/json");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var logger_1 = require("../../../util/logger");
var DEFAULT_DIRECTION_KEYS = (_a = {},
    _a[chartAxisDirection_1.ChartAxisDirection.X] = ['xKey'],
    _a[chartAxisDirection_1.ChartAxisDirection.Y] = ['yKey'],
    _a);
var CartesianSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeBaseClickEvent, _super);
    function CartesianSeriesNodeBaseClickEvent(xKey, yKey, nativeEvent, datum, series) {
        var _this = _super.call(this, nativeEvent, datum, series) || this;
        _this.xKey = xKey;
        _this.yKey = yKey;
        return _this;
    }
    return CartesianSeriesNodeBaseClickEvent;
}(series_1.SeriesNodeBaseClickEvent));
exports.CartesianSeriesNodeBaseClickEvent = CartesianSeriesNodeBaseClickEvent;
var CartesianSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeClickEvent, _super);
    function CartesianSeriesNodeClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeClick';
        return _this;
    }
    return CartesianSeriesNodeClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
exports.CartesianSeriesNodeClickEvent = CartesianSeriesNodeClickEvent;
var CartesianSeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeDoubleClickEvent, _super);
    function CartesianSeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return CartesianSeriesNodeDoubleClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
exports.CartesianSeriesNodeDoubleClickEvent = CartesianSeriesNodeDoubleClickEvent;
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries(opts) {
        if (opts === void 0) { opts = {}; }
        var _a;
        var _this = _super.call(this, {
            useSeriesGroupLayer: true,
            pickModes: opts.pickModes,
            directionKeys: (_a = opts.directionKeys) !== null && _a !== void 0 ? _a : DEFAULT_DIRECTION_KEYS,
        }) || this;
        _this._contextNodeData = [];
        _this.nodeDataDependencies = {};
        _this.highlightSelection = selection_1.Selection.select(_this.highlightNode, function () {
            return _this.opts.hasMarkers ? _this.markerFactory() : _this.nodeFactory();
        });
        _this.highlightLabelSelection = selection_1.Selection.select(_this.highlightLabel, text_1.Text);
        _this.subGroups = [];
        _this.subGroupId = 0;
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        var _b = opts.pathsPerSeries, pathsPerSeries = _b === void 0 ? 1 : _b, _c = opts.hasMarkers, hasMarkers = _c === void 0 ? false : _c, _d = opts.pathsZIndexSubOrderOffset, pathsZIndexSubOrderOffset = _d === void 0 ? [] : _d, _e = opts.renderLayerPerSubSeries, renderLayerPerSubSeries = _e === void 0 ? true : _e;
        _this.opts = { pathsPerSeries: pathsPerSeries, hasMarkers: hasMarkers, pathsZIndexSubOrderOffset: pathsZIndexSubOrderOffset, renderLayerPerSubSeries: renderLayerPerSubSeries };
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
        var isValidDatum = ((isContinuousX && value_1.isContinuous(x)) || (!isContinuousX && value_1.isDiscrete(x))) &&
            ((isContinuousY && value_1.isContinuous(y)) || (!isContinuousY && value_1.isDiscrete(y)));
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
                        anySeriesItemEnabled = (visible && seriesItemEnabled.size === 0) || __spread(seriesItemEnabled.values()).some(function (v) { return v === true; });
                        newNodeDataDependencies = {
                            seriesRectWidth: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width,
                            seriesRectHeight: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.height,
                        };
                        if (json_1.jsonDiff(this.nodeDataDependencies, newNodeDataDependencies) != null) {
                            this.nodeDataDependencies = newNodeDataDependencies;
                            this.markNodeDataDirty();
                        }
                        return [4 /*yield*/, this.updateSelections(seriesHighlighted, anySeriesItemEnabled)];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, this.updateNodes(seriesHighlighted, anySeriesItemEnabled)];
                    case 2:
                        _e.sent();
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
                    case 4: return [4 /*yield*/, Promise.all(this.subGroups.map(function (g, i) { return _this.updateSeriesGroupSelections(g, i, seriesHighlighted); }))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateSeriesGroupSelections = function (subGroup, seriesIdx, seriesHighlighted) {
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, labelSelection, markerSelection, paths, contextData, nodeData, labelData, itemId, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths;
                        contextData = this._contextNodeData[seriesIdx];
                        nodeData = contextData.nodeData, labelData = contextData.labelData, itemId = contextData.itemId;
                        return [4 /*yield*/, this.updatePaths({ seriesHighlighted: seriesHighlighted, itemId: itemId, contextData: contextData, paths: paths, seriesIdx: seriesIdx })];
                    case 1:
                        _d.sent();
                        _a = subGroup;
                        return [4 /*yield*/, this.updateDatumSelection({ nodeData: nodeData, datumSelection: datumSelection, seriesIdx: seriesIdx })];
                    case 2:
                        _a.datumSelection = _d.sent();
                        _b = subGroup;
                        return [4 /*yield*/, this.updateLabelSelection({ labelData: labelData, labelSelection: labelSelection, seriesIdx: seriesIdx })];
                    case 3:
                        _b.labelSelection = _d.sent();
                        if (!markerSelection) return [3 /*break*/, 5];
                        _c = subGroup;
                        return [4 /*yield*/, this.updateMarkerSelection({
                                nodeData: nodeData,
                                markerSelection: markerSelection,
                                seriesIdx: seriesIdx,
                            })];
                    case 4:
                        _c.markerSelection = _d.sent();
                        _d.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.nodeFactory = function () {
        return new group_1.Group();
    };
    CartesianSeries.prototype.markerFactory = function () {
        var MarkerShape = util_1.getMarker();
        return new MarkerShape();
    };
    CartesianSeries.prototype.updateSeriesGroups = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, contextNodeData, contentGroup, subGroups, _c, pathsPerSeries, hasMarkers, pathsZIndexSubOrderOffset, renderLayerPerSubSeries, totalGroups, layer, subGroupId, subGroupZOffset, dataNodeGroup, markerGroup, labelGroup, pathParentGroup, paths, index;
            var _this = this;
            return __generator(this, function (_d) {
                _b = this, contextNodeData = _b._contextNodeData, contentGroup = _b.contentGroup, subGroups = _b.subGroups, _c = _b.opts, pathsPerSeries = _c.pathsPerSeries, hasMarkers = _c.hasMarkers, pathsZIndexSubOrderOffset = _c.pathsZIndexSubOrderOffset, renderLayerPerSubSeries = _c.renderLayerPerSubSeries;
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
                    layer = renderLayerPerSubSeries;
                    subGroupId = this.subGroupId++;
                    subGroupZOffset = subGroupId;
                    dataNodeGroup = new group_1.Group({
                        name: this.id + "-series-sub" + subGroupId + "-dataNodes",
                        layer: layer,
                        zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                        zIndexSubOrder: [function () { return _this._declarationOrder; }, subGroupZOffset],
                    });
                    markerGroup = hasMarkers
                        ? new group_1.Group({
                            name: this.id + "-series-sub" + this.subGroupId++ + "-markers",
                            layer: layer,
                            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                            zIndexSubOrder: [function () { return _this._declarationOrder; }, 10000 + subGroupId],
                        })
                        : undefined;
                    labelGroup = new group_1.Group({
                        name: this.id + "-series-sub" + this.subGroupId++ + "-labels",
                        layer: layer,
                        zIndex: layers_1.Layers.SERIES_LABEL_ZINDEX,
                        zIndexSubOrder: [function () { return _this._declarationOrder; }, subGroupId],
                    });
                    contentGroup.appendChild(dataNodeGroup);
                    contentGroup.appendChild(labelGroup);
                    if (markerGroup) {
                        contentGroup.appendChild(markerGroup);
                    }
                    pathParentGroup = renderLayerPerSubSeries ? dataNodeGroup : contentGroup;
                    paths = [];
                    for (index = 0; index < pathsPerSeries; index++) {
                        paths[index] = new path_1.Path();
                        paths[index].zIndex = layers_1.Layers.SERIES_LAYER_ZINDEX;
                        paths[index].zIndexSubOrder = [
                            function () { return _this._declarationOrder; },
                            ((_a = pathsZIndexSubOrderOffset[index]) !== null && _a !== void 0 ? _a : 0) + subGroupZOffset,
                        ];
                        pathParentGroup.appendChild(paths[index]);
                    }
                    subGroups.push({
                        paths: paths,
                        dataNodeGroup: dataNodeGroup,
                        markerGroup: markerGroup,
                        labelGroup: labelGroup,
                        labelSelection: selection_1.Selection.select(labelGroup, text_1.Text),
                        datumSelection: selection_1.Selection.select(dataNodeGroup, function () { return _this.nodeFactory(); }),
                        markerSelection: markerGroup ? selection_1.Selection.select(markerGroup, function () { return _this.markerFactory(); }) : undefined,
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updateNodes = function (seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, highlightSelection, highlightLabelSelection, contextNodeData, seriesItemEnabled, _c, hasMarkers, renderLayerPerSubSeries, visible, seriesOpacity, subGroupOpacities, isSubGroupOpacityDifferent;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData, seriesItemEnabled = _b.seriesItemEnabled, _c = _b.opts, hasMarkers = _c.hasMarkers, renderLayerPerSubSeries = _c.renderLayerPerSubSeries;
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
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 })];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [4 /*yield*/, this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 })];
                    case 5:
                        _d.sent();
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
                                                    dataNodeGroup.zIndex >= layers_1.Layers.SERIES_LAYER_ZINDEX
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
                                                    if (!renderLayerPerSubSeries) {
                                                        path.opacity = subGroupOpacity;
                                                        path.visible = subGroupVisible;
                                                    }
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
                                            return [4 /*yield*/, this.updatePathNodes({ seriesHighlighted: seriesHighlighted, itemId: itemId, paths: paths, seriesIdx: seriesIdx })];
                                        case 1:
                                            _c.sent();
                                            return [4 /*yield*/, this.updateDatumNodes({ datumSelection: datumSelection, isHighlight: false, seriesIdx: seriesIdx })];
                                        case 2:
                                            _c.sent();
                                            return [4 /*yield*/, this.updateLabelNodes({ labelSelection: labelSelection, seriesIdx: seriesIdx })];
                                        case 3:
                                            _c.sent();
                                            if (!(hasMarkers && markerSelection)) return [3 /*break*/, 5];
                                            return [4 /*yield*/, this.updateMarkerNodes({ markerSelection: markerSelection, isHighlight: false, seriesIdx: seriesIdx })];
                                        case 4:
                                            _c.sent();
                                            _c.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 6:
                        _d.sent();
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
            .filter(function (a) { return a instanceof categoryAxis_1.CategoryAxis; })
            .map(function (a) { return a.direction; });
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        var _f = __read(directions, 1), _g = _f[0], primaryDirection = _g === void 0 ? chartAxisDirection_1.ChartAxisDirection.X : _g;
        var hitPoint = rootGroup.transformPoint(x, y);
        var hitPointCoords = primaryDirection === chartAxisDirection_1.ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
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
                        var point_1 = primaryDirection === chartAxisDirection_1.ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
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
    CartesianSeries.prototype.validateXYData = function (xKey, yKey, data, xAxis, yAxis, xData, yData, yDepth) {
        var _a;
        if (yDepth === void 0) { yDepth = 1; }
        if (((_a = this.chart) === null || _a === void 0 ? void 0 : _a.mode) === 'integrated') {
            // Integrated Charts use-cases do not require this validation.
            return true;
        }
        if (!xAxis || !yAxis || data.length === 0 || (this.seriesItemEnabled.size > 0 && !this.isAnySeriesVisible())) {
            return true;
        }
        var hasNumber = function (items, depth, maxDepth) {
            if (depth === void 0) { depth = 0; }
            if (maxDepth === void 0) { maxDepth = 0; }
            return items.some(depth === maxDepth ? function (y) { return value_1.isContinuous(y); } : function (arr) { return hasNumber(arr, depth + 1, maxDepth); });
        };
        var isContinuousX = xAxis.scale instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = yAxis.scale instanceof continuousScale_1.ContinuousScale;
        var validationResult = true;
        if (isContinuousX && !hasNumber(xData)) {
            logger_1.Logger.warnOnce("the number axis has no numeric data supplied for xKey: [" + xKey + "].");
            validationResult = false;
        }
        if (isContinuousY && !hasNumber(yData, 0, yDepth - 1)) {
            logger_1.Logger.warnOnce("the number axis has no numeric data supplied for yKey: [" + yKey + "].");
            validationResult = false;
        }
        return validationResult;
    };
    CartesianSeries.prototype.updatePaths = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Override point for sub-classes.
                opts.paths.forEach(function (p) { return (p.visible = false); });
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updatePathNodes = function (_opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
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
    return CartesianSeries;
}(series_1.Series));
exports.CartesianSeries = CartesianSeries;
var CartesianSeriesMarker = /** @class */ (function (_super) {
    __extends(CartesianSeriesMarker, _super);
    function CartesianSeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION),
        changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR })
    ], CartesianSeriesMarker.prototype, "formatter", void 0);
    return CartesianSeriesMarker;
}(seriesMarker_1.SeriesMarker));
exports.CartesianSeriesMarker = CartesianSeriesMarker;
//# sourceMappingURL=cartesianSeries.js.map