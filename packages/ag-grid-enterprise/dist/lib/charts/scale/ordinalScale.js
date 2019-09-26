// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
var OrdinalScale = /** @class */ (function () {
    function OrdinalScale() {
        /**
         * Using an object as a map prevents us from uniquely identifying objects and arrays:
         *
         *     index[{}]   === index[{foo: 'bar'}]    // true
         *     index[[{}]] === index[[{foo: 'bar'}]]  // true
         *
         * Use `Map` when IE11 is irrelevant.
         */
        this.index = {}; // new Map<D, number>();
        this._domain = [];
        this._range = [];
    }
    Object.defineProperty(OrdinalScale.prototype, "domain", {
        get: function () {
            return this._domain;
        },
        set: function (values) {
            var domain = this._domain;
            var index = this.index = {};
            domain.length = 0;
            values.forEach(function (d) {
                var key = d + '';
                if (!index[key]) {
                    index[key] = domain.push(d);
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrdinalScale.prototype, "range", {
        get: function () {
            return this._range;
        },
        set: function (values) {
            var n = values.length;
            var range = this._range;
            range.length = n;
            for (var i = 0; i < n; i++) {
                range[i] = values[i];
            }
        },
        enumerable: true,
        configurable: true
    });
    OrdinalScale.prototype.convert = function (d) {
        // Since `d` in `this.index[d]` will be implicitly converted to a string
        // anyway, we explicitly convert it, because we might have to use it twice.
        var key = d + '';
        var i = this.index[key];
        if (!i) {
            if (this.unknown !== undefined) {
                return this.unknown;
            }
            this.index[key] = i = this.domain.push(d);
        }
        return this.range[(i - 1) % this.range.length];
    };
    return OrdinalScale;
}());
exports.OrdinalScale = OrdinalScale;
