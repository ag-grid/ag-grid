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
import { PieSeries } from './series/polar/pieSeries';
export class PolarChart extends Chart {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        super(document, overrideDevicePixelRatio, resources);
        this.padding = new Padding(40);
    }
    performLayout() {
        const _super = Object.create(null, {
            performLayout: { get: () => super.performLayout }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const shrinkRect = yield _super.performLayout.call(this);
            const fullSeriesRect = shrinkRect.clone();
            this.computeSeriesRect(shrinkRect);
            this.computeCircle();
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
        });
    }
    computeSeriesRect(shrinkRect) {
        const { seriesAreaPadding } = this;
        shrinkRect.shrink(seriesAreaPadding.left, 'left');
        shrinkRect.shrink(seriesAreaPadding.top, 'top');
        shrinkRect.shrink(seriesAreaPadding.right, 'right');
        shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');
        this.seriesRect = shrinkRect;
    }
    computeCircle() {
        const seriesBox = this.seriesRect;
        const polarSeries = this.series.filter((series) => {
            return series instanceof PolarSeries;
        });
        const setSeriesCircle = (cx, cy, r) => {
            polarSeries.forEach((series) => {
                series.centerX = cx;
                series.centerY = cy;
                series.radius = r;
            });
            const pieSeries = polarSeries.filter((series) => series instanceof PieSeries);
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
            for (const series of polarSeries) {
                const box = series.computeLabelsBBox({ hideWhenNecessary }, seriesBox);
                if (box == null)
                    continue;
                labelBoxes.push(box);
            }
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
    refineCircle(labelsBox, radius) {
        const minCircleRatio = 0.5; // Prevents reduced circle to be too small
        const seriesBox = this.seriesRect;
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
                }
                else if (padTop > padBottom) {
                    padTop = padHeight - padBottom;
                }
                else {
                    padBottom = padHeight - padTop;
                }
            }
            if (2 * newRadius + horizontalPadding > seriesBox.width) {
                const padWidth = seriesBox.width - 2 * newRadius;
                if (Math.min(padLeft, padRight) * 2 > padWidth) {
                    padLeft = padWidth / 2;
                    padRight = padWidth / 2;
                }
                else if (padLeft > padRight) {
                    padLeft = padWidth - padRight;
                }
                else {
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
PolarChart.className = 'PolarChart';
PolarChart.type = 'polar';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sYXJDaGFydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydC9wb2xhckNoYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQXlCLE1BQU0sU0FBUyxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDMUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFckQsTUFBTSxPQUFPLFVBQVcsU0FBUSxLQUFLO0lBTWpDLFlBQVksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsd0JBQWlDLEVBQUUsU0FBaUM7UUFDeEcsS0FBSyxDQUFDLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUh6RCxZQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFJMUIsQ0FBQztJQUVLLGFBQWE7Ozs7O1lBQ2YsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFNLGFBQWEsV0FBRSxDQUFDO1lBRS9DLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXJCLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzVCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUUzQixJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixD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