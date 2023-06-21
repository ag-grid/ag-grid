import { Chart, TransferableResources } from './chart';
import { PolarSeries } from './series/polar/polarSeries';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
import { SeriesNodeDatum } from './series/series';
import { PieSeries } from './series/polar/pieSeries';
import { ChartAxisDirection } from './chartAxisDirection';
import { PolarAxis } from './axis/polarAxis';

export class PolarChart extends Chart {
    static className = 'PolarChart';
    static type = 'polar' as const;

    padding = new Padding(40);

    constructor(document = window.document, overrideDevicePixelRatio?: number, resources?: TransferableResources) {
        super(document, overrideDevicePixelRatio, resources);
    }

    async performLayout() {
        const shrinkRect = await super.performLayout();

        const fullSeriesRect = shrinkRect.clone();
        this.computeSeriesRect(shrinkRect);
        this.computeCircle(shrinkRect);
        this.axes.forEach((axis) => axis.update());

        const hoverRectPadding = 20;
        const hoverRect = shrinkRect.clone().grow(hoverRectPadding);
        this.hoverRect = hoverRect;

        this.layoutService.dispatchLayoutComplete({
            type: 'layout-complete',
            chart: { width: this.scene.width, height: this.scene.height },
            series: { rect: fullSeriesRect, paddedRect: shrinkRect, hoverRect, visible: true },
            axes: [],
        });

        return shrinkRect;
    }

    protected updateAxes(cx: number, cy: number, radius: number) {
        this.axes.forEach((axis) => {
            if (axis.direction === ChartAxisDirection.X) {
                axis.range = [-Math.PI / 2, (3 * Math.PI) / 2];
                axis.gridLength = radius;
                axis.translation.x = cx;
                axis.translation.y = cy;
            } else if (axis.direction === ChartAxisDirection.Y) {
                axis.range = [radius, 0];
                axis.translation.x = cx;
                axis.translation.y = cy - radius;
            }
            axis.updateScale();
        });
    }

    private computeSeriesRect(shrinkRect: BBox) {
        const { seriesAreaPadding } = this;

        shrinkRect.shrink(seriesAreaPadding.left, 'left');
        shrinkRect.shrink(seriesAreaPadding.top, 'top');
        shrinkRect.shrink(seriesAreaPadding.right, 'right');
        shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');

        this.seriesRect = shrinkRect;
    }

    private computeCircle(seriesBox: BBox) {
        const polarSeries = this.series.filter((series): series is PolarSeries<SeriesNodeDatum> => {
            return series instanceof PolarSeries;
        });
        const polarAxes = this.axes.filter((axis): axis is PolarAxis => {
            return axis instanceof PolarAxis;
        });

        const setSeriesCircle = (cx: number, cy: number, r: number) => {
            this.updateAxes(cx, cy, r);
            polarSeries.forEach((series) => {
                series.centerX = cx;
                series.centerY = cy;
                series.radius = r;
            });

            const pieSeries = polarSeries.filter((series): series is PieSeries => series instanceof PieSeries);
            if (pieSeries.length > 1) {
                const innerRadii = pieSeries
                    .map((series) => {
                        const innerRadius = series.getInnerRadius();
                        return { series, innerRadius };
                    })
                    .sort((a, b) => a.innerRadius - b.innerRadius);
                innerRadii[innerRadii.length - 1].series.surroundingRadius = undefined;
                for (let i = 0; i < innerRadii.length - 1; i++) {
                    innerRadii[i].series.surroundingRadius = innerRadii[i + 1].innerRadius;
                }
            }
        };

        const centerX = seriesBox.x + seriesBox.width / 2;
        const centerY = seriesBox.y + seriesBox.height / 2;
        const initialRadius = Math.max(0, Math.min(seriesBox.width, seriesBox.height) / 2);
        let radius = initialRadius;
        setSeriesCircle(centerX, centerY, radius);

        const shake = ({ hideWhenNecessary = false } = {}) => {
            const labelBoxes = [];
            for (const series of [...polarAxes, ...polarSeries]) {
                const box = series.computeLabelsBBox({ hideWhenNecessary }, seriesBox);
                if (box) {
                    labelBoxes.push(box);
                }
            }

            if (labelBoxes.length === 0) {
                setSeriesCircle(centerX, centerY, initialRadius);
                return;
            }

            const labelBox = BBox.merge(labelBoxes);
            const refined = this.refineCircle(labelBox, radius, seriesBox);
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

        return { radius, centerX, centerY };
    }

    private refineCircle(labelsBox: BBox, radius: number, seriesBox: BBox) {
        const minCircleRatio = 0.5; // Prevents reduced circle to be too small

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
