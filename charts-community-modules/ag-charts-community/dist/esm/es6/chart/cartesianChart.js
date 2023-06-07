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
import { Logger } from '../util/logger';
import { toRadians } from '../util/angle';
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
    }
    performLayout() {
        const _super = Object.create(null, {
            performLayout: { get: () => super.performLayout }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const shrinkRect = yield _super.performLayout.call(this);
            const { seriesRect, visibility, clipSeries } = this.updateAxes(shrinkRect);
            this.seriesRoot.visible = visibility.series;
            this.seriesRect = seriesRect;
            this.series.forEach((series) => {
                series.rootGroup.translationX = Math.floor(seriesRect.x);
                series.rootGroup.translationY = Math.floor(seriesRect.y);
            });
            const { seriesRoot, seriesAreaPadding } = this;
            const seriesPaddedRect = seriesRect.clone().grow(seriesAreaPadding);
            const hoverRectPadding = 20;
            const hoverRect = seriesPaddedRect.clone().grow(hoverRectPadding);
            this.hoverRect = hoverRect;
            this.layoutService.dispatchLayoutComplete({
                type: 'layout-complete',
                chart: { width: this.scene.width, height: this.scene.height },
                series: { rect: seriesRect, paddedRect: seriesPaddedRect, hoverRect, visible: visibility.series },
                axes: this.axes.map((axis) => (Object.assign({ id: axis.id }, axis.getLayoutState()))),
            });
            if (clipSeries) {
                seriesRoot.setClipRectInGroupCoordinateSpace(seriesPaddedRect);
            }
            else {
                seriesRoot.setClipRectInGroupCoordinateSpace();
            }
            return shrinkRect;
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
        const crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(axisWidths) : {};
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
                paddedBounds,
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
    buildCrossLinePadding(axisWidths) {
        var _a;
        const crossLinePadding = {};
        this.axes.forEach((axis) => {
            if (axis.crossLines) {
                axis.crossLines.forEach((crossLine) => {
                    crossLine.calculatePadding(crossLinePadding);
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
        const { axis, seriesRect, paddedBounds, axisWidths, newAxisWidths, primaryTickCounts, addInterAxisPadding } = opts;
        let { clipSeries } = opts;
        const { position, direction } = axis;
        const axisLeftRightRange = (axis) => {
            if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };
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
        const paddedBoundsCoefficient = 0.3;
        if (axis.thickness > 0) {
            axis.maxThickness = axis.thickness;
        }
        else if (direction === ChartAxisDirection.Y) {
            axis.maxThickness = paddedBounds.width * paddedBoundsCoefficient;
        }
        else {
            axis.maxThickness = paddedBounds.height * paddedBoundsCoefficient;
        }
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
        axis.updatePosition({ rotation: toRadians(axis.rotation), sideFlag: axis.label.getSideFlag() });
    }
}
CartesianChart.className = 'CartesianChart';
CartesianChart.type = 'cartesian';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuQ2hhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvY2FydGVzaWFuQ2hhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBeUIsTUFBTSxTQUFTLENBQUM7QUFDdkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRWpFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzFELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzFDLE1BQU0sVUFBVSxHQUE4QixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRWpGLE1BQU0sT0FBTyxjQUFlLFNBQVEsS0FBSztJQU9yQyxZQUFZLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLHdCQUFpQyxFQUFFLFNBQWlDO1FBQ3hHLEtBQUssQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFKekQsdUVBQXVFO1FBQ3ZELFdBQU0sR0FBWSxJQUFJLENBQUM7UUEwQy9CLG9CQUFlLEdBQXFEO1lBQ3hFLEdBQUcsRUFBRSxDQUFDO1lBQ04sTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxDQUFDO1NBQ1gsQ0FBQztRQUNNLG9CQUFlLEdBQWtCO1lBQ3JDLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQztJQS9DRixDQUFDO0lBRUssYUFBYTs7Ozs7WUFDZixNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU0sYUFBYSxXQUFFLENB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