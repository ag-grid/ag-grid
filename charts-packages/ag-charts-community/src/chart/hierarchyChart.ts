import { BBox } from '../scene/bbox';
import { ClipRect } from '../scene/clipRect';
import { Chart } from './chart';

export class HierarchyChart extends Chart {
    static className = 'HierarchyChart';
    static type = 'hierarchy' as const;

    constructor(document = window.document, overrideDevicePixelRatio?: number) {
        super(document, overrideDevicePixelRatio);

        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root!!.visible = false;

        const root = this.scene.root!;
        root.append(this.seriesRoot);
        root.append(this.legend.group);
    }

    protected _data: any = {};

    private _seriesRoot = new ClipRect();
    get seriesRoot(): ClipRect {
        return this._seriesRoot;
    }

    async performLayout() {
        this.scene.root!!.visible = true;

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
