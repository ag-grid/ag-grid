"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniTreemap = void 0;
const ag_charts_community_1 = require("ag-charts-community");
const miniChart_1 = require("../miniChart");
class MiniTreemap extends miniChart_1.MiniChart {
    constructor(container, fills, strokes, themeTemplate, isCustomTheme) {
        super(container, 'treemapTooltip');
        const { size, padding } = this;
        const data = [
            [1, 1],
            [3, 2, 1],
        ];
        const treeSize = data.length;
        const treePadding = treeSize % 2 === 0 ? 0.3 : 0.2;
        const range = [padding, size - padding];
        const columns = data.length;
        const columnParts = (columns * (columns + 1)) / 2;
        const columnPadding = treePadding / (columns - 1);
        const availableRange = range[1] - range[0];
        const availableWidth = availableRange - treePadding;
        let previousX = range[0];
        this.rects = data.reduce((rects, d, columnIndex) => {
            rects !== null && rects !== void 0 ? rects : (rects = []);
            const widthRatio = (columns - columnIndex) / columnParts;
            const width = availableWidth * widthRatio;
            const rows = d.length;
            const rowParts = d.reduce((parts, ratio) => (parts += ratio), 0);
            const rowPadding = treePadding / (rows - 1 || 1);
            const availableHeight = rows > 1 ? availableRange - treePadding : availableRange;
            let previousY = range[0];
            const xRects = d.map((ratio) => {
                const rect = new ag_charts_community_1._Scene.Rect();
                const height = (availableHeight * ratio) / rowParts;
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
            rects.push(...xRects);
            return rects;
        }, []);
        this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
        const rectGroup = new ag_charts_community_1._Scene.Group();
        rectGroup.setClipRectInGroupCoordinateSpace(new ag_charts_community_1._Scene.BBox(padding, padding, size - padding, size - padding));
        rectGroup.append(this.rects);
        this.root.append(rectGroup);
    }
    updateColors(fills, strokes, themeTemplate, isCustomTheme) {
        var _a;
        const { properties } = themeTemplate !== null && themeTemplate !== void 0 ? themeTemplate : {};
        const defaultBackgroundColor = properties === null || properties === void 0 ? void 0 : properties.get(ag_charts_community_1._Theme.DEFAULT_BACKGROUND_COLOUR);
        const backgroundFill = (_a = (Array.isArray(defaultBackgroundColor) ? defaultBackgroundColor[0] : defaultBackgroundColor)) !== null && _a !== void 0 ? _a : 'white';
        this.rects.forEach((rect, i) => {
            rect.fill = fills[i % strokes.length];
            rect.stroke = isCustomTheme ? strokes[i % strokes.length] : backgroundFill;
        });
    }
}
exports.MiniTreemap = MiniTreemap;
MiniTreemap.chartType = 'treemap';
