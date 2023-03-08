import { _Scene, _ModuleSupport, FontStyle, FontWeight, AgCrosshairLabelFormatterParams } from 'ag-charts-community';

const { Group, Line, Text } = _Scene;
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
    padding: number = 5;

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
    stroke?: string = 'rgb(195, 195, 195)';

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [4, 2];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(NUMBER(0))
    strokeWidth: number = 2;

    @Validate(NUMBER(0, 1))
    strokeOpacity: number = 1;

    @Validate(BOOLEAN)
    snap: boolean = true;

    label: CrosshairLabel = new CrosshairLabel();

    private seriesRect?: _Scene.BBox = undefined;
    private crosshairGroup: _Scene.Group = new Group();
    private labelNode: _Scene.Text = this.crosshairGroup.appendChild(new Text());
    private lineNode: _Scene.Line = this.crosshairGroup.appendChild(new Line());

    constructor(private readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        const mouseMove = ctx.interactionManager.addListener('hover', (event) => this.onMouseMove(event));
        const highlight = ctx.highlightManager.addListener('highlight-change', (event) =>
            this.onHighlightChange(event)
        );
        this.destroyFns.push(() => ctx.interactionManager.removeListener(mouseMove));
        this.destroyFns.push(() => ctx.highlightManager.removeListener(highlight));

        const layout = ctx.layoutService.addListener('layout-complete', (event) => this.layout(event));
        this.destroyFns.push(() => ctx.layoutService.removeListener(layout));

        ctx.scene!.root!.appendChild(this.crosshairGroup);
    }

    layout({ series: { rect, visible } }: _ModuleSupport.LayoutCompleteEvent) {
        if (!(visible && rect)) {
            return;
        }
        this.seriesRect = rect;
        this.crosshairGroup.translationX = rect.x;
        this.crosshairGroup.translationY = rect.y;

        this.updateLine();
        this.updateLabel();
    }

    updateLine() {
        const { lineNode: line, seriesRect, stroke, strokeWidth, strokeOpacity, lineDash, lineDashOffset } = this;

        if (!seriesRect) {
            return;
        }

        line.stroke = stroke;
        line.strokeWidth = strokeWidth;
        line.strokeOpacity = strokeOpacity;
        line.lineDash = lineDash;
        line.lineDashOffset = lineDashOffset;

        line.y1 = line.y2 = 0;
        line.x1 = 0;
        line.x2 = seriesRect.width;
    }

    updateLabel() {
        const {
            labelNode,
            label: { fontStyle, fontWeight, fontSize, fontFamily, color, padding },
        } = this;

        labelNode.fontStyle = fontStyle;
        labelNode.fontWeight = fontWeight;
        labelNode.fontSize = fontSize;
        labelNode.fontFamily = fontFamily;
        labelNode.fill = color;

        labelNode.text = 'label'; // remove
        labelNode.x = -padding;
        labelNode.textAlign = 'right';
        labelNode.textBaseline = 'middle';
    }

    onMouseMove(event: _ModuleSupport.InteractionEvent<'hover'>) {
        const { crosshairGroup, snap, seriesRect } = this;
        if (snap || !seriesRect) {
            return;
        }

        const { offsetX, offsetY } = event;

        if (seriesRect.containsPoint(offsetX, offsetY)) {
            crosshairGroup.visible = true;
            crosshairGroup.translationY = Math.floor(offsetY);
            // update label text
        } else {
            crosshairGroup.visible = false;
        }
    }

    onHighlightChange(event: _ModuleSupport.HighlightChangeEvent) {
        const { crosshairGroup, snap, seriesRect } = this;
        if (!(snap && seriesRect)) {
            return;
        }

        const { currentHighlight } = event;
        if (currentHighlight && currentHighlight.point) {
            const { y } = currentHighlight.point;
            crosshairGroup.visible = true;
            crosshairGroup.translationY = Math.floor(y + seriesRect.y);
            // update label text
        } else {
            crosshairGroup.visible = false;
        }
    }
}
