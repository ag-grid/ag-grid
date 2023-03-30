import {
    _Scene,
    _Util,
    _ModuleSupport,
    AgCrosshairLabelRendererResult,
    AgCartesianAxisPosition,
} from 'ag-charts-community';
import { CrosshairLabel, LabelMeta } from './crosshairLabel';

const { Group, Line, BBox } = _Scene;
const { checkDatum } = _Util;
const { Validate, NUMBER, BOOLEAN, OPT_COLOR_STRING, OPT_LINE_DASH, Layers } = _ModuleSupport;

export class Crosshair extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    public update(): void {}

    @Validate(OPT_COLOR_STRING)
    stroke?: string = 'rgb(195, 195, 195)';

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [6, 3];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity: number = 1;

    @Validate(BOOLEAN)
    snap: boolean = false;

    readonly label: CrosshairLabel;
    private seriesRect: _Scene.BBox = new BBox(0, 0, 0, 0);
    private bounds: _Scene.BBox = new BBox(0, 0, 0, 0);
    private visible: boolean = false;
    private axisCtx: _ModuleSupport.AxisContext;
    private axisLayout?: _ModuleSupport.AxisLayout & {
        id: string;
    };
    private labelFormatter?: (value: any) => string;

    private crosshairGroup: _Scene.Group = new Group({ layer: true, zIndex: Layers.SERIES_CROSSHAIR_ZINDEX });
    private lineNode: _Scene.Line = this.crosshairGroup.appendChild(new Line());

    private activeHighlight?: _ModuleSupport.HighlightChangeEvent['currentHighlight'] = undefined;
    constructor(private readonly ctx: _ModuleSupport.ModuleContextWithParent<_ModuleSupport.AxisContext>) {
        super();

        const mouseMove = ctx.interactionManager.addListener('hover', (event) => this.onMouseMove(event));
        const highlight = ctx.highlightManager.addListener('highlight-change', (event) =>
            this.onHighlightChange(event)
        );
        const layout = ctx.layoutService.addListener('layout-complete', (event) => this.layout(event));

        this.destroyFns.push(() => ctx.interactionManager.removeListener(mouseMove));
        this.destroyFns.push(() => ctx.highlightManager.removeListener(highlight));
        this.destroyFns.push(() => ctx.layoutService.removeListener(layout));

        this.axisCtx = ctx.parent;

        ctx.scene.root!.appendChild(this.crosshairGroup);
        this.destroyFns.push(() => ctx.scene.root?.removeChild(this.crosshairGroup));

        this.crosshairGroup.visible = false;

        this.label = new CrosshairLabel(document, ctx.scene.canvas.container ?? document.body);
        this.destroyFns.push(() => this.label.destroy());
    }

    private layout({ series: { rect, visible }, axes }: _ModuleSupport.LayoutCompleteEvent) {
        this.hideCrosshair();

        if (!(visible && axes)) {
            this.visible = false;
            return;
        }

        this.visible = true;
        this.seriesRect = rect;

        const { position: axisPosition, axisId } = this.axisCtx;

        const axisLayout = axes.find((a) => a.id === axisId);

        if (!axisLayout) {
            return;
        }

        this.axisLayout = axisLayout;
        const padding = axisLayout.gridPadding + axisLayout.seriesAreaPadding;
        this.bounds = this.buildBounds(rect, axisPosition, padding);

        const { crosshairGroup, bounds } = this;
        crosshairGroup.translationX = Math.round(bounds.x);
        crosshairGroup.translationY = Math.round(
            axisPosition === 'top' || axisPosition === 'bottom' ? bounds.y + bounds.height : bounds.y
        );

        const rotation = axisPosition === 'top' || axisPosition === 'bottom' ? -Math.PI / 2 : 0;
        crosshairGroup.rotation = rotation;

        this.updateLine();

        const format = this.label.format ?? axisLayout.label.format;
        this.labelFormatter = format ? this.axisCtx.scaleValueFormatter(format) : undefined;
    }

    private buildBounds(rect: _Scene.BBox, axisPosition: AgCartesianAxisPosition, padding: number): _Scene.BBox {
        const bounds = rect.clone();
        bounds.x += axisPosition === 'left' ? -padding : 0;
        bounds.y += axisPosition === 'top' ? -padding : 0;
        bounds.width += axisPosition === 'left' || axisPosition === 'right' ? padding : 0;
        bounds.height += axisPosition === 'top' || axisPosition === 'bottom' ? padding : 0;

        return bounds;
    }

    private updateLine() {
        const {
            lineNode: line,
            bounds,
            stroke,
            strokeWidth,
            strokeOpacity,
            lineDash,
            lineDashOffset,
            axisCtx,
            axisLayout,
        } = this;

        if (!axisLayout) {
            return;
        }
        line.stroke = stroke;
        line.strokeWidth = strokeWidth;
        line.strokeOpacity = strokeOpacity;
        line.lineDash = lineDash;
        line.lineDashOffset = lineDashOffset;

        line.y1 = line.y2 = 0;
        line.x1 = 0;
        line.x2 = axisCtx.direction === 'x' ? bounds.height : bounds.width;
    }

    private formatValue(val: any): string {
        const { labelFormatter, axisLayout } = this;

        if (labelFormatter) {
            return labelFormatter(val);
        }

        const isInteger = val % 1 === 0;
        const fractionDigits = (axisLayout?.label.fractionDigits ?? 0) + (isInteger ? 0 : 1);

        return typeof val === 'number' ? val.toFixed(fractionDigits) : String(val);
    }

    private onMouseMove(event: _ModuleSupport.InteractionEvent<'hover'>) {
        const { crosshairGroup, snap, seriesRect, axisCtx, visible, activeHighlight } = this;
        if (snap) {
            return;
        }

        const { offsetX, offsetY } = event;

        if (visible && seriesRect.containsPoint(offsetX, offsetY)) {
            crosshairGroup.visible = true;

            const highlightValue = activeHighlight ? this.getActiveHighlightValue(activeHighlight) : undefined;
            let value;
            if (axisCtx.direction === 'x') {
                crosshairGroup.translationX = Math.round(offsetX);
                value = axisCtx.continuous ? axisCtx.scaleInvert(offsetX - seriesRect.x) : highlightValue;
            } else {
                crosshairGroup.translationY = Math.round(offsetY);
                value = axisCtx.continuous ? axisCtx.scaleInvert(offsetY - seriesRect.y) : highlightValue;
            }

            if (value) {
                this.showLabel(offsetX, offsetY, value);
            } else {
                this.hideLabel();
            }
        } else {
            this.hideCrosshair();
        }
    }

    private onHighlightChange(event: _ModuleSupport.HighlightChangeEvent) {
        const { crosshairGroup, snap, seriesRect, axisCtx, visible } = this;

        const { currentHighlight } = event;

        const hasCrosshair =
            currentHighlight &&
            (currentHighlight.series.xAxis.id === axisCtx.axisId ||
                currentHighlight.series.yAxis.id === axisCtx.axisId);

        if (!hasCrosshair) {
            this.activeHighlight = undefined;
        } else {
            this.activeHighlight = currentHighlight;
        }

        if (!snap) {
            return;
        }

        if (visible && this.activeHighlight) {
            crosshairGroup.visible = true;

            const value = this.getActiveHighlightValue(this.activeHighlight);
            const position = axisCtx.scaleConvert(value);

            let x = 0;
            let y = 0;
            const halfBandwidth = axisCtx.scaleBandwidth() / 2;
            if (axisCtx.direction === 'x') {
                x = position + halfBandwidth;
                crosshairGroup.translationX = Math.round(x + seriesRect.x);
            } else {
                y = position + halfBandwidth;
                crosshairGroup.translationY = Math.round(y + seriesRect.y);
            }

            this.showLabel(x + seriesRect.x, y + seriesRect.y, value);
        } else {
            this.hideCrosshair();
        }
    }

    private getActiveHighlightValue(
        activeHighlight: Exclude<_ModuleSupport.HighlightChangeEvent['currentHighlight'], undefined>
    ) {
        const { axisCtx } = this;
        const { xKey = '', yKey = '', datum } = activeHighlight;
        const isYValue = axisCtx.keys().indexOf(yKey) >= 0;
        const key = isYValue ? yKey : xKey;

        const datumValue = checkDatum(datum[key], axisCtx.continuous);
        const cumulativeValue = activeHighlight.cumulativeValue;

        const value = isYValue && cumulativeValue !== undefined ? cumulativeValue : datumValue;

        return value;
    }

    private getLabelHtml(value: any): string {
        const { label, axisLayout: { label: { fractionDigits = 0 } = {} } = {} } = this;
        const { renderer: labelRenderer } = label;
        const defaults: AgCrosshairLabelRendererResult = {
            text: this.formatValue(value),
        };

        if (labelRenderer) {
            const params = {
                value,
                fractionDigits,
            };
            if (labelRenderer) {
                return label.toLabelHtml(labelRenderer(params), defaults);
            }
        }

        return label.toLabelHtml(defaults);
    }

    private showLabel(x: number, y: number, value: any) {
        const { axisCtx, bounds, label, axisLayout } = this;

        if (!axisLayout) {
            return;
        }

        const {
            label: { padding: labelPadding },
            tickSize,
        } = axisLayout;

        const padding = labelPadding + tickSize;

        const html = this.getLabelHtml(value);
        label.setLabelHtml(html);
        const labelBBox = label.computeBBox();

        let labelMeta: LabelMeta;
        if (axisCtx.direction === 'x') {
            const xOffset = -labelBBox.width / 2;
            const yOffset = axisCtx.position === 'bottom' ? 0 : -labelBBox.height;
            const fixedY = axisCtx.position === 'bottom' ? bounds.y + bounds.height + padding : bounds.y - padding;
            labelMeta = {
                x: x + xOffset,
                y: fixedY + yOffset,
            };
        } else {
            const yOffset = -labelBBox.height / 2;
            const xOffset = axisCtx.position === 'right' ? 0 : -labelBBox.width;
            const fixedX = axisCtx.position === 'right' ? bounds.x + bounds.width + padding : bounds.x - padding;
            labelMeta = {
                x: fixedX + xOffset,
                y: y + yOffset,
            };
        }

        label.show(labelMeta);
    }

    private hideCrosshair() {
        this.crosshairGroup.visible = false;
        this.hideLabel();
    }

    private hideLabel() {
        this.label.toggle(false);
    }
}
