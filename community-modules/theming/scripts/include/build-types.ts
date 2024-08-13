import { join } from 'path';

import type { ThemeParam } from '../../src/GENERATED-param-types';
import { ThemeUnit } from '../../src/ThemeUnit';
import { coreParams } from '../../src/parts/core/core-part';
import { getParamType } from '../../src/theme-types';
import type { ParamType, Part } from '../../src/theme-types';
import { DEV_MODE, fatalError, getProjectDir, writeTsFile } from './utils';

export const generateDocsFile = async () => {
    const mainExports = await import('../../src/main');
    const { getParamDocs, getParamDocsKeys } = await import('../../src/metadata/docs');

    validateDocs(getParamDocsKeys().map((key) => [key, getParamDocs(key)]));

    const exportedUnits: ThemeUnit[] = [];
    const exportNames = new Map<ThemeUnit, string>();
    for (const [exportName, exportValue] of Object.entries(mainExports)) {
        if (exportValue instanceof ThemeUnit) {
            const unit = exportValue as ThemeUnit;
            if (exportNames.has(unit)) {
                throw new Error(`${unit.id} exported twice with names ${exportNames.get(unit)} and ${exportName}`);
            }
            exportNames.set(unit, exportName);
            exportedUnits.push(unit);
            if (!/^\w+\/\w+$/.test(unit.id)) {
                throw fatalError(`${unit.id} should have id in the format "group/variant" (actual: "${unit.id}")`);
            }
            const [groupFromId, variantFromId] = unit.id.split('/');
            const expectedName = groupFromId + upperCamelCase(variantFromId);
            if (exportName !== expectedName) {
                throw fatalError(`${unit.id} should be exported with name "${expectedName}" (actual: "${exportName}")`);
            }
            if (unit.group !== groupFromId) {
                throw fatalError(`${unit.id} has group "${unit.group}" that doesn't match the first part of its id`);
            }
        }
    }

    const allUnits = flattenUnits(exportedUnits);

    for (const unit of allUnits) {
        try {
            getPartParams(unit).forEach(getParamType);
        } catch (e: any) {
            throw fatalError(`Error in ${unit.id}: ${e.message}`);
        }
    }

    const allParams = Array.from(
        new Set<string>(Array.from(allUnits).flatMap(getPartParams).concat(coreParams))
    ).sort();

    const allParamsSet = new Set(allParams);
    const superfluousParamDocs = getParamDocsKeys().filter((p) => !allParamsSet.has(p));
    if (superfluousParamDocs.length) {
        fatalErrorInProdOnly(`Superfluous param docs: ${superfluousParamDocs.join(', ')}`);
    }

    let result = generatedWarning;

    const valueTypes = Array.from(new Set(allParams.map(getParamType).map(valueTypeName))).sort();

    result += `import type { ${valueTypes.join(', ')} } from "./theme-types";\n\n`;

    const paramsByType: Record<string, string[]> = {};

    result += docComment({
        mainComment:
            'All possible theme param types - the actual params available will be a subset of this type depending on the parts in use by the theme.',
    });
    result += `export type ThemeParams = {\n\n`;
    for (const param of allParams) {
        const type = getParamType(param);
        paramsByType[type] ||= [];
        paramsByType[type].push(param);
        let mainComment = getParamDocs(param);
        if (!mainComment) {
            const message = `No documentation for param ${param}`;
            fatalErrorInProdOnly(message);
            mainComment = message;
        }
        result += docComment({
            mainComment,
            extraComment: paramExtraDocs[type],
        });
        result += `  ${param}: ${upperCamelCase(type)}Value;\n\n`;
    }
    result += `}\n\n`;

    result += docComment({ mainComment: 'Union of all possible theme param names' });
    result += `export type ThemeParam = keyof ThemeParams;\n\n`;

    for (const type of Object.keys(paramsByType).sort()) {
        const params = paramsByType[type]
            .sort()
            .map((p) => `"${p}"`)
            .join(' | ');
        result += `export type ${upperCamelCase(type)}Param = ${params};\n\n`;
    }

    await writeTsFile(join(getProjectDir(), 'GENERATED-param-types.ts'), result);
};

