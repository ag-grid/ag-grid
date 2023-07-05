import type { Scale } from './scale';
import { Color } from '../util/color';
import { Logger } from '../util/logger';
import interpolateColor from '../interpolate/color';

export class ColorScale implements Scale<number, string, number> {
    domain = [0, 1];
    range = ['red', 'blue'];

    private parsedRange = this.range.map((v) => Color.fromString(v));

    update() {
        const { domain, range } = this;

        if (domain.length < 2) {
            Logger.warnOnce('`colorDomain` should have at least 2 values.');
            if (domain.length === 0) {
                domain.push(0, 1);
            } else if (domain.length === 1) {
                domain.push(domain[0] + 1);
            }
        }

        for (let i = 1; i < domain.length; i++) {
            const a = domain[i - 1];
            const b = domain[i];
            if (a >= b) {
                Logger.warnOnce('`colorDomain` values should be supplied in ascending order.');
                domain.sort((a, b) => a - b);
                break;
            }
        }

        const isSmallRange = range.length < domain.length;
        if (isSmallRange || (domain.length > 2 && range.length > domain.length)) {
            Logger.warnOnce(
                'Number of elements in `colorRange` needs to match the number of elements in `colorDomain`.'
            );
            if (isSmallRange) {
                for (let i = range.length; i < domain.length; i++) {
                    range.push('black');
                }
            } else {
                range.splice(domain.length);
            }
        }

        this.parsedRange = this.range.map((v) => Color.fromString(v));
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
