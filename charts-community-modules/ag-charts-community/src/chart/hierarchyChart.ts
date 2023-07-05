import { BBox } from '../scene/bbox';
import type { TransferableResources } from './chart';
import { Chart } from './chart';

export class HierarchyChart extends Chart {
    static className = 'HierarchyChart';
    static type = 'hierarchy' as const;

    constructor(document = window.document, overrideDevicePixelRatio?: number, resources?: TransferableResources) {
        super(document, overrideDevicePixelRatio, resources);
    }

    protected _data: any = {};

    async performLayout() {
        const shrinkRect = await super.performLayout();

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

        this.seriesRoot.translationX = Math.floor(shrinkRect.x);
        this.seriesRoot.translationY = Math.floor(shrinkRect.y);
        await Promise.all(
            this.series.map(async (series) => {
                await series.update({ seriesRect: shrinkRect }); // this has to happen after the `updateAxes` call
            })
        );

        const { seriesRoot } = this;
        seriesRoot.setClipRectInGroupCoordinateSpace(
            new BBox(shrinkRect.x, shrinkRect.y, shrinkRect.width, shrinkRect.height)
        );

        this.layoutService.dispatchLayoutComplete({
            type: 'layout-complete',
            chart: { width: this.scene.width, height: this.scene.height },
            series: { rect: fullSeriesRect, paddedRect: shrinkRect, hoverRect, visible: true },
            axes: [],
        });

        return shrinkRect;
    }
}