const flattenUnits = (units: ThemeUnit[]): ThemeUnit[] => {
    const all: ThemeUnit[] = [];
    const accumulate = (a: readonly ThemeUnit[]) => {
        for (const unit of a) {
            all.push(unit);
            accumulate(unit.dependencies);
        }
    };
    accumulate(units);
    return Array.from(new Set(all));
};

const fatalErrorInProdOnly = (message: string) => {
    if (DEV_MODE) {
        console.error(`🧯 IGNORING FATAL ERROR IN DEV MODE: ${message}`);
    } else {
        throw fatalError(message);
    }
};

const validateDocs = (paramDocs: [string, string | undefined][]) => {
    for (const [param, docs] of paramDocs) {
        const error = getDocsError(param, docs);
        if (error) {
            fatalErrorInProdOnly(`Issue with docs for param ${param}: ${error} (docs: "${docs}")`);
        }
    }
};

const getDocsError = (key: string, docs: string | undefined): string | null => {
    if (docs == null) {
        return 'No docs';
    }
    const keyWords = key.replace(/(?<=[a-z])(?=[A-Z])/g, ' ').toLowerCase();
    const suffix = paramSuffixes.find((s) => keyWords.endsWith(s));
    if (!suffix) {
        return 'Ends with unrecognised suffix';
    }
    if (suffix === 'size') {
        return /\b(sizes?|amounts?)\b/i.test(docs) ? null : "Should contain the term 'size' or 'amount'";
    }
    if (suffix === 'border') {
        return /\b(borders?|lines?)\b/i.test(docs) ? null : "Should contain the term 'border' or 'line'";
    }
    const words = suffix.replace('scale', 'multiply').split(' ');
    for (const word of words) {
        if (!docs.toLowerCase().includes(word)) {
            return `Does not contain the pattern "${word}"`;
        }
    }
    return null;
};

const paramSuffixes = [
    'background color',
    'color scheme',
    'color',
    'scale',
    'padding start',
    'padding',
    'spacing',
    'size',
    'width',
    'height',
    'radius',
    'indent',
    'border style',
    'border',
    'shadow',
    'image',
    'font family',
    'font weight',
    'transition duration',
    'duration',
    'display',
];

