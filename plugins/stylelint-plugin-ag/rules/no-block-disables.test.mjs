import stylelint from 'stylelint';

import plugin from './no-block-disables.mjs';

const config = {
    plugins: [plugin],
    rules: {
        'ag/no-block-disables': true,
    },
};

async function lint(code, lintConfig = config) {
    const result = await stylelint.lint({ code, config: lintConfig });
    return result.results[0].warnings;
}

describe('no-block-disables', () => {
    describe('should flag', () => {
        // A disable of all rules also disables this rule, so it is only caught by the ignoreDisables run
        it('flags a whole-file disable of all rules when run with ignoreDisables', async () => {
            const warnings = await lint('/* stylelint-disable */\n.x { color: red; }', {
                ...config,
                ignoreDisables: true,
            });
            expect(warnings).toHaveLength(1);
        });

        it('flags a block disable of a named rule', async () => {
            const warnings = await lint('/* stylelint-disable color-named -- reason */\n.x { color: red; }');
            expect(warnings).toHaveLength(1);
        });

        it('flags a disable/enable range', async () => {
            const warnings = await lint(
                '/* stylelint-disable color-named */\n.x { color: red; }\n/* stylelint-enable color-named */'
            );
            expect(warnings).toHaveLength(1);
        });

        it('cannot be silenced by a preceding next-line disable when run with ignoreDisables', async () => {
            const warnings = await lint(
                '/* stylelint-disable-next-line ag/no-block-disables */\n/* stylelint-disable color-named */\n.x { color: red; }',
                { ...config, ignoreDisables: true }
            );
            expect(warnings).toHaveLength(1);
        });
    });

    describe('should not flag', () => {
        it('allows next-line disables', async () => {
            const warnings = await lint('/* stylelint-disable-next-line color-named -- reason */\n.x { color: red; }');
            expect(warnings).toHaveLength(0);
        });

        it('allows same-line disables', async () => {
            const warnings = await lint('.x { color: red; } /* stylelint-disable-line color-named -- reason */');
            expect(warnings).toHaveLength(0);
        });

        it('allows ordinary comments that mention stylelint-disable', async () => {
            const warnings = await lint('/* a comment about stylelint-disable */\n.x {}');
            expect(warnings).toHaveLength(0);
        });
    });
});
