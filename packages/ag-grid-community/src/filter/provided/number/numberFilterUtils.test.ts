import type { ColDef } from '../../../entities/colDef';
import type { GridOptionsService } from '../../../gridOptionsService';
import type { Column } from '../../../interfaces/iColumn';
import type { FilterInputCallbackParams } from '../../../interfaces/iFilter';
import { stringToFloat } from './numberFilterUtils';

// Only reached when a `numberParser` is configured; the params it is handed are built from these. Stubs
// rather than real beans: `getColDef` and `addCommon` are the whole of what the call touches.
const COL_DEF: ColDef = { field: 'val' };
const COLUMN = { getColDef: () => COL_DEF } as unknown as Column;
const GOS = { addCommon: (params: object) => ({ ...params, api: {}, context: {} }) } as unknown as GridOptionsService;

// A `number` input keeps scientific notation as the text the user typed — `1e3` is a valid floating-point
// number to the HTML parser — so what reads an input back has to read that notation too. The behavioural
// suite cannot cover it: happy-dom reports such an input as invalid, where every supported browser does not.
describe('stringToFloat', () => {
    test.each([
        ['1e3', 1000],
        ['1E3', 1000],
        ['1.5e-3', 0.0015],
        ['-2.5e2', -250],
    ])('reads scientific notation %s as %s', (text, expected) => {
        expect(stringToFloat(undefined, text, GOS, COLUMN)).toBe(expected);
    });

    test.each([
        ['a plain integer', '42', 42],
        ['a negative decimal', '-2.5', -2.5],
        ['blank', '   ', null],
        ['empty', '', null],
        ['a lone minus, which is a number half-typed', '-', null],
        ['a padded lone minus', '  -  ', null],
        ['a padded number, which parses as the number', ' 5 ', 5],
        ['absent', null, null],
    ])('reads %s as %s', (_name, text, expected) => {
        expect(stringToFloat(undefined, text, GOS, COLUMN)).toBe(expected);
    });

    test.each([
        ['a number', 1000, 1000],
        ['zero, which is a value and not a blank', 0, 0],
    ])('takes %s as already read', (_name, value, expected) => {
        expect(stringToFloat(undefined, value, GOS, COLUMN)).toBe(expected);
        // A parser reads text; there is none to read when the value already is a number.
        expect(stringToFloat(() => 42, value, GOS, COLUMN)).toBe(expected);
    });

    test('a numberParser owns the reading wherever one is configured', () => {
        const parser = (text: string | null) => (text === 'one thousand' ? 1000 : null);
        expect(stringToFloat(parser, 'one thousand', GOS, COLUMN)).toBe(1000);
        // Blank reaches the parser as null rather than as text it never has to recognise.
        expect(stringToFloat(parser, '  ', GOS, COLUMN)).toBe(null);
        // The default reading does not apply underneath a parser that rejected the text.
        expect(stringToFloat(parser, '1e3', GOS, COLUMN)).toBe(null);
    });

    test('a numberParser is handed the text as typed, whitespace included, and the column alongside it', () => {
        const seen: [string | null, FilterInputCallbackParams][] = [];
        const parser = (text: string | null, common: FilterInputCallbackParams) => {
            seen.push([text, common]);
            return null;
        };
        stringToFloat(parser, ' 5 ', GOS, COLUMN);
        stringToFloat(parser, '  ', GOS, COLUMN);
        expect(seen.map(([text]) => text)).toEqual([' 5 ', null]);
        expect(seen.every(([, common]) => common.column === COLUMN && common.colDef === COL_DEF)).toBe(true);
    });
});
