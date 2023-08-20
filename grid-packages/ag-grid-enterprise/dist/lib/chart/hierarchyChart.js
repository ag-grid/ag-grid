"use strict";
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
exports.HierarchyChart = void 0;
var bbox_1 = require("../scene/bbox");
var chart_1 = require("./chart");
var HierarchyChart = /** @class */ (function (_super) {
    __extends(HierarchyChart, _super);
    function HierarchyChart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio, resources) || this;
        _this._data = {};
        return _this;
    }
    HierarchyChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shrinkRect, seriesAreaPadding, fullSeriesRect, hoverRectPadding, hoverRect, seriesRoot;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.performLayout.call(this)];
                    case 1:
                        shrinkRect = _a.sent();
                        seriesAreaPadding = this.seriesAreaPadding;
                        fullSeriesRect = shrinkRect.clone();
                        shrinkRect.shrink(seriesAreaPadding.left, 'left');
                        shrinkRect.shrink(seriesAreaPadding.top, 'top');
                        shrinkRect.shrink(seriesAreaPadding.right, 'right');
                        shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');
                        this.seriesRect = shrinkRect;
                        hoverRectPadding = 20;
                        hoverRect = shrinkRect.clone().grow(hoverRectPadding);
                        this.hoverRect = hoverRect;
                        this.seriesRoot.translationX = Math.floor(shrinkRect.x);
                        this.seriesRoot.translationY = Math.floor(shrinkRect.y);
                        return [4 /*yield*/, Promise.all(this.series.map(function (series) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, series.update({ seriesRect: shrinkRect })];
                                        case 1:
                                            _a.sent(); // this has to happen after the `updateAxes` call
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        seriesRoot = this.seriesRoot;
                        seriesRoot.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(shrinkRect.x, shrinkRect.y, shrinkRect.width, shrinkRect.height));
                        this.layoutService.dispatchLayoutComplete({
                            type: 'layout-complete',
                            chart: { width: this.scene.width, height: this.scene.height },
                            series: { rect: fullSeriesRect, paddedRect: shrinkRect, hoverRect: hoverRect, visible: true },
                            axes: [],
                        });
                        return [2 /*return*/, shrinkRect];
                }
            });
        });
    };
    HierarchyChart.className = 'HierarchyChart';
    HierarchyChart.type = 'hierarchy';
    return HierarchyChart;
}(chart_1.Chart));
exports.HierarchyChart = HierarchyChart;
//# sourceMappingURL=hierarchyChart.js.map