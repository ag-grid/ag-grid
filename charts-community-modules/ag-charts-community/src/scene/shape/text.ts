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

    // TextMetrics are used if lineHeight is not defined.
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    lineHeight?: number = undefined;

    computeBBox(): BBox {
        return HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    }

    private getPreciseBBox(): BBox {
        let left = 0;
        let top = 0;
        let width = 0;
        let height = 0;

        // Distance between first and last base lines.
        let baselineDistance = 0;

        for (var i = 0; i < this.lines.length; i++) {
            const metrics = HdpiCanvas.measureText(this.lines[i], this.font, this.textBaseline, this.textAlign);

            left = Math.max(left, metrics.actualBoundingBoxLeft);
            width = Math.max(width, metrics.width);

            if (i == 0) {
                top += metrics.actualBoundingBoxAscent;
                height += metrics.actualBoundingBoxAscent;
            } else {
                baselineDistance += metrics.fontBoundingBoxAscent ?? metrics.emHeightAscent;
            }

            if (i == this.lines.length - 1) {
                height += metrics.actualBoundingBoxDescent;
            } else {
                baselineDistance += metrics.fontBoundingBoxDescent ?? metrics.emHeightDescent;
            }
        }

        if (this.lineHeight !== undefined) {
            baselineDistance = (this.lines.length - 1) * this.lineHeight;
        }
        height += baselineDistance;

        top += baselineDistance * this.getVerticalOffset();

        return new BBox(this.x - left, this.y - top, width, height);
    }

    private getVerticalOffset(): number {
        switch (this.textBaseline) {
            case 'top':
            case 'hanging':
                return 0;
            case 'bottom':
            case 'alphabetic':
            case 'ideographic':
                return 1;
            case 'middle':
                return 0.5;
        }
    }

    private getApproximateBBox(): BBox {
        let width = 0;
        let firstLineHeight = 0;
        // Distance between first and last base lines.
        let baselineDistance = 0;

        if (this.lines.length > 0) {
            const lineSize = HdpiCanvas.getTextSize(this.lines[0], this.font);

            width = lineSize.width;
            firstLineHeight = lineSize.height;
        }

        for (let i = 1; i < this.lines.length; i++) {
            const lineSize = HdpiCanvas.getTextSize(this.lines[i], this.font);

            width = Math.max(width, lineSize.width);
            baselineDistance += this.lineHeight ?? lineSize.height;
        }

        let { x, y } = this;

        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= width;
                break;
            case 'center':
                x -= width / 2;
        }

        switch (this.textBaseline) {
            case 'alphabetic':
                y -= firstLineHeight * 0.7 + baselineDistance * 0.5;
                break;
            case 'middle':
                y -= firstLineHeight * 0.45 + baselineDistance * 0.5;
                break;
            case 'ideographic':
                y -= firstLineHeight + baselineDistance;
                break;
            case 'hanging':
                y -= firstLineHeight * 0.2 + baselineDistance * 0.5;
                break;
            case 'bottom':
                y -= firstLineHeight + baselineDistance;
                break;
        }

        return new BBox(x, y, width, firstLineHeight + baselineDistance);
    }

    private getLineHeight(line: string): number {
        if (this.lineHeight) return this.lineHeight;

        if (HdpiCanvas.has.textMetrics) {
            const metrics = HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);

            return (
                (metrics.fontBoundingBoxAscent ?? metrics.emHeightAscent) +
                (metrics.fontBoundingBoxDescent ?? metrics.emHeightDescent)
            );
        }
        return HdpiCanvas.getTextSize(line, this.font).height;
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

        if (!this.lines.length || !this.layerManager) {
            if (stats) stats.nodesSkipped += this.nodeCount.count;
            return;
        }

        this.computeTransformMatrix();
        this.matrix.toContext(ctx);

        const { fill, stroke, strokeWidth } = this;

        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        const pixelRatio = this.layerManager.canvas.pixelRatio || 1;
        const { globalAlpha } = ctx;

        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;

            const { fillShadow } = this;

            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }

            this.renderLines((line, x, y) => ctx.fillText(line, x, y));
        }

        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;

            const { lineDash, lineDashOffset, lineCap, lineJoin } = this;

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

            this.renderLines((line, x, y) => ctx.strokeText(line, x, y));
        }

        super.render(renderCtx);
    }

    private renderLines(renderCallback: (line: string, x: number, y: number) => void): void {
        const { lines, x, y } = this;
        const lineHeights = this.lines.map((line) => this.getLineHeight(line));
        const totalHeight = lineHeights.reduce((a, b) => a + b, 0);
        let offsetY: number = -(totalHeight - lineHeights[0]) * this.getVerticalOffset();

        for (let i = 0; i < lines.length; i++) {
            renderCallback(lines[i], x, y + offsetY);

            offsetY += lineHeights[i];
        }
    }
}

export function getFont(fontSize: number, fontFamily: string, fontStyle?: string, fontWeight?: string): string {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
