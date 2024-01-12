import { bench } from '@arktype/attest';
import { ColDef as ColDefOriginal } from './src/ts/entities/colDef';

type StringOrNumKeys<TObj> = keyof TObj & (string | number);
type NestedPath<TValue, Prefix extends string, TValueNestedChild, TDepth extends any[]> = 
    TValue extends object
        ? `${Prefix}.${ TDepth['length'] extends 7 ? any : NestedFieldPaths<TValue, TValueNestedChild, TDepth>}`
        : never;

// This type wrapper is needed for correct handling of union types in ColDefField
// If a user provides a union type for TData = {a: string} | { b: string} then ColDefField<TData> will be "a" | "b"
// Without the ColDefField wrapper NestedFieldPaths<TData> would return never as there is no overlap between the two types
/**
 * Returns a union of all possible paths to nested fields in `TData`.
 */
export type ColDefField<TData = any, TValue = any> = TData extends any ? NestedFieldPaths<TData, TValue, []> : never;

/**
 * Returns a union of all possible paths to nested fields in `TData`.
 */
export type NestedFieldPaths<TData = any, TValue = any, TDepth extends any[] = []> = {
    [TKey in StringOrNumKeys<TData>]:
        TData[TKey] extends Function | undefined ? never // ignore functions
        : TData[TKey] extends Date | undefined ? (TData[TKey] extends TValue ? `${TKey}` : never) // dont recurse into dates
            : TData[TKey] extends any[] | undefined 
                ? (TData[TKey] extends TValue ? `${TKey}` : never) | `${TKey}.${number}` // arrays support index access
                : (TData[TKey] extends TValue ? `${TKey}` : never) |  NestedPath<TData[TKey], `${TKey}`, TValue, [...TDepth, any]>;
}[StringOrNumKeys<TData>];

export interface ColDef<TData = any, TValue = any> {
    field: ColDefField<TData, TValue>;
}

bench('number', () => {
    interface IRowData {
        a: number;
        c: string;
        d: Date;
        d2: Date;
        b: IRowData;
        b2: IRowData;
    }
    return { field: 'a' } as ColDef<IRowData>;
}).types([662, 'instantiations']);

bench('number[]', () => {
    interface IRowData {
        a: number[];
        c: string[];
        d: Date[];
        d2: Date[];
        b: IRowData;
        b2: IRowData;
    }
    return { field: 'a' } as ColDef<IRowData>;
}).types([679, 'instantiations']);

bench('OG: number', () => {
    interface IRowData {
        a: number;
        c: string;
        d: Date;
        d2: Date;
        b: IRowData;
        b2: IRowData;

    }
    return { field: 'a' } as ColDefOriginal<IRowData>;
}).types([662, 'instantiations']);

bench('OG: number[]', () => {
    interface IRowData {
        a: number[];
        c: string[];
        d: Date[];
        d2: Date[];
        b: IRowData;
        b2: IRowData;

    }
    return { field: 'a' } as ColDefOriginal<IRowData>;
}).types([679, 'instantiations']);

/* bench('bench type', () => {
    return {field: 'b'} as ColDef<IRowData2, unknown>;
}).types([2831, 'instantiations']); */
/* bench('bench field2', () => {
    
    return '' as NestedPath<{a: {b:Function}},'',number, []>;
}).types([3, 'instantiations']); */

/* bench('bench runtime and type', () => {
    return { field: 'a' } as ColDef<IRowData>;
}).types([112, 'instantiations']);

bench('bench runtime and Recusvie type', () => {
    return { field: 'child.a' } as ColDef<IRowData2>;
}).types([2161, 'instantiations']); */
