import { Scale } from './scale';

export abstract class ContinuousScale implements Scale<any, any> {
    protected _domain: any[] = [0, 1];
    set domain(values: any[]) {
        this._domain = values;
    }
    get domain() {
        return this._domain;
    }

    protected _range: any[] = [0, 1];
    set range(values: any[]) {
        this._range = values;
    }
    get range() {
        return this._range;
    }

    protected transform(x: any) {
        return x;
    }
    protected transformInvert(x: any) {
        return x;
    }

    strictClampByDefault = false;

    convert(x: number, params?: { strict: boolean }) {
        const strict = params?.strict ?? this.strictClampByDefault;

        const domain = this.domain.map((d) => this.transform(d));
        const d0 = domain[0];
        const d1 = domain[domain.length - 1];

        const { range } = this;
        const r0 = range[0];
        const r1 = range[range.length - 1];

        x = this.transform(x);

        if (x < d0) {
            return strict ? NaN : r0;
        } else if (x > d1) {
            return strict ? NaN : r1;
        }

        if (d0 === d1) {
            return (r0 + r1) / 2;
        } else if (x === d0) {
            return r0;
        } else if (x === d1) {
            return r1;
        }

        return r0 + ((x - d0) / (d1 - d0)) * (r1 - r0);
    }

    invert(x: number): any {
        const domain = this.domain.map((d) => this.transform(d));
        const d0 = domain[0];
        const d1 = domain[domain.length - 1];

        const { range } = this;
        const r0 = range[0];
        const r1 = range[range.length - 1];

        let d: any;
        if (x < r0) {
            d = d0;
        } else if (x > r1) {
            d = d1;
        } else if (r0 === r1) {
            d = (d0 + d1) / 2;
        } else if (x === r0) {
            d = d0;
        } else if (x === r1) {
            d = d1;
        } else {
            d = d0 + ((x - r0) / (r1 - r0)) * (d1 - d0);
        }

        return this.transformInvert(d);
    }
}
