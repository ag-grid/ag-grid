import { bench } from '@arktype/attest';
import { IItem, IRowData, IRowData2 } from './benchesOG';

type StringOrNumKeys<TObj> = keyof TObj & (string | number);
type FilteredKeys<TObj, TFilter> = {
    [TKey in StringOrNumKeys<TObj>]: TObj[TKey] extends TFilter | undefined ? TKey : never;
}[ StringOrNumKeys<TObj>];

type NestedPath<TValue, Prefix extends string, TValueNestedChild, TDepth extends any[]> = 
TValue extends object
?  TValue extends any[] | undefined ? never :
          TValue extends Date | undefined ? never: `${Prefix}.${ TDepth['length'] extends 5 ? any : NestedFieldPaths<TValue, TValueNestedChild, TDepth>}`
        : never;

export type ColDefField<TData = any, TValue = any> = TData extends any ? NestedFieldPaths<TData, TValue, []> : never;

export type NestedFieldPaths<TData = any, TValue = any, TDepth extends any[] = []> = {
    [TKey in FilteredKeys<TData, TValue>]:
        TData[TKey] extends Function | undefined ? never // ignore functions
            : TKey | NestedPath<TData[TKey], `${TKey}`, TValue, [...TDepth, any]>;
}[FilteredKeys<TData, TValue>];

export interface ColDef<TData = any, TValue = any> {
    field: ColDefField<TData, TValue>;
}

bench('IRowData', () => {
    return { field: 'a' } as ColDef<IRowData, number>;
})
.types([2055, 'instantiations']);

bench('IRowData2', () => {
    return { field: 'c' } as ColDef<IRowData2>;
})
.types([811, 'instantiations']);

bench('ITem[]', () => {
    return [{ field: 'A' }, {field: 'A.B'}] as ColDef<IItem>[];
})
.types([10921, 'instantiations']);
