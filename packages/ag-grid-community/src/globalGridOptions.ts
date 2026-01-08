import type { GridOptions } from './entities/gridOptions';
import { _mergeDeep } from './utils/mergeDeep';

export class GlobalGridOptions {
    static gridOptions: GridOptions | undefined = undefined;
    static mergeStrategy: GlobalGridOptionsMergeStrategy = 'shallow';

    /**
     * @param providedOptions
     * @returns Shallow copy of the provided options with global options merged in.
     */
    static applyGlobalGridOptions(providedOptions: GridOptions): GridOptions {
        return _mergeGridOptions(GlobalGridOptions.gridOptions, providedOptions, GlobalGridOptions.mergeStrategy);
    }

    /**
     * Apply global grid option for a specific option key.
     * If the merge strategy is 'deep' and both global and provided values are objects, they will be merged deeply.
     * Otherwise, the provided value is returned as is.
     * @param optionKey - The key of the grid option to apply.
     * @param providedValue - The value provided to the grid instance.
     * @returns The merged value if applicable, otherwise the provided value.
     */
    static applyGlobalGridOption<K extends keyof GridOptions>(
        optionKey: K,
        providedValue: GridOptions[K]
    ): GridOptions[K] {
        if (GlobalGridOptions.mergeStrategy === 'deep') {
            const globalValue = _getGlobalGridOption(optionKey);
            if (globalValue && typeof globalValue === 'object' && typeof providedValue === 'object') {
                return GlobalGridOptions.applyGlobalGridOptions({ [optionKey]: providedValue })[optionKey];
            }
        }
        return providedValue;
    }
}

/**
 * When providing global grid options, specify how they should be merged with the grid options provided to individual grids.
 * - `deep` will merge the global options into the provided options deeply, with provided options taking precedence.
 * - `shallow` will merge the global options with the provided options shallowly, with provided options taking precedence.
 * @default 'shallow'
 * @param gridOptions - global grid options
 */
export type GlobalGridOptionsMergeStrategy = 'deep' | 'shallow';

/**
 * Provide gridOptions that will be shared by all grid instances.
 * Individually defined GridOptions will take precedence over global options.
 * @param gridOptions - global grid options
 */
export function provideGlobalGridOptions(
    gridOptions: GridOptions,
    mergeStrategy: GlobalGridOptionsMergeStrategy = 'shallow'
): void {
    GlobalGridOptions.gridOptions = gridOptions;
    GlobalGridOptions.mergeStrategy = mergeStrategy;
}

export function _getGlobalGridOption<K extends keyof GridOptions>(gridOption: K): GridOptions[K] {
    return GlobalGridOptions.gridOptions?.[gridOption];
}

/**
 * Merge grid options using the specified strategy.
 * @param baseOptions - Base options to merge into
 * @param providedOptions - Options to merge on top
 * @param mergeStrategy - 'deep' or 'shallow' merge strategy
 * @returns Merged grid options
 */
export function _mergeGridOptions(
    baseOptions: GridOptions | undefined,
    providedOptions: GridOptions | undefined,
    mergeStrategy: GlobalGridOptionsMergeStrategy
): GridOptions {
    if (!baseOptions) {
        // No baseOptions provided, return a shallow copy of the provided options
        return providedOptions ? { ...providedOptions } : {};
    }
    if (!providedOptions) {
        return { ...baseOptions };
    }

    let mergedGridOps: GridOptions = {};
    // Merge deep to avoid leaking changes to the global options
    _mergeDeep(mergedGridOps, baseOptions, true, true);
    if (mergeStrategy === 'deep') {
        _mergeDeep(mergedGridOps, providedOptions, true, true);
    } else {
        // Shallow copy so that provided object properties completely override global options
        mergedGridOps = { ...mergedGridOps, ...providedOptions };
    }

    // Handle context specially to maintain reference
    if (baseOptions.context) {
        // Ensure context reference is maintained if it was provided
        mergedGridOps.context = baseOptions.context;
    }
    if (providedOptions.context) {
        if (mergeStrategy === 'deep' && mergedGridOps.context) {
            // Merge global context properties into the provided context whilst maintaining provided context reference
            _mergeDeep(providedOptions.context, mergedGridOps.context, true, true);
        }
        mergedGridOps.context = providedOptions.context;
    }

    return mergedGridOps;
}
