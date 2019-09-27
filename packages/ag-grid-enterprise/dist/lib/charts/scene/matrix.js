// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bbox_1 = require("./bbox");
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
    Matrix.prototype.setIdentityElements = function () {
        var e = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 1;
        e[4] = 0;
        e[5] = 0;
        return this;
    };
    Object.defineProperty(Matrix.prototype, "identity", {
        get: function () {
            var e = this.elements;
            return e[0] === 1 && e[1] === 0 && e[2] === 0 &&
                e[3] === 1 && e[4] === 0 && e[5] === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "a", {
        get: function () {
            return this.elements[0];
        },
        set: function (value) {
            this.elements[0] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "b", {
        get: function () {
            return this.elements[1];
        },
        set: function (value) {
            this.elements[1] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "c", {
        get: function () {
            return this.elements[2];
        },
        set: function (value) {
            this.elements[2] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "d", {
        get: function () {
            return this.elements[3];
        },
        set: function (value) {
            this.elements[3] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "e", {
        get: function () {
            return this.elements[4];
        },
        set: function (value) {
            this.elements[4] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "f", {
        get: function () {
            return this.elements[5];
        },
        set: function (value) {
            this.elements[5] = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Performs the AxB matrix multiplication and saves the result
     * to `C`, if given, or to `A` otherwise.
     */
    Matrix.prototype.AxB = function (A, B, C) {
        var m11 = A[0], m12 = A[1], m21 = A[2], m22 = A[3], m31 = A[4], m32 = A[5];
        var o11 = B[0], o12 = B[1], o21 = B[2], o22 = B[3], o31 = B[4], o32 = B[5];
        C = C || A;
        C[0] = m11 * o11 + m21 * o12;
        C[1] = m12 * o11 + m22 * o12;
        C[2] = m11 * o21 + m21 * o22;
        C[3] = m12 * o21 + m22 * o22;
        C[4] = m11 * o31 + m21 * o32 + m31;
        C[5] = m12 * o31 + m22 * o32 + m32;
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
        var _a = this.elements, a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
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
        var _a = this.elements, a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        other.setElements([d, -b, -c, a, c * f - d * e, b * e - a * f]);
        return this;
    };
    Matrix.prototype.invertSelf = function () {
        var elements = this.elements;
        var a = elements[0], b = elements[1], c = elements[2], d = elements[3], e = elements[4], f = elements[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        elements[0] = d;
        elements[1] = -b;
        elements[2] = -c;
        elements[3] = a;
        elements[4] = c * f - d * e;
        elements[5] = b * e - a * f;
        return this;
    };
    Matrix.prototype.clone = function () {
        return new Matrix(this.elements.slice());
    };
    Matrix.prototype.transformPoint = function (x, y) {
        var e = this.elements;
        return {
            x: x * e[0] + y * e[2] + e[4],
            y: x * e[1] + y * e[3] + e[5]
        };
    };
    Matrix.prototype.transformBBox = function (bbox, radius, target) {
        if (radius === void 0) { radius = 0; }
        var elements = this.elements;
        var xx = elements[0];
        var xy = elements[1];
        var yx = elements[2];
        var yy = elements[3];
        var h_w = bbox.width * 0.5;
        var h_h = bbox.height * 0.5;
        var cx = bbox.x + h_w;
        var cy = bbox.y + h_h;
        var w, h;
        if (radius) {
            h_w -= radius;
            h_h -= radius;
            var sx = Math.sqrt(xx * xx + yx * yx);
            var sy = Math.sqrt(xy * xy + yy * yy);
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
    Matrix.flyweight = function (elements) {
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
    };
    Matrix.matrix = new Matrix();
    return Matrix;
}());
exports.Matrix = Matrix;
