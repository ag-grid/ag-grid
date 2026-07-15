import { expect, test } from 'vitest';

import type { Part } from 'ag-grid-community';
import { iconSetAlpine, iconSetMaterial, tabStyleMaterial } from 'ag-grid-community';

import { type ParseThemeResult, parseThemeCode, validateAndConvertToPreset } from './parseThemeCode';

// parseThemeCode is host-agnostic, so tests supply their own recognised-param
// set and part extractor rather than depending on grid's real ParamModel/
// PartModel (which is what production callers use instead).
const TEST_PARAM_KEYS = new Set([
    'accentColor',
    'chromeBackgroundColor',
    'fontSize',
    'backgroundColor',
    'wrapperBorder',
    'fontFamily',
]);

const TEST_PARTS_BY_EXPORT_NAME: Record<string, Part<any>> = { iconSetAlpine, iconSetMaterial, tabStyleMaterial };

function testExtractParts(identifiers: string[]): Part<any>[] {
    const selectedByFeature = new Map<string, Part<any>>();
    for (const identifier of identifiers) {
        const part = TEST_PARTS_BY_EXPORT_NAME[identifier];
        if (part) {
            const featureName = identifier.startsWith('iconSet') ? 'iconSet' : 'tabStyle';
            selectedByFeature.set(featureName, part);
        }
    }
    return Array.from(selectedByFeature.values());
}

function parse(code: string): ParseThemeResult {
    return parseThemeCode(code, {
        isRecognizedParam: (key) => TEST_PARAM_KEYS.has(key),
        extractParts: testExtractParts,
    });
}

test('parses params, parts and nested objects from typical theme code', () => {
    expect(
        parse(`
            import { themeQuartz, iconSetAlpine } from 'ag-grid-community';

            // to use myTheme in an application, pass it to the theme grid option
            const myTheme = themeQuartz
                .withPart(iconSetAlpine)
                .withParams({
                    accentColor: "#4EF222",
                    chromeBackgroundColor: {
                        ref: "foregroundColor",
                        mix: 0.07,
                        onto: "backgroundColor"
                    },
                });
        `)
    ).toEqual({
        success: true,
        params: {
            accentColor: '#4EF222',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.07,
                onto: 'backgroundColor',
            },
        },
        parts: [iconSetAlpine],
        variableWarnings: [],
    });
});

