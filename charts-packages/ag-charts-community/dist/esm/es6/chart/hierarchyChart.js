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
import { Chart } from './chart';
export class HierarchyChart extends Chart {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        super(document, overrideDevicePixelRatio, resources);
        this._data = {};
        const root = this.scene.root;
        this.legend.attachLegend(root);
    }
    performLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.root.visible = true;
            const { width, height, legend, padding } = this;
            let shrinkRect = new BBox(0, 0, width, height);
            shrinkRect.shrink(padding.left, 'left');
            shrinkRect.shrink(padding.top, 'top');
            shrinkRect.shrink(padding.right, 'right');
            shrinkRect.shrink(padding.bottom, 'bottom');
            shrinkRect = this.positionCaptions(shrinkRect);
            shrinkRect = this.positionLegend(shrinkRect);
            if (legend.visible && legend.enabled && legend.data.length) {
                const legendPadding = legend.spacing;
                shrinkRect.shrink(legendPadding, legend.position);
            }
            this.seriesRect = shrinkRect;
            this.series.forEach((series) => {
                series.rootGroup.translationX = Math.floor(shrinkRect.x);
                series.rootGroup.translationY = Math.floor(shrinkRect.y);
                series.update({ seriesRect: shrinkRect }); // this has to happen after the `updateAxes` call
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
