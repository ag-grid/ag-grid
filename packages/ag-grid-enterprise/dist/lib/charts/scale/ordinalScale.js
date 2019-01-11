// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
var OrdinalScale = /** @class */ (function () {
    function OrdinalScale() {
        this._domain = [];
        this._range = [];
        this.index = {}; // new Map<D, number>();
    }
    Object.defineProperty(OrdinalScale.prototype, "domain", {
        get: function () {
            return this._domain;
        },
        set: function (values) {
            var domain = this._domain;
            var index = this.index = {};
            domain.length = 0;
            values.forEach(function (value) {
                if (index[value] === undefined) {
                    domain.push(value);
                    index[value] = domain.length - 1;
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
            var _a;
            this._range.length = 0;
            (_a = this._range).push.apply(_a, values);
        },
        enumerable: true,
        configurable: true
    });
    OrdinalScale.prototype.convert = function (d) {
        var i = this.index[d];
        if (i === undefined) {
            this.domain.push(d);
            this.index[d] = i = this.domain.length - 1;
        }
        var range = this.range;
        if (range.length === 0) {
            return this.unknown;
        }
        return range[i % range.length];
    };
    return OrdinalScale;
}());
exports.OrdinalScale = OrdinalScale;
