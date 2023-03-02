import { Chart, TransferableResources } from './chart';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { ChartAxis } from './chartAxis';
import { ChartAxisDirection } from './chartAxisDirection';
import { BBox } from '../scene/bbox';
import { AgCartesianAxisPosition } from './agChartOptions';
import { Logger } from '../util/logger';

type VisibilityMap = { crossLines: boolean; series: boolean };

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    static type = 'cartesian';

    /** Integrated Charts feature state - not used in Standalone Charts. */
    public readonly paired: boolean = true;

    constructor(document = window.document, overrideDevicePixelRatio?: number, resources?: TransferableResources) {
        super(document, overrideDevicePixelRatio, resources);

        const root = this.scene.root!;
        this.legend.attachLegend(root);
    }

    async performLayout() {
        this.scene.root!.visible = true;

        const { width, height, legend, padding } = this;

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
        });

        const { seriesRoot } = this;
        if (clipSeries) {
            const { x, y, width, height } = seriesRect;
            seriesRoot.setClipRectInGroupCoordinateSystem(new BBox(x, y, width, height));
        } else {
            seriesRoot.setClipRectInGroupCoordinateSystem(undefined);
        }
    }

    private _lastAxisWidths: Partial<Record<AgCartesianAxisPosition, number>> = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    };
    private _lastVisibility: VisibilityMap = {
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

        const stableOutputs = <T extends typeof axisWidths>(
            otherAxisWidths: T,
            otherVisibility: Partial<VisibilityMap>
        ) => {
            // Check for new axis positions.
            if (Object.keys(otherAxisWidths).some((k) => (axisWidths as any)[k] == null)) {
                return false;
            }
            return (
                visibility.crossLines === otherVisibility.crossLines &&
                visibility.series === otherVisibility.series &&
                // Check for existing axis positions and equality.
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

    private updateAxesPass(
        axisWidths: Partial<Record<AgCartesianAxisPosition, number>>,
        bounds: BBox,
        lastPassSeriesRect?: BBox
    ) {
        const { axes } = this;
        const visited: Partial<Record<AgCartesianAxisPosition, number>> = {};
        const newAxisWidths: Partial<Record<AgCartesianAxisPosition, number>> = {};
        const visibility: Partial<VisibilityMap> = {
            series: true,
            crossLines: true,
        };

        let clipSeries = false;
        const primaryTickCounts: Partial<Record<ChartAxisDirection, number>> = {};

        const crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(lastPassSeriesRect, axisWidths) : {};
        const axisBound = this.buildAxisBound(bounds, axisWidths, crossLinePadding, visibility);

        const seriesRect = this.buildSeriesRect(axisBound, axisWidths);

        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach((axis) => {
            const { position } = axis;

            const {
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
        axisWidths: Partial<Record<AgCartesianAxisPosition, number>>,
        crossLinePadding: Partial<Record<AgCartesianAxisPosition, number>>,
        visibility: Partial<VisibilityMap>
    ) {
        const result = bounds.clone();
        const { top = 0, right = 0, bottom = 0, left = 0 } = crossLinePadding;
        const horizontalPadding = left + right;
        const verticalPadding = top + bottom;
        const totalWidth = (axisWidths.left ?? 0) + (axisWidths.right ?? 0) + horizontalPadding;
        const totalHeight = (axisWidths.top ?? 0) + (axisWidths.bottom ?? 0) + verticalPadding;
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

    private buildSeriesRect(axisBound: BBox, axisWidths: Partial<Record<AgCartesianAxisPosition, number>>) {
        const result = axisBound.clone();
        const { top, bottom, left, right } = axisWidths;
        result.x += left ?? 0;
        result.y += top ?? 0;
        result.width -= (left ?? 0) + (right ?? 0);
        result.height -= (top ?? 0) + (bottom ?? 0);

        // Width and height should not be negative.
        result.width = Math.max(0, result.width);
        result.height = Math.max(0, result.height);

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

        const zoom = this.zoomManager.getZoom()?.[axis.direction];
        const { min = 0, max = 1 } = zoom ?? {};
        axis.visibleRange = [min, max];

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
