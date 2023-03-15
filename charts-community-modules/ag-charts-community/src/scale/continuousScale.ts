import { Logger } from '../util/logger';
import { TimeInterval } from '../util/time/interval';
import { Scale } from './scale';

export abstract class ContinuousScale<D extends number | Date, I = number> implements Scale<D, number, I> {
    static readonly defaultTickCount = 5;

    nice = false;
    interval?: I;
    tickCount = ContinuousScale.defaultTickCount;
    minTickCount = 0;
    maxTickCount = Infinity;
    niceDomain: any[] = null as any;

    protected constructor(public domain: D[], public range: number[]) {}

    protected transform(x: D) {
        return x;
    }
    protected transformInvert(x: D) {
        return x;
    }

    fromDomain(d: D): number {
        if (d instanceof Date) {
            return d.getTime();
        }
        return d as number;
    }

    abstract toDomain(d: number): D;

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

    convert(x: D, params?: { strict: boolean }) {
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

        return (
            r0 + ((this.fromDomain(x) - this.fromDomain(d0)) / (this.fromDomain(d1) - this.fromDomain(d0))) * (r1 - r0)
        );
    }

    invert(x: number) {
        this.refresh();
        const domain = this.getDomain().map((d) => this.transform(d));
        const [d0, d1] = domain;

        const { range } = this;
        const [r0, r1] = range;

        let d: any;
        if (r0 === r1) {
            d = this.toDomain((this.fromDomain(d0) + this.fromDomain(d1)) / 2);
        } else {
            d = this.toDomain(
                this.fromDomain(d0) + ((x - r0) / (r1 - r0)) * (this.fromDomain(d1) - this.fromDomain(d0))
            );
        }

        return this.transformInvert(d);
    }

    protected cache: any = null;
    protected cacheProps: Array<keyof this> = ['domain', 'range', 'nice', 'tickCount', 'minTickCount', 'maxTickCount'];
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

    protected isDenseInterval({
        start,
        stop,
        interval,
        count,
    }: {
        start: number;
        stop: number;
        interval: number | TimeInterval;
        count?: number;
    }): boolean {
        const { range } = this;
        const domain = stop - start;

        const min = Math.min(range[0], range[1]);
        const max = Math.max(range[0], range[1]);

        const availableRange = max - min;
        const step = typeof interval === 'number' ? interval : 1;
        count ??= domain / step;
        if (count >= availableRange) {
            Logger.warn(
                `the configured tick interval, ${JSON.stringify(
                    interval
                )}, results in more than 1 tick per pixel, ignoring. Supply a larger tick interval or omit this configuration.`
            );
            return true;
        }

        return false;
    }
}
