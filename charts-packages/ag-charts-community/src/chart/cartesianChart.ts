import { Chart } from "./chart";
import { CategoryAxis } from "./axis/categoryAxis";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxisPosition, ChartAxisDirection } from "./chartAxis";
import { Series } from "./series/series";
import { BBox } from "../scene/bbox";
import { ClipRect } from "../scene/clipRect";
import { Navigator } from "./navigator/navigator";
import { NumberAxis } from "./axis/numberAxis";

export class CartesianChart extends Chart {
    static className = 'CartesianChart';
    static type: 'cartesian' | 'groupedCategory' = 'cartesian';

    constructor(document = window.document) {
        super(document);

        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        this.scene.root!!.visible = false;

        const root = this.scene.root!;
        root.append(this.seriesRoot);
        root.append(this.legend.group);

        this.navigator.enabled = false;
    }

    private _seriesRoot = new ClipRect();
    get seriesRoot(): ClipRect {
        return this._seriesRoot;
    }

    readonly navigator = new Navigator(this);

    performLayout(): void {
        if (this.dataPending) {
            return;
        }

        this.scene.root!!.visible = true;

        const { width, height, axes, legend, navigator } = this;

        const shrinkRect = new BBox(0, 0, width, height);

        this.positionCaptions();
        this.positionLegend();

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

        const { captionAutoPadding, padding } = this;

        this.updateAxes();

        shrinkRect.x += padding.left;
        shrinkRect.width -= padding.left + padding.right;

        shrinkRect.y += padding.top + captionAutoPadding;
        shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;

        if (navigator.enabled) {
            shrinkRect.height -= navigator.height + navigator.margin;
        }

        let bottomAxesHeight = 0;

        const axisPositionVisited: { [key in ChartAxisPosition]: boolean } = {
            top: false,
            right: false,
            bottom: false,
            left: false,
            angle: false,
            radius: false
        }

        axes.forEach(axis => {
            axis.group.visible = true;
            let axisThickness = Math.floor(axis.thickness || axis.computeBBox().width);

            // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
            const axisPadding = axis.title && axis.title.padding.top || 15;

            if (axisPositionVisited[axis.position]) {
                axisThickness += axisPadding;
            }

            switch (axis.position) {
                case ChartAxisPosition.Top:
                    axisPositionVisited[ChartAxisPosition.Top] = true;
                    shrinkRect.y += axisThickness;
                    shrinkRect.height -= axisThickness;
                    axis.translation.y = Math.floor(shrinkRect.y + 1);
                    axis.label.mirrored = true;
                    break;
                case ChartAxisPosition.Right:
                    axisPositionVisited[ChartAxisPosition.Right] = true;
                    shrinkRect.width -= axisThickness;
                    axis.translation.x = Math.floor(shrinkRect.x + shrinkRect.width);
                    axis.label.mirrored = true;
                    break;
                case ChartAxisPosition.Bottom:
                    axisPositionVisited[ChartAxisPosition.Bottom] = true;
                    shrinkRect.height -= axisThickness;
                    bottomAxesHeight += axisThickness;
                    axis.translation.y = Math.floor(shrinkRect.y + shrinkRect.height + 1);
                    break;
                case ChartAxisPosition.Left:
                    axisPositionVisited[ChartAxisPosition.Left] = true;
                    shrinkRect.x += axisThickness;
                    shrinkRect.width -= axisThickness;
                    axis.translation.x = Math.floor(shrinkRect.x);
                    break;
            }
        });

        axes.forEach(axis => {
            switch (axis.position) {
                case ChartAxisPosition.Top:
                case ChartAxisPosition.Bottom:
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.range = [0, shrinkRect.width];
                    axis.gridLength = shrinkRect.height;
                    break;
                case ChartAxisPosition.Left:
                case ChartAxisPosition.Right:
                    axis.translation.y = Math.floor(shrinkRect.y);
                    if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                        axis.range = [0, shrinkRect.height];
                    } else {
                        axis.range = [shrinkRect.height, 0];
                    }
                    axis.gridLength = shrinkRect.width;
                    break;
            }
        });

        this.createNodeData();

        this.seriesRect = shrinkRect;
        this.series.forEach(series => {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxes` call
        });

        const { seriesRoot } = this;
        seriesRoot.x = shrinkRect.x;
        seriesRoot.y = shrinkRect.y;
        seriesRoot.width = shrinkRect.width;
        seriesRoot.height = shrinkRect.height;

        if (navigator.enabled) {
            navigator.x = shrinkRect.x;
            navigator.y = shrinkRect.y + shrinkRect.height + bottomAxesHeight + navigator.margin;
            navigator.width = shrinkRect.width;
        }

        this.axes.forEach(axis => axis.update());
    }

    protected initSeries(series: Series) {
        super.initSeries(series);
    }

    protected freeSeries(series: Series) {
        super.freeSeries(series);
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

    private getTouchOffset(event: TouchEvent): { offsetX: number, offsetY: number } | undefined {
        const rect = this.scene.canvas.element.getBoundingClientRect();
        const touch = event.touches[0];
        return touch ? {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        } : undefined;
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

    protected onTouchEnd(event: TouchEvent) {
        this.navigator.onDragStop();
    }

    protected onTouchCancel(event: TouchEvent) {
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

    protected assignAxesToSeries(force: boolean = false) {
        super.assignAxesToSeries(force);

        this.series.forEach(series => {
            if (!series.xAxis) {
                console.warn(`Could not find a matching xAxis for the ${series.id} series.`);
            }
            if (!series.yAxis) {
                console.warn(`Could not find a matching yAxis for the ${series.id} series.`);
            }
        });
    }

    updateAxes() {
        const { navigator } = this;
        let clipSeries = false;
        let primaryTickCount: number;

        this.axes.forEach(axis => {
            const { direction, boundSeries } = axis;

            if (boundSeries.length === 0) {
                console.warn('AG Charts - chart series not initialised; check series and axes configuration.');
            }

            if (axis.linkedTo) {
                axis.domain = axis.linkedTo.domain;
            } else {
                const domains: any[][] = [];
                boundSeries.filter(s => s.visible).forEach(series => {
                    domains.push(series.getDomain(direction));
                });

                const domain = new Array<any>().concat(...domains);

                const isYAxis = axis.direction === 'y';

                if (axis instanceof NumberAxis && isYAxis) {
                    // the `primaryTickCount` is used to align the secondary axis tick count with the primary
                    axis.setDomain(domain, primaryTickCount);
                    primaryTickCount = primaryTickCount || axis.scale.ticks!(axis.tick.count).length;
                } else {
                    axis.domain = domain;
                }
            }

            if (axis.direction === ChartAxisDirection.X) {
                axis.visibleRange = [navigator.min, navigator.max];
            }

            if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
                clipSeries = true;
            }

            axis.update();
        });

        this.seriesRoot.enabled = clipSeries;
    }
}