test('parses various param value types and formats', () => {
    // Plain object without .withParams()
    expect(parse(`{ fontSize: 14, backgroundColor: "#fff" }`).params).toEqual({
        fontSize: 14,
        backgroundColor: '#fff',
    });

    // Boolean values
    expect(parse(`{ wrapperBorder: true }`).params).toEqual({ wrapperBorder: true });
    expect(parse(`{ wrapperBorder: false }`).params).toEqual({ wrapperBorder: false });

    // Null value
    expect(parse(`{ wrapperBorder: null }`).params).toEqual({ wrapperBorder: null });

    // Integer and float numbers
    expect(parse(`{ fontSize: 14 }`).params).toEqual({ fontSize: 14 });
    expect(parse(`{ fontSize: 14.5 }`).params).toEqual({ fontSize: 14.5 });
    expect(parse(`{ fontSize: -3.14 }`).params).toEqual({ fontSize: -3.14 });

    // Array values
    expect(parse(`{ fontFamily: ["Arial", "sans-serif"] }`).params).toEqual({
        fontFamily: ['Arial', 'sans-serif'],
    });

    // Nested object with identifier keys
    expect(parse(`{ chromeBackgroundColor: { ref: "foo", mix: 0.5 } }`).params).toEqual({
        chromeBackgroundColor: { ref: 'foo', mix: 0.5 },
    });

    // Single quoted key at top level
    expect(parse(`{ 'fontSize': 14 }`).params).toEqual({ fontSize: 14 });

    // Double quoted key at top level
    expect(parse(`{ "fontSize": 14 }`).params).toEqual({ fontSize: 14 });

    // Single quoted key in nested object
    expect(parse(`{ chromeBackgroundColor: { 'ref': "foo" } }`).params).toEqual({
        chromeBackgroundColor: { ref: 'foo' },
    });

    // Tolerates line comments in code
    expect(
        parse(`{
        // comment
        chromeBackgroundColor
        // comment
        :
        // comment
        {
        // comment
        'ref':
        // comment
        "foo"
        // comment
        }
        // comment
        }`).params
    ).toEqual({
        chromeBackgroundColor: { ref: 'foo' },
    });

    // Tolerates line comments in code
    expect(
        parse(`{
        /* comment */
        chromeBackgroundColor
        /* comment */
        :
        /* comment */
        {
        /* comment */
        'ref':
        /* comment */
        "foo"
        /* comment */
        }
        /* comment */
        }`).params
    ).toEqual({
        chromeBackgroundColor: { ref: 'foo' },
    });

    // Double quoted key in nested object
    expect(parse(`{ chromeBackgroundColor: { "ref": "foo" } }`).params).toEqual({
        chromeBackgroundColor: { ref: 'foo' },
    });

    // Escape sequences in string values are unescaped
    expect(parse(String.raw`{ fontFamily: "Foo \"Bar\" é\n", accentColor: '#4EF222' }`).params).toEqual({
        fontFamily: 'Foo "Bar" é\n',
        accentColor: '#4EF222',
    });

    // Array as property of object within value
    expect(parse(`{ chromeBackgroundColor: { items: [1, 2, 3] } }`).params).toEqual({
        chromeBackgroundColor: { items: [1, 2, 3] },
    });

    // Object within array
    expect(parse(`{ fontFamily: [{ name: "Arial" }, { name: "Helvetica" }] }`).params).toEqual({
        fontFamily: [{ name: 'Arial' }, { name: 'Helvetica' }],
    });

    // Unknown keys are silently filtered
    expect(parse(`{ fontSize: 14, unknownKey: "value" }`).params).toEqual({ fontSize: 14 });

    // Variable references generate warnings but don't fail
    expect(parse(`{ fontSize: myVar, backgroundColor: "#fff" }`)).toMatchObject({
        success: true,
        params: { backgroundColor: '#fff' },
        variableWarnings: ['Parsing error at fontSize: `myVar` looks like JS code, not a value'],
    });

    // Function calls generate warnings with full expression (no spaces)
    expect(parse(`{ fontSize: myFunction(), backgroundColor: "#fff" }`)).toMatchObject({
        success: true,
        params: { backgroundColor: '#fff' },
        variableWarnings: ['Parsing error at fontSize: `myFunction()` looks like JS code, not a value'],
    });

    // Complex code preserves whitespace
    expect(parse('{ fontSize: calculate(a, b, [`template ${foo()} `, d]) , backgroundColor: "#fff" }')).toMatchObject({
        success: true,
        params: { backgroundColor: '#fff' },
        variableWarnings: [
            'Parsing error at fontSize: `calculate(a, b, [`template ${foo()} `, d])` looks like JS code, not a value',
        ],
    });

    // Long code is truncated
    expect(
        parse(
            '{ fontSize: this is an\nextremely long string\nover several lines\nthat will be truncated, backgroundColor: "#fff" }'
        )
    ).toMatchObject({
        success: true,
        params: { backgroundColor: '#fff' },
        variableWarnings: [
            'Parsing error at fontSize: `this is an extremely long string over several line...` looks like JS code, not a value',
        ],
    });
});

test('detects parts anywhere in code with last-wins for same feature', () => {
    // Parts-only code (no params) is valid
    expect(parse(`const theme = themeQuartz.withPart(iconSetAlpine);`)).toMatchObject({
        success: true,
        params: {},
        parts: [iconSetAlpine],
    });

    // Part in import statement
    expect(parse(`import { iconSetAlpine } from 'ag-grid-community';`).parts).toEqual([iconSetAlpine]);

    // Multiple parts of same feature - last wins
    expect(
        parse(`
            import { iconSetAlpine, iconSetMaterial } from 'ag-grid-community';
            const theme = themeQuartz.withPart(iconSetAlpine).withPart(iconSetMaterial);
        `).parts
    ).toEqual([iconSetMaterial]);

    // Multiple parts from different features - all detected
    expect(
        parse(`
            import { iconSetAlpine, tabStyleMaterial } from 'ag-grid-community';
            const theme = themeQuartz.withPart(iconSetAlpine).withPart(tabStyleMaterial);
        `).parts
    ).toEqual(expect.arrayContaining([iconSetAlpine, tabStyleMaterial]));
});

test('parseThemeCode with no extractParts option never returns parts', () => {
    expect(parseThemeCode(`{ fontSize: 14 }`, { isRecognizedParam: (key) => TEST_PARAM_KEYS.has(key) })).toEqual({
        success: true,
        params: { fontSize: 14 },
        parts: [],
        variableWarnings: [],
    });
});

test('validateAndConvertToPreset creates preset with warnings for invalid param values', () => {
    const { preset, warnings } = validateAndConvertToPreset({
        success: true,
        params: {
            fontSize: 14, // valid
            backgroundColor: '#fff', // valid
            accentColor: { invalid: true }, // warning: invalid value
        },
        parts: [iconSetAlpine],
        variableWarnings: [],
    });

    // Valid items included in preset
    expect(preset.params).toEqual({
        fontSize: 14,
        backgroundColor: '#fff',
    });
    expect(preset.parts).toEqual([iconSetAlpine]);

    // Warnings for invalid items
    expect(warnings).toHaveLength(1);
    expect(warnings.some((w) => w.includes('accentColor'))).toBe(true);
});
