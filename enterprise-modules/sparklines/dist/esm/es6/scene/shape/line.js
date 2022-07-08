import { Shape } from "./shape";
import { chainObjects } from "../../util/object";
import { BBox } from "../bbox";
export class Line extends Shape {
    constructor() {
        super();
        this._x1 = 0;
        this._y1 = 0;
        this._x2 = 0;
        this._y2 = 0;
        this.restoreOwnStyles();
    }
    set x1(value) {
        if (this._x1 !== value) {
            this._x1 = value;
            this.dirty = true;
        }
    }
    get x1() {
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
    set y1(value) {
        if (this._y1 !== value) {
            this._y1 = value;
            this.dirty = true;
        }
    }
    get y1() {
        return this._y1;
    }
    set x2(value) {
        if (this._x2 !== value) {
            this._x2 = value;
            this.dirty = true;
        }
    }
    get x2() {
        return this._x2;
    }
    set y2(value) {
        if (this._y2 !== value) {
            this._y2 = value;
            this.dirty = true;
        }
    }
    get y2() {
        return this._y2;
    }
    computeBBox() {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }
    isPointInPath(x, y) {
        return false;
    }
    isPointInStroke(x, y) {
        return false;
    }
    render(ctx) {
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
        }
        else if (y1 === y2) {
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
Line.className = 'Line';
Line.defaultStyles = chainObjects(Shape.defaultStyles, {
    fill: undefined,
    strokeWidth: 1
});
