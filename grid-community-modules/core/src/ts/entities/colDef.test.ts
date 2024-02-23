import { ColDef, ColGroupDef } from './colDef'
import { describe, test } from '@jest/globals';

describe('ColDef.field Types', () => {

    test('string with no generic', () => {
        const t: ColDef = { field: 'anyString' };
    })

    test('Simple TData', () => {
        interface RowData {
            a: number
            b: string
        }
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            // @ts-expect-error - non existent field
            { field: 'c' },
        ];
    })

    test('Simple TData with Column Group', () => {
        interface RowData {
            a: number
            b: string
        }
        const t: (ColDef<RowData> | ColGroupDef<RowData>)[] = [
            { field: 'a' },
            { field: 'b' },
            // @ts-expect-error - non existent field
            { field: 'c' },
            { children: [
                { field: 'a' },
                { field: 'b' },
                // @ts-expect-error - non existent field
                { field: 'c' },
            ]},
        ];
    })

    test('Union typed TData', () => {
        type RowData = { a: number } | { b: string } | { a: number, c: boolean };
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            { field: 'c' },
            // @ts-expect-error - non existent field
            { field: 'd' },
        ];
    })

    test('Nested TData', () => {
        interface RowData {
            a: number
            b: string,
            c: {
                d: boolean
                e: {
                    f: number
                },
            }
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
        ]
    })

    test('Recursive TData', () => {
        interface RowData {
            a: number;
            child: RowData
            
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
            { field: 'child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child' },
            
        ];

        interface RowData2 {
            a: number;
            b: string;
            child: RowData2
            
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
    })

    test('Child is recursive in TData', () => {
        interface ChildTree {
            id: number;
            children: ChildTree;
        }

        interface RowData {
            a: number
            b: string,
            tree: ChildTree;
        }
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
           { field: 'tree.children.children.children.id' },
        ];
    })

    test('Array index access TData', () => {
        interface RowData {
            list: number[];
            
        }
        const t: ColDef<RowData>[] = [
           { field: 'list.0' }, // maintain support for this as it works for accessing items from an array            
        ];
    })


    test('Recursive TData type instead of interface', () => {
        type RowData = {
            a: number;
            child: RowData
            
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
            { field: 'child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child' },
            
        ];

        type RowData2 = {
            a: number;
            b: string;
            child: RowData2
            
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
    })


});