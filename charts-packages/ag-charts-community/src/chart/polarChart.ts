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

        const radiusRatioThreshold = 0.5;
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

            // Label padding around the circle
            let padLeft = Math.max(0, circleLeft - labelBox.x);
            let padTop = Math.max(0, circleTop - labelBox.y);
            let padRight = Math.max(0, labelBox.x + labelBox.width - circleRight);
            let padBottom = Math.max(0, labelBox.y + labelBox.height - circleBottom);

            // Available area for the circle (after the padding will be applied)
            const availCircleWidth = seriesBox.width - padLeft - padRight;
            const availCircleHeight = seriesBox.height - padTop - padBottom;

            let newRadius = Math.min(availCircleWidth, availCircleHeight) / 2;
            const minRadius = (radiusRatioThreshold * Math.min(seriesBox.width, seriesBox.height)) / 2;
            if (newRadius < minRadius) {
                // If the radius is too small, reduce the label padding
                newRadius = minRadius;
                if (padLeft + 2 * newRadius + padRight > seriesBox.width) {
                    const padWidth = seriesBox.width - 2 * newRadius;
                    if (Math.min(padLeft, padRight) * 2 > padWidth) {
                        padLeft = padWidth / 2;
                        padRight = padWidth / 2;
                    } else if (padLeft > padRight) {
                        padLeft = padWidth - padRight;
                    } else {
                        padRight = padWidth - padLeft;
                    }
                }
            }

            const newWidth = padLeft + 2 * newRadius + padRight;
            const newHeight = padTop + 2 * newRadius + padBottom;
            centerX = seriesBox.x + (seriesBox.width - newWidth) / 2 + padLeft + newRadius;
            centerY = seriesBox.y + (seriesBox.height - newHeight) / 2 + padTop + newRadius;
            radius = newRadius;

            polarSeries.forEach((series) => {
                series.centerX = centerX;
                series.centerY = centerY;
                series.radius = radius;
            });
        }
    }
}
