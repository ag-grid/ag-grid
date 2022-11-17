import { Chart } from './chart';
import { Node } from '../scene/node';
import { PolarSeries } from './series/polar/polarSeries';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
import { SeriesNodeDatum } from './series/series';

export class PolarChart extends Chart {
    static className = 'PolarChart';
    static type = 'polar' as const;

    padding = new Padding(40);

    constructor(document = window.document, overrideDevicePixelRatio?: number) {
        super(document, overrideDevicePixelRatio);

        this.scene.root!.append(this.legend.group);
    }

    get seriesRoot(): Node {
        return this.scene.root!;
    }

    async performLayout() {
        const { captionAutoPadding = 0 } = this.positionCaptions();
        this.positionLegend(captionAutoPadding);
        this.computeSeriesRect(captionAutoPadding);
        this.computeLabelsPadding();
    }

    private computeSeriesRect(captionAutoPadding: number) {
        const shrinkRect = new BBox(0, 0, this.width, this.height);

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
    }

    private computeLabelsPadding() {
        const seriesBox = this.seriesRect!;
        const polarSeries = this.series.filter((series) => {
            return series instanceof PolarSeries;
        }) as PolarSeries<SeriesNodeDatum>[];

        let centerX = seriesBox.x + seriesBox.width / 2;
        let centerY = seriesBox.y + seriesBox.height / 2;
        let radius = Math.max(0, Math.min(seriesBox.width, seriesBox.height) / 2);
        polarSeries.forEach((series) => {
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
        });

        const labelRepositionAttempts = 2;
        for (let i = 0; i < labelRepositionAttempts; i++) {
            const labelBoxes = polarSeries
                .map((series) => series.computeLabelsBBox())
                .filter((box) => box != null) as BBox[];
            if (labelBoxes.length === 0) {
                break;
            }

            const labelBox = BBox.merge(labelBoxes);

            const circleLeft = -radius;
            const circleTop = -radius;
            const circleRight = radius;
            const circleBottom = radius;

            const padLeft = Math.max(0, circleLeft - labelBox.x);
            const padTop = Math.max(0, circleTop - labelBox.y);
            const padRight = Math.max(0, labelBox.x + labelBox.width - circleRight);
            const padBottom = Math.max(0, labelBox.y + labelBox.height - circleBottom);

            radius = Math.min(seriesBox.width - padLeft - padRight, seriesBox.height - padTop - padBottom) / 2;
            const newWidth = padLeft + 2 * radius + padRight;
            const newHeight = padTop + 2 * radius + padBottom;
            centerX = seriesBox.x + padLeft + radius + (seriesBox.width - newWidth) / 2;
            centerY = seriesBox.y + padTop + radius + (seriesBox.height - newHeight) / 2;

            polarSeries.forEach((series) => {
                series.centerX = centerX;
                series.centerY = centerY;
                series.radius = radius;
            });
        }
    }
}
