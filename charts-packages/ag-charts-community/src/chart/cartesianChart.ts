import { Chart } from './chart';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { ChartAxis, ChartAxisPosition, ChartAxisDirection } from './chartAxis';
import { BBox } from '../scene/bbox';
import { ClipRect } from '../scene/clipRect';
import { Navigator } from './navigator/navigator';

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    static type: 'cartesian' | 'groupedCategory' = 'cartesian';

    constructor(document = window.document, overrideDevicePixelRatio?: number) {
        super(document, overrideDevicePixelRatio);

        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root!!.visible = false;

        const root = this.scene.root!;
        root.append(this.seriesRoot);
        root.append(this.legend.group);

        this.navigator.enabled = false;
    }

    readonly seriesRoot = new ClipRect();
    readonly navigator = new Navigator(this);

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

    private _onTouchStart: any;
    private _onTouchMove: any;
    private _onTouchEnd: any;
    private _onTouchCancel: any;

    protected setupDomListeners(chartElement: HTMLCanvasElement) {
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

    protected cleanupDomListeners(chartElement: HTMLCanvasElement) {
        super.cleanupDomListeners(chartElement);

        chartElement.removeEventListener('touchstart', this._onTouchStart);
        chartElement.removeEventListener('touchmove', this._onTouchMove);
        chartElement.removeEventListener('touchend', this._onTouchEnd);
        chartElement.removeEventListener('touchcancel', this._onTouchCancel);
    }

    private getTouchOffset(event: TouchEvent): { offsetX: number; offsetY: number } | undefined {
        const rect = this.scene.canvas.element.getBoundingClientRect();
        const touch = event.touches[0];
        return touch
            ? {
                  offsetX: touch.clientX - rect.left,
                  offsetY: touch.clientY - rect.top,
              }
            : undefined;
    }

    protected onTouchStart(event: TouchEvent) {
        const offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDragStart(offset);
        }
    }

    protected onTouchMove(event: TouchEvent) {
        const offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDrag(offset);
        }
    }

    protected onTouchEnd(_event: TouchEvent) {
        this.navigator.onDragStop();
    }

    protected onTouchCancel(_event: TouchEvent) {
        this.navigator.onDragStop();
    }

    protected onMouseDown(event: MouseEvent) {
        super.onMouseDown(event);
        this.navigator.onDragStart(event);
    }

    protected onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        this.navigator.onDrag(event);
    }

    protected onMouseUp(event: MouseEvent) {
        super.onMouseUp(event);
        this.navigator.onDragStop();
    }

    protected onMouseOut(event: MouseEvent) {
        super.onMouseOut(event);
        this.navigator.onDragStop();
    }

    updateAxes(inputShrinkRect: BBox) {
        const axisWidths: Partial<Record<ChartAxisPosition, number>> = {
            [ChartAxisPosition.Top]: 0,
            [ChartAxisPosition.Bottom]: 0,
            [ChartAxisPosition.Left]: 0,
            [ChartAxisPosition.Right]: 0,
        };

        const stableWidths = <T extends typeof axisWidths>(other: T) => {
            return Object.entries(axisWidths).every(([p, w]) => {
                const otherW = (other as any)[p];
                if (w || otherW) {
                    return w === otherW;
                }
                return true;
            });
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
        let lastPass: typeof axisWidths = {};
        let clipSeries = false;
        let seriesRect: BBox | undefined = undefined;
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

    private updateAxesPass(
        axisWidths: Partial<Record<ChartAxisPosition, number>>,
        bounds: BBox,
        lastPassSeriesRect?: BBox
    ) {
        const { navigator, axes } = this;
        const visited: Partial<Record<ChartAxisPosition, number>> = {};
        const newAxisWidths: Partial<Record<ChartAxisPosition, number>> = {};

        let clipSeries = false;
        let primaryTickCounts: Partial<Record<ChartAxisDirection, number>> = {};

        const crossLinePadding: Partial<Record<ChartAxisPosition, number>> = {};

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
            result.x += left ?? 0;
            result.y += top ?? 0;
            result.width -= (left ?? 0) + (right ?? 0);
            result.height -= (top ?? 0) + (bottom ?? 0);

            // Width and height should not be negative.
            result.width = Math.max(0, result.width);
            result.height = Math.max(0, result.height);

            return result;
        };
        const seriesRect = buildSeriesRect();

        const clampToOutsideSeriesRect = (value: number, dimension: 'x' | 'y', direction: -1 | 1) => {
            const { x, y, width, height } = seriesRect;
            const clampBounds = [x, y, x + width, y + height];
            const fn = direction === 1 ? Math.min : Math.max;
            const compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];

            return fn(value, compareTo);
        };

        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach((axis) => {
            const { position, direction } = axis;
            visited[position] = (visited[position] ?? 0) + 1;

            const axisLeftRightRange = (axis: ChartAxis<any>) => {
                if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                    return [0, seriesRect.height];
                }
                return [seriesRect.height, 0];
            };

            axis.label.mirrored = ['top', 'right'].includes(position);

            const axisOffset = newAxisWidths[position] ?? 0;
            switch (position) {
                case ChartAxisPosition.Top:
                case ChartAxisPosition.Bottom:
                    axis.range = [0, seriesRect.width];
                    axis.gridLength = seriesRect.height;
                    break;
                case ChartAxisPosition.Right:
                case ChartAxisPosition.Left:
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

            let primaryTickCount = primaryTickCounts[axis.direction];
            ({ primaryTickCount } = axis.calculateDomain({ primaryTickCount }));
            primaryTickCounts[axis.direction] = primaryTickCount;

            axis.update();

            let axisThickness = 0;
            if (axis.thickness) {
                axisThickness = axis.thickness;
            } else {
                const bbox = axis.computeBBox();
                axisThickness = direction === ChartAxisDirection.X ? bbox.height : bbox.width;
            }

            // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
            const axisPadding = 15;
            const visitCount = visited[position] ?? 0;
            if (visitCount > 1) {
                axisThickness += axisPadding;
            }
            axisThickness = Math.ceil(axisThickness);

            switch (position) {
                case ChartAxisPosition.Top:
                    axis.translation.x = axisBound.x + (axisWidths.left ?? 0);
                    axis.translation.y = clampToOutsideSeriesRect(axisBound.y + 1 + axisOffset + axisThickness, 'y', 1);
                    break;
                case ChartAxisPosition.Bottom:
                    axis.translation.x = axisBound.x + (axisWidths.left ?? 0);
                    axis.translation.y = clampToOutsideSeriesRect(
                        axisBound.y + axisBound.height + 1 - axisThickness - axisOffset,
                        'y',
                        -1
                    );
                    break;
                case ChartAxisPosition.Left:
                    axis.translation.y = axisBound.y + (axisWidths.top ?? 0);
                    axis.translation.x = clampToOutsideSeriesRect(axisBound.x + axisOffset + axisThickness, 'x', 1);
                    break;
                case ChartAxisPosition.Right:
                    axis.translation.y = axisBound.y + (axisWidths.top ?? 0);
                    axis.translation.x = clampToOutsideSeriesRect(
                        axisBound.x + axisBound.width - axisThickness - axisOffset,
                        'x',
                        -1
                    );
                    break;
            }

            axis.update();

            newAxisWidths[position] = (newAxisWidths[position] ?? 0) + axisThickness;
        });

        return { clipSeries, seriesRect, axisWidths: newAxisWidths };
    }
}
