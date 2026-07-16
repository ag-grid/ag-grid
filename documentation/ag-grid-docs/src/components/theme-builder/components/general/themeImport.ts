import { allParamModels } from '@ag-website-shared/theming/ParamModel';
import { allFeatureModels } from '@ag-website-shared/theming/PartModel';
import { parseThemeCode, validateAndConvertToPreset } from '@ag-website-shared/theming/parseThemeCode';
import type { Store } from '@ag-website-shared/theming/store';

import type { Part } from 'ag-grid-community';

import { type Preset, applyPreset } from '../presets/presets';

// Grid themes can swap out whole parts (icon sets, tab styles, ...), unlike a
// plain param. Match any identifier in the pasted code against each part's
// known export name, keeping the last one seen per feature.
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
                    : 'Could not find any theme parameters. Expected code like: themeQuartz.withParams({ backgroundColor: "#fff" })',
        };
    }

    // validateAndConvertToPreset only validates each param value against the
    // theming engine, so its params bag is a plain Record rather than grid's
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
