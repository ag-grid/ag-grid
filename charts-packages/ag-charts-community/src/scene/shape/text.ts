import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection, RenderContext } from '../node';
import { FontStyle, FontWeight } from '../../chart/agChartOptions';

function SceneFontChangeDetection(opts?: { redraw?: RedrawType; changeCb?: (t: any) => any }) {
    const { redraw = RedrawType.MAJOR, changeCb } = opts || {};

    return SceneChangeDetection({ redraw, type: 'font', changeCb });
}
export class Text extends Shape {
    static className = 'Text';

    protected static defaultStyles = Object.assign({}, Shape.defaultStyles, {
        textAlign: 'start' as CanvasTextAlign,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic' as CanvasTextBaseline,
    });

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    x: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    y: number = 0;

    private lines: string[] = [];
    private _splitText() {
        this.lines = typeof this.text === 'string' ? this.text.split(/\r?\n/g) : [];
    }

    @SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: (o: Text) => o._splitText() })
    text: string = '';

    private _dirtyFont: boolean = true;
    private _font?: string;
    get font(): string {
        if (this._dirtyFont) {
            this._dirtyFont = false;
            this._font = getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
        }

        return this._font!;
    }

    @SceneFontChangeDetection()
    fontStyle?: FontStyle;

    @SceneFontChangeDetection()
    fontWeight?: FontWeight;

    @SceneFontChangeDetection()
    fontSize: number = 10;

    @SceneFontChangeDetection()
    fontFamily: string = 'sans-serif';

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    textAlign: CanvasTextAlign = Text.defaultStyles.textAlign;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    textBaseline: CanvasTextBaseline = Text.defaultStyles.textBaseline;

    // Multi-line text is complicated because:
    // - Canvas does not support it natively, so we have to implement it manually
    // - need to know the height of each line -> need to parse the font shorthand ->
    //   generally impossible to do because font size may not be in pixels
    // - so, need to measure the text instead, each line individually -> expensive
    // - or make the user provide the line height manually for multi-line text
    // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
    // - textBaseline kind of loses its meaning for multi-line text
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    lineHeight: number = 14;

    computeBBox(): BBox {
        return HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    }

    private getPreciseBBox(): BBox {
        const metrics = HdpiCanvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);

        return new BBox(
            this.x - metrics.actualBoundingBoxLeft,
            this.y - metrics.actualBoundingBoxAscent,
            metrics.width,
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        );
    }

    private getApproximateBBox(): BBox {
        const size = HdpiCanvas.getTextSize(this.text, this.font);
        let { x, y } = this;

        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= size.width;
                break;
            case 'center':
                x -= size.width / 2;
        }

        switch (this.textBaseline) {
            case 'alphabetic':
                y -= size.height * 0.7;
                break;
            case 'middle':
                y -= size.height * 0.45;
                break;
            case 'ideographic':
                y -= size.height;
                break;
            case 'hanging':
                y -= size.height * 0.2;
                break;
            case 'bottom':
                y -= size.height;
                break;
        }

        return new BBox(x, y, size.width, size.height);
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();

        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    }

    render(renderCtx: RenderContext): void {
        const { ctx, forceRender, stats } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats) stats.nodesSkipped += this.nodeCount.count;
            return;
        }

        if (!this.lines.length || !this.scene) {
            if (stats) stats.nodesSkipped += this.nodeCount.count;
            return;
        }

        this.computeTransformMatrix();
        this.matrix.toContext(ctx);

        const { fill, stroke, strokeWidth } = this;

        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        const pixelRatio = this.scene.canvas.pixelRatio || 1;
        const { globalAlpha } = ctx;

        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;

            const { fillShadow, text, x, y } = this;

            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }

            ctx.fillText(text, x, y);
        }

        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;

            const { lineDash, lineDashOffset, lineCap, lineJoin, text, x, y } = this;

            if (lineDash) {
                ctx.setLineDash(lineDash);
            }

            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }

            if (lineCap) {
                ctx.lineCap = lineCap;
            }

            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }

            ctx.strokeText(text, x, y);
        }

        super.render(renderCtx);
    }
}

export function getFont(fontSize: number, fontFamily: string, fontStyle?: string, fontWeight?: string): string {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
