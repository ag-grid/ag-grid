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
var bbox_1 = require("../scene/bbox");
var clipRect_1 = require("../scene/clipRect");
var chart_1 = require("./chart");
var HierarchyChart = /** @class */ (function (_super) {
    __extends(HierarchyChart, _super);
    function HierarchyChart(document, overrideDevicePixelRatio) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio) || this;
        _this._data = {};
        _this._seriesRoot = new clipRect_1.ClipRect();
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        _this.scene.root.visible = false;
        var root = _this.scene.root;
        root.append(_this.seriesRoot);
        root.append(_this.legend.group);
        return _this;
    }
    Object.defineProperty(HierarchyChart.prototype, "seriesRoot", {
        get: function () {
            return this._seriesRoot;
        },
        enumerable: true,
        configurable: true
    });
    HierarchyChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, legend, shrinkRect, _b, captionAutoPadding, legendAutoPadding, legendPadding, padding, seriesRoot;
            return __generator(this, function (_c) {
                this.scene.root.visible = true;
                _a = this, width = _a.width, height = _a.height, legend = _a.legend;
                shrinkRect = new bbox_1.BBox(0, 0, width, height);
                _b = this.positionCaptions().captionAutoPadding, captionAutoPadding = _b === void 0 ? 0 : _b;
                this.positionLegend(captionAutoPadding);
                if (legend.enabled && legend.data.length) {
                    legendAutoPadding = this.legendAutoPadding;
                    legendPadding = this.legend.spacing;
                    shrinkRect.x += legendAutoPadding.left;
                    shrinkRect.y += legendAutoPadding.top;
                    shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
                    shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
                    switch (this.legend.position) {
                        case 'right':
                            shrinkRect.width -= legendPadding;
                            break;
                        case 'bottom':
                            shrinkRect.height -= legendPadding;
                            break;
                        case 'left':
                            shrinkRect.x += legendPadding;
                            shrinkRect.width -= legendPadding;
                            break;
                        case 'top':
                            shrinkRect.y += legendPadding;
                            shrinkRect.height -= legendPadding;
                            break;
                    }
                }
                padding = this.padding;
                shrinkRect.x += padding.left;
                shrinkRect.width -= padding.left + padding.right;
                shrinkRect.y += padding.top + captionAutoPadding;
                shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;
                this.seriesRect = shrinkRect;
                this.series.forEach(function (series) {
                    series.group.translationX = Math.floor(shrinkRect.x);
                    series.group.translationY = Math.floor(shrinkRect.y);
                    series.update(); // this has to happen after the `updateAxes` call
                });
                seriesRoot = this.seriesRoot;
                seriesRoot.x = shrinkRect.x;
                seriesRoot.y = shrinkRect.y;
                seriesRoot.width = shrinkRect.width;
                seriesRoot.height = shrinkRect.height;
                return [2 /*return*/];
            });
        });
    };
    HierarchyChart.className = 'HierarchyChart';
    HierarchyChart.type = 'hierarchy';
    return HierarchyChart;
}(chart_1.Chart));
exports.HierarchyChart = HierarchyChart;
