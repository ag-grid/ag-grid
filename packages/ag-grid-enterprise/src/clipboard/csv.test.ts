import { stringToArray } from './clipboardService';

describe('stringToArray', () => {
    it('returns parsed data', () => {
        const input = 'a1,a2\nb1,b2\nc1,c2';
        const output = stringToArray(input);

        expect(output).toStrictEqual([
            ['a1', 'a2'],
            ['b1', 'b2'],
            ['c1', 'c2'],
        ]);
    });

    it('can use different delimiter', () => {
        const input = 'a1;a2\nb1;b2\nc1;c2';
        const output = stringToArray(input, ';');

        expect(output).toStrictEqual([
            ['a1', 'a2'],
            ['b1', 'b2'],
            ['c1', 'c2'],
        ]);
    });

    it('supports quoted fields', () => {
        const input = '"a1","a2"\n"b1","b2"\n"c1","c2"';
        const output = stringToArray(input);

        expect(output).toStrictEqual([
            ['"a1"', '"a2"'],
            ['"b1"', '"b2"'],
            ['"c1"', '"c2"'],
        ]);
    });

    it('supports mixture of quoted and unquoted fields', () => {
        const input = '"a1",a2\nb1,"b2"\n"c1","c2"';
        const output = stringToArray(input);

        expect(output).toStrictEqual([
            ['"a1"', 'a2'],
            ['b1', '"b2"'],
            ['"c1"', '"c2"'],
        ]);
    });

    it('preserves newlines inside quoted fields', () => {
        const input = '"this is a\nfield with a newline",another';
        const output = stringToArray(input);

        expect(output).toStrictEqual([['"this is a\nfield with a newline"', 'another']]);
    });

    it('preserves quotes inside unquoted fields', () => {
        const input = 'thishasa"quoteinthestring,another';
        const output = stringToArray(input);

        expect(output).toStrictEqual([['thishasa"quoteinthestring', 'another']]);
    });

    it('preserves empty first field', () => {
        const input = ',a2,a3';
        const output = stringToArray(input);

        expect(output).toStrictEqual([['', 'a2', 'a3']]);
    });

    it('preserves empty last field', () => {
        const input = 'a1,a2,';
        const output = stringToArray(input);

        expect(output).toStrictEqual([['a1', 'a2', '']]);
    });

    it('preserves empty last line', () => {
        const input = 'a1,a2\n';
        const output = stringToArray(input);

        expect(output).toStrictEqual([['a1', 'a2'], ['']]);
    });
});
