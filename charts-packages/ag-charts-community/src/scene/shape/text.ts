import { Shape } from "./shape";
import { chainObjects } from "../../util/object";
import { BBox } from "../bbox";
import { HdpiCanvas } from "../../canvas/hdpiCanvas";

export type FontStyle = 'normal' | 'italic' | 'oblique';
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export class Text extends Shape {

    static className = 'Text';

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        textAlign: 'start' as CanvasTextAlign,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic' as CanvasTextBaseline
    });

    private _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private lineBreakRegex = /\r?\n/g;
    private lines: string[] = [];

    private splitText() {
        this.lines = this._text.split(this.lineBreakRegex);
    }

    private _text: string = '';
    set text(value: string) {
        const str = String(value); // `value` can be an object here

        if (this._text !== str) {
            this._text = str;
            this.splitText();
            this.dirty = true;
        }
    }
    get text(): string {
        return this._text;
    }

    private _font?: string;
    get font(): string {
        if (this.dirtyFont) {
            this.dirtyFont = false;

            this._font = [
                this.fontStyle || '',
                this.fontWeight || '',
                this.fontSize + 'px',
                this.fontFamily
            ].join(' ').trim();
        }

        return this._font!;
    }

    private _dirtyFont: boolean = true;
    set dirtyFont(value: boolean) {
        if (this._dirtyFont !== value) {
            this._dirtyFont = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyFont(): boolean {
        return this._dirtyFont;
    }

    private _fontStyle?: FontStyle;
    set fontStyle(value: FontStyle | undefined) {
        if (this._fontStyle !== value) {
            this._fontStyle = value;
            this.dirtyFont = true;
        }
    }
    get fontStyle(): FontStyle | undefined {
        return this._fontStyle;
    }

    private _fontWeight?: FontWeight;
    set fontWeight(value: FontWeight | undefined) {
        if (this._fontWeight !== value) {
            this._fontWeight = value;
            this.dirtyFont = true;
        }
    }
    get fontWeight(): FontWeight | undefined {
        return this._fontWeight;
    }

    private _fontSize: number = 10;
    set fontSize(value: number) {
        if (!isFinite(value)) {
            value = 10;
        }
        if (this._fontSize !== value) {
            this._fontSize = value;
            this.dirtyFont = true;
        }
    }
    get fontSize(): number {
        return this._fontSize;
    }

    private _fontFamily: string = 'sans-serif';
    set fontFamily(value: string) {
        if (this._fontFamily !== value) {
            this._fontFamily = value;
            this.dirtyFont = true;
        }
    }
    get fontFamily(): string {
        return this._fontFamily;
    }

    private _textAlign: CanvasTextAlign = Text.defaultStyles.textAlign;
    set textAlign(value: CanvasTextAlign) {
        if (this._textAlign !== value) {
            this._textAlign = value;
            this.dirty = true;
        }
    }
    get textAlign(): CanvasTextAlign {
        return this._textAlign;
    }

    private _textBaseline: CanvasTextBaseline = Text.defaultStyles.textBaseline;
    set textBaseline(value: CanvasTextBaseline) {
        if (this._textBaseline !== value) {
            this._textBaseline = value;
            this.dirty = true;
        }
    }
    get textBaseline(): CanvasTextBaseline {
        return this._textBaseline;
    }

    private _lineHeight: number = 14;
    set lineHeight(value: number) {
        // Multi-line text is complicated because:
        // - Canvas does not support it natively, so we have to implement it manually
        // - need to know the height of each line -> need to parse the font shorthand ->
        //   generally impossible to do because font size may not be in pixels
        // - so, need to measure the text instead, each line individually -> expensive
        // - or make the user provide the line height manually for multi-line text
        // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
        // - textBaseline kind of loses its meaning for multi-line text
        if (this._lineHeight !== value) {
            this._lineHeight = value;
            this.dirty = true;
        }
    }
    get lineHeight(): number {
        return this._lineHeight;
    }

    computeBBox(): BBox | undefined {
        return HdpiCanvas.has.textMetrics
            ? this.getPreciseBBox()
            : this.getApproximateBBox();
    }

    private getPreciseBBox(): BBox {
        const metrics = HdpiCanvas.measureText(this.text, this.font,
            this.textBaseline, this.textAlign);

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

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.lines.length || !this.scene) {
            return;
        }

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // this.matrix.transformBBox(this.computeBBox!()).render(ctx); // debug
        this.matrix.toContext(ctx);

        const { fill, stroke, strokeWidth } = this;

        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        const pixelRatio = this.scene.canvas.pixelRatio || 1;

        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = this.opacity * this.fillOpacity;

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
            ctx.globalAlpha = this.opacity * this.strokeOpacity;

            const { lineDash, lineDashOffset, lineCap, lineJoin, strokeShadow, text, x, y } = this;

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

            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }

            ctx.strokeText(text, x, y);
        }

        this.dirty = false;
    }
}
