import { Chart, TransferableResources } from './chart';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { ChartAxis, ChartAxisDirection } from './chartAxis';
import { BBox } from '../scene/bbox';
import { Navigator } from './navigator/navigator';
import { AgCartesianAxisPosition } from './agChartOptions';

type VisibilityMap = { axes: boolean; crossLines: boolean; series: boolean };

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    static type: 'cartesian' | 'groupedCategory' = 'cartesian';

    /** Integrated Charts feature state - not used in Standalone Charts. */
    public readonly paired: boolean = true;

    constructor(document = window.document, overrideDevicePixelRatio?: number, resources?: TransferableResources) {
        super(document, overrideDevicePixelRatio, resources);

        const root = this.scene.root!;
        root.append(this.legend.group);

        this.navigator.enabled = false;
    }

    readonly navigator = new Navigator(this, this.interactionManager);

    async performLayout() {
        this.scene.root!.visible = true;

        const { width, height, legend, navigator } = this;

        let shrinkRect = new BBox(0, 0, width, height);

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
            navigator.y = shrinkRect.y + shrinkRect.height + navigator.margin;
        }

        const { seriesRect, seriesVisible } = this.updateAxes(shrinkRect);

        if (navigator.enabled && seriesVisible) {
            navigator.x = seriesRect.x;
            navigator.width = seriesRect.width;
        }

        this.seriesRoot.visible = seriesVisible;
        legend.visible = seriesVisible;
        navigator.visible = seriesVisible;

        this.seriesRect = seriesRect;
        this.series.forEach((series) => {
            series.rootGroup.translationX = Math.floor(seriesRect.x);
            series.rootGroup.translationY = Math.floor(seriesRect.y);
        });

        const { seriesRoot } = this;
        seriesRoot.x = seriesRect.x;
        seriesRoot.y = seriesRect.y;
        seriesRoot.width = seriesRect.width;
        seriesRoot.height = seriesRect.height;
    }

    private _lastAxisWidths: Partial<Record<AgCartesianAxisPosition, number>> = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    };
    private _lastVisibility: VisibilityMap = {
        axes: true,
        crossLines: true,
        series: true,
    };
    updateAxes(inputShrinkRect: BBox) {
        // Start with a good approximation from the last update - this should mean that in many resize
        // cases that only a single pass is needed \o/.
        const axisWidths = { ...this._lastAxisWidths };
        const visibility = { ...this._lastVisibility };

        // Clean any positions which aren't valid with the current axis status (otherwise we end up
        // never being able to find a stable result).
        const liveAxisWidths = new Set(this._axes.map((a) => a.position));
        for (const position of Object.keys(axisWidths) as AgCartesianAxisPosition[]) {
            if (!liveAxisWidths.has(position)) {
                delete axisWidths[position];
            }
        }

        const stableWidths = <T extends typeof axisWidths>(
            otherAxisWidths: T,
            otherVisibility: Partial<VisibilityMap>
        ) => {
            return (
                visibility.axes === otherVisibility.axes &&
                Object.entries(axisWidths).every(([p, w]) => {
                    const otherW = (otherAxisWidths as any)[p];
                    if (w != null || otherW != null) {
                        return w === otherW;
                    }
                    return true;
                })
            );
        };
        const ceilValues = <T extends Record<string, number | undefined>>(records: T) => {
            return Object.entries(records).reduce((out, [key, value]) => {
                if (value && Math.abs(value) === Infinity) {
                    value = 0;
                }
                out[key] = value != null ? Math.ceil(value) : value;
                return out;
            }, {} as any);
        };

        // Iteratively try to resolve axis widths - since X axis width affects Y axis range,
        // and vice-versa, we need to iteratively try and find a fit for the axes and their
        // ticks/labels.
        let lastPassAxisWidths: typeof axisWidths = {};
        let lastPassVisibility: Partial<VisibilityMap> = {};
        let clipSeries = false;
        let seriesRect = this.seriesRect?.clone();
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
                console.warn('AG Charts - unable to find stable axis layout.');
                break;
            }
        } while (!stableWidths(lastPassAxisWidths, lastPassVisibility));

        this.seriesRoot.enabled = clipSeries;

        visibility.series = seriesRect.width >= 1 && seriesRect.height >= 1;
        visibility.crossLines = visibility.crossLines && visibility.series;

        // update visibility of axes and crosslines
        this.axes.forEach((axis) => {
            axis.setVisible({ axis: visibility.axes, crossLines: visibility.crossLines });
        });

        this._lastAxisWidths = axisWidths;
        this._lastVisibility = visibility;

        return { seriesRect, seriesVisible: visibility.series };
    }

    private updateAxesPass(
        axisWidths: Partial<Record<AgCartesianAxisPosition, number>>,
        bounds: BBox,
        lastPassSeriesRect?: BBox
    ) {
        const { axes } = this;
        const visited: Partial<Record<AgCartesianAxisPosition, number>> = {};
        const newAxisWidths: Partial<Record<AgCartesianAxisPosition, number>> = {};
        const visibility: Partial<VisibilityMap> = {
            axes: true,
            crossLines: true,
        };

        let clipSeries = false;
        let primaryTickCounts: Partial<Record<ChartAxisDirection, number>> = {};

        const crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(lastPassSeriesRect, axisWidths) : {};
        const axisBound = this.buildAxisBound(bounds, crossLinePadding, visibility);

        const seriesRect = this.buildSeriesRect(axisBound, axisWidths);

        if (seriesRect.width === 0 || seriesRect.height === 0) {
            visibility.axes = false;
            visibility.crossLines = false;
            return { clipSeries, seriesRect, axisWidths, visibility };
        }

        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach((axis) => {
            const { position } = axis;

            let {
                clipSeries: newClipSeries,
                axisThickness,
                axisOffset,
            } = this.calculateAxisDimensions({
                axis,
                seriesRect,
                axisWidths,
                newAxisWidths,
                primaryTickCounts,
                clipSeries,
                addInterAxisPadding: (visited[position] ?? 0) > 0,
            });

            visited[position] = (visited[position] ?? 0) + 1;
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

    private buildCrossLinePadding(
        lastPassSeriesRect: BBox,
        axisWidths: Partial<Record<AgCartesianAxisPosition, number>>
    ) {
        const crossLinePadding: Partial<Record<AgCartesianAxisPosition, number>> = {};

        this.axes.forEach((axis) => {
            if (axis.crossLines) {
                axis.crossLines.forEach((crossLine) => {
                    crossLine.calculatePadding(crossLinePadding, lastPassSeriesRect);
                });
            }
        });
        // Reduce cross-line padding to account for overlap with axes.
        for (const [side, padding = 0] of Object.entries(crossLinePadding) as [AgCartesianAxisPosition, number][]) {
            crossLinePadding[side] = Math.max(padding - (axisWidths[side] ?? 0), 0);
        }

        return crossLinePadding;
    }

    private buildAxisBound(
        bounds: BBox,
        crossLinePadding: Partial<Record<AgCartesianAxisPosition, number>>,
        visibility: Partial<VisibilityMap>
    ) {
        const result = bounds.clone();
        const { top = 0, right = 0, bottom = 0, left = 0 } = crossLinePadding;
        const horizontalPadding = left + right;
        const verticalPadding = top + bottom;
        if (result.width <= horizontalPadding || result.height <= verticalPadding) {
            // Not enough space for crossLines padding, hide crossLines and don't consider padding for axisBound
            visibility.crossLines = false;
            return result;
        }

        result.x += left;
        result.y += top;
        result.width -= horizontalPadding;
        result.height -= verticalPadding;

        return result;
    }

    private buildSeriesRect(axisBound: BBox, axisWidths: Partial<Record<AgCartesianAxisPosition, number>>) {
        let result = axisBound.clone();
        const { top, bottom, left, right } = axisWidths;
        result.x += left ?? 0;
        result.y += top ?? 0;
        result.width -= (left ?? 0) + (right ?? 0);
        result.height -= (top ?? 0) + (bottom ?? 0);

        // Width and height should not be negative.
        result.width = Math.max(0, Math.round(result.width));
        result.height = Math.max(0, Math.round(result.height));

        return result;
    }

    private clampToOutsideSeriesRect(seriesRect: BBox, value: number, dimension: 'x' | 'y', direction: -1 | 1) {
        const { x, y, width, height } = seriesRect;
        const clampBounds = [x, y, x + width, y + height];
        const fn = direction === 1 ? Math.min : Math.max;
        const compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];

        return fn(value, compareTo);
    }

    private calculateAxisDimensions(opts: {
        axis: ChartAxis;
        seriesRect: BBox;
        axisWidths: Partial<Record<AgCartesianAxisPosition, number>>;
        newAxisWidths: Partial<Record<AgCartesianAxisPosition, number>>;
        primaryTickCounts: Partial<Record<ChartAxisDirection, number>>;
        clipSeries: boolean;
        addInterAxisPadding: boolean;
    }) {
        const { axis, seriesRect, axisWidths, newAxisWidths, primaryTickCounts, addInterAxisPadding } = opts;
        let { clipSeries } = opts;
        const { navigator } = this;
        const { position, direction } = axis;

        const axisLeftRightRange = (axis: ChartAxis<any>) => {
            if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };

        axis.label.mirrored = ['top', 'right'].includes(position);

        const axisOffset = newAxisWidths[position] ?? 0;
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

        if (axis.direction === ChartAxisDirection.X) {
            let { min, max, enabled } = navigator;
            if (enabled) {
                axis.visibleRange = [min, max];
            } else {
                axis.visibleRange = [0, 1];
            }
        }
        if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
            clipSeries = true;
        }

        let primaryTickCount = axis.nice ? primaryTickCounts[direction] : undefined;
        primaryTickCount = axis.update(primaryTickCount);
        primaryTickCounts[direction] = primaryTickCounts[direction] ?? primaryTickCount;

        let axisThickness = 0;
        if (axis.thickness) {
            axisThickness = axis.thickness;
        } else {
            const bbox = axis.computeBBox();
            axisThickness = direction === ChartAxisDirection.X ? bbox.height : bbox.width;
        }

        // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
        const axisPadding = 15;
        if (addInterAxisPadding) {
            axisThickness += axisPadding;
        }
        axisThickness = Math.ceil(axisThickness);
        newAxisWidths[position] = (newAxisWidths[position] ?? 0) + axisThickness;

        axis.gridPadding = (axisWidths[position] ?? 0) - (newAxisWidths[position] ?? 0);

        return { clipSeries, axisThickness, axisOffset };
    }

    private positionAxis(opts: {
        axis: ChartAxis;
        axisBound: BBox;
        axisWidths: Partial<Record<AgCartesianAxisPosition, number>>;
        primaryTickCounts: Partial<Record<ChartAxisDirection, number>>;
        seriesRect: BBox;
        axisOffset: number;
        axisThickness: number;
    }) {
        const { axis, axisBound, axisWidths, seriesRect, axisOffset, axisThickness } = opts;
        const { position } = axis;

        switch (position) {
            case 'top':
                axis.translation.x = axisBound.x + (axisWidths.left ?? 0);
                axis.translation.y = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.y + 1 + axisOffset + axisThickness,
                    'y',
                    1
                );
                break;
            case 'bottom':
                axis.translation.x = axisBound.x + (axisWidths.left ?? 0);
                axis.translation.y = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.y + axisBound.height + 1 - axisThickness - axisOffset,
                    'y',
                    -1
                );
                break;
            case 'left':
                axis.translation.y = axisBound.y + (axisWidths.top ?? 0);
                axis.translation.x = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.x + axisOffset + axisThickness,
                    'x',
                    1
                );
                break;
            case 'right':
                axis.translation.y = axisBound.y + (axisWidths.top ?? 0);
                axis.translation.x = this.clampToOutsideSeriesRect(
                    seriesRect,
                    axisBound.x + axisBound.width - axisThickness - axisOffset,
                    'x',
                    -1
                );
                break;
        }

        axis.updatePosition();
    }
}
