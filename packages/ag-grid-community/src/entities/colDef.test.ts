/* eslint-disable sonarjs/no-dead-store */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    GridOptions,
    HeaderTooltipCallbackParams,
    HeaderTooltipDefinition,
    ITooltipParams,
    TooltipContentParams,
} from '../main';
import type { ColDef, ColGroupDef, NestedFieldPaths, NestedPath, StringOrNumKeys } from './colDef';

describe('ColDef.field Types', () => {
    test('string with no generic', () => {
        const t: ColDef = { field: 'anyString' };
    });

    test('Simple TData', () => {
        interface RowData {
            a: number;
            b: string;
        }
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            // @ts-expect-error - non existent field
            { field: 'c' },
        ];
    });

    test('Simple TData with Column Group', () => {
        interface RowData {
            a: number;
            b: string;
        }
        const t: (ColDef<RowData> | ColGroupDef<RowData>)[] = [
            { field: 'a' },
            { field: 'b' },
            // @ts-expect-error - non existent field
            { field: 'c' },
            {
                children: [
                    { field: 'a' },
                    { field: 'b' },
                    // @ts-expect-error - non existent field
                    { field: 'c' },
                ],
            },
        ];
    });

    test('Union typed TData', () => {
        type RowData = { a: number } | { b: string } | { a: number; c: boolean };
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            { field: 'c' },
            // @ts-expect-error - non existent field
            { field: 'd' },
        ];
    });

    test('Nested TData', () => {
        interface RowData {
            a: number;
            b: string;
            c: {
                d: boolean;
                e: {
                    f: number;
                };
            };
        }
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            { field: 'c' },
            { field: 'c.d' },
            { field: 'c.e' },
            { field: 'c.e.f' },
        ];
        const numbers: ColDef<RowData, number>[] = [
            { field: 'a' },
            { field: 'c.e.f' },
            // @ts-expect-error - string is not assignable to number
            { field: 'b' },
        ];
    });

    test('Recursive TData', () => {
        interface RowData {
            a: number;
            child: RowData;
        }
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'child' },
            { field: 'child.a' },
            { field: 'child.child' },
            { field: 'child.child.a' },
            { field: 'child.child.child' },
            // @ts-expect-error - validate type 5 levels deep
            { field: 'child.child.child.child.childWrong' },
            // Let the user take care of the rest
            { field: 'child.child.child.child.child.child.child.childWrong' },
            {
                field: 'child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child',
            },
        ];

        interface RowData2 {
            a: number;
            b: string;
            child: RowData2;
        }
        const t2: ColDef<RowData2, string>[] = [
            { field: 'b' },
            // @ts-expect-error RowData is not assignable to string
            { field: 'child' },
            { field: 'child.b' },
            // @ts-expect-error number is not assignable to string
            { field: 'child.child.a' },
            { field: 'child.child.b' },
        ];
        const t3: ColDef<RowData2, number>[] = [
            { field: 'a' },
            // @ts-expect-error RowData is not assignable to number
            { field: 'child' },
            { field: 'child.a' },
            // @ts-expect-error number is not assignable to number
            { field: 'child.child.b' },
            { field: 'child.child.a' },
        ];
    });

    test('Child is recursive in TData', () => {
        interface ChildTree {
            id: number;
            children: ChildTree;
        }

        interface RowData {
            a: number;
            b: string;
            tree: ChildTree;
        }
        const t: ColDef<RowData>[] = [{ field: 'a' }, { field: 'b' }, { field: 'tree.children.children.children.id' }];
    });

    test('Array index access TData', () => {
        interface RowData {
            list: number[];
        }
        const t: ColDef<RowData>[] = [
            { field: 'list.0' }, // maintain support for this as it works for accessing items from an array
        ];
    });

    test('suppressNoteActions callback types', () => {
        interface RowData {
            athlete: string;
        }

        const t: ColDef<RowData>[] = [
            {
                field: 'athlete',
                suppressNoteActions: ({ data, column, colDef, node }) =>
                    !!data?.athlete && !!column && !!colDef && !!node,
            },
        ];
    });

    test('Recursive TData type instead of interface', () => {
        type RowData = {
            a: number;
            child: RowData;
        };
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'child' },
            { field: 'child.a' },
            { field: 'child.child' },
            { field: 'child.child.a' },
            { field: 'child.child.child' },
            // @ts-expect-error - validate type 5 levels deep
            { field: 'child.child.child.child.childWrong' },
            // Let the user take care of the rest
            { field: 'child.child.child.child.child.child.child.childWrong' },
            {
                field: 'child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child',
            },
        ];

        type RowData2 = {
            a: number;
            b: string;
            child: RowData2;
        };
        const t2: ColDef<RowData2, string>[] = [
            { field: 'b' },
            // @ts-expect-error RowData is not assignable to string
            { field: 'child' },
            { field: 'child.b' },
            // @ts-expect-error number is not assignable to string
            { field: 'child.child.a' },
            { field: 'child.child.b' },
        ];
        const t3: ColDef<RowData2, number>[] = [
            { field: 'a' },
            // @ts-expect-error RowData is not assignable to number
            { field: 'child' },
            { field: 'child.a' },
            // @ts-expect-error number is not assignable to number
            { field: 'child.child.b' },
            { field: 'child.child.a' },
        ];
    });

    test('Generic-typed property is selectable in a generic context', () => {
        interface Row<T> {
            id: number;
            e: T;
        }
        function makeColDefs<T>(): ColDef<Row<T>>[] {
            return [
                { field: 'id' },
                { field: 'e' },
                // @ts-expect-error - non existent field must still be rejected in a generic context
                { field: 'nonExistent' },
            ];
        }
        makeColDefs();
    });

    test('Optional properties resolve', () => {
        interface RowData {
            a?: number;
            b?: { c: string };
        }
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            { field: 'b.c' },
            // @ts-expect-error - non existent field
            { field: 'd' },
        ];
    });

    test('Function-typed fields are selectable (widening trade-off)', () => {
        interface RowData {
            a: number;
            getName: () => string;
        }
        const t: ColDef<RowData>[] = [{ field: 'a' }, { field: 'getName' }];
    });

    test('OLD field-path union is a subset of the current one (guards against narrowing)', () => {
        // Frozen baseline: the field-path union as a single mapped type (own keys and
        // nested paths emitted together), the form before the own/nested split. Every
        // path it accepts must stay assignable to the exported NestedFieldPaths, so the
        // union can only widen. Reuses the production StringOrNumKeys / NestedPath
        // helpers, so the only type duplicated locally is the one under change.
        type OldNestedFieldPaths<TData = any, TValue = any, TDepth extends any[] = []> = {
            [TKey in StringOrNumKeys<TData>]: TData[TKey] extends ((...args: any[]) => any) | undefined
                ? never
                : TData[TKey] extends any[] | undefined
                  ? (TData[TKey] extends TValue ? `${TKey}` : never) | `${TKey}.${number}`
                  : | (TData[TKey] extends TValue ? `${TKey}` : never)
                    | NestedPath<TData[TKey], `${TKey}`, TValue, [...TDepth, any]>;
        }[StringOrNumKeys<TData>];

        type Extends<A, B> = [A] extends [B] ? true : false;

        interface AllBaseTypes {
            num: number;
            str: string;
            bool: boolean;
            date: Date;
            nul: null;
            optional?: number;
            maybe: string | undefined;
            primitiveArray: number[];
            objectArray: { x: number }[];
            nested: { c: string; deep: { d: boolean } };
            optionalNested?: { c: string };
            fn: () => string;
            unionValue: number | string;
        }
        type UnionData = { a: number } | { b: string } | { a: number; c: boolean };

        const _superset: [
            Extends<OldNestedFieldPaths<AllBaseTypes>, NestedFieldPaths<AllBaseTypes>>,
            Extends<OldNestedFieldPaths<AllBaseTypes, number>, NestedFieldPaths<AllBaseTypes, number>>,
            Extends<OldNestedFieldPaths<AllBaseTypes, string>, NestedFieldPaths<AllBaseTypes, string>>,
            Extends<OldNestedFieldPaths<UnionData>, NestedFieldPaths<UnionData>>,
        ] = [true, true, true, true];
    });
});

