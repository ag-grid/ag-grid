import { _Scene, _ModuleSupport, AgCrosshairLabelRendererResult } from 'ag-charts-community';
import { CrosshairLabel, LabelMeta } from './crosshairLabel';
import { toLabelHtml } from './util/label';

const { Group, Line, BBox } = _Scene;
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
    strokeWidth: number = 2;

    @Validate(NUMBER(0, 1))
    strokeOpacity: number = 1;

    @Validate(BOOLEAN)
    snap: boolean = false;

    readonly label: CrosshairLabel;
    private seriesRect: _Scene.BBox = new BBox(0, 0, 0, 0);
    private axisCtx: _ModuleSupport.AxisContext;
    private axisLayout?: _ModuleSupport.AxisLayout & {
        id: string;
    };
    private crosshairGroup: _Scene.Group = new Group({ layer: true, zIndex: Layers.AXIS_ZINDEX });
    private lineNode: _Scene.Line = this.crosshairGroup.appendChild(new Line());

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

        ctx.scene!.root!.appendChild(this.crosshairGroup);

        this.crosshairGroup.visible = false;

        this.label = new CrosshairLabel(document, ctx.scene.canvas.container ?? document.body);
    }

    layout({ series: { rect, visible }, axes }: _ModuleSupport.LayoutCompleteEvent) {
        if (!(visible && rect && axes)) {
            return;
        }
        this.seriesRect = rect;

        const { position: axisPosition, axisId } = this.axisCtx;

        this.axisLayout = axes.find((a) => a.id === axisId);

        this.crosshairGroup.translationX = Math.floor(rect.x);
        this.crosshairGroup.translationY = Math.floor(
            axisPosition === 'top' || axisPosition === 'bottom' ? rect.y + rect.height : rect.y
        );

        const rotation = axisPosition === 'top' || axisPosition === 'bottom' ? -Math.PI / 2 : 0;
        this.crosshairGroup.rotation = rotation;

        this.updateLine();
    }

    updateLine() {
        const {
            lineNode: line,
            seriesRect,
            stroke,
            strokeWidth,
            strokeOpacity,
            lineDash,
            lineDashOffset,
            axisCtx,
        } = this;

        line.stroke = stroke;
        line.strokeWidth = strokeWidth;
        line.strokeOpacity = strokeOpacity;
        line.lineDash = lineDash;
        line.lineDashOffset = lineDashOffset;

        line.y1 = line.y2 = 0;
        line.x1 = 0;
        line.x2 = axisCtx.direction === 'x' ? seriesRect.height : seriesRect.width;
    }

    getAxisValue(position: number): string {
        const { axisCtx } = this;

        const value = axisCtx.scaleInvert(position);

        return this.formatValue(value);
    }

    formatValue(val: any): string {
        const { axisLayout } = this;

        const isInteger = val % 1 === 0;
        const fractionDigits = (axisLayout?.label.fractionDigits ?? 0) + (isInteger ? 0 : 1);

        return typeof val === 'number' ? val.toFixed(fractionDigits) : String(val);
    }

    onMouseMove(event: _ModuleSupport.InteractionEvent<'hover'>) {
        const { crosshairGroup, snap, seriesRect, axisCtx } = this;
        if (snap || !axisCtx.continuous) {
            return;
        }

        const { offsetX, offsetY } = event;

        if (seriesRect.containsPoint(offsetX, offsetY)) {
            crosshairGroup.visible = true;

            let value;
            if (axisCtx.direction === 'x') {
                crosshairGroup.translationX = Math.floor(offsetX);
                value = this.getAxisValue(offsetX - seriesRect.x);
            } else {
                crosshairGroup.translationY = Math.floor(offsetY);
                value = this.getAxisValue(offsetY - seriesRect.y);
            }

            this.showLabel(offsetX, offsetY, value);
        } else {
            crosshairGroup.visible = false;
            this.hideLabel();
        }
    }

    onHighlightChange(event: _ModuleSupport.HighlightChangeEvent) {
        const { crosshairGroup, snap, seriesRect, axisCtx } = this;
        if (!snap && axisCtx.continuous) {
            return;
        }

        const { currentHighlight } = event;
        if (currentHighlight && currentHighlight.point) {
            const { x, y } = currentHighlight.point;

            crosshairGroup.visible = true;

            let value;
            if (axisCtx.direction === 'x') {
                crosshairGroup.translationX = Math.floor(x + seriesRect.x);
                value = this.getAxisValue(x);
            } else {
                crosshairGroup.translationY = Math.floor(y + seriesRect.y);
                value = this.getAxisValue(y);
            }

            this.showLabel(x + seriesRect.x, y + seriesRect.y, value);
        } else {
            crosshairGroup.visible = false;
            this.hideLabel();
        }
    }

    getLabelHtml(value: string): string {
        const { label, axisLayout: { label: { fractionDigits = 0 } = {} } = {} } = this;
        const { renderer: labelRenderer } = label;
        const content = value;
        const defaults: AgCrosshairLabelRendererResult = {
            content,
        };

        if (labelRenderer) {
            const params = {
                value,
                fractionDigits,
            };
            if (labelRenderer) {
                return toLabelHtml(labelRenderer(params), defaults);
            }
        }

        return toLabelHtml(defaults);
    }

    showLabel(x: number, y: number, value: string) {
        const { axisCtx, seriesRect, label } = this;

        const html = this.getLabelHtml(value);
        label.setLabelHtml(html);
        const labelBBox = label.computeBBox();

        let labelMeta: LabelMeta;
        if (axisCtx.direction === 'x') {
            const xOffset = -labelBBox.width / 2;
            const yOffset = axisCtx.position === 'bottom' ? 0 : -labelBBox.height;
            const fixedY = axisCtx.position === 'bottom' ? seriesRect.y + seriesRect.height : seriesRect.y;
            labelMeta = {
                x: x + xOffset,
                y: fixedY + yOffset,
            };
        } else {
            const yOffset = -labelBBox.height / 2;
            const xOffset = axisCtx.position === 'right' ? 0 : -labelBBox.width;
            const fixedX = axisCtx.position === 'right' ? seriesRect.x + seriesRect.width : seriesRect.x;
            labelMeta = {
                x: fixedX + xOffset,
                y: y + yOffset,
            };
        }

        label.show(labelMeta);
    }

    hideLabel() {
        this.label.toggle(false);
    }
}
