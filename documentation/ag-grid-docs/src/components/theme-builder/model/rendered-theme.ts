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
        const api: any = get(previewGridApi);
        setTimeout(() => {
            if (api && !api.destroyCalled) {
                // TODO this is a hack to force the grid to recalculate its
                // sizes, we should add a public API for this
                api.gos.environment.calculatedSizes = {};
                api.eventService.dispatchEvent({ type: 'gridStylesChanged' });
            }
        }, 1);
    }

    // also install the theme at the top level, as its variables are used in UI controls
    installTheme(theme);

    return theme;
});

export const useRenderedTheme = () => useAtomValue(renderedThemeAtom);
