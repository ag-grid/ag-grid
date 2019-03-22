import {Shape} from "./shape";
import {chainObjects} from "../../util/object";
import {HdpiCanvas} from "../../canvas/hdpiCanvas";
import {BBox, isPointInBBox, renderBBox} from "../bbox";

export class Text extends Shape {
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
        if (this._text !== value) {
            this._text = value;
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

    readonly getBBox = HdpiCanvas.supports.textMetrics
        ? (): BBox => {
            const metrics = HdpiCanvas.measureText(this.text, this.font,
                this.textBaseline, this.textAlign);

            return {
                x: this.x - metrics.actualBoundingBoxLeft,
                y: this.y - metrics.actualBoundingBoxAscent,
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            };
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

            return {x, y, width: size.width, height: size.height};
        };

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.getBBox();

        return isPointInBBox(bbox, point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    applyContextAttributes(ctx: CanvasRenderingContext2D) {
        super.applyContextAttributes(ctx);
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.scene)
            return;

        const lines = this.lines;
        const lineCount = lines.length;

        if (!lineCount)
            return;

        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.applyContextAttributes(ctx);

        if (lineCount > 1) {
            // TODO: multi-line text
        } else if (lineCount === 1) {
            if (this.fillStyle) {
                ctx.fillText(this.text, this.x, this.y);
            }
            if (this.strokeStyle) {
                ctx.strokeText(this.text, this.x, this.y);
            }
        }

        // renderBBox(ctx, this.getBBox()); // debug

        this.dirty = false;
    }
}
