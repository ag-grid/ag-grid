var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BBox } from '../scene/bbox';
import { ClipRect } from '../scene/clipRect';
import { Chart } from './chart';
export class HierarchyChart extends Chart {
    constructor(document = window.document, overrideDevicePixelRatio) {
        super(document, overrideDevicePixelRatio);
        this._data = {};
        this._seriesRoot = new ClipRect();
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root.visible = false;
        const root = this.scene.root;
        root.append(this.seriesRoot);
        root.append(this.legend.group);
    }
    get seriesRoot() {
        return this._seriesRoot;
    }
    performLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.root.visible = true;
            const { width, height, legend } = this;
            const shrinkRect = new BBox(0, 0, width, height);
            const { captionAutoPadding = 0 } = this.positionCaptions();
            this.positionLegend(captionAutoPadding);
            if (legend.enabled && legend.data.length) {
                const { legendAutoPadding } = this;
                const legendPadding = this.legend.spacing;
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
            const { padding } = this;
            shrinkRect.x += padding.left;
            shrinkRect.width -= padding.left + padding.right;
            shrinkRect.y += padding.top + captionAutoPadding;
            shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;
            this.seriesRect = shrinkRect;
            this.series.forEach((series) => {
                series.group.translationX = Math.floor(shrinkRect.x);
                series.group.translationY = Math.floor(shrinkRect.y);
                series.update(); // this has to happen after the `updateAxes` call
            });
            const { seriesRoot } = this;
            seriesRoot.x = shrinkRect.x;
            seriesRoot.y = shrinkRect.y;
            seriesRoot.width = shrinkRect.width;
            seriesRoot.height = shrinkRect.height;
        });
    }
}
HierarchyChart.className = 'HierarchyChart';
HierarchyChart.type = 'hierarchy';
