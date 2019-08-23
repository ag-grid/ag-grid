import { Shape } from "./shape";
import { chainObjects } from "../../util/object";
import { BBox } from "../bbox";

export class Line extends Shape {

    static className = 'Line';

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        fill: undefined,
        strokeWidth: 1
    });

    constructor() {
        super();
        this.restoreOwnStyles();
    }

    static create(x1: number, y1: number, x2: number, y2: number): Line {
        const line = new Line();

        line.x1 = x1;
        line.y1 = y1;
        line.x2 = x2;
        line.y2 = y2;

        return line;
    }

    private _x1: number = 0;
    set x1(value: number) {
        if (this._x1 !== value) {
            this._x1 = value;
            this.dirty = true;
        }
    }
    get x1(): number {
        // TODO: Investigate getter performance further in the context
        //       of the scene graph.
        //       In isolated benchmarks using a getter has the same
        //       performance as a direct property access in Firefox 64.
        //       But in Chrome 71 the getter is 60% slower than direct access.
        //       Direct read is 4.5+ times slower in Chrome than it is in Firefox.
        //       Property access and direct read have the same performance
        //       in Safari 12, which is 2+ times faster than Firefox at this.
        // https://jsperf.com/es5-getters-setters-versus-getter-setter-methods/18
        // This is a know Chrome issue. They say it's not a regression, since
        // the behavior is observed since M60, but jsperf.com history shows the
        // 10x slowdown happened between Chrome 48 and Chrome 57.
        // https://bugs.chromium.org/p/chromium/issues/detail?id=908743
        return this._x1;
    }

    private _y1: number = 0;
    set y1(value: number) {
        if (this._y1 !== value) {
            this._y1 = value;
            this.dirty = true;
        }
    }
    get y1(): number {
        return this._y1;
    }

    private _x2: number = 0;
    set x2(value: number) {
        if (this._x2 !== value) {
            this._x2 = value;
            this.dirty = true;
        }
    }
    get x2(): number {
        return this._x2;
    }

    private _y2: number = 0;
    set y2(value: number) {
        if (this._y2 !== value) {
            this._y2 = value;
            this.dirty = true;
        }
    }
    get y2(): number {
        return this._y2;
    }

    readonly getBBox = (): BBox => {
        return new BBox(
            this.x1,
            this.y1,
            this.x2 - this.x1,
            this.y2 - this.y1
        );
    }

    isPointInPath(x: number, y: number): boolean {
        return false;
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        let x1 = this.x1;
        let y1 = this.y1;
        let x2 = this.x2;
        let y2 = this.y2;

        // Align to the pixel grid if the line is strictly vertical
        // or horizontal (but not both, i.e. a dot).
        if (x1 === x2) {
            const x = Math.round(x1) + Math.floor(this.strokeWidth) % 2 / 2;
            x1 = x;
            x2 = x;
        } else if (y1 === y2) {
            const y = Math.round(y1) + Math.floor(this.strokeWidth) % 2 / 2;
            y1 = y;
            y2 = y;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        this.fillStroke(ctx);

        this.dirty = false;
    }
}
