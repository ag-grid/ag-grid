import type { Part } from 'ag-grid-community';

import { allParamModels } from '../../theming/ParamModel';
import { allFeatureModels } from '../../theming/PartModel';
import { parseThemeCode, validateAndConvertToPreset } from '../../theming/parseThemeCode';
import { type Preset, applyPreset } from '../../theming/preset';
import type { RenderedThemeInfo } from '../../theming/rendered-theme';
import type { Store } from '../../theming/store';

// Host-agnostic import/export of theme code. The generated snippet and the
// import statement differ per host (studioTheme from 'ag-studio', themeQuartz
// from 'ag-grid-community', a future charts theme, ...), supplied here.
type ThemeCodeConfig = {
    themeVariable: string;
    importSource: string;
};

let themeCodeConfig: ThemeCodeConfig = { themeVariable: 'themeQuartz', importSource: 'ag-grid-community' };

export const setThemeCodeConfig = (config: ThemeCodeConfig) => {
    themeCodeConfig = config;
};

// Themes can swap out whole parts (icon sets, tab styles, ...), unlike a plain
// param. Match any identifier in the pasted code against each part's known
// export name, keeping the last one seen per feature. Hosts without swappable
// parts have no features, so this returns nothing.
function extractParts(identifiers: string[]): Part<any>[] {
    const features = allFeatureModels();

    const partByExportName = new Map<string, Part<any>>();
    for (const feature of features) {
        for (const partModel of feature.parts) {
            partByExportName.set(partModel.exportName, partModel.part);
        }
    }

    const selectedPartByFeature = new Map<string, Part<any>>();
    for (const identifier of identifiers) {
        if (partByExportName.has(identifier)) {
            const feature = features.find((f) => identifier.startsWith(f.featureName));
            if (feature) {
                selectedPartByFeature.set(feature.featureName, partByExportName.get(identifier)!);
            }
        }
    }

    return Array.from(selectedPartByFeature.values());
}

export type ValidationResult =
    | { status: 'empty'; validParamCount: 0 }
    | { status: 'success'; validParamCount: number; preset: Preset }
    | { status: 'warning'; validParamCount: number; preset: Preset; warnings: string[] }
    | { status: 'error'; validParamCount: 0; error: string };

export function validateThemeCode(code: string): ValidationResult {
    if (!code.trim()) {
        return { status: 'empty', validParamCount: 0 };
    }

    const validParamKeys = new Set<string>(allParamModels().map((m) => m.property));
    const parseResult = parseThemeCode(code, {
        isRecognizedParam: (key) => validParamKeys.has(key),
        extractParts,
    });
    if (!parseResult.success) {
        return { status: 'error', validParamCount: 0, error: parseResult.error };
    }

    const { preset: parsedPreset, warnings } = validateAndConvertToPreset(parseResult);
    const validParamCount = Object.keys(parsedPreset.params || {}).length + (parsedPreset.parts?.length || 0);

    if (validParamCount === 0) {
        return {
            status: 'error',
            validParamCount: 0,
            error:
                warnings.length > 0
                    ? warnings.join('\n')
                    : `Could not find any theme parameters. Expected code like: ${themeCodeConfig.themeVariable}.withParams({ backgroundColor: "#fff" })`,
        };
    }

    // validateAndConvertToPreset only validates each param value against the
    // theming engine, so its params bag is a plain Record rather than the
    // stricter Partial<ThemeParams> - safe to widen here.
    const preset = parsedPreset as Preset;

    if (warnings.length === 0) {
        return { status: 'success', validParamCount, preset };
    }

    return { status: 'warning', validParamCount, preset, warnings };
}

export function applyValidatedTheme(store: Store, preset: Preset): void {
    applyPreset(store, preset);
}

export function renderThemeCodeSample({ overriddenParams, usedParts }: RenderedThemeInfo): string {
    const { themeVariable, importSource } = themeCodeConfig;
    const imports = [themeVariable];
    let code = '';
    code += `// to use myTheme in an application, pass it to the theme option\n`;
    const paramsJS = JSON.stringify(overriddenParams, null, 4)
        .replaceAll(/^(\s+)"([^"]+)":/gm, '$1$2:')
        .replaceAll(/(:\s*)"(\d+)px"/gm, '$1$2');
    code += `export const myTheme = ${themeVariable}\n`;
    for (const part of usedParts) {
        const partImport = camelCase(part.id);
        code += `    .withPart(${partImport})\n`;
        imports.push(partImport);
    }
    code += `    .withParams(${paramsJS.replaceAll('\n', '\n    ')});\n`;
    code = `import { ${imports.join(', ')} } from '${importSource}';\n\n${code}`;

    return code;
}

const camelCase = (str: string) => str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());
