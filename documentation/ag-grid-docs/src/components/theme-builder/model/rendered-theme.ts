import { Theme, inputStyleBordered, tabStyleQuartz } from '@ag-grid-community/theming';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import { allParamModels } from './ParamModel';
import { PartModel } from './PartModel';
import { enabledAdvancedParamsAtom } from './advanced-params';
import type { Store } from './store';

const changeDetection = atom(0);

export const rerenderTheme = (store: Store) => {
    store.set(changeDetection, (n) => n + 1);
};

const previewGridContainer = atom<HTMLDivElement | null>(null);
export const useSetPreviewGridContainer = () => useSetAtom(previewGridContainer);

export const renderedThemeAtom = atom((get): Theme => {
    get(changeDetection);
    const enabledAdvancedParams = get(enabledAdvancedParamsAtom);

    const params = Object.fromEntries(
        allParamModels()
            .filter((param) => enabledAdvancedParams.has(param.property) || !param.onlyEditableAsAdvancedParam)
            .map((param) => [param.property, get(param.valueAtom)])
    );

    const iconSet = get(PartModel.for('iconSet').variantAtom).variant;

    const theme = new Theme({
        parts: [iconSet, tabStyleQuartz, inputStyleBordered],
        params,
    });

    const container = get(previewGridContainer);
    if (container) {
        theme.install({ container });
    }

    // also install the theme at the top level, as it is required for preset previews
    theme.install();

    return theme;
});

export const useRenderedTheme = () => useAtomValue(renderedThemeAtom);
