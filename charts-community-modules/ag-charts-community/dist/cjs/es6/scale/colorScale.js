"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorScale = void 0;
const color_1 = require("../util/color");
const color_2 = require("../interpolate/color");
class ColorScale {
    constructor() {
        this.domain = [0, 1];
        this._range = ['red', 'green'];
        this.parsedRange = this._range.map((v) => color_1.Color.fromString(v));
    }
    get range() {
        return this._range;
    }
    set range(values) {
        this._range = values;
        this.parsedRange = values.map((v) => color_1.Color.fromString(v));
    }
    convert(x) {
        const { domain, range, parsedRange } = this;
        const d0 = domain[0];
        const d1 = domain[domain.length - 1];
        const r0 = range[0];
        const r1 = range[range.length - 1];
        if (x <= d0) {
            return r0;
        }
        if (x >= d1) {
            return r1;
        }
        let index;
        let q;
        if (domain.length === 2) {
            const t = (x - d0) / (d1 - d0);
            const step = 1 / (range.length - 1);
            index = range.length <= 2 ? 0 : Math.min(Math.floor(t * (range.length - 1)), range.length - 2);
            q = (t - index * step) / step;
        }
        else {
            for (index = 0; index < domain.length - 2; index++) {
                if (x < domain[index + 1]) {
                    break;
                }
            }
            const a = domain[index];
            const b = domain[index + 1];
            q = (x - a) / (b - a);
        }
        const c0 = parsedRange[index];
        const c1 = parsedRange[index + 1];
        return color_2.default(c0, c1)(q);
    }
}
exports.ColorScale = ColorScale;
