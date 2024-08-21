import { type ParamType, getParamDocs, getParamType, themeQuartz } from '@ag-grid-community/theming';
import { useAtom, useAtomValue } from 'jotai';

import type { PersistentAtom } from './JSONStorage';
import { atomWithJSONStorage } from './JSONStorage';
import type { Store } from './store';
import { type ThemeParam, memoize, titleCase } from './utils';

const paramModels: Record<string, unknown> = {};

// Params that are editable in the UI immediately without adding as an advanced param
const nonAdvancedParams = new Set([
    'fontFamily',
    'fontSize',
    'backgroundColor',
    'foregroundColor',
    'accentColor',
    'borderColor',
    'wrapperBorder',
    'rowBorder',
    'columnBorder',
    'sidePanelBorder',
    'gridSize',
    'wrapperBorderRadius',
    'borderRadius',
    'headerBackgroundColor',
    'headerTextColor',
    'headerFontFamily',
    'headerFontSize',
    'headerFontWeight',
    'headerVerticalPaddingScale',
    'cellTextColor',
    'oddRowBackgroundColor',
    'rowVerticalPaddingScale',
    'cellHorizontalPaddingScale',
    'iconSize',
]);

export class ParamModel<T> {
    readonly label: string;
    readonly docs: string;
    readonly type: ParamType;
    readonly valueAtom: PersistentAtom<T | undefined>;

    private constructor(readonly property: ThemeParam) {
        this.label = titleCase(property);
        this.valueAtom = atomWithJSONStorage<T | undefined>(`param.${property}`, undefined);
        this.docs = getParamDocs(property) || '';
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

// Suppress properties that we don't want to be discoverable in the theme builder:
//
// - sideButton*: set of properties is not well considered, needs rebuilding as a part like tabs
// - panel*: shouldn't exist as its own element to style, instead style charts and advanced filter builder separately
// - *Image: trying to edit a `url(data:svg image)` in a text editor doesn't work well

const suppressParamRegex = /^(sideButton.*|panel*|.*Image)$/;

export const allParamModels = memoize(() => {
    const allParams = Array.from(Object.keys(themeQuartz.getParams())) as ThemeParam[];
    return allParams
        .sort()
        .map(ParamModel.for)
        .filter((param) => !suppressParamRegex.test(param.property))
        .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
});
