"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarChart = void 0;
const chart_1 = require("./chart");
const polarSeries_1 = require("./series/polar/polarSeries");
const padding_1 = require("../util/padding");
const bbox_1 = require("../scene/bbox");
class PolarChart extends chart_1.Chart {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        super(document, overrideDevicePixelRatio, resources);
        this.padding = new padding_1.Padding(40);
        const root = this.scene.root;
        this.legend.attachLegend(root);
    }
    performLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.root.visible = true;
            const { width, height, padding } = this;
            let shrinkRect = new bbox_1.BBox(0, 0, width, height);
            shrinkRect.shrink(padding.left, 'left');
            shrinkRect.shrink(padding.top, 'top');
            shrinkRect.shrink(padding.right, 'right');
            shrinkRect.shrink(padding.bottom, 'bottom');
            shrinkRect = this.positionCaptions(shrinkRect);
            shrinkRect = this.positionLegend(shrinkRect);
            this.computeSeriesRect(shrinkRect);
            this.computeCircle();
        });
    }
    computeSeriesRect(shrinkRect) {
        const { legend } = this;
        if (legend.visible && legend.enabled && legend.data.length) {
            const legendPadding = legend.spacing;
            shrinkRect.shrink(legendPadding, legend.position);
        }
        this.seriesRect = shrinkRect;
    }
    computeCircle() {
        const seriesBox = this.seriesRect;
        const polarSeries = this.series.filter((series) => {
            return series instanceof polarSeries_1.PolarSeries;
        });
        const setSeriesCircle = (cx, cy, r) => {
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
                .filter((box) => box != null);
            if (labelBoxes.length === 0) {
                setSeriesCircle(centerX, centerY, initialRadius);
                return;
            }
            const labelBox = bbox_1.BBox.merge(labelBoxes);
            const refined = this.refineCircle(labelBox, radius);
            setSeriesCircle(refined.centerX, refined.centerY, refined.radius);
            if (refined.radius === radius) {
                return;
            }
            radius = refined.radius;
        };
        shake(); // Initial attempt
        shake(); // Precise attempt
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
            if (newRadius === minVerticalRadius) {
                const t = seriesBox.height / (newRadius * 2 + padTop + padBottom);
                padTop *= t;
                padBottom *= t;
            }
            if (newRadius === minHorizontalRadius) {
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
exports.PolarChart = PolarChart;
PolarChart.className = 'PolarChart';
PolarChart.type = 'polar';
