import { ColDef } from './colDef'
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
            // @ts-expect-error - string is not assignable to number
            { field: 'c' },
        ];
    })

    test('Union typed TData', () => {
        type RowData = { a: number } | { b: string } | { a: number, c: boolean };
        const t: ColDef<RowData>[] = [
            { field: 'a' },
            { field: 'b' },
            { field: 'c' },
            // @ts-expect-error - string is not assignable to number
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
});