const paramExtraDocs: Record<ParamType, string[]> = {
    color: [
        'A CSS color value e.g. "red" or "#ff0088". Alternatively:',
        '',
        '- `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a color param name)',
        '- `{ref: "foo", mix: 0.1}` -> use 10% `foo`, 90% transparent',
        '- `{ref: "foo", mix: 0.1, onto: "bar"}` -> use 10% `foo`, 90% `bar`',
    ],
    colorScheme: [
        'A CSS color-scheme value, e.g. "light", "dark", or "inherit" to use the same setting as the parent application',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme',
    ],
    border: [
        'A CSS border value e.g. "solid 1px red". Alternatively an object containing optional properties:',
        '',
        '- `style` -> a CSS border-style, default `"solid"`',
        '- `width` -> a width in pixels, default `1`',
        '- `color` -> a ColorValue as you would pass to any color param, default `{ref: "borderColor"}`',
        '',
        'Or a reference:',
        '- `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)',
        '',
        'Or boolean value',
        '- `true` -> `{}` (the default border style, equivalent to `{style: "solid", width: 1, color: {ref: "borderColor"}`)',
        '- `false` -> `"none"` (no border).',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/border',
    ],
    borderStyle: [
        'A CSS line-style value e.g. "solid" or "dashed".',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/line-style',
    ],
    length: [
        'A CSS dimension value with length units, e.g. "1px" or "2em". Alternatively:',
        '',
        '- `4` -> "4px" (a plain JavaScript number will be given pixel units)',
        '- `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)',
        '- `{calc: "foo + bar * 2"}` -> Use a dynamically calculated expression. You can use param names like gridSize and fontSize in the expression, as well as built-in CSS math functions like `min(gridSize, fontSize)`',
    ],
    scale: ['A number without units to multiply the original value by.'],
    duration: [
        'A CSS time value with second or millisecond units e.g. `"0.3s"` or `"300ms"`. Alternatively:',
        '',
        '- `0.4` -> "0.4s" (a plain JavaScript number is assumed to be a number of seconds.',
        '- `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration',
    ],
    shadow: [
        'A CSS box shadow value e.g. "10px 5px 5px red;". Alternatively an object containing optional properties:',
        '',
        '- `offsetX` -> number of pixels to move the shadow to the right, or a negative value to move left, default 0',
        '- `offsetY` -> number of pixels to move the shadow downwards, or a negative value to move up, default 0',
        '- `radius` -> softness of the shadow. 0 = hard edge, 10 = 10px wide blur',
        '- `spread` -> size of the shadow. 0 = same size as the shadow-casting element. 10 = 10px wider in all directions.',
        '- `color` -> color of the shadow e.g. `"red"`. Default `{ref: "foregroundColor"}`',
        '',
        'Or a reference:',
        '- `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow',
    ],
    image: [
        'A CSS image value e.g. `"url(...image-url...)"`. Alternatively:',
        '',
        '- `{svg: "...XML source of SVG image..."}` -> embed an SVG as a data: uri',
        '- `{url: "https://..."}` -> a URL to load an image asset from. Can be a HTTPS URL, or image assets such as PNGs can be converted to data: URLs',
        '- `{ref: "foo"}` -> use the same value as the `foo` param (`ref` must be a valid param name)',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/image',
    ],
    fontFamily: [
        'A CSS font-family value consisting of a font name or comma-separated list of fonts in order of preference e.g. `"Roboto, -apple-system, \'Segoe UI\', sans-serif"`. Alternatively:',
        '',
        '- `["Roboto", "-apple-system", "Segoe UI", "sans-serif"]` -> an array of font names in order of preference',
        '- `["Dave\'s Font"]` -> when passing an array, special characters in font names will automatically be escaped',
        '- `{ref: "foo"}` -> use the same value as `foo` which must be a valid font family param name',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/font-family',
    ],
    fontWeight: [
        'A CSS font-weight value e.g. `500` or `"bold"`',
        '',
        '@see https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight',
    ],
};

const docComment = (arg: {
    mainComment: string;
    extraComment?: string[] | null;
    defaultValue?: any;
    defaultValueComment?: string;
}) => {
    const newline = `\n * `;
    let result = '/**';
    result += newline + arg.mainComment;
    if (arg.extraComment) {
        result += newline + newline + arg.extraComment.join(newline);
    }
    if (arg.defaultValue !== undefined) {
        let defaultValueString = JSON.stringify(arg.defaultValue);
        if (arg.defaultValueComment) {
            defaultValueString += ` (${arg.defaultValueComment})`;
        }
        result += newline;
        result += ` * @default ${defaultValueString}`;
    }
    result += '\n */\n';
    return result;
};

const generatedWarning = `
//
// NOTE: THIS FILE IS GENERATED DO NOT EDIT IT DIRECTLY!
// It can be regenerated by running \`npm run codegen\` or
// \`npm run codegen:watch\` to regenerate on changes.
//

`;

const valueTypeName = (type: ParamType) => `${upperCamelCase(type)}Value`;

const upperCamelCase = (str: string) => camelCase(str[0].toUpperCase() + str.slice(1));

const camelCase = (str: string) => str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());

const getPartParams = (part: Part): ThemeParam[] => Object.keys(part.defaults) as ThemeParam[];
