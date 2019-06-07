import { Shape } from "./shape";
import { chainObjects } from "../../util/object";
import { HdpiCanvas } from "../../canvas/hdpiCanvas";
import { BBox } from "../bbox";

export class Text extends Shape {

    static className = 'Text';

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        textAlign: 'start' as CanvasTextAlign,
        font: '10px sans-serif' as string,
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

    private lineBreakRe = /\r?\n/g;
    private lines: string[] = [];

    private splitText() {
        this.lines = this._text.split(this.lineBreakRe);
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

    private _font: string = Text.defaultStyles.font;
    set font(value: string) {
        if (this._font !== value) {
            this._font = value;
            this.dirty = true;
        }
    }
    get font(): string {
        return this._font;
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

    readonly getBBox = HdpiCanvas.has.textMetrics
        ? (): BBox => {
            const metrics = HdpiCanvas.measureText(this.text, this.font,
                this.textBaseline, this.textAlign);

            return new BBox(
                this.x - metrics.actualBoundingBoxLeft,
                this.y - metrics.actualBoundingBoxAscent,
                metrics.width,
                metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            );
        }
        : (): BBox => {
            const size = HdpiCanvas.getTextSize(this.text, this.font);
            let x = this.x;
            let y = this.y;

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
        };

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getBBox();

        return bbox.containsPoint(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.scene || !this.lines.length) {
            return;
        }

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        if (this.opacity < 1) {
            ctx.globalAlpha = this.opacity;
        }
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        const pixelRatio = this.scene.hdpiCanvas.pixelRatio || 1;

        if (this.fill) {
            ctx.fillStyle = this.fill;

            const fillShadow = this.fillShadow;
            if (fillShadow) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.offset.x * pixelRatio;
                ctx.shadowOffsetY = fillShadow.offset.y * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fillText(this.text, this.x, this.y);
        }

        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.lineWidth = this.strokeWidth;
            if (this.lineDash) {
                ctx.setLineDash(this.lineDash);
            }
            if (this.lineDashOffset) {
                ctx.lineDashOffset = this.lineDashOffset;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }

            const strokeShadow = this.strokeShadow;
            if (strokeShadow) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.offset.x * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.offset.y * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.strokeText(this.text, this.x, this.y);
        }

        // // debug
        // this.matrix.transformBBox(this.getBBox!()).render(ctx);

        this.dirty = false;
    }
}
