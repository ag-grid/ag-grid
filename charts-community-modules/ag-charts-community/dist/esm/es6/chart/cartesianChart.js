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
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { ChartAxisDirection } from './chartAxisDirection';
import { BBox } from '../scene/bbox';
import { Logger } from '../util/logger';
const directions = ['top', 'right', 'bottom', 'left'];
export class CartesianChart extends Chart {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        super(document, overrideDevicePixelRatio, resources);
        /** Integrated Charts feature state - not used in Standalone Charts. */
        this.paired = true;
        this._lastAxisWidths = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        };
        this._lastVisibility = {
            crossLines: true,
            series: true,
        };
        const root = this.scene.root;
        this.legend.attachLegend(root);
    }
    performLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.root.visible = true;
            const { legend, padding, scene: { width, height }, } = this;
            let shrinkRect = new BBox(0, 0, width, height);
            shrinkRect.x += padding.left;
            shrinkRect.y += padding.top;
            shrinkRect.width -= padding.left + padding.right;
            shrinkRect.height -= padding.top + padding.bottom;
            shrinkRect = this.positionCaptions(shrinkRect);
            shrinkRect = this.positionLegend(shrinkRect);
            if (legend.visible && legend.enabled && legend.data.length) {
                const legendPadding = legend.spacing;
                shrinkRect.shrink(legendPadding, legend.position);
            }
            ({ shrinkRect } = this.layoutService.dispatchPerformLayout('before-series', { shrinkRect }));
            const { seriesRect, visibility, clipSeries } = this.updateAxes(shrinkRect);
            this.seriesRoot.visible = visibility.series;
            this.seriesRect = seriesRect;
            this.series.forEach((series) => {
                series.rootGroup.translationX = Math.floor(seriesRect.x);
                series.rootGroup.translationY = Math.floor(seriesRect.y);
            });
            this.layoutService.dispatchLayoutComplete({
                type: 'layout-complete',
                series: { rect: seriesRect, visible: visibility.series },
                axes: this.axes.map((axis) => (Object.assign({ id: axis.id }, axis.getLayoutState()))),
            });
            const { seriesRoot, seriesAreaPadding } = this;
            if (clipSeries) {
                const x = seriesRect.x - seriesAreaPadding.left;
                const y = seriesRect.y - seriesAreaPadding.top;
                const width = seriesAreaPadding.left + seriesRect.width + seriesAreaPadding.right;
                const height = seriesAreaPadding.top + seriesRect.height + seriesAreaPadding.bottom;
                seriesRoot.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
            }
            else {
                seriesRoot.setClipRectInGroupCoordinateSpace();
            }
        });
    }
    updateAxes(inputShrinkRect) {
        var _a;
        // Start with a good approximation from the last update - this should mean that in many resize
        // cases that only a single pass is needed \o/.
        const axisWidths = Object.assign({}, this._lastAxisWidths);
        const visibility = Object.assign({}, this._lastVisibility);
        // Clean any positions which aren't valid with the current axis status (otherwise we end up
        // never being able to find a stable result).
        const liveAxisWidths = new Set(this._axes.map((a) => a.position));
        for (const position of Object.keys(axisWidths)) {
            if (!liveAxisWidths.has(position)) {
                delete axisWidths[position];
            }
        }
        const stableOutputs = (otherAxisWidths, otherVisibility) => {
            // Check for new axis positions.
            if (Object.keys(otherAxisWidths).some((k) => axisWidths[k] == null)) {
                return false;
            }
            return (visibility.crossLines === otherVisibility.crossLines &&
                visibility.series === otherVisibility.series &&
                // Check for existing axis positions and equality.
                Object.entries(axisWidths).every(([p, w]) => {
                    const otherW = otherAxisWidths[p];
                    if (w != null || otherW != null) {
                        return w === otherW;
                    }
                    return true;
                }));
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
        let lastPassAxisWidths = {};
        let lastPassVisibility = {};
        let clipSeries = false;
        let seriesRect = (_a = this.seriesRect) === null || _a === void 0 ? void 0 : _a.clone();
        let count = 0;
        do {
            Object.assign(axisWidths, lastPassAxisWidths);
            Object.assign(visibility, lastPassVisibility);
            const result = this.updateAxesPass(axisWidths, inputShrinkRect.clone(), seriesRect);
            lastPassAxisWidths = ceilValues(result.axisWidths);
            lastPassVisibility = result.visibility;
            clipSeries = result.clipSeries;
            seriesRect = result.seriesRect;
            if (count++ > 10) {
                Logger.warn('unable to find stable axis layout.');
                break;
            }
        } while (!stableOutputs(lastPassAxisWidths, lastPassVisibility));
        const clipRectPadding = 5;
        this.axes.forEach((axis) => {
            // update visibility of crosslines
            axis.setCrossLinesVisible(visibility.crossLines);
            if (!seriesRect) {
                return;
            }
            axis.clipGrid(seriesRect.x, seriesRect.y, seriesRect.width + clipRectPadding, seriesRect.height + clipRectPadding);
            switch (axis.position) {
                case 'left':
                case 'right':
                    axis.clipTickLines(inputShrinkRect.x, seriesRect.y, inputShrinkRect.width + clipRectPadding, seriesRect.height + clipRectPadding);
                    break;
                case 'top':
                case 'bottom':
                    axis.clipTickLines(seriesRect.x, inputShrinkRect.y, seriesRect.width + clipRectPadding, inputShrinkRect.height + clipRectPadding);
                    break;
            }
        });
        this._lastAxisWidths = axisWidths;
        this._lastVisibility = visibility;
        return { seriesRect, visibility, clipSeries };
    }
    updateAxesPass(axisWidths, bounds, lastPassSeriesRect) {
        const { axes } = this;
        const visited = {};
        const newAxisWidths = {};
        const visibility = {
            series: true,
            crossLines: true,
        };
        let clipSeries = false;
        const primaryTickCounts = {};
        const paddedBounds = this.applySeriesPadding(bounds);
        const crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(lastPassSeriesRect, axisWidths) : {};
        const axisBound = this.buildAxisBound(paddedBounds, axisWidths, crossLinePadding, visibility);
        const seriesRect = this.buildSeriesRect(axisBound, axisWidths);
        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach((axis) => {
            var _a, _b;
            const { position } = axis;
            const { clipSeries: newClipSeries, axisThickness, axisOffset, } = this.calculateAxisDimensions({
                axis,
                seriesRect,
                axisWidths,
                newAxisWidths,
                primaryTickCounts,
                clipSeries,
                addInterAxisPadding: ((_a = visited[position]) !== null && _a !== void 0 ? _a : 0) > 0,
            });
            visited[position] = ((_b = visited[position]) !== null && _b !== void 0 ? _b : 0) + 1;
            clipSeries = clipSeries || newClipSeries;
            this.positionAxis({
                axis,
                axisBound,
                axisOffset,
                axisThickness,
                axisWidths,
                primaryTickCounts,
                seriesRect,
            });
        });
        return { clipSeries, seriesRect, axisWidths: newAxisWidths, visibility };
    }
    buildCrossLinePadding(lastPassSeriesRect, axisWidths) {
        var _a;
        const crossLinePadding = {};
        this.axes.forEach((axis) => {
            if (axis.crossLines) {
                axis.crossLines.forEach((crossLine) => {
                    crossLine.calculatePadding(crossLinePadding, lastPassSeriesRect);
                });
            }
        });
        // Reduce cross-line padding to account for overlap with axes.
        for (const [side, padding = 0] of Object.entries(crossLinePadding)) {
            crossLinePadding[side] = Math.max(padding - ((_a = axisWidths[side]) !== null && _a !== void 0 ? _a : 0), 0);
        }
        return crossLinePadding;
    }
    applySeriesPadding(bounds) {
        const paddedRect = bounds.clone();
        const reversedAxes = this.axes.slice().reverse();
        directions.forEach((dir) => {
            const padding = this.seriesAreaPadding[dir];
            const axis = reversedAxes.find((axis) => axis.position === dir);
            if (axis) {
                axis.seriesAreaPadding = padding;
            }
            else {
                paddedRect.shrink(padding, dir);
            }
        });
        return paddedRect;
    }
    buildAxisBound(bounds, axisWidths, crossLinePadding, visibility) {
        var _a, _b, _c, _d;
        const result = bounds.clone();
        const { top = 0, right = 0, bottom = 0, left = 0 } = crossLinePadding;
        const horizontalPadding = left + right;
        const verticalPadding = top + bottom;
        const totalWidth = ((_a = axisWidths.left) !== null && _a !== void 0 ? _a : 0) + ((_b = axisWidths.right) !== null && _b !== void 0 ? _b : 0) + horizontalPadding;
        const totalHeight = ((_c = axisWidths.top) !== null && _c !== void 0 ? _c : 0) + ((_d = axisWidths.bottom) !== null && _d !== void 0 ? _d : 0) + verticalPadding;
        if (result.width <= totalWidth || result.height <= totalHeight) {
            // Not enough space for crossLines and series
            visibility.crossLines = false;
            visibility.series = false;
            return result;
        }
        result.x += left;
        result.y += top;
        result.width -= horizontalPadding;
        result.height -= verticalPadding;
        return result;
    }
    buildSeriesRect(axisBound, axisWidths) {
        const result = axisBound.clone();
        const { top, bottom, left, right } = axisWidths;
        result.x += left !== null && left !== void 0 ? left : 0;
        result.y += top !== null && top !== void 0 ? top : 0;
        result.width -= (left !== null && left !== void 0 ? left : 0) + (right !== null && right !== void 0 ? right : 0);
        result.height -= (top !== null && top !== void 0 ? top : 0) + (bottom !== null && bottom !== void 0 ? bottom : 0);
        // Width and height should not be negative.
        result.width = Math.max(0, result.width);
        result.height = Math.max(0, result.height);
        return result;
    }
    clampToOutsideSeriesRect(seriesRect, value, dimension, direction) {
        const { x, y, width, height } = seriesRect;
        const clampBounds = [x, y, x + width, y + height];
        const fn = direction === 1 ? Math.min : Math.max;
        const compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];
        return fn(value, compareTo);
    }
    calculateAxisDimensions(opts) {
        var _a, _b, _c, _d, _e, _f;
        const { axis, seriesRect, axisWidths, newAxisWidths, primaryTickCounts, addInterAxisPadding } = opts;
        let { clipSeries } = opts;
        const { position, direction } = axis;
        const axisLeftRightRange = (axis) => {
            if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };
        axis.label.mirrored = ['top', 'right'].includes(position);
        const axisOffset = (_a = newAxisWidths[position]) !== null && _a !== void 0 ? _a : 0;
        switch (position) {
            case 'top':
            case 'bottom':
                axis.range = [0, seriesRect.width];
                axis.gridLength = seriesRect.height;
                break;
            case 'right':
            case 'left':
                axis.range = axisLeftRightRange(axis);
                axis.gridLength = seriesRect.width;
                break;
        }
        const zoom = (_b = this.zoomManager.getZoom()) === null || _b === void 0 ? void 0 : _b[axis.direction];
        const { min = 0, max = 1 } = zoom !== null && zoom !== void 0 ? zoom : {};
        axis.visibleRange = [min, max];
        if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
            clipSeries = true;
        }
        let primaryTickCount = axis.nice ? primaryTickCounts[direction] : undefined;
        primaryTickCount = axis.update(primaryTickCount);
        primaryTickCounts[direction] = (_c = primaryTickCounts[direction]) !== null && _c !== void 0 ? _c : primaryTickCount;
        let axisThickness = 0;
        if (axis.thickness) {
            axisThickness = axis.thickness;
        }
        else {
            const bbox = axis.computeBBox();
            axisThickness = direction === ChartAxisDirection.X ? bbox.height : bbox.width;
        }
        // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
        const axisPadding = 15;
        if (addInterAxisPadding) {
            axisThickness += axisPadding;
        }
        axisThickness = Math.ceil(axisThickness);
        newAxisWidths[position] = ((_d = newAxisWidths[position]) !== null && _d !== void 0 ? _d : 0) + axisThickness;
        axis.gridPadding = ((_e = axisWidths[position]) !== null && _e !== void 0 ? _e : 0) - ((_f = newAxisWidths[position]) !== null && _f !== void 0 ? _f : 0);
        return { clipSeries, axisThickness, axisOffset };
    }
    positionAxis(opts) {
        var _a, _b, _c, _d;
        const { axis, axisBound, axisWidths, seriesRect, axisOffset, axisThickness } = opts;
        const { position } = axis;
        switch (position) {
            case 'top':
                axis.translation.x = axisBound.x + ((_a = axisWidths.left) !== null && _a !== void 0 ? _a : 0);
                axis.translation.y = this.clampToOutsideSeriesRect(seriesRect, axisBound.y + 1 + axisOffset + axisThickness, 'y', 1);
                break;
            case 'bottom':
                axis.translation.x = axisBound.x + ((_b = axisWidths.left) !== null && _b !== void 0 ? _b : 0);
                axis.translation.y = this.clampToOutsideSeriesRect(seriesRect, axisBound.y + axisBound.height + 1 - axisThickness - axisOffset, 'y', -1);
                break;
            case 'left':
                axis.translation.y = axisBound.y + ((_c = axisWidths.top) !== null && _c !== void 0 ? _c : 0);
                axis.translation.x = this.clampToOutsideSeriesRect(seriesRect, axisBound.x + axisOffset + axisThickness, 'x', 1);
                break;
            case 'right':
                axis.translation.y = axisBound.y + ((_d = axisWidths.top) !== null && _d !== void 0 ? _d : 0);
                axis.translation.x = this.clampToOutsideSeriesRect(seriesRect, axisBound.x + axisBound.width - axisThickness - axisOffset, 'x', -1);
                break;
        }
        axis.updatePosition();
    }
}
CartesianChart.className = 'CartesianChart';
CartesianChart.type = 'cartesian';
