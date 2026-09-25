import { type Palette, withPaletteDefaults } from '@ag-website-shared/components/theme-builder/palette';
import { atomWithJSONStorage } from '@ag-website-shared/theming/JSONStorage';
import { addChangedModelItem } from '@ag-website-shared/theming/changed-model-items';
import type { Store } from '@ag-website-shared/theming/store';
import { useAtom, useAtomValue, useStore } from 'jotai';
import { useCallback } from 'react';

import { DEFAULT_THEME_NAME, getPalette } from './chartsTheme';

/**
 * The palette has no counterpart in the shared param model, which knows only flat
 * named params, so it gets an atom of its own and the host composes the two. Only
 * the storage binding is here - the shape and transforms are host-agnostic and
 * live in `theme-builder/palette.ts`.
 */

const DEFAULT_PALETTE = getPalette(DEFAULT_THEME_NAME);

/** Unset means "inherit the base theme's palette". */
const paletteAtom = atomWithJSONStorage<Palette | undefined>('charts-palette', undefined);

/** Only a preset: an import omits an accent to say the base theme's should show through. */
export const completePalette = (palette: Palette) => withPaletteDefaults(palette, DEFAULT_PALETTE);

export const usePalette = () => {
    const store = useStore();
    const [stored, setStored] = useAtom(paletteAtom);
    // No ParamModel for the provider's listeners to watch, so an edit reports itself.
    const setPalette = useCallback(
        (palette: Palette) => {
            setStored(palette);
            addChangedModelItem(store, 'charts-palette');
        },
        [store, setStored]
    );
    return [stored ?? DEFAULT_PALETTE, setPalette] as const;
};

export const useStoredPalette = () => useAtomValue(paletteAtom);

export const setStoredPalette = (store: Store, palette: Palette | undefined) => store.set(paletteAtom, palette);

export const getStoredPalette = (store: Store) => store.get(paletteAtom);
