import { join } from 'path';
import type { ParamType } from '../../src/metadata/docs';
import type { Part } from '../../src/theme-types';
import { DEV_MODE, fatalError, getProjectDir, writeTsFile } from './utils';

export const generateDocsFile = async () => {
    const mainExports = await import('../../src/main');
    const { allParts } = await import('../../src/parts/parts');
    const { getParamDocs, getParamDocsKeys, getParamType } = await import('../../src/metadata/docs');
    const { getPartParams } = await import('../../src/theme-types');

    const exportedParts = new Set<Part>();
    for (const [exportName, exportValue] of Object.entries(mainExports)) {
        const part = exportValue as Part;
        if (part.partId && part.variantId) {
            if (!allParts.includes(part)) {
                throw fatalError(`Part ${part.partId}/${part.variantId} is exported but not listed in allParts`);
            }
            exportedParts.add(part);
            const expectedName = part.partId + upperCamelCase(part.variantId);
            if (exportName !== expectedName) {
                throw fatalError(
                    `Part ${part.partId}/${part.variantId} should be exported with name "${expectedName}" (actual: "${exportName}")`
                );
            }
        }
    }

    for (const part of allParts) {
        if (!exportedParts.has(part)) {
            throw fatalError(`Part ${part.partId}/${part.variantId} is not exported`);
        }
        try {
            getPartParams(part).forEach(getParamType);
        } catch (e: any) {
            throw fatalError(`Error in part ${part.partId}/${part.variantId}: ${e.message}`);
        }
    }

    const allParams = Array.from(new Set<string>(allParts.flatMap((p) => getPartParams(p)))).sort();

    const allParamsSet = new Set(allParams);
    const superfluousParamDocs = getParamDocsKeys().filter((p) => !allParamsSet.has(p));
    if (superfluousParamDocs.length) {
        fatalErrorInProdOnly(`Superfluous param docs: ${superfluousParamDocs.join(', ')}`);
    }

    let result = generatedWarning;

    const valueTypes = Array.from(new Set(allParams.map(getParamType).map(valueTypeName))).sort();

    result += `import { ${valueTypes.join(', ')} } from "./main";\n\n`;

    result += `export type Param = keyof ParamTypes;\n\n`;

    result += `export type ParamTypes = {\n\n`;
    for (const param of allParams) {
        const type = getParamType(param);
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

    await writeTsFile(join(getProjectDir(), 'GENERATED-param-types.ts'), result);
};

const fatalErrorInProdOnly = (message: string) => {
    if (DEV_MODE) {
        console.error(`🧯 IGNORING FATAL ERROR IN DEV MODE: ${message}`);
    } else {
        throw fatalError(message);
    }
};

const paramExtraDocs: Record<ParamType, string[]> = {
    color: [
        'A CSS color value e.g. "red" or "#ff0088". The following shorthands are accepted:',
        '- `true` -> "solid 1px var(--ag-border-color)"',
        '- `false` -> "none".',
        // TODO add {ref: 'paramName'} when implemented as well as color extensions
    ],
    border: [
        'A CSS border value e.g. "solid 1px red". See https://developer.mozilla.org/en-US/docs/Web/CSS/border. The following shorthands are accepted:',
        '- `true` -> "solid 1px var(--ag-border-color)"',
        '- `false` -> "none".',
    ],
    borderStyle: [
        'A CSS line-style value e.g. "solid" or "dashed". See https://developer.mozilla.org/en-US/docs/Web/CSS/line-style.',
    ],
    display: [
        'A CSS display value, "block" to show the element and "none" to hide it. It is recommended to use the boolean shorthands:',
        '- `true` -> "block" (show)',
        '- `false` -> "none" (hide).',
    ],
    length: [
        'A CSS dimension value with length units, e.g. "1px" or "2em". A JavaScript number will be interpreted as a length in pixel units, e.g.',
        '- `4` -> "4px"',
        // TODO add {ref: 'paramName'} when implemented as well as length extensions
    ],
    duration: ['A CSS time value with second or millisecond units e.g. `"0.3s"` or `"300ms"`.'],
    shadow: [
        'A CSS box shadow value e.g. "10px 5px 5px red;". See https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow',
    ],
    image: [
        'A CSS image value e.g. `"url(data:image/png;base64,base64-encoded-image...)". See https://developer.mozilla.org/en-US/docs/Web/CSS/image`',
    ],
    fontFamily: ['A CSS font-family value e.g. `\'"Times New Roman", serif\'`'],
    fontWeight: ['A CSS font-weight value e.g. `500` or `"bold"`'],
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
