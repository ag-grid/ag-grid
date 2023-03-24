import { Chart, TransferableResources } from './chart';
import { PolarSeries } from './series/polar/polarSeries';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
import { SeriesNodeDatum } from './series/series';

export class PolarChart extends Chart {
    static className = 'PolarChart';
    static type = 'polar' as const;

    padding = new Padding(40);

    constructor(document = window.document, overrideDevicePixelRatio?: number, resources?: TransferableResources) {
        super(document, overrideDevicePixelRatio, resources);

        const root = this.scene.root!;
        this.legend.attachLegend(root);
    }

    async performLayout() {
        this.scene.root!.visible = true;

        const {
            padding,
            scene: { width, height },
        } = this;

        let shrinkRect = new BBox(0, 0, width, height);
        shrinkRect.shrink(padding.left, 'left');
        shrinkRect.shrink(padding.top, 'top');
        shrinkRect.shrink(padding.right, 'right');
        shrinkRect.shrink(padding.bottom, 'bottom');

        shrinkRect = this.positionCaptions(shrinkRect);
        shrinkRect = this.positionLegend(shrinkRect);
        this.computeSeriesRect(shrinkRect);
        this.computeCircle();
    }

    private computeSeriesRect(shrinkRect: BBox) {
        const { legend, seriesAreaPadding } = this;

        if (legend.visible && legend.enabled && legend.data.length) {
            const legendPadding = legend.spacing;
            shrinkRect.shrink(legendPadding, legend.position);
        }

        shrinkRect.shrink(seriesAreaPadding.left, 'left');
        shrinkRect.shrink(seriesAreaPadding.top, 'top');
        shrinkRect.shrink(seriesAreaPadding.right, 'right');
        shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');

        this.seriesRect = shrinkRect;
    }

    private computeCircle() {
        const seriesBox = this.seriesRect!;
        const polarSeries = this.series.filter((series) => {
            return series instanceof PolarSeries;
        }) as PolarSeries<SeriesNodeDatum>[];

        const setSeriesCircle = (cx: number, cy: number, r: number) => {
            polarSeries.forEach((series) => {
                series.centerX = cx;
                series.centerY = cy;
                series.radius = r;
            });
        };

        const centerX = seriesBox.x + seriesBox.width / 2;
        const centerY = seriesBox.y + seriesBox.height / 2;
        const initialRadius = Math.max(0, Math.min(seriesBox.width, seriesBox.height) / 2);
        let radius = initialRadius;
        setSeriesCircle(centerX, centerY, radius);

        const shake = ({ hideWhenNecessary = false } = {}) => {
            const labelBoxes = polarSeries
                .map((series) => series.computeLabelsBBox({ hideWhenNecessary }))
                .filter((box) => box != null) as BBox[];
            if (labelBoxes.length === 0) {
                setSeriesCircle(centerX, centerY, initialRadius);
                return;
            }

            const labelBox = BBox.merge(labelBoxes);
            const refined = this.refineCircle(labelBox, radius);
            setSeriesCircle(refined.centerX, refined.centerY, refined.radius);

            if (refined.radius === radius) {
                return;
            }

            radius = refined.radius;
        };

        shake(); // Initial attempt
        shake(); // Precise attempt
        shake(); // Just in case
        shake({ hideWhenNecessary: true }); // Hide unnecessary labels
        shake({ hideWhenNecessary: true }); // Final result
    }

    private refineCircle(labelsBox: BBox, radius: number) {
        const minCircleRatio = 0.5; // Prevents reduced circle to be too small

        const seriesBox = this.seriesRect!;
        const circleLeft = -radius;
        const circleTop = -radius;
        const circleRight = radius;
        const circleBottom = radius;

        // Label padding around the circle
        let padLeft = Math.max(0, circleLeft - labelsBox.x);
        let padTop = Math.max(0, circleTop - labelsBox.y);
        let padRight = Math.max(0, labelsBox.x + labelsBox.width - circleRight);
        let padBottom = Math.max(0, labelsBox.y + labelsBox.height - circleBottom);

        // Available area for the circle (after the padding will be applied)
        const availCircleWidth = seriesBox.width - padLeft - padRight;
        const availCircleHeight = seriesBox.height - padTop - padBottom;

        let newRadius = Math.min(availCircleWidth, availCircleHeight) / 2;
        const minHorizontalRadius = (minCircleRatio * seriesBox.width) / 2;
        const minVerticalRadius = (minCircleRatio * seriesBox.height) / 2;
        const minRadius = Math.min(minHorizontalRadius, minVerticalRadius);
        if (newRadius < minRadius) {
            // If the radius is too small, reduce the label padding
            newRadius = minRadius;
            const horizontalPadding = padLeft + padRight;
            const verticalPadding = padTop + padBottom;
            if (2 * newRadius + verticalPadding > seriesBox.height) {
                const padHeight = seriesBox.height - 2 * newRadius;
                if (Math.min(padTop, padBottom) * 2 > padHeight) {
                    padTop = padHeight / 2;
                    padBottom = padHeight / 2;
                } else if (padTop > padBottom) {
                    padTop = padHeight - padBottom;
                } else {
                    padBottom = padHeight - padTop;
                }
            }

            if (2 * newRadius + horizontalPadding > seriesBox.width) {
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

        return {
            centerX: seriesBox.x + (seriesBox.width - newWidth) / 2 + padLeft + newRadius,
            centerY: seriesBox.y + (seriesBox.height - newHeight) / 2 + padTop + newRadius,
            radius: newRadius,
        };
    }
}
