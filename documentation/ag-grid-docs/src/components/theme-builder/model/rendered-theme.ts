import type { GridApi } from '@ag-grid-community/core';
import { type Theme, defineTheme, inputStyleBordered, installTheme, tabStyleQuartz } from '@ag-grid-community/theming';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import { allParamModels } from './ParamModel';
import { PartModel } from './PartModel';
import type { Store } from './store';

const changeDetection = atom(0);

export const rerenderTheme = (store: Store) => {
    store.set(changeDetection, (n) => n + 1);
};

const previewGridContainer = atom<HTMLDivElement | null>(null);
export const useSetPreviewGridContainer = () => useSetAtom(previewGridContainer);

const previewGridApi = atom<GridApi | null>(null);
export const useSetPreviewGridApi = () => useSetAtom(previewGridApi);

export const renderedThemeAtom = atom((get): Theme => {
    get(changeDetection);

    const paramValues = Object.fromEntries(allParamModels().map((param) => [param.property, get(param.valueAtom)]));

    const iconSet = get(PartModel.for('iconSet').variantAtom).variant;

    const theme = defineTheme([iconSet, tabStyleQuartz, inputStyleBordered], paramValues);

    const container = get(previewGridContainer);
    if (container) {
        installTheme(theme, container);
        lastApi = get(previewGridApi);
        clearTimeout(lastTimeout);
        lastTimeout = setTimeout(() => {
            if (lastApi && !lastApi.destroyCalled) {
                // TODO this is a hack to force the grid to recalculate its
                // sizes, we should add a public API for this
                lastApi.gos.environment.calculatedSizes = {};
                lastApi.eventService.dispatchEvent({ type: 'gridStylesChanged' });
            }
            // TODO this timeout exists because stylesheet parsing is
            // asynchronous so we need to wait "a while" before asking the grid
            // to update itself. Potential solutions include polling to detect
            // when parsing is done (see
            // https://stackoverflow.com/questions/4488567/is-there-any-way-to-detect-when-a-css-file-has-been-fully-loaded)
            // or using replaceSync (we're not using it now because it requires
            // that we use constructed stylesheets, which have higher specificity)
        }, 250);
    }

    // also install the theme at the top level, as its variables are used in UI controls
    installTheme(theme);

    return theme;
});

let lastTimeout: any;
let lastApi: any;

export const useRenderedTheme = () => useAtomValue(renderedThemeAtom);
