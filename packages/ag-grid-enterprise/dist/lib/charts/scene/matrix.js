// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * As of Jan 8, 2019, Firefox still doesn't implement
 * `getTransform(): DOMMatrix;`
 * `setTransform(transform?: DOMMatrix2DInit)`
 * in the `CanvasRenderingContext2D`.
 * Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=928150
 * IE11 and Edge 44 also don't have the support.
 * Thus this class, to keep track of the current transform and
 * combine transformations.
 * Standards: https://html.spec.whatwg.org/dev/canvas.html
 *           https://www.w3.org/TR/geometry-1/
 */
var Matrix = /** @class */ (function () {
    function Matrix(elements) {
        if (elements === void 0) { elements = [1, 0, 0, 1, 0, 0]; }
        this._a = 1;
        this._b = 0;
        this._c = 0;
        this._d = 1;
        this._e = 0;
        this._f = 0;
        this.elements = elements;
    }
    Matrix.prototype.setElements = function (elements) {
        var e = this.elements;
        e[0] = elements[0];
        e[1] = elements[1];
        e[2] = elements[2];
        e[3] = elements[3];
        e[4] = elements[4];
        e[5] = elements[5];
        return this;
    };
    Object.defineProperty(Matrix.prototype, "isIdentity", {
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
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns the current matrix.
     * @param other
     */
    Matrix.prototype.multiplySelf = function (other) {
        var elements = this.elements;
        var m11 = elements[0], m12 = elements[1], m21 = elements[2], m22 = elements[3], m31 = elements[4], m32 = elements[5];
        var _g = other.elements, o11 = _g[0], o12 = _g[1], o21 = _g[2], o22 = _g[3], o31 = _g[4], o32 = _g[5];
        elements[0] = m11 * o11 + m21 * o12;
        elements[1] = m12 * o11 + m22 * o12;
        elements[2] = m11 * o21 + m21 * o22;
        elements[3] = m12 * o21 + m22 * o22;
        elements[4] = m11 * o31 + m21 * o32 + m31;
        elements[5] = m12 * o31 + m22 * o32 + m32;
        return this;
    };
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns a new matrix.
     * @param other
     */
    Matrix.prototype.multiply = function (other) {
        var elements = new Array(6);
        var _g = this.elements, m11 = _g[0], m12 = _g[1], m21 = _g[2], m22 = _g[3], m31 = _g[4], m32 = _g[5];
        var _h = other.elements, o11 = _h[0], o12 = _h[1], o21 = _h[2], o22 = _h[3], o31 = _h[4], o32 = _h[5];
        elements[0] = m11 * o11 + m21 * o12;
        elements[1] = m12 * o11 + m22 * o12;
        elements[2] = m11 * o21 + m21 * o22;
        elements[3] = m12 * o21 + m22 * o22;
        elements[4] = m11 * o31 + m21 * o32 + m31;
        elements[5] = m12 * o31 + m22 * o32 + m32;
        return new Matrix(elements);
    };
    Matrix.prototype.inverse = function () {
        var _g = this.elements, a = _g[0], b = _g[1], c = _g[2], d = _g[3], e = _g[4], f = _g[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        return new Matrix([d, -b, -c, a, c * f - d * e, b * e - a * f]);
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
    return Matrix;
}());
exports.Matrix = Matrix;
