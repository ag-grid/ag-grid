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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniHeatmap = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var miniChart_1 = require("../miniChart");
var MiniHeatmap = /** @class */ (function (_super) {
    __extends(MiniHeatmap, _super);
    function MiniHeatmap(container, fills, strokes, themeTemplate, isCustomTheme) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, container, 'heatmapTooltip') || this;
        var _c = _this, size = _c.size, padding = _c.padding;
        var heatmapSize = 3;
        var data = Array.from({ length: heatmapSize }, function (_, __) {
            return Array.from({ length: heatmapSize }, function (_, yIndex) { return yIndex; });
        });
        var domain = data.map(function (_, index) { return index; });
        var xScale = new ag_charts_community_1._Scene.BandScale();
        xScale.domain = domain;
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.01;
        xScale.paddingOuter = 0.1;
        var yScale = new ag_charts_community_1._Scene.BandScale();
        yScale.domain = domain;
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.01;
        yScale.paddingOuter = 0.1;
        var width = (_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0;
        var height = (_b = yScale.bandwidth) !== null && _b !== void 0 ? _b : 0;
        _this.rects = data.reduce(function (rects, d, index) {
            rects !== null && rects !== void 0 ? rects : (rects = []);
            var xRects = d.map(function (_, yIndex) {
                var rect = new ag_charts_community_1._Scene.Rect();
                rect.x = xScale.convert(index);
                rect.y = yScale.convert(yIndex);
                rect.width = width;
                rect.height = height;
                rect.strokeWidth = 0;
                rect.crisp = true;
                return rect;
            });
            rects.push.apply(rects, __spreadArray([], __read(xRects), false));
            return rects;
        }, []);
        _this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
        var rectGroup = new ag_charts_community_1._Scene.Group();
        rectGroup.setClipRectInGroupCoordinateSpace(new ag_charts_community_1._Scene.BBox(padding, padding, size - padding, size - padding));
        rectGroup.append(_this.rects);
        _this.root.append(rectGroup);
        return _this;
    }
    MiniHeatmap.prototype.updateColors = function (fills, strokes, themeTemplate, isCustomTheme) {
        var _a;
        var properties = (themeTemplate !== null && themeTemplate !== void 0 ? themeTemplate : {}).properties;
        var defaultColorRange = properties === null || properties === void 0 ? void 0 : properties.get(ag_charts_community_1._Theme.DEFAULT_DIVERGING_SERIES_COLOUR_RANGE);
        var defaultBackgroundColor = properties === null || properties === void 0 ? void 0 : properties.get(ag_charts_community_1._Theme.DEFAULT_BACKGROUND_COLOUR);
        var backgroundFill = (_a = (Array.isArray(defaultBackgroundColor) ? defaultBackgroundColor[0] : defaultBackgroundColor)) !== null && _a !== void 0 ? _a : 'white';
        var colorRange = isCustomTheme ? [fills[0], fills[1]] : defaultColorRange;
        var stroke = isCustomTheme ? strokes[0] : backgroundFill;
        this.rects.forEach(function (rect, i) {
            rect.fill = ag_charts_community_1._Util.Color.interpolate(colorRange[0], colorRange[1])(i * 0.2);
            rect.stroke = stroke;
        });
    };
    MiniHeatmap.chartType = 'heatmap';
    return MiniHeatmap;
}(miniChart_1.MiniChart));
exports.MiniHeatmap = MiniHeatmap;
