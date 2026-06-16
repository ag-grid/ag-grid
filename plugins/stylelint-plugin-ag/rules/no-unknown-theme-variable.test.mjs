import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import stylelint from 'stylelint';

import plugin from './no-unknown-theme-variable.mjs';

const dir = mkdtempSync(join(tmpdir(), 'ag-unknown-theme-variable-'));
const paramFile = join(dir, 'params.ts');

writeFileSync(
    paramFile,
    [
        'export interface P {',
        '    accentColor: ColorValue;',
        '    borderRadius: LengthValue;',
        '    rowHeight: LengthValue;',
        '}',
        '',
    ].join('\n')
);

function makeConfig(secondaryOptions) {
    return {
        plugins: [plugin],
        rules: {
            'ag/no-unknown-theme-variable': [true, secondaryOptions],
        },
    };
}

const config = makeConfig({
    paramSourceFiles: [paramFile],
    publicOutputVariables: ['--ag-line-height'],
});

async function lint(code, lintConfig = config) {
    const result = await stylelint.lint({ code, config: lintConfig });
    return result.results[0].warnings;
}

describe('no-unknown-theme-variable', () => {
    describe('should flag', () => {
        it('flags a variable that does not match any theme param', async () => {
            const warnings = await lint('.x { color: var(--ag-illegal); }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('var(--ag-illegal)');
        });

        it('flags each unknown variable in a declaration', async () => {
            const warnings = await lint('.x { border: var(--ag-foo) var(--ag-bar); }');
            expect(warnings).toHaveLength(2);
        });

        it('flags an unknown variable with whitespace after var(', async () => {
            const warnings = await lint('.x { color: var( --ag-illegal ); }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('var(--ag-illegal)');
        });
    });

    describe('should not flag', () => {
        it('allows a variable derived from a theme param (kebab-cased)', async () => {
            const warnings = await lint('.x { color: var(--ag-accent-color); }');
            expect(warnings).toHaveLength(0);
        });

        it('allows a multi-word param converted to a CSS variable', async () => {
            const warnings = await lint('.x { border-radius: var(--ag-border-radius); }');
            expect(warnings).toHaveLength(0);
        });

        it('allows --ag-internal- prefixed variables', async () => {
            const warnings = await lint('.x { width: var(--ag-internal-horizontal-size); }');
            expect(warnings).toHaveLength(0);
        });
    });

    describe('should flag --ag-inherited-', () => {
        it('flags --ag-inherited- prefixed variables (not a recognised prefix)', async () => {
            const warnings = await lint('.x { color: var(--ag-inherited-text-color); }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('var(--ag-inherited-text-color)');
        });
    });

    describe('configuration', () => {
        it('flags every theme variable when no paramSourceFiles are configured', async () => {
            const warnings = await lint(
                '.x { color: var(--ag-accent-color); border-radius: var(--ag-border-radius); }',
                makeConfig({})
            );
            expect(warnings).toHaveLength(2);
        });

        it('still allows --ag-internal- variables when no paramSourceFiles are configured', async () => {
            const warnings = await lint('.x { width: var(--ag-internal-foo); }', makeConfig({}));
            expect(warnings).toHaveLength(0);
        });
    });
});
