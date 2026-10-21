import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import rule from './no-mismatched-generic-args.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            project: './fixtures/tsconfig.json',
            tsconfigRootDir: import.meta.dirname,
        },
    },
});

const filename = 'fixtures/file.ts';

const DECLARATIONS = `
interface Col<TValue = any, TData = any> {}
class Base<TValue = any, TData = any> {}
`;

function mismatch(arg, param, name) {
    return { messageId: 'mismatch', data: { arg, param, name } };
}

ruleTester.run('no-mismatched-generic-args', rule, {
    valid: [
        {
            filename,
            name: 'type reference with matching roles',
            code: `${DECLARATIONS} type A<TValue, TData> = Col<TValue, TData>;`,
        },
        {
            filename,
            name: 'type reference with a concrete argument',
            code: `${DECLARATIONS} type A<TData> = Col<any, TData>;`,
        },
        {
            filename,
            name: 'interface extends with matching roles',
            code: `${DECLARATIONS} interface A<TData> extends Col<any, TData> {}`,
        },
        {
            filename,
            name: 'class implements with matching roles',
            code: `${DECLARATIONS} class A<TData> implements Col<any, TData> {}`,
        },
        {
            filename,
            name: 'class extends with matching roles',
            code: `${DECLARATIONS} class A<TData> extends Base<any, TData> {}`,
        },
        {
            filename,
            name: 'class expression extends with matching roles',
            code: `${DECLARATIONS} const A = class<TData> extends Base<any, TData> {};`,
        },
        { filename, name: 'argument that is not a role name', code: `${DECLARATIONS} type A<TRow> = Col<TRow>;` },
        {
            filename,
            name: 'parameter that is not a role name',
            code: 'interface Box<T> {} type A<TData> = Box<TData>;',
        },
    ],
    invalid: [
        {
            filename,
            name: 'type reference',
            code: `${DECLARATIONS} type A<TData> = Col<TData>;`,
            errors: [mismatch('TData', 'TValue', 'Col')],
        },
        {
            filename,
            name: 'swapped roles in a type reference',
            code: `${DECLARATIONS} type A<TValue, TData> = Col<TData, TValue>;`,
            errors: [mismatch('TData', 'TValue', 'Col'), mismatch('TValue', 'TData', 'Col')],
        },
        {
            filename,
            name: 'interface extends',
            code: `${DECLARATIONS} interface A<TData> extends Col<TData> {}`,
            errors: [mismatch('TData', 'TValue', 'Col')],
        },
        {
            filename,
            name: 'class implements',
            code: `${DECLARATIONS} class A<TData> implements Col<TData> {}`,
            errors: [mismatch('TData', 'TValue', 'Col')],
        },
        {
            filename,
            name: 'class extends',
            code: `${DECLARATIONS} class A<TData> extends Base<TData> {}`,
            errors: [mismatch('TData', 'TValue', 'Base')],
        },
        {
            filename,
            name: 'class expression extends',
            code: `${DECLARATIONS} const A = class<TData> extends Base<TData> {};`,
            errors: [mismatch('TData', 'TValue', 'Base')],
        },
    ],
});
