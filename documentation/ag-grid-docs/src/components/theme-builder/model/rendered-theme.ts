import { type Theme, themeQuartz } from '@ag-grid-community/theming';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import { allParamModels } from './ParamModel';
import { FeatureModel } from './PartModel';
import { enabledAdvancedParamsAtom } from './advanced-params';
import type { Store } from './store';

const changeDetection = atom(0);

export const rerenderTheme = (store: Store) => {
    store.set(changeDetection, (n) => n + 1);
};

export const renderedThemeAtom = atom((get): Theme => {
    get(changeDetection);
    const enabledAdvancedParams = get(enabledAdvancedParamsAtom);

    const params = Object.fromEntries(
        allParamModels()
            .filter((param) => enabledAdvancedParams.has(param.property) || !param.onlyEditableAsAdvancedParam)
            .map((param) => [param.property, get(param.valueAtom)])
    );

    const iconSet = get(FeatureModel.for('iconSet').selectedPartAtom).part;

    const theme = themeQuartz.usePart(iconSet).overrideParams(params);

    return theme as Theme;
});

export const useRenderedTheme = () => useAtomValue(renderedThemeAtom);
