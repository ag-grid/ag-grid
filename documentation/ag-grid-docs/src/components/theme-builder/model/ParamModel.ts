import {
    type ParamType,
    corePart,
    getParamDocs,
    getParamType,
    getPartParams,
    inputStyleBase,
    tabStyleBase,
} from '@ag-grid-community/theming';
import { useAtom, useAtomValue } from 'jotai';

import type { PersistentAtom } from './JSONStorage';
import { atomWithJSONStorage } from './JSONStorage';
import type { Store } from './store';
import { memoize, titleCase } from './utils';

const paramModels: Record<string, ParamModel> = {};

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

export class ParamModel {
    readonly label: string;
    readonly docs: string;
    readonly type: ParamType;
    readonly valueAtom: PersistentAtom<any>;

    private constructor(readonly property: string) {
        this.label = titleCase(property);
        this.valueAtom = atomWithJSONStorage(`param.${property}`, undefined);
        this.docs = getParamDocs(property) || '';
        this.type = getParamType(property);
    }

    hasValue = (store: Store) => store.get(this.valueAtom) != null;

    get onlyEditableAsAdvancedParam(): boolean {
        return !nonAdvancedParams.has(this.property);
    }

    static for(property: string | ParamModel) {
        if (property instanceof ParamModel) {
            return property;
        }
        return paramModels[property] || (paramModels[property] = new ParamModel(property));
    }
}

export const useParamAtom = (model: ParamModel) => useAtom(model.valueAtom);

export const useParam = (model: ParamModel) => useAtomValue(model.valueAtom);

// Suppress properties that we don't want to be discoverable in the theme builder:
//
// - sideButton*: set of properties is not well considered, needs rebuilding as a part like tabs
// - panel*: shouldn't exist as its own element to style, instead style charts and advanced filter builder separately
// - *Image: trying to edit a `url(data:svg image)` in a text editor doesn't work well
// - *Shadow: we don't have a shadow editor, and reinterpretValue doesn't work for var() expressions in box-shadow values so editing in a text editor is clunky

const suppressParamEditingRegex = /^(sideButton.*|panel*|.*Image)$/;

export const allParamModels = memoize(() =>
    [...getPartParams(corePart), ...getPartParams(inputStyleBase), ...getPartParams(tabStyleBase)]
        .map((param) => ParamModel.for(param))
        .filter((param) => !suppressParamEditingRegex.test(param.property))
        .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
);
