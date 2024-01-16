import { bench } from '@arktype/attest';
import { IItem, IRowData, IRowData2 } from './benchesOG';

type StringOrNumKeys<TObj> = keyof TObj & (string | number);
type NestedPath<TValue, Prefix extends string, TValueNestedChild, TDepth extends any[]> = 
    TValue extends object
        ? TValue extends Date | undefined | null ? never // Don't recurse into Date internals
        : `${Prefix}.${ TDepth['length'] extends 5 ? any : NestedFieldPaths<TValue, TValueNestedChild, TDepth>}`
        : never;

export type ColDefField<TData = any, TValue = any> = TData extends any ? NestedFieldPaths<TData, TValue, []> : never;

export type NestedFieldPaths<TData = any, TValue = any, TDepth extends any[] = []> = {
    [TKey in StringOrNumKeys<TData>]:
        TData[TKey] extends Function | undefined ? never // ignore functions
            : TData[TKey] extends any[] | undefined 
                ? (TData[TKey] extends TValue ? `${TKey}` : never) | `${TKey}.${number}` // arrays support index access
                : (TData[TKey] extends TValue ? `${TKey}` : never) | NestedPath<TData[TKey], `${TKey}`, TValue, [...TDepth, any]>;
}[StringOrNumKeys<TData>];

export interface ColDef<TData = any, TValue = any> {
    field: ColDefField<TData, TValue>;
}

bench('IRowData', () => {
    return { field: 'b.d' } as ColDef<IRowData>;
})
.types([2101, 'instantiations']);

bench('IRowData2', () => {
    return { field: 'a' } as ColDef<IRowData2>;
})
.types([888, 'instantiations']);

bench('ITem[]', () => {
    return [{ field: 'A' }, {field: 'A.B'}] as ColDef<IItem>[];
})
.types([10998, 'instantiations']);
