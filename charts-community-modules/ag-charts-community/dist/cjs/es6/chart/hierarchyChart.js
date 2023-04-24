"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyChart = void 0;
const bbox_1 = require("../scene/bbox");
const chart_1 = require("./chart");
class HierarchyChart extends chart_1.Chart {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        super(document, overrideDevicePixelRatio, resources);
        this._data = {};
        const root = this.scene.root;
        this.legend.attachLegend(root);
    }
    performLayout() {
        const _super = Object.create(null, {
            performLayout: { get: () => super.performLayout }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const shrinkRect = yield _super.performLayout.call(this);
            const { seriesAreaPadding } = this;
            const fullSeriesRect = shrinkRect.clone();
            shrinkRect.shrink(seriesAreaPadding.left, 'left');
            shrinkRect.shrink(seriesAreaPadding.top, 'top');
            shrinkRect.shrink(seriesAreaPadding.right, 'right');
            shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');
            this.seriesRect = shrinkRect;
            const hoverRectPadding = 20;
            const hoverRect = shrinkRect.clone().grow(hoverRectPadding);
            this.hoverRect = hoverRect;
            this.series.forEach((series) => {
                series.rootGroup.translationX = Math.floor(shrinkRect.x);
                series.rootGroup.translationY = Math.floor(shrinkRect.y);
                series.update({ seriesRect: shrinkRect }); // this has to happen after the `updateAxes` call
            });
            const { seriesRoot } = this;
            seriesRoot.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(shrinkRect.x, shrinkRect.y, shrinkRect.width, shrinkRect.height));
            this.layoutService.dispatchLayoutComplete({
                type: 'layout-complete',
                chart: { width: this.scene.width, height: this.scene.height },
                series: { rect: fullSeriesRect, paddedRect: shrinkRect, hoverRect, visible: true },
                axes: [],
            });
            return shrinkRect;
        });
    }
}
exports.HierarchyChart = HierarchyChart;
HierarchyChart.className = 'HierarchyChart';
HierarchyChart.type = 'hierarchy';
