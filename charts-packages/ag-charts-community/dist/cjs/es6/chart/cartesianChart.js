"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chart_1 = require("./chart");
const categoryAxis_1 = require("./axis/categoryAxis");
const groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
const chartAxis_1 = require("./chartAxis");
const bbox_1 = require("../scene/bbox");
const clipRect_1 = require("../scene/clipRect");
const navigator_1 = require("./navigator/navigator");
class CartesianChart extends chart_1.Chart {
    constructor(document = window.document) {
        super(document);
        this.seriesRoot = new clipRect_1.ClipRect();
        this.navigator = new navigator_1.Navigator(this);
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root.visible = false;
        const root = this.scene.root;
        root.append(this.seriesRoot);
        root.append(this.legend.group);
        this.navigator.enabled = false;
    }
    performLayout() {
        this.scene.root.visible = true;
        const { width, height, legend, navigator } = this;
        let shrinkRect = new bbox_1.BBox(0, 0, width, height);
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
        if (navigator.enabled) {
            const navigatorTotalHeight = navigator.height + navigator.margin;
            shrinkRect.height -= navigatorTotalHeight;
            navigator.x = shrinkRect.x;
            navigator.y = shrinkRect.y + shrinkRect.height + navigator.margin;
            navigator.width = shrinkRect.width;
        }
        const { seriesRect } = this.updateAxes(shrinkRect);
        this.seriesRect = seriesRect;
        this.series.forEach((series) => {
            series.group.translationX = Math.floor(seriesRect.x);
            series.group.translationY = Math.floor(seriesRect.y);
        });
        const { seriesRoot } = this;
        seriesRoot.x = seriesRect.x;
        seriesRoot.y = seriesRect.y;
        seriesRoot.width = seriesRect.width;
        seriesRoot.height = seriesRect.height;
    }
    setupDomListeners(chartElement) {
        super.setupDomListeners(chartElement);
        this._onTouchStart = this.onTouchStart.bind(this);
        this._onTouchMove = this.onTouchMove.bind(this);
        this._onTouchEnd = this.onTouchEnd.bind(this);
        this._onTouchCancel = this.onTouchCancel.bind(this);
        chartElement.addEventListener('touchstart', this._onTouchStart, { passive: true });
        chartElement.addEventListener('touchmove', this._onTouchMove, { passive: true });
        chartElement.addEventListener('touchend', this._onTouchEnd, { passive: true });
        chartElement.addEventListener('touchcancel', this._onTouchCancel, { passive: true });
    }
    cleanupDomListeners(chartElement) {
        super.cleanupDomListeners(chartElement);
        chartElement.removeEventListener('touchstart', this._onTouchStart);
        chartElement.removeEventListener('touchmove', this._onTouchMove);
        chartElement.removeEventListener('touchend', this._onTouchEnd);
        chartElement.removeEventListener('touchcancel', this._onTouchCancel);
    }
    getTouchOffset(event) {
        const rect = this.scene.canvas.element.getBoundingClientRect();
        const touch = event.touches[0];
        return touch
            ? {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top,
            }
            : undefined;
    }
    onTouchStart(event) {
        const offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDragStart(offset);
        }
    }
    onTouchMove(event) {
        const offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDrag(offset);
        }
    }
    onTouchEnd(_event) {
        this.navigator.onDragStop();
    }
    onTouchCancel(_event) {
        this.navigator.onDragStop();
    }
    onMouseDown(event) {
        super.onMouseDown(event);
        this.navigator.onDragStart(event);
    }
    onMouseMove(event) {
        super.onMouseMove(event);
        this.navigator.onDrag(event);
    }
    onMouseUp(event) {
        super.onMouseUp(event);
        this.navigator.onDragStop();
    }
    onMouseOut(event) {
        super.onMouseOut(event);
        this.navigator.onDragStop();
    }
    updateAxes(inputShrinkRect) {
        const axisWidths = {
            [chartAxis_1.ChartAxisPosition.Top]: 0,
            [chartAxis_1.ChartAxisPosition.Bottom]: 0,
            [chartAxis_1.ChartAxisPosition.Left]: 0,
            [chartAxis_1.ChartAxisPosition.Right]: 0,
        };
        const stableWidths = (other) => {
            return Object.entries(axisWidths).every(([p, w]) => {
                const otherW = other[p];
                if (w || otherW) {
                    return w === otherW;
                }
                return true;
            });
        };
        const ceilValues = (records) => {
            return Object.entries(records).reduce((out, [key, value]) => {
                if (value && Math.abs(value) === Infinity) {
                    value = 0;
                }
                out[key] = value != null ? Math.ceil(value) : value;
                return out;
            }, {});
        };
        // Iteratively try to resolve axis widths - since X axis width affects Y axis range,
        // and vice-versa, we need to iteratively try and find a fit for the axes and their
        // ticks/labels.
        let lastPass = {};
        let clipSeries = false;
        let seriesRect = undefined;
        let count = 0;
        do {
            Object.assign(axisWidths, lastPass);
            const result = this.updateAxesPass(axisWidths, inputShrinkRect.clone(), seriesRect);
            lastPass = ceilValues(result.axisWidths);
            clipSeries = result.clipSeries;
            seriesRect = result.seriesRect;
            if (count++ > 10) {
                throw new Error('AG Charts - unable to find stable axis layout.');
            }
        } while (!stableWidths(lastPass));
        this.seriesRoot.enabled = clipSeries;
        return { seriesRect };
    }
    updateAxesPass(axisWidths, bounds, lastPassSeriesRect) {
        const { navigator, axes } = this;
        const visited = {};
        const newAxisWidths = {};
        let clipSeries = false;
        let primaryTickCounts = {};
        const crossLinePadding = {};
        if (lastPassSeriesRect) {
            this.axes.forEach((axis) => {
                if (axis.crossLines) {
                    axis.crossLines.forEach((crossLine) => {
                        crossLine.calculatePadding(crossLinePadding, lastPassSeriesRect);
                    });
                }
            });
        }
        const buildAxisBound = () => {
            const result = bounds.clone();
            const { top = 0, right = 0, bottom = 0, left = 0 } = crossLinePadding;
            result.x += left;
            result.y += top;
            result.width -= left + right;
            result.height -= top + bottom;
            return result;
        };
        const axisBound = buildAxisBound();
        const buildSeriesRect = () => {
            let result = axisBound.clone();
            const { top, bottom, left, right } = axisWidths;
            result.x += (left !== null && left !== void 0 ? left : 0);
            result.y += (top !== null && top !== void 0 ? top : 0);
            result.width -= ((left !== null && left !== void 0 ? left : 0)) + ((right !== null && right !== void 0 ? right : 0));
            result.height -= ((top !== null && top !== void 0 ? top : 0)) + ((bottom !== null && bottom !== void 0 ? bottom : 0));
            // Width and height should not be negative.
            result.width = Math.max(0, result.width);
            result.height = Math.max(0, result.height);
            return result;
        };
        const seriesRect = buildSeriesRect();
        const clampToOutsideSeriesRect = (value, dimension, direction) => {
            const { x, y, width, height } = seriesRect;
            const clampBounds = [x, y, x + width, y + height];
            const fn = direction === 1 ? Math.min : Math.max;
            const compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];
            return fn(value, compareTo);
        };
        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach((axis) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const { position, direction } = axis;
            visited[position] = (_a = visited[position], (_a !== null && _a !== void 0 ? _a : 0)) + 1;
            const axisLeftRightRange = (axis) => {
                if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                    return [0, seriesRect.height];
                }
                return [seriesRect.height, 0];
            };
            axis.label.mirrored = ['top', 'right'].includes(position);
            const axisOffset = (_b = newAxisWidths[position], (_b !== null && _b !== void 0 ? _b : 0));
            switch (position) {
                case chartAxis_1.ChartAxisPosition.Top:
                case chartAxis_1.ChartAxisPosition.Bottom:
                    axis.range = [0, seriesRect.width];
                    axis.gridLength = seriesRect.height;
                    break;
                case chartAxis_1.ChartAxisPosition.Right:
                case chartAxis_1.ChartAxisPosition.Left:
                    axis.range = axisLeftRightRange(axis);
                    axis.gridLength = seriesRect.width;
                    break;
            }
            axis.calculateTickCount();
            if (axis.direction === chartAxis_1.ChartAxisDirection.X) {
                let { min, max, enabled } = navigator;
                if (enabled) {
                    axis.visibleRange = [min, max];
                }
                else {
                    axis.visibleRange = [0, 1];
                }
            }
            if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
                clipSeries = true;
            }
            let primaryTickCount = primaryTickCounts[axis.direction];
            ({ primaryTickCount } = axis.calculateDomain({ primaryTickCount }));
            primaryTickCounts[axis.direction] = primaryTickCount;
            axis.update();
            let axisThickness = 0;
            if (axis.thickness) {
                axisThickness = axis.thickness;
            }
            else {
                const bbox = axis.computeBBox();
                axisThickness = direction === chartAxis_1.ChartAxisDirection.X ? bbox.height : bbox.width;
            }
            // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
            const axisPadding = 15;
            const visitCount = (_c = visited[position], (_c !== null && _c !== void 0 ? _c : 0));
            if (visitCount > 1) {
                axisThickness += axisPadding;
            }
            axisThickness = Math.ceil(axisThickness);
            switch (position) {
                case chartAxis_1.ChartAxisPosition.Top:
                    axis.translation.x = axisBound.x + (_d = axisWidths.left, (_d !== null && _d !== void 0 ? _d : 0));
                    axis.translation.y = clampToOutsideSeriesRect(axisBound.y + 1 + axisOffset + axisThickness, 'y', 1);
                    break;
                case chartAxis_1.ChartAxisPosition.Bottom:
                    axis.translation.x = axisBound.x + (_e = axisWidths.left, (_e !== null && _e !== void 0 ? _e : 0));
                    axis.translation.y = clampToOutsideSeriesRect(axisBound.y + axisBound.height + 1 - axisThickness - axisOffset, 'y', -1);
                    break;
                case chartAxis_1.ChartAxisPosition.Left:
                    axis.translation.y = axisBound.y + (_f = axisWidths.top, (_f !== null && _f !== void 0 ? _f : 0));
                    axis.translation.x = clampToOutsideSeriesRect(axisBound.x + axisOffset + axisThickness, 'x', 1);
                    break;
                case chartAxis_1.ChartAxisPosition.Right:
                    axis.translation.y = axisBound.y + (_g = axisWidths.top, (_g !== null && _g !== void 0 ? _g : 0));
                    axis.translation.x = clampToOutsideSeriesRect(axisBound.x + axisBound.width - axisThickness - axisOffset, 'x', -1);
                    break;
            }
            axis.update();
            newAxisWidths[position] = (_h = newAxisWidths[position], (_h !== null && _h !== void 0 ? _h : 0)) + axisThickness;
        });
        return { clipSeries, seriesRect, axisWidths: newAxisWidths };
    }
}
exports.CartesianChart = CartesianChart;
CartesianChart.className = 'CartesianChart';
CartesianChart.type = 'cartesian';
