import { Scale } from './scale';
import { Color } from '../util/color';
import interpolateColor from '../interpolate/color';

export class ColorScale implements Scale<number, string, number> {
    domain = [0, 1];

    private _range = ['red', 'green'];
    private parsedRange = this._range.map((v) => Color.fromString(v));
    get range() {
        return this._range;
    }
    set range(values: string[]) {
        this._range = values;
        this.parsedRange = values.map((v) => Color.fromString(v));
    }

    convert(x: number) {
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

        let index: number;
        let q: number;

        if (domain.length === 2) {
            const t = (x - d0) / (d1 - d0);
            const step = 1 / (range.length - 1);
            index = range.length <= 2 ? 0 : Math.min(Math.floor(t * (range.length - 1)), range.length - 2);
            q = (t - index * step) / step;
        } else {
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
        return interpolateColor(c0, c1)(q);
    }
}
