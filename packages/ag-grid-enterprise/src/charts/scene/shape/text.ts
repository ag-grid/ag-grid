import { Shape } from "./shape";
import {chainObjects} from "../../util/object";

export class Text extends Shape {
    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        fillStyle: 'black',

        textAlign: 'start' as CanvasTextAlign,
        font: '10px sans-serif',
        textBaseline: 'alphabetic' as CanvasTextBaseline
    });

    constructor(text: string, x: number, y: number) {
        super();

        // The `dirty` flag is set to `true` initially for all nodes.
        // So for properties that simply set it `true` when modified,
        // we can skip going through their setter and set them directly,
        // for a faster instance construction.
        // But we can't do that for those properties have some extra
        // logic in their setter, like the `text` property here.
        this.text = text;
        this._x = x;
        this._y = y;

        this.fillStyle = Text.defaultStyles.fillStyle;
    }

    private _x: number;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number;
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

    private _text: string;
    set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this.lines = value.split(this.lineBreakRe);
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

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return false;
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
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

        this.dirty = false;
    }
}
