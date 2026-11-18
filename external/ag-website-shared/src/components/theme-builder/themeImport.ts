import type { Part } from 'ag-stack';

import { allParamModels } from '../../theming/ParamModel';
import { allFeatureModels } from '../../theming/PartModel';
import { parseThemeCode, validateAndConvertToPreset } from '../../theming/parseThemeCode';
import { type Preset, applyPreset } from '../../theming/preset';
import type { RenderedThemeInfo } from '../../theming/rendered-theme';
import type { Store } from '../../theming/store';

type ThemeCodeConfig = {
    themeVariable: string;
    importSource: string;
};

let themeCodeConfig: ThemeCodeConfig | undefined;

export const setThemeCodeConfig = (config: ThemeCodeConfig) => {
    themeCodeConfig = config;
};

const getThemeCodeConfig = (): ThemeCodeConfig => {
    if (!themeCodeConfig) {
        throw new Error('No theme code config, call setThemeCodeConfig() before importing or exporting a theme');
    }
    return themeCodeConfig;
};

const noParamsError = () =>
    `Could not find any theme parameters. Expected code like: ${getThemeCodeConfig().themeVariable}.withParams({ backgroundColor: "#fff" })`;

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

/**
 * The outcome of reading pasted theme code, ready for the dialog to render and
 * to apply. A host's parser decides both halves - `summary` is what the dialog
 * says it found, `apply` is how the theme reaches the store - so a host whose
 * themes are not param bags, a charts options object say, needs no change here.
 */
export type ValidationResult =
    | { status: 'empty'; validParamCount: 0 }
    | { status: 'success'; validParamCount: number; summary?: string; apply: (store: Store) => void }
    | {
          status: 'warning';
          validParamCount: number;
          summary?: string;
          apply: (store: Store) => void;
          warnings: string[];
      }
    | { status: 'error'; validParamCount: 0; error: string };

/**
 * One top-level key a host reads itself, such as its own options exported
 * beside the theme. Its value is read whole, so its contents are never taken
 * for theme params.
 */
export interface ThemeCodeExtension<T> {
    key: string;
    read: (value: unknown) => T | undefined;
    /** Replaces the plain preset apply. */
    apply: (store: Store, preset: Preset, value: T | undefined) => void;
    /** What else was found, appended to the summary. */
    describe?: (value: T) => string;
}

export function validateThemeCode<T>(code: string, extension?: ThemeCodeExtension<T>): ValidationResult {
    if (!code.trim()) {
        return { status: 'empty', validParamCount: 0 };
    }

    const validParamKeys = new Set<string>(allParamModels().map((m) => m.property));
    const parseResult = parseThemeCode(code, {
        isRecognizedParam: (key) => validParamKeys.has(key) || key === extension?.key,
        extractParts,
        noParamsError,
    });
    if (!parseResult.success) {
        return { status: 'error', validParamCount: 0, error: parseResult.error };
    }

    const params = { ...parseResult.params };
    let extended: T | undefined;
    if (extension) {
        extended = extension.read(params[extension.key]);
        delete params[extension.key];
    }
    const { preset: parsedPreset, warnings } = validateAndConvertToPreset({ ...parseResult, params });
    const validParamCount = Object.keys(parsedPreset.params || {}).length + (parsedPreset.parts?.length || 0);

    if (validParamCount === 0) {
        return {
            status: 'error',
            validParamCount: 0,
            error: warnings.length > 0 ? warnings.join('\n') : noParamsError(),
        };
    }

    const apply = (store: Store) =>
        extension ? extension.apply(store, parsedPreset, extended) : applyPreset(store, parsedPreset);
    const described = extended !== undefined ? extension?.describe?.(extended) : undefined;
    const summary = described
        ? `Found ${validParamCount} theme parameter${validParamCount !== 1 ? 's' : ''} and ${described}`
        : undefined;

    if (warnings.length === 0) {
        return { status: 'success', validParamCount, summary, apply };
    }

    return { status: 'warning', validParamCount, summary, apply, warnings };
}

export function renderThemeCodeSample({ overriddenParams, usedParts }: RenderedThemeInfo): string {
    const { themeVariable, importSource } = getThemeCodeConfig();
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
