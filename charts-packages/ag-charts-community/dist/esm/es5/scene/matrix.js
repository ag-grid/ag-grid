var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { BBox } from './bbox';
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
var Matrix = /** @class */ (function () {
    function Matrix(elements) {
        if (elements === void 0) { elements = [1, 0, 0, 1, 0, 0]; }
        this.elements = elements;
    }
    Matrix.prototype.setElements = function (elements) {
        var e = this.elements;
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
    };
    Object.defineProperty(Matrix.prototype, "identity", {
        get: function () {
            var e = this.elements;
            return e[0] === 1 && e[1] === 0 && e[2] === 0 && e[3] === 1 && e[4] === 0 && e[5] === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "a", {
        get: function () {
            return this.elements[0];
        },
        set: function (value) {
            this.elements[0] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "b", {
        get: function () {
            return this.elements[1];
        },
        set: function (value) {
            this.elements[1] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "c", {
        get: function () {
            return this.elements[2];
        },
        set: function (value) {
            this.elements[2] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "d", {
        get: function () {
            return this.elements[3];
        },
        set: function (value) {
            this.elements[3] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "e", {
        get: function () {
            return this.elements[4];
        },
        set: function (value) {
            this.elements[4] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "f", {
        get: function () {
            return this.elements[5];
        },
        set: function (value) {
            this.elements[5] = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Performs the AxB matrix multiplication and saves the result
     * to `C`, if given, or to `A` otherwise.
     */
    Matrix.prototype.AxB = function (A, B, C) {
        var a = A[0] * B[0] + A[2] * B[1], b = A[1] * B[0] + A[3] * B[1], c = A[0] * B[2] + A[2] * B[3], d = A[1] * B[2] + A[3] * B[3], e = A[0] * B[4] + A[2] * B[5] + A[4], f = A[1] * B[4] + A[3] * B[5] + A[5];
        C = C || A;
        C[0] = a;
        C[1] = b;
        C[2] = c;
        C[3] = d;
        C[4] = e;
        C[5] = f;
    };
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns the current matrix.
     * @param other
     */
    Matrix.prototype.multiplySelf = function (other) {
        this.AxB(this.elements, other.elements);
        return this;
    };
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns a new matrix.
     * @param other
     */
    Matrix.prototype.multiply = function (other) {
        var elements = new Array(6);
        this.AxB(this.elements, other.elements, elements);
        return new Matrix(elements);
    };
    Matrix.prototype.preMultiplySelf = function (other) {
        this.AxB(other.elements, this.elements, this.elements);
        return this;
    };
    /**
     * Returns the inverse of this matrix as a new matrix.
     */
    Matrix.prototype.inverse = function () {
        var _a = __read(this.elements, 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        return new Matrix([d, -b, -c, a, c * f - d * e, b * e - a * f]);
    };
    /**
     * Save the inverse of this matrix to the given matrix.
     */
    Matrix.prototype.inverseTo = function (other) {
        var _a = __read(this.elements, 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        other.setElements([d, -b, -c, a, c * f - d * e, b * e - a * f]);
        return this;
    };
    Matrix.prototype.invertSelf = function () {
        var el = this.elements;
        var a = el[0], b = el[1], c = el[2], d = el[3], e = el[4], f = el[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
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
    };
    Matrix.prototype.transformPoint = function (x, y) {
        var e = this.elements;
        return {
            x: x * e[0] + y * e[2] + e[4],
            y: x * e[1] + y * e[3] + e[5],
        };
    };
    Matrix.prototype.transformBBox = function (bbox, target) {
        var elements = this.elements;
        var xx = elements[0];
        var xy = elements[1];
        var yx = elements[2];
        var yy = elements[3];
        var h_w = bbox.width * 0.5;
        var h_h = bbox.height * 0.5;
        var cx = bbox.x + h_w;
        var cy = bbox.y + h_h;
        var w = Math.abs(h_w * xx) + Math.abs(h_h * yx);
        var h = Math.abs(h_w * xy) + Math.abs(h_h * yy);
        if (!target) {
            target = new BBox(0, 0, 0, 0);
        }
        target.x = cx * xx + cy * yx + elements[4] - w;
        target.y = cx * xy + cy * yy + elements[5] - h;
        target.width = w + w;
        target.height = h + h;
        return target;
    };
    Matrix.prototype.toContext = function (ctx) {
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
        var e = this.elements;
        ctx.transform(e[0], e[1], e[2], e[3], e[4], e[5]);
    };
    Matrix.flyweight = function (sourceMatrix) {
        return Matrix.instance.setElements(sourceMatrix.elements);
    };
    Matrix.updateTransformMatrix = function (matrix, scalingX, scalingY, rotation, translationX, translationY, opts) {
        // Assume that centers of scaling and rotation are at the origin.
        var _a = __read([0, 0], 2), bbcx = _a[0], bbcy = _a[1];
        var sx = scalingX;
        var sy = scalingY;
        var scx;
        var scy;
        if (sx === 1 && sy === 1) {
            scx = 0;
            scy = 0;
        }
        else {
            scx = (opts === null || opts === void 0 ? void 0 : opts.scalingCenterX) == null ? bbcx : opts === null || opts === void 0 ? void 0 : opts.scalingCenterX;
            scy = (opts === null || opts === void 0 ? void 0 : opts.scalingCenterY) == null ? bbcy : opts === null || opts === void 0 ? void 0 : opts.scalingCenterY;
        }
        var r = rotation;
        var cos = Math.cos(r);
        var sin = Math.sin(r);
        var rcx;
        var rcy;
        if (r === 0) {
            rcx = 0;
            rcy = 0;
        }
        else {
            rcx = (opts === null || opts === void 0 ? void 0 : opts.rotationCenterX) == null ? bbcx : opts === null || opts === void 0 ? void 0 : opts.rotationCenterX;
            rcy = (opts === null || opts === void 0 ? void 0 : opts.rotationCenterY) == null ? bbcy : opts === null || opts === void 0 ? void 0 : opts.rotationCenterY;
        }
        var tx = translationX;
        var ty = translationY;
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
        var tx4 = scx * (1 - sx) - rcx;
        var ty4 = scy * (1 - sy) - rcy;
        matrix.setElements([
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            cos * tx4 - sin * ty4 + rcx + tx,
            sin * tx4 + cos * ty4 + rcy + ty,
        ]);
        return matrix;
    };
    Matrix.instance = new Matrix();
    return Matrix;
}());
export { Matrix };
