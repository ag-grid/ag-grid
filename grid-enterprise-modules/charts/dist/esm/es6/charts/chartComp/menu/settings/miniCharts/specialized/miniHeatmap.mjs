import { _Scene, _Theme, _Util } from 'ag-charts-community';
import { MiniChart } from '../miniChart.mjs';
export class MiniHeatmap extends MiniChart {
    constructor(container, fills, strokes, themeTemplate, isCustomTheme) {
        var _a, _b;
        super(container, 'heatmapTooltip');
        const { size, padding } = this;
        const heatmapSize = 3;
        const data = Array.from({ length: heatmapSize }, (_, __) => Array.from({ length: heatmapSize }, (_, yIndex) => yIndex));
        const domain = data.map((_, index) => index);
        const xScale = new _Scene.BandScale();
        xScale.domain = domain;
        xScale.range = [padding, size - padding];
        xScale.paddingInner = 0.01;
        xScale.paddingOuter = 0.1;
        const yScale = new _Scene.BandScale();
        yScale.domain = domain;
        yScale.range = [padding, size - padding];
        yScale.paddingInner = 0.01;
        yScale.paddingOuter = 0.1;
        const width = (_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0;
        const height = (_b = yScale.bandwidth) !== null && _b !== void 0 ? _b : 0;
        this.rects = data.reduce((rects, d, index) => {
            rects !== null && rects !== void 0 ? rects : (rects = []);
            const xRects = d.map((_, yIndex) => {
                const rect = new _Scene.Rect();
                rect.x = xScale.convert(index);
                rect.y = yScale.convert(yIndex);
                rect.width = width;
                rect.height = height;
                rect.strokeWidth = 0;
                rect.crisp = true;
                return rect;
            });
            rects.push(...xRects);
            return rects;
        }, []);
        this.updateColors(fills, strokes, themeTemplate, isCustomTheme);
        const rectGroup = new _Scene.Group();
        rectGroup.setClipRectInGroupCoordinateSpace(new _Scene.BBox(padding, padding, size - padding, size - padding));
        rectGroup.append(this.rects);
        this.root.append(rectGroup);
    }
    updateColors(fills, strokes, themeTemplate, isCustomTheme) {
        var _a;
        const { properties } = themeTemplate !== null && themeTemplate !== void 0 ? themeTemplate : {};
        const defaultColorRange = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_DIVERGING_SERIES_COLOUR_RANGE);
        const defaultBackgroundColor = properties === null || properties === void 0 ? void 0 : properties.get(_Theme.DEFAULT_BACKGROUND_COLOUR);
        const backgroundFill = (_a = (Array.isArray(defaultBackgroundColor) ? defaultBackgroundColor[0] : defaultBackgroundColor)) !== null && _a !== void 0 ? _a : 'white';
        const colorRange = isCustomTheme ? [fills[0], fills[1]] : defaultColorRange;
        const stroke = isCustomTheme ? strokes[0] : backgroundFill;
        this.rects.forEach((rect, i) => {
            rect.fill = _Util.Color.interpolate(colorRange[0], colorRange[1])(i * 0.2);
            rect.stroke = stroke;
        });
    }
}
MiniHeatmap.chartType = 'heatmap';
