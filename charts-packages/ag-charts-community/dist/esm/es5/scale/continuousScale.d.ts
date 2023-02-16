import { TimeInterval } from '../util/time/interval';
import { Scale } from './scale';
export declare abstract class ContinuousScale<D extends number | Date, I = number> implements Scale<D, number, I> {
    domain: D[];
    range: number[];
    static readonly defaultTickCount = 5;
    nice: boolean;
    interval?: I;
    tickCount: number;
    niceDomain: any[];
    protected constructor(domain: D[], range: number[]);
    protected transform(x: D): D;
    protected transformInvert(x: D): D;
    fromDomain(d: D): number;
    abstract toDomain(d: number): D;
    protected getDomain(): any[];
    strictClampByDefault: boolean;
    convert(x: D, params?: {
        strict: boolean;
    }): number;
    invert(x: number): D;
    protected cache: any;
    protected cacheProps: Array<keyof this>;
    protected didChange(): boolean;
    abstract update(): void;
    protected abstract updateNiceDomain(): void;
    protected refresh(): void;
    protected isDenseInterval({ start, stop, interval, count, }: {
        start: number;
        stop: number;
        interval: number | TimeInterval;
        count?: number;
    }): boolean;
}
