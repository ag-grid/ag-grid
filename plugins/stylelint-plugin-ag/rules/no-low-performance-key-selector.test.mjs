import stylelint from 'stylelint';

import plugin from './no-low-performance-key-selector.mjs';

const config = {
    plugins: [plugin],
    rules: {
        'ag/no-low-performance-key-selector': true,
    },
};

async function lint(code) {
    const result = await stylelint.lint({
        code,
        config,
    });
    return result.results[0].warnings;
}

describe('no-low-performance-key-selector', () => {
    describe('should flag (low performance key selector)', () => {
        it('flags nested pseudo-element: .foo { &:after { } }', async () => {
            const warnings = await lint('.foo { &:after { color: red } }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('&:after');
        });

        it('flags nested pseudo-class: .foo { &:hover { } }', async () => {
            const warnings = await lint('.foo { &:hover { color: red } }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('&:hover');
        });

        it('flags universal selector: .foo > * { }', async () => {
            const warnings = await lint('.foo > * { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('*');
        });

        it('flags type selector after combinator: .foo > div { }', async () => {
            const warnings = await lint('.foo > div { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('div');
        });

        it('flags bare type selector: div { }', async () => {
            const warnings = await lint('div { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('div');
        });

        it('flags attribute selector: [data-x] { }', async () => {
            const warnings = await lint('[data-x] { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('[data-x]');
        });

        it('flags :where with selector list: :where(.foo, .bar) { }', async () => {
            const warnings = await lint(':where(.foo, .bar) { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain(':where(.foo, .bar)');
        });

        it('flags nested :where with selector list: .foo { :where(.bar, .baz) { } }', async () => {
            const warnings = await lint('.foo { :where(.bar, .baz) { color: red } }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain(':where(.bar, .baz)');
        });

        it('flags :not: :not(.foo) { }', async () => {
            const warnings = await lint(':not(.foo) { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain(':not(.foo)');
        });

        it('flags :has: :has(.foo) { }', async () => {
            const warnings = await lint(':has(.foo) { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain(':has(.foo)');
        });

        it('flags deeply nested: .foo { .bar { &:after { } } }', async () => {
            const warnings = await lint('.foo { .bar { &:after { color: red } } }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('&:after');
        });

        it('flags only the bad selector in selector list: .foo, div { }', async () => {
            const warnings = await lint('.foo, div { color: red }');
            expect(warnings).toHaveLength(1);
            expect(warnings[0].text).toContain('div');
        });

        it('flags nesting containers even without declarations', async () => {
            const warnings = await lint(":where(.a, .b) { :after { content: ''; } }");
            // Both should be flagged - nesting containers still cause slow matching
            expect(warnings).toHaveLength(2);
            expect(warnings[0].text).toContain(':where(.a, .b)');
            expect(warnings[1].text).toContain(':after');
        });
    });

    describe('should NOT flag (high performance key selector)', () => {
        it('allows class with pseudo-element: .foo:after { }', async () => {
            const warnings = await lint('.foo:after { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows class with pseudo-class: .foo:hover { }', async () => {
            const warnings = await lint('.foo:hover { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows class after combinator: .foo > .bar { }', async () => {
            const warnings = await lint('.foo > .bar { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows nested class: .foo { &.bar { } }', async () => {
            const warnings = await lint('.foo { &.bar { } }');
            expect(warnings).toHaveLength(0);
        });

        it('allows nested descendant class: .foo { & .bar { } }', async () => {
            const warnings = await lint('.foo { & .bar { } }');
            expect(warnings).toHaveLength(0);
        });

        it('allows :where with single class and pseudo: .foo { &:where(.bar):after { } }', async () => {
            const warnings = await lint('.foo { &:where(.bar):after { } }');
            expect(warnings).toHaveLength(0);
        });

        it('allows ID selector: #main { }', async () => {
            const warnings = await lint('#main { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows type with class: div.foo { }', async () => {
            const warnings = await lint('div.foo { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows :where with single class: :where(.foo) { }', async () => {
            const warnings = await lint(':where(.foo) { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows selector list of single-class :where: :where(.foo), :where(.bar) { }', async () => {
            const warnings = await lint(':where(.foo), :where(.bar) { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows nested class under :where: :where(.foo) { .bar { } }', async () => {
            const warnings = await lint(':where(.foo) { .bar { } }');
            expect(warnings).toHaveLength(0);
        });

        it('allows class with attribute: .foo[data-x] { }', async () => {
            const warnings = await lint('.foo[data-x] { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows nested class chained: .foo { &.bar:after { } }', async () => {
            const warnings = await lint('.foo { &.bar:after { } }');
            expect(warnings).toHaveLength(0);
        });

        it('allows bare class: .foo { }', async () => {
            const warnings = await lint('.foo { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows :is with single class: :is(.foo) { }', async () => {
            const warnings = await lint(':is(.foo) { }');
            expect(warnings).toHaveLength(0);
        });

        it('allows standalone nesting selector: .foo { :where(.bar) & { } }', async () => {
            const warnings = await lint('.foo { :where(.bar) & { color: red } }');
            expect(warnings).toHaveLength(0);
        });
    });
});
