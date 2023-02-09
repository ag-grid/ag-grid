import { TimeInterval } from '../util/time/interval';
import { Scale } from './scale';

export abstract class ContinuousScale implements Scale<any, any> {
    static readonly defaultTickCount = 5;

    domain: any[] = [0, 1];
    range: any[] = [0, 1];
    nice = false;
    interval?: number | TimeInterval;
    tickCount = ContinuousScale.defaultTickCount;
    niceDomain: any[] = null as any;

    protected transform(x: any) {
        return x;
    }
    protected transformInvert(x: any) {
        return x;
    }

    protected getDomain() {
        if (this.nice) {
            this.refresh();
            if (this.niceDomain) {
                return this.niceDomain;
            }
        }
        return this.domain;
    }

    strictClampByDefault = false;

    convert(x: any, params?: { strict: boolean }) {
        if (!this.domain || this.domain.length < 2) {
            return NaN;
        }
        this.refresh();
        const strict = params?.strict ?? this.strictClampByDefault;

        const domain = this.getDomain().map((d) => this.transform(d));
        const [d0, d1] = domain;

        const { range } = this;
        const [r0, r1] = range;

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
        this.refresh();
        const domain = this.getDomain().map((d) => this.transform(d));
        const [d0, d1] = domain;

        const { range } = this;
        const [r0, r1] = range;

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

    protected cache: any = null;
    protected cacheProps: Array<keyof this> = ['domain', 'range', 'nice', 'tickCount'];
    protected didChange() {
        const { cache } = this;
        const didChange = !cache || this.cacheProps.some((p) => this[p] !== cache[p]);
        if (didChange) {
            this.cache = {};
            this.cacheProps.forEach((p) => (this.cache[p] = this[p]));
            return true;
        }
        return false;
    }

    abstract update(): void;
    protected abstract updateNiceDomain(): void;

    protected refresh() {
        if (this.didChange()) {
            this.update();
        }
    }

    protected isDenseInterval({ start, stop, interval }: { start: number; stop: number; interval: number }): boolean {
        const { range } = this;
        const domain = stop - start;

        const min = Math.min(range[0], range[1]);
        const max = Math.max(range[0], range[1]);

        const availableRange = max - min;
        const stepCount = domain / interval;
        if (stepCount >= availableRange) {
            console.warn(
                `AG Charts - the configured tick interval, ${interval}, results in more than 1 tick per pixel, no ticks will be displayed. Supply a larger tick interval or omit this configuration.`
            );
            return true;
        }

        return false;
    }
}
