import { _Scene, _ModuleSupport, FontStyle, FontWeight, AgCrosshairLabelFormatterParams } from 'ag-charts-community';

const { Group, Line, Text, BBox } = _Scene;
const {
    Validate,
    NUMBER,
    OPT_NUMBER,
    BOOLEAN,
    OPT_COLOR_STRING,
    OPT_LINE_DASH,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    STRING,
    OPT_STRING,
    Layers,
} = _ModuleSupport;

export class CrosshairLabel {
    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(NUMBER(1))
    fontSize: number = 12;

    @Validate(STRING)
    fontFamily: string = 'Verdana, sans-serif';

    /**
     * The padding between the label and the crosshair line.
     */
    @Validate(NUMBER(0))
    padding: number = 11;

    /**
     * The color of the label.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(87, 87, 87, 1)';

    /**
     * Custom label rotation in degrees.
     * The label is rendered perpendicular to the axis line by default.
     * Or parallel to the axis line.
     * The value of this config is used as the angular offset/deflection
     * from the default rotation.
     */
    @Validate(OPT_NUMBER(-360, 360))
    rotation?: number = undefined;

    formatter?: (params: AgCrosshairLabelFormatterParams) => string = undefined;

    @Validate(OPT_STRING)
    format: string | undefined = undefined;
}

export class Corsshair extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    public update(): void {}

    @Validate(OPT_COLOR_STRING)
    stroke?: string = 'rgb(87, 87, 87)';

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

    label: CrosshairLabel = new CrosshairLabel();

    private seriesRect: _Scene.BBox = new BBox(0, 0, 0, 0);
    private axisCtx: _ModuleSupport.AxisContext;
    private axisLayout?: _ModuleSupport.AxisLayout & {
        id: string;
    };
    private crosshairGroup: _Scene.Group = new Group({ layer: true, zIndex: Layers.AXIS_ZINDEX });
    private labelNode: _Scene.Text = this.crosshairGroup.appendChild(new Text());
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
        this.updateLabel();
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

    updateLabel() {
        const {
            axisCtx,
            axisLayout,
            seriesRect,
            labelNode,
            label: { fontStyle, fontWeight, fontSize, fontFamily, color, padding },
        } = this;

        labelNode.fontStyle = fontStyle;
        labelNode.fontWeight = fontWeight;
        labelNode.fontSize = fontSize;
        labelNode.fontFamily = fontFamily;
        labelNode.fill = color;

        const crosshairLength = axisCtx.direction === 'x' ? seriesRect.height : seriesRect.width;
        const mirrored = axisCtx.position === 'top' || axisCtx.position === 'right';
        const labelX = mirrored ? padding + crosshairLength : -padding;

        labelNode.rotationCenterX = labelX;
        labelNode.x = labelX;

        if (!axisLayout) {
            return;
        }

        labelNode.rotation = axisLayout.label.rotation;
        labelNode.textAlign = axisLayout.label.align;
        labelNode.textBaseline = axisLayout.label.baseline;
    }

    updateLabelText(position: number) {
        const { labelNode, axisCtx } = this;

        const value = axisCtx.scaleInvert(position);

        labelNode.text = this.formatLabel(value);
    }

    formatLabel(val: any): string {
        const {
            label,
            axisLayout,
        } = this;

        const isInteger = val % 1 === 0;
        const fractionDigits = (axisLayout?.label.fractionDigits ?? 0) + (isInteger ? 0 : 1);
        const defaultFormatter = typeof val === 'number' ? (val: number) => val.toFixed(fractionDigits) : (val: any) => String(val);

        if (label.formatter) {
            return label.formatter({
                value: val,
                fractionDigits,
                formatter: defaultFormatter,
            })
        } else {
            return defaultFormatter(val);
        }
    }

    onMouseMove(event: _ModuleSupport.InteractionEvent<'hover'>) {
        const { crosshairGroup, snap, seriesRect, axisCtx } = this;
        if (snap || !axisCtx.continuous) {
            return;
        }

        const { offsetX, offsetY } = event;

        if (seriesRect.containsPoint(offsetX, offsetY)) {
            crosshairGroup.visible = true;

            if (axisCtx.direction === 'x') {
                crosshairGroup.translationX = Math.floor(offsetX);
                this.updateLabelText(offsetX - seriesRect.x);
            } else {
                crosshairGroup.translationY = Math.floor(offsetY);
                this.updateLabelText(offsetY - seriesRect.y);
            }
        } else {
            crosshairGroup.visible = false;
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

            if (axisCtx.direction === 'x') {
                crosshairGroup.translationX = Math.floor(x + seriesRect.x);
                this.updateLabelText(x);
            } else {
                crosshairGroup.translationY = Math.floor(y + seriesRect.y);
                this.updateLabelText(y);
            }
        } else {
            crosshairGroup.visible = false;
        }
    }
}
