"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bbox_1 = require("./bbox");
/**
 * As of Jan 8, 2019, Firefox still doesn't implement
 * `getTransform(): DOMMatrix;`
 * `setTransform(transform?: DOMMatrix2DInit)`
 * in the `CanvasRenderingContext2D`.
 * Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=928150
 * IE11 and Edge 44 also don't have the support.
 * Thus this class, to keep track of the current transform and
 * combine transformations.
 * Standards:
 * https://html.spec.whatwg.org/dev/canvas.html
 * https://www.w3.org/TR/geometry-1/
 */
class Matrix {
    constructor(elements = [1, 0, 0, 1, 0, 0]) {
        this.elements = elements;
    }
    setElements(elements) {
        const e = this.elements;
        // `this.elements = elements.slice()` is 4-5 times slower
        // (in Chrome 71 and FF 64) than manually copying elements,
        // since slicing allocates new memory.
        // The performance of passing parameters individually
        // vs as an array is about the same in both browsers, so we
        // go with a single (array of elements) parameter, because
        // `setElements(elements)` and `setElements([a, b, c, d, e, f])`
        // calls give us roughly the same performance, versus
        // `setElements(...elements)` and `setElements(a, b, c, d, e, f)`,
        // where the spread operator causes a 20-30x performance drop
        // (30x when compiled to ES5's `.apply(this, elements)`
        //  20x when used natively).
        e[0] = elements[0];
        e[1] = elements[1];
        e[2] = elements[2];
        e[3] = elements[3];
        e[4] = elements[4];
        e[5] = elements[5];
        return this;
    }
    setIdentityElements() {
        const e = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 1;
        e[4] = 0;
        e[5] = 0;
        return this;
    }
    get identity() {
        const e = this.elements;
        return e[0] === 1 && e[1] === 0 && e[2] === 0 && e[3] === 1 && e[4] === 0 && e[5] === 0;
    }
    set a(value) {
        this.elements[0] = value;
    }
    get a() {
        return this.elements[0];
    }
    set b(value) {
        this.elements[1] = value;
    }
    get b() {
        return this.elements[1];
    }
    set c(value) {
        this.elements[2] = value;
    }
    get c() {
        return this.elements[2];
    }
    set d(value) {
        this.elements[3] = value;
    }
    get d() {
        return this.elements[3];
    }
    set e(value) {
        this.elements[4] = value;
    }
    get e() {
        return this.elements[4];
    }
    set f(value) {
        this.elements[5] = value;
    }
    get f() {
        return this.elements[5];
    }
    /**
     * Performs the AxB matrix multiplication and saves the result
     * to `C`, if given, or to `A` otherwise.
     */
    AxB(A, B, C) {
        const a = A[0] * B[0] + A[2] * B[1], b = A[1] * B[0] + A[3] * B[1], c = A[0] * B[2] + A[2] * B[3], d = A[1] * B[2] + A[3] * B[3], e = A[0] * B[4] + A[2] * B[5] + A[4], f = A[1] * B[4] + A[3] * B[5] + A[5];
        C = C || A;
        C[0] = a;
        C[1] = b;
        C[2] = c;
        C[3] = d;
        C[4] = e;
        C[5] = f;
    }
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns the current matrix.
     * @param other
     */
    multiplySelf(other) {
        this.AxB(this.elements, other.elements);
        return this;
    }
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns a new matrix.
     * @param other
     */
    multiply(other) {
        const elements = new Array(6);
        this.AxB(this.elements, other.elements, elements);
        return new Matrix(elements);
    }
    preMultiplySelf(other) {
        this.AxB(other.elements, this.elements, this.elements);
        return this;
    }
    /**
     * Returns the inverse of this matrix as a new matrix.
     */
    inverse() {
        let [a, b, c, d, e, f] = this.elements;
        const rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        return new Matrix([d, -b, -c, a, c * f - d * e, b * e - a * f]);
    }
    /**
     * Save the inverse of this matrix to the given matrix.
     */
    inverseTo(other) {
        let [a, b, c, d, e, f] = this.elements;
        const rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        other.setElements([d, -b, -c, a, c * f - d * e, b * e - a * f]);
        return this;
    }
    invertSelf() {
        const el = this.elements;
        let a = el[0], b = el[1], c = el[2], d = el[3], e = el[4], f = el[5];
        const rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        el[0] = d;
        el[1] = -b;
        el[2] = -c;
        el[3] = a;
        el[4] = c * f - d * e;
        el[5] = b * e - a * f;
        return this;
    }
    clone() {
        return new Matrix(this.elements.slice());
    }
    transformPoint(x, y) {
        const e = this.elements;
        return {
            x: x * e[0] + y * e[2] + e[4],
            y: x * e[1] + y * e[3] + e[5],
        };
    }
    transformBBox(bbox, radius = 0, target) {
        const elements = this.elements;
        const xx = elements[0];
        const xy = elements[1];
        const yx = elements[2];
        const yy = elements[3];
        let h_w = bbox.width * 0.5;
        let h_h = bbox.height * 0.5;
        const cx = bbox.x + h_w;
        const cy = bbox.y + h_h;
        let w, h;
        if (radius) {
            h_w -= radius;
            h_h -= radius;
            const sx = Math.sqrt(xx * xx + yx * yx);
            const sy = Math.sqrt(xy * xy + yy * yy);
            w = Math.abs(h_w * xx) + Math.abs(h_h * yx) + Math.abs(sx * radius);
            h = Math.abs(h_w * xy) + Math.abs(h_h * yy) + Math.abs(sy * radius);
        }
        else {
            w = Math.abs(h_w * xx) + Math.abs(h_h * yx);
            h = Math.abs(h_w * xy) + Math.abs(h_h * yy);
        }
        if (!target) {
            target = new bbox_1.BBox(0, 0, 0, 0);
        }
        target.x = cx * xx + cy * yx + elements[4] - w;
        target.y = cx * xy + cy * yy + elements[5] - h;
        target.width = w + w;
        target.height = h + h;
        return target;
    }
    toContext(ctx) {
        // It's fair to say that matrix multiplications are not cheap.
        // However, updating path definitions on every frame isn't either, so
        // it may be cheaper to just translate paths. It's also fair to
        // say, that most paths will have to be re-rendered anyway, say
        // rectangle paths in a bar chart, where an animation would happen when
        // the data set changes and existing bars are morphed into new ones.
        // Or a pie chart, where old sectors are also morphed into new ones.
        // Same for the line chart. The only plausible case where translating
        // existing paths would be enough, is the scatter chart, where marker
        // icons, typically circles, stay the same size. But if circle radii
        // are bound to some data points, even circle paths would have to be
        // updated. And thus it makes sense to optimize for fewer matrix
        // transforms, where transform matrices of paths are mostly identity
        // matrices and `x`/`y`, `centerX`/`centerY` and similar properties
        // are used to define a path at specific coordinates. And only groups
        // are used to collectively apply a transform to a set of nodes.
        // If the matrix is mostly identity (95% of the time),
        // the `if (this.isIdentity)` check can make this call 3-4 times
        // faster on average: https://jsperf.com/matrix-check-first-vs-always-set
        if (this.identity) {
            return;
        }
        const e = this.elements;
        ctx.transform(e[0], e[1], e[2], e[3], e[4], e[5]);
    }
    static flyweight(elements) {
        if (elements) {
            if (elements instanceof Matrix) {
                Matrix.matrix.setElements(elements.elements);
            }
            else {
                Matrix.matrix.setElements(elements);
            }
        }
        else {
            Matrix.matrix.setIdentityElements();
        }
        return Matrix.matrix;
    }
    static updateTransformMatrix(matrix, scalingX, scalingY, rotation, translationX, translationY, opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Assume that centers of scaling and rotation are at the origin.
        const [bbcx, bbcy] = [0, 0];
        const sx = scalingX;
        const sy = scalingY;
        let scx;
        let scy;
        if (sx === 1 && sy === 1) {
            scx = 0;
            scy = 0;
        }
        else {
            scx = ((_a = opts) === null || _a === void 0 ? void 0 : _a.scalingCenterX) == null ? bbcx : (_b = opts) === null || _b === void 0 ? void 0 : _b.scalingCenterX;
            scy = ((_c = opts) === null || _c === void 0 ? void 0 : _c.scalingCenterY) == null ? bbcy : (_d = opts) === null || _d === void 0 ? void 0 : _d.scalingCenterY;
        }
        const r = rotation;
        const cos = Math.cos(r);
        const sin = Math.sin(r);
        let rcx;
        let rcy;
        if (r === 0) {
            rcx = 0;
            rcy = 0;
        }
        else {
            rcx = ((_e = opts) === null || _e === void 0 ? void 0 : _e.rotationCenterX) == null ? bbcx : (_f = opts) === null || _f === void 0 ? void 0 : _f.rotationCenterX;
            rcy = ((_g = opts) === null || _g === void 0 ? void 0 : _g.rotationCenterY) == null ? bbcy : (_h = opts) === null || _h === void 0 ? void 0 : _h.rotationCenterY;
        }
        const tx = translationX;
        const ty = translationY;
        // The transform matrix `M` is a result of the following transformations:
        // 1) translate the center of scaling to the origin
        // 2) scale
        // 3) translate back
        // 4) translate the center of rotation to the origin
        // 5) rotate
        // 6) translate back
        // 7) translate
        //         (7)          (6)             (5)             (4)           (3)           (2)           (1)
        //     | 1 0 tx |   | 1 0 rcx |   | cos -sin 0 |   | 1 0 -rcx |   | 1 0 scx |   | sx 0 0 |   | 1 0 -scx |
        // M = | 0 1 ty | * | 0 1 rcy | * | sin  cos 0 | * | 0 1 -rcy | * | 0 1 scy | * | 0 sy 0 | * | 0 1 -scy |
        //     | 0 0  1 |   | 0 0  1  |   |  0    0  1 |   | 0 0  1   |   | 0 0  1  |   | 0  0 0 |   | 0 0  1   |
        // Translation after steps 1-4 above:
        const tx4 = scx * (1 - sx) - rcx;
        const ty4 = scy * (1 - sy) - rcy;
        matrix.setElements([
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            cos * tx4 - sin * ty4 + rcx + tx,
            sin * tx4 + cos * ty4 + rcy + ty,
        ]);
        return matrix;
    }
}
exports.Matrix = Matrix;
Matrix.matrix = new Matrix();
