import { describe, expect, test } from '@jest/globals';
import { stripImportDeclarations } from './parser-utils';

describe(stripImportDeclarations, () => {
    test('strips import statements', () => {
        const input = `
        1;
        import "foo"
        2;
        import "foo";
        3;
        import 'foo';
        4;
        import foo from "foo";
        5;
        import * as foo from "foo";
        6;
        import {} from "foo";
        7;
        import {foo} from "foo";
        8;
        import {foo,} from "foo";
        9;
        import {foo,bar} from "foo";
        10;
        import {foo,bar,baz} from "foo";
        11;
        import {foo,bar,baz,} from "foo";
        12;
        import foo,{bar,baz,qux} from "foo";
        13;
        import   foo   ,   {   bar   ,   baz   ,   qux   }   from   "foo";
        14;
        import foo, {
            bar,
            baz,
            qux
        } from "foo";
        15;
        import foo, {
            bar,
            baz,
            qux,
        } from "foo";
        'done';
        `;
        const expected = `
        1;
                2;

        3;

        4;

        5;

        6;

        7;

        8;

        9;

        10;

        11;

        12;

        13;

        14;

        15;

        'done';
        `;
        expect(stripImportDeclarations(input).replace(/\n +\n/g, '\n\n')).toEqual(expected);
    });
});