describe('Tooltip Types', () => {
    interface RowData {
        amount: number;
        label: string;
    }
    interface Context {
        prefix: string;
    }

    test('header callbacks use display names without changing numeric column metadata', () => {
        const colDef: ColDef<RowData, number> = {
            field: 'amount',
            tooltip: (params) => {
                const value: number | null | undefined = params.value;
                // @ts-expect-error Cell source values remain numeric.
                const text: string | null | undefined = params.value;
                // @ts-expect-error Content callbacks have no tooltip lifecycle method.
                const hide = params.hideTooltipCallback;
                return value;
            },
            headerTooltip: (params) => {
                const value: string | null | undefined = params.value;
                const column: HeaderTooltipCallbackParams<RowData, number>['column'] = params.column;
                const definition: HeaderTooltipCallbackParams<RowData, number>['colDef'] = params.colDef;
                // @ts-expect-error Header display names are not numeric cell values.
                const numeric: number | null | undefined = params.value;
                // @ts-expect-error The column still describes numeric cells, not header text.
                const textColumn: HeaderTooltipCallbackParams<RowData, string>['column'] = params.column;
                // @ts-expect-error The definition still describes numeric cells, not header text.
                const textDefinition: HeaderTooltipCallbackParams<RowData, string>['colDef'] = params.colDef;
                // @ts-expect-error Header callbacks have no tooltip lifecycle method.
                const hide = params.hideTooltipCallback;
                return value?.toUpperCase();
            },
            headerTooltipValueGetter: (params) => params.value?.toUpperCase(),
            tooltipValueGetter: (params) => params.value?.toFixed(2),
        };
        const groupDef: ColGroupDef<RowData> = {
            children: [colDef],
            headerTooltip: (params) => params.value?.toUpperCase(),
        };
        const headerTooltip: HeaderTooltipDefinition<RowData, number, Context> = (params) =>
            params.context.prefix + params.value?.toUpperCase();
    });

    test('component params preserve three generic positions and allow a distinct resolved payload', () => {
        const legacyComponent = (params: ITooltipParams<RowData, number, Context>) => {
            const value: number | null | undefined = params.value;
            const context: Context = params.context;
            const hide: (() => void) | undefined = params.hideTooltipCallback;
            // @ts-expect-error The existing TValue generic still defaults the resolved payload type.
            const text: string | null | undefined = params.value;
        };
        const component = (params: ITooltipParams<RowData, number, Context, { label: string }>) => {
            const value: { label: string } | null | undefined = params.value;
            const context: Context = params.context;
            const column: HeaderTooltipCallbackParams<RowData, number>['column'] = params.column;
            const definition: HeaderTooltipCallbackParams<RowData, number>['colDef'] = params.colDef;
            const content: TooltipContentParams<RowData, number, Context, { label: string }> = params;
            // @ts-expect-error The resolved payload is not the numeric cell value.
            const numeric: number | null | undefined = params.value;
            // @ts-expect-error Resolved content alone has no tooltip lifecycle method.
            const hide = content.hideTooltipCallback;
            params.hideTooltipCallback?.();
        };
    });

    test('selectors receive arbitrary resolved content rather than the column cell value type', () => {
        const colDef: ColDef<RowData, number> = {
            tooltip: (params) => ({ label: String(params.value) }),
            tooltipComponentSelector: (params) => {
                const text: string = params.value;
                const structured: { label: string } = params.value;
                const column: HeaderTooltipCallbackParams<RowData, number>['column'] = params.column;
                const hide: (() => void) | undefined = params.hideTooltipCallback;
                // @ts-expect-error Arbitrary tooltip payloads must not erase the column cell value type.
                const textColumn: HeaderTooltipCallbackParams<RowData, string>['column'] = params.column;
                return undefined;
            },
        };
    });

    test('accessible descriptions receive resolved content without the hide lifecycle method', () => {
        const options: GridOptions<RowData> = {
            getTooltipAriaDescription: (params) => {
                const content: TooltipContentParams<RowData> = params;
                const amount: number | undefined = params.data?.amount;
                // @ts-expect-error Row-data typing is retained for accessible descriptions.
                const missing = params.data?.missing;
                // @ts-expect-error Accessible descriptions may be requested before a tooltip exists.
                const hide = params.hideTooltipCallback;
                return content.value?.label;
            },
        };
    });
});
