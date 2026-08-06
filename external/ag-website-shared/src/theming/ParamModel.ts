import { useAtom, useAtomValue } from 'jotai';

import { themeQuartz } from 'ag-grid-community';

import type { PersistentAtom } from './JSONStorage';
import { atomWithJSONStorage } from './JSONStorage';
import { type ParamType, getParamType } from './api';
import type { Store } from './store';
import { type ThemeParam, getThemeDefaultParams, memoize, titleCase } from './utils';

const paramModels: Record<string, unknown> = {};

// Params that are editable in the UI immediately without adding as an advanced param.
// Grid's default set; hosts can override the whole set via setNonAdvancedParams.
const gridNonAdvancedParams = new Set([
    'fontFamily',
    'fontSize',
    'backgroundColor',
    'foregroundColor',
    'accentColor',
    'borderColor',
    'wrapperBorder',
    'rowBorder',
    'columnBorder',
    'headerRowBorder',
    'spacing',
    'wrapperBorderRadius',
    'borderRadius',
    'headerBackgroundColor',
    'headerTextColor',
    'headerFontFamily',
    'headerFontSize',
    'headerFontWeight',
    'headerVerticalPaddingScale',
    'cellTextColor',
    'dataBackgroundColor',
    'oddRowBackgroundColor',
    'rowVerticalPaddingScale',
    'cellHorizontalPaddingScale',
    'iconSize',
]);

let nonAdvancedParams = gridNonAdvancedParams;

/**
 * Hosts can supply the set of params that are editable directly (not only as an
 * advanced param). Defaults to grid's set. Must be called before any ParamModel
 * is used, since onlyEditableAsAdvancedParam is read against this set.
 */
export const setNonAdvancedParams = (params: Iterable<string>) => {
    nonAdvancedParams = new Set(params);
};

type ThemeParamSource = () => Record<string, unknown>;

let themeParamSource: ThemeParamSource = () => getThemeDefaultParams(themeQuartz);

/**
 * Hosts can supply the source of "all params" the builder knows about (e.g.
 * Studio's studioTheme default params rather than grid's themeQuartz). Defaults
 * to grid's themeQuartz. Must be called before allParamModels() is first
 * evaluated, since that result is memoized.
 */
export const setThemeParamSource = (source: ThemeParamSource) => {
    themeParamSource = source;
};

type ParamDocsProvider = (property: string) => string | undefined;

let paramDocsProvider: ParamDocsProvider = () => undefined;

/**
 * Hosts can plug in a source of per-param documentation strings (e.g. JSDoc
 * comments extracted from the theming engine at doc-site build time). Must be
 * called before any ParamModel is constructed, since docs are resolved eagerly
 * in the constructor.
 */
export const setParamDocsProvider = (provider: ParamDocsProvider) => {
    paramDocsProvider = provider;
};

export class ParamModel<T> {
    readonly label: string;
    readonly docs: string;
    readonly type: ParamType;
    readonly valueAtom: PersistentAtom<T | undefined>;

    private constructor(readonly property: ThemeParam) {
        this.label = titleCase(property);
        this.valueAtom = atomWithJSONStorage<T | undefined>(`param.${property}`, undefined);
        this.docs = paramDocsProvider(property) || '';
        this.type = getParamType(property);
    }

    hasValue = (store: Store) => store.get(this.valueAtom) != null;

    get onlyEditableAsAdvancedParam(): boolean {
        return !nonAdvancedParams.has(this.property);
    }

    static for<T>(property: ThemeParam | ParamModel<T>): ParamModel<T> {
        if (property instanceof ParamModel) {
            return property;
        }
        if (!paramModels[property]) {
            paramModels[property] = new ParamModel<T>(property);
        }
        return paramModels[property] as ParamModel<T>;
    }
}

export const useParamAtom = <T>(model: ParamModel<T>) => useAtom(model.valueAtom);

export const useParam = <T>(model: ParamModel<T>) => useAtomValue(model.valueAtom);

export const allParamModels = memoize(() => {
    const defaultModeParams = themeParamSource();
    const allParams = Array.from(Object.keys(defaultModeParams)) as ThemeParam[];
    return allParams.map(ParamModel.for).sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
});
