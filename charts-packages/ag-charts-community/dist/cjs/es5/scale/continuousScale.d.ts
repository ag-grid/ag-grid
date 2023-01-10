import { Scale } from './scale';
export declare abstract class ContinuousScale implements Scale<any, any> {
    domain: any[];
    range: any[];
    nice: boolean;
    tickCount: number;
    niceDomain: any[];
    protected transform(x: any): any;
    protected transformInvert(x: any): any;
    protected getDomain(): any[];
    strictClampByDefault: boolean;
    convert(x: any, params?: {
        strict: boolean;
    }): any;
    invert(x: number): any;
    protected cache: any;
    protected cacheProps: Array<keyof this>;
    protected didChange(): boolean;
    abstract update(): void;
    protected abstract updateNiceDomain(): void;
    protected refresh(): void;
}
