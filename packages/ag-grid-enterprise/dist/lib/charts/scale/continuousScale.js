// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContinuousScale = /** @class */ (function () {
    function ContinuousScale(reinterpolatorFactory, deinterpolatorFactory, rangeComparator) {
        this._domain = [0, 1];
        this._range = [];
        this.clamp = false;
        this.reinterpolatorFactory = reinterpolatorFactory;
        this.deinterpolatorFactory = deinterpolatorFactory;
        this.rangeComparator = rangeComparator;
    }
    Object.defineProperty(ContinuousScale.prototype, "domain", {
        get: function () {
            return this._domain;
        },
        set: function (values) {
            this._domain = values.slice();
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContinuousScale.prototype, "range", {
        get: function () {
            return this._range;
        },
        set: function (values) {
            this._range = values.slice();
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    ContinuousScale.prototype.convert = function (d) {
        if (!this.piecewiseReinterpolator) {
            if (!this.piecewiseReinterpolatorFactory) {
                throw new Error('Missing piecewiseReinterpolatorFactory');
            }
            var deinterpolatorFactory = this.clamp
                ? this.clampDeinterpolatorFactory(this.deinterpolatorOf)
                : this.deinterpolatorOf;
            this.piecewiseReinterpolator = this.piecewiseReinterpolatorFactory(this._domain, this._range, deinterpolatorFactory, this.reinterpolatorFactory);
        }
        if (!this.piecewiseReinterpolator) {
            throw new Error('Missing piecewiseReinterpolator');
        }
        return this.piecewiseReinterpolator(d);
    };
    ContinuousScale.prototype.invert = function (r) {
        if (!this.deinterpolatorFactory) {
            throw new Error('Missing deinterpolatorFactory');
        }
        if (!this.piecewiseDeinterpolator) {
            if (!this.piecewiseDeinterpolatorFactory) {
                throw new Error('Missing piecewiseDeinterpolatorFactory');
            }
            var reinterpolatorFactory = this.clamp
                ? this.clampReinterpolatorFactory(this.reinterpolatorOf)
                : this.reinterpolatorOf;
            this.piecewiseDeinterpolator = this.piecewiseDeinterpolatorFactory(this._range, this._domain, this.deinterpolatorFactory, reinterpolatorFactory);
        }
        return this.piecewiseDeinterpolator(r);
    };
    ContinuousScale.prototype.clampDeinterpolatorFactory = function (deinterpolatorOf) {
        return function (a, b) {
            var deinterpolate = deinterpolatorOf(a, b);
            return function (x) {
                if (x <= a) {
                    return 0.0;
                }
                else if (x >= b) {
                    return 1.0;
                }
                else {
                    return deinterpolate(x);
                }
            };
        };
    };
    ContinuousScale.prototype.clampReinterpolatorFactory = function (reinterpolatorOf) {
        return function (a, b) {
            var reinterpolate = reinterpolatorOf(a, b);
            return function (t) {
                if (t <= 0) {
                    return a;
                }
                else if (t >= 1) {
                    return b;
                }
                else {
                    return reinterpolate(t);
                }
            };
        };
    };
    ContinuousScale.prototype.rescale = function () {
        // TODO: uncomment the polylinear functionality here and the corresponding
        //       methods below when we have a use case fot it.
        // const isPoly = Math.min(this._domain.length, this._range.length) > 2;
        // this.piecewiseReinterpolatorFactory = isPoly ? this.polymap : this.bimap;
        // this.piecewiseDeinterpolatorFactory = isPoly ? this.polymapInvert : this.bimapInvert;
        this.piecewiseReinterpolatorFactory = this.bimap;
        this.piecewiseDeinterpolatorFactory = this.bimapInvert;
        this.piecewiseDeinterpolator = undefined;
        this.piecewiseReinterpolator = undefined;
    };
    ContinuousScale.prototype.bimap = function (domain, range, deinterpolatorOf, reinterpolatorOf) {
        var d0 = domain[0];
        var d1 = domain[1];
        var r0 = range[0];
        var r1 = range[1];
        var dt;
        var tr;
        if (d1 < d0) {
            dt = deinterpolatorOf(d1, d0);
            tr = reinterpolatorOf(r1, r0);
        }
        else {
            dt = deinterpolatorOf(d0, d1);
            tr = reinterpolatorOf(r0, r1);
        }
        return function (x) { return tr(dt(x)); };
    };
    ContinuousScale.prototype.bimapInvert = function (range, domain, deinterpolatorOf, reinterpolatorOf) {
        var r0 = range[0];
        var r1 = range[1];
        var d0 = domain[0];
        var d1 = domain[1];
        var rt;
        var td;
        if (d1 < d0) {
            rt = deinterpolatorOf(r1, r0);
            td = reinterpolatorOf(d1, d0);
        }
        else {
            rt = deinterpolatorOf(r0, r1);
            td = reinterpolatorOf(d0, d1);
        }
        return function (x) { return td(rt(x)); };
    };
    return ContinuousScale;
}());
exports.default = ContinuousScale;
