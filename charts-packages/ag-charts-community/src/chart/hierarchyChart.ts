import { BBox } from '../scene/bbox';
import { Chart, TransferableResources } from './chart';

export class HierarchyChart extends Chart {
    static className = 'HierarchyChart';
    static type = 'hierarchy' as const;

    constructor(document = window.document, overrideDevicePixelRatio?: number, resources?: TransferableResources) {
        super(document, overrideDevicePixelRatio, resources);

        const root = this.scene.root!;
        this.legend.attachLegend(root);
    }

    protected _data: any = {};

    async performLayout() {
        this.scene.root!!.visible = true;

        const { width, height, padding } = this;

        let shrinkRect = new BBox(0, 0, width, height);
        shrinkRect.shrink(padding.left, 'left');
        shrinkRect.shrink(padding.top, 'top');
        shrinkRect.shrink(padding.right, 'right');
        shrinkRect.shrink(padding.bottom, 'bottom');

        shrinkRect = this.positionLegend(shrinkRect);
        shrinkRect = this.positionCaptions(shrinkRect);

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
    }
}
