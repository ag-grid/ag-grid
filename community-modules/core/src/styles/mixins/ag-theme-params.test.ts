import * as sass from 'node-sass';

describe('ag-param', () => {
    it('resolves derived values', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 x: ag-derived(a),
                 a: ag-derived(b, $times: c, $plus: 2),
                 b: 4,
                 c: 10
            ));
            .foo {
                x: ag-param(x);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
            ".foo {
            x: 42;
            }"
        `);
    });

    it('applies all maths operators', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: 1,
                 b: 2,
                 times-10: ag-derived(a, $times: 10),
                 times-b: ag-derived(a, $times: b),
                 plus-10: ag-derived(a, $plus: 10),
                 plus-b: ag-derived(a, $plus: b),
                 divide-10: ag-derived(a, $divide: 10),
                 divide-b: ag-derived(a, $divide: b),
                 minus-10: ag-derived(a, $minus: 10),
                 minus-b: ag-derived(a, $minus: b)
            ));
            .foo {
                times-10: ag-param(times-10);
                times-b: ag-param(times-b);
                plus-10: ag-param(plus-10);
                plus-b: ag-param(plus-b);
                divide-10: ag-param(divide-10);
                divide-b: ag-param(divide-b);
                minus-10: ag-param(minus-10);
                minus-b: ag-param(minus-b);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
            ".foo {
            times-10: 10;
            times-b: 2;
            plus-10: 11;
            plus-b: 3;
            divide-10: 0.1;
            divide-b: 0.5;
            minus-10: -9;
            minus-b: -1;
            }"
        `);
    });

    it('applies all color operators', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: rgb(100, 100, 100),
                 b: red,
                 c: rgba(200, 200, 200, 0.5),
                 opacity: ag-derived(a, $opacity: .5),
                 lighten: ag-derived(a, $lighten: 10%),
                 darken: ag-derived(a, $darken: 10%),
                 mix-red: ag-derived(a, $mix: red 25%),
                 mix-b: ag-derived(a, $mix: b 25%),
                 self-overlay-1: ag-derived(c, $self-overlay: 1),
                 self-overlay-2: ag-derived(c, $self-overlay: 2),
                 self-overlay-3: ag-derived(c, $self-overlay: 3)
            ));
            .foo {
                opacity: ag-param(opacity);
                lighten: ag-param(lighten);
                darken: ag-param(darken);
                mix-red: ag-param(mix-red);
                mix-b: ag-param(mix-b);
                self-overlay-1: ag-param(self-overlay-1);
                self-overlay-2: ag-param(self-overlay-2);
                self-overlay-3: ag-param(self-overlay-3);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
".foo {
opacity: rgba(100, 100, 100, 0.5);
lighten: #7e7e7e;
darken: #4b4b4b;
mix-red: #8b4b4b;
mix-b: #8b4b4b;
self-overlay-1: rgba(200, 200, 200, 0.5);
self-overlay-2: rgba(200, 200, 200, 0.75);
self-overlay-3: rgba(200, 200, 200, 0.875);
}"
`);
    });

    it('does not throw an error when used with a color property in regular use', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 my-color: red
            ));
            .foo {
                x: ag-param(my-color);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
".foo {
x: red;
}"
`);
    });

    it('throws an error when used with a color property and color access is disabled', () => {
        const render = () =>
            renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 my-color: red
            ));
            @include ag-allow-color-param-access-with-ag-param(false);
            .foo {
                x: ag-param(my-color);
            }
        `);
        expect(render).toThrow(
            'Illegal call to ag-param(my-color) - all colour params must be accessed through the ag-color-property mixin.'
        );
    });
});

describe('ag-color-property', () => {
    it('emits a color property with CSS var override', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: red,
                 suppress-color-css-var-overrides: false
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
".foo {
color: red;
color: var(--ag-a, red);
}"
`);
    });

    it('allows CSS variable overrides to be disabled', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: ag-derived(b),
                 b: ag-derived(c),
                 c: red,
                 suppress-color-css-var-overrides: true
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
".foo {
color: red;
}"
`);
    });

    it('implements ag-derived default value cascades using CSS variable default values', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: ag-derived(b),
                 b: ag-derived(c),
                 c: red,
                 suppress-color-css-var-overrides: false
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
".foo {
color: red;
color: var(--ag-a, var(--ag-b, var(--ag-c, red)));
}"
`);
    });

    it('stops the runtime variable cascade when an ag-derived value modifies a color', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: ag-derived(b),
                 b: ag-derived(c, $opacity: 0.5),
                 c: red,
                 suppress-color-css-var-overrides: false
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`
".foo {
color: rgba(255, 0, 0, 0.5);
color: var(--ag-a, rgba(255, 0, 0, 0.5));
}"
`);
    });

    it('emits nothing when a value is null', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: null,
                 suppress-color-css-var-overrides: false
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`""`);
    });

    it('emits nothing when a value resolves to null', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: ag-derived(c),
                 c: null,
                 suppress-color-css-var-overrides: false
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`""`);
    });

    it('emits nothing when a value resolves to null through an ag-derived that performs color modification', () => {
        const rendered = renderScss(`
            @import "./ag-theme-params";
            @include ag-register-params((
                 a: ag-derived(b),
                 b: ag-derived(c, $opacity: 0.5),
                 c: null,
                 suppress-color-css-var-overrides: false
            ));
            .foo {
                @include ag-color-property(color, a);
            }
        `);
        expect(rendered).toMatchInlineSnapshot(`""`);
    });
});

const renderScss = (source: string) => {
    const result = sass.renderSync({
        data: source,
        includePaths: [__dirname],
    });
    const css = result.css.toString();
    // normalise whitespace
    return css
        .replace(/\t/g, ' ')
        .replace(/;/g, ';\n')
        .replace(/{/g, '{\n')
        .replace(/}/g, '}\n')
        .replace(/\s*\n\s*/g, '\n')
        .replace(/ +/g, ' ')
        .trim();
};
