var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Chart } from './chart';
import { PolarSeries } from './series/polar/polarSeries';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
export class PolarChart extends Chart {
    constructor(document = window.document, overrideDevicePixelRatio) {
        super(document, overrideDevicePixelRatio);
        this.padding = new Padding(40);
        this.scene.root.append(this.legend.group);
    }
    get seriesRoot() {
        return this.scene.root;
    }
    performLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            const shrinkRect = new BBox(0, 0, this.width, this.height);
            const { captionAutoPadding = 0 } = this.positionCaptions();
            this.positionLegend(captionAutoPadding);
            shrinkRect.y += captionAutoPadding;
            shrinkRect.height -= captionAutoPadding;
            if (this.legend.enabled && this.legend.data.length) {
                const legendAutoPadding = this.legendAutoPadding;
                shrinkRect.x += legendAutoPadding.left;
                shrinkRect.y += legendAutoPadding.top;
                shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
                shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
                const legendPadding = this.legend.spacing;
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
            const padding = this.padding;
            shrinkRect.x += padding.left;
            shrinkRect.y += padding.top;
            shrinkRect.width -= padding.left + padding.right;
            shrinkRect.height -= padding.top + padding.bottom;
            this.seriesRect = shrinkRect;
            const centerX = shrinkRect.x + shrinkRect.width / 2;
            const centerY = shrinkRect.y + shrinkRect.height / 2;
            const radius = Math.max(0, Math.min(shrinkRect.width, shrinkRect.height) / 2); // radius shouldn't be negative
            this.series.forEach((series) => {
                if (series instanceof PolarSeries) {
                    series.centerX = centerX;
                    series.centerY = centerY;
                    series.radius = radius;
                }
            });
        });
    }
}
PolarChart.className = 'PolarChart';
PolarChart.type = 'polar';
