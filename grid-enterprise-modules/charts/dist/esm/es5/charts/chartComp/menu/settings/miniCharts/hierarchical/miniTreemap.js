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
import { _Scene, _Theme } from 'ag-charts-community';
import { MiniChart } from '../miniChart';
var MiniTreemap = /** @class */ (function (_super) {
    __extends(MiniTreemap, _super);
    function MiniTreemap(container, fills, strokes, themeTemplate, isCustomTheme) {
        var _this = _super.call(this, container, 'treemapTooltip') || this;
        var _a = _this, size = _a.size, padding = _a.padding;
        var data = [
            [1, 1],
            [3, 2, 1],
        ];
        var treeSize = data.length;
        var treePadding = treeSize % 2 === 0 ? 0.3 : 0.2;
        var range = [padding, size - padding];
        var columns = data.length;
        var columnParts = (columns * (columns + 1)) / 2;
        var columnPadding = treePadding / (columns - 1);
        var availableRange = range[1] - range[0];
        var availableWidth = availableRange - treePadding;
        var previousX = range[0];
        _this.rects = data.reduce(function (rects, d, columnIndex) {
            rects !== null && rects !== void 0 ? rects : (rects = []);
            var widthRatio = (columns - columnIndex) / columnParts;
            var width = availableWidth * widthRatio;
            var rows = d.length;
            var rowParts = d.reduce(function (parts, ratio) { return (parts += ratio); }, 0);
            var rowPadding = treePadding / (rows - 1 || 1);
            var availableHeight = rows > 1 ? availableRange - treePadding : availableRange;
            var previousY = range[0];
            var xRects = d.map(function (ratio) {
                var rect = new _Scene.Rect();
                var height = (availableHeight * ratio) / rowParts;
                rect.x = previousX;
                rect.y = previousY;
                rect.width = width;
                rect.height = height;
                rect.strokeWidth = 0.75;
                rect.crisp = true;
                previousY += height + rowPadding;
                return rect;
            });
            previousX += width + columnPadding;
            rects.push.apply(rects, __spreadArray([], __read(xRects), false));
            return rects;
        }, []);
        _this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
        var rectGroup = new _Scene.Group();
        rectGroup.setClipRectInGroupCoordinateSpace(new _Scene.BBox(padding, padding, size - padding, size - padding));
        rectGroup.append(_this.rects);
        _this.root.append(rectGroup);
        return _this;
    }
    MiniTreemap.prototype.updateColors = function (fills, strokes, themeTemplate, isCustomTheme) {
        var _a;
        var properties = (themeTemplate !== null && themeTemplate !== void 0 ? themeTemplate : {}).properties;
        var defaultBackgroundColor = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_BACKGROUND_COLOUR);
        var backgroundFill = (_a = (Array.isArray(defaultBackgroundColor) ? defaultBackgroundColor[0] : defaultBackgroundColor)) !== null && _a !== void 0 ? _a : 'white';
        this.rects.forEach(function (rect, i) {
            rect.fill = fills[i % strokes.length];
            rect.stroke = isCustomTheme ? strokes[i % strokes.length] : backgroundFill;
        });
    };
    MiniTreemap.chartType = 'treemap';
    return MiniTreemap;
}(MiniChart));
export { MiniTreemap };
