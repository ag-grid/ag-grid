import { bench } from '@arktype/attest';
import { ColDef as ColDefOriginal } from './src/ts/entities/colDef';

type StringOrNumKeys<TObj> = keyof TObj & (string | number);
type NestedPath<TValue, Prefix extends string, TValueNestedChild, TDepth extends any[]> = 
    TValue extends object
        ? `${Prefix}.${ TDepth['length'] extends 7 ? any : NestedFieldPaths<TValue, TValueNestedChild, TDepth>}`
        : never;

export type ColDefField<TData = any, TValue = any> = TData extends any ? NestedFieldPaths<TData, TValue, []> : never;

export type NestedFieldPaths<TData = any, TValue = any, TDepth extends any[] = []> = {
    [TKey in StringOrNumKeys<TData>]:
        TData[TKey] extends Function | undefined ? never // ignore functions
        : TData[TKey] extends Date | undefined ? (TData[TKey] extends TValue ? `${TKey}` : never) // don't recurse into dates
            : TData[TKey] extends any[] | undefined 
                ? (TData[TKey] extends TValue ? `${TKey}` : never) | `${TKey}.${number}` // arrays support index access
                : (TData[TKey] extends TValue ? `${TKey}` : never) |  NestedPath<TData[TKey], `${TKey}`, TValue, [...TDepth, any]>;
}[StringOrNumKeys<TData>];

export interface ColDef<TData = any, TValue = any> {
    field: ColDefField<TData, TValue>;
}
interface IRowData {
    a: number;
    c: string;
    d: Date;
    d2: Date;
    b: IRowData;
    b2: IRowData;
}

bench('number', () => {
    return { field: 'a' } as ColDef<IRowData>;
})
//.mean([2,'ns'])
.types([2072, 'instantiations']);

bench('OG: number', () => {
    return { field: 'a' } as ColDefOriginal<IRowData>;
})
//.mean([2,'ns'])
.types([2072, 'instantiations']);

interface IRowData2 {
    a: number[];
    c: string[];
    d: Date[];
    d2: Date[];
    b: IRowData2;
    b2: IRowData2;
}
bench('number[]', () => {
    return { field: 'a' } as ColDef<IRowData2>;
})
//.mean([2,'ns'])
.types([865, 'instantiations']);

bench('OG: number[]', () => {
    return { field: 'a' } as ColDefOriginal<IRowData2>;
})
//.mean([2,'ns'])
.types([865, 'instantiations']);
