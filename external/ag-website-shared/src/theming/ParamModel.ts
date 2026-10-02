import { useAtom, useAtomValue } from 'jotai';

import type { PersistentAtom } from './JSONStorage';
import { atomWithJSONStorage } from './JSONStorage';
import { type ParamType, getParamType } from './api';
import { getBaseTheme } from './base-theme';
import type { Store } from './store';
import { type ThemeParam, getThemeDefaultParams, memoize, titleCase } from './utils';

const paramModels: Record<string, unknown> = {};

let nonAdvancedParams = new Set<string>();

/**
 * Hosts supply the params that are editable directly rather than only after
 * being added as an advanced param. Must be called before any ParamModel is
 * used, since onlyEditableAsAdvancedParam is read against this set.
 */
export const setNonAdvancedParams = (params: Iterable<string>) => {
    nonAdvancedParams = new Set(params);
};

type ThemeParamSource = () => Record<string, unknown>;

let themeParamSource: ThemeParamSource = () => getThemeDefaultParams(getBaseTheme());

/**
 * Hosts supply the catalogue of params the builder knows about; the base
 * theme's own params otherwise. Must be called before allParamModels() is first
 * evaluated, since that result is memoized.
 */
export const setThemeParamSource = (source: ThemeParamSource) => {
    themeParamSource = source;
};

type ParamDocsProvider = (property: string) => string | undefined;

let paramDocsProvider: ParamDocsProvider = () => undefined;

/**
 * Hosts can plug in a source of per-param documentation strings (e.g. JSDoc
 * extracted from the theming engine at doc-site build time). Read on demand
 * rather than at construction, so a host whose docs arrive as a render prop can
 * register them then and still reach the models already built.
 */
export const setParamDocsProvider = (provider: ParamDocsProvider) => {
    paramDocsProvider = provider;
};

type ParamDocsUrlProvider = (property: string) => string | undefined;

let paramDocsUrlProvider: ParamDocsUrlProvider = () => undefined;

/**
 * Hosts can plug in a page to send the reader to for a param's full
 * documentation - the site's API reference, anchored on the param itself. Kept
 * apart from the descriptions, a host being able to have the text without
 * having a page to link to; registering neither leaves the tooltip unlinked.
 */
export const setParamDocsUrlProvider = (provider: ParamDocsUrlProvider) => {
    paramDocsUrlProvider = provider;
};

export class ParamModel<T> {
    readonly label: string;
    readonly type: ParamType;
    readonly valueAtom: PersistentAtom<T | undefined>;

    private constructor(readonly property: ThemeParam) {
        this.label = titleCase(property);
        this.valueAtom = atomWithJSONStorage<T | undefined>(`param.${property}`, undefined);
        this.type = getParamType(property);
    }

    get docs(): string {
        return paramDocsProvider(this.property) || '';
    }

    get docsUrl(): string | undefined {
        return paramDocsUrlProvider(this.property);
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
