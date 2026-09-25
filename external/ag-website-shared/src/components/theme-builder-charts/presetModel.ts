import { atomWithJSONStorage } from '@ag-website-shared/theming/JSONStorage';
import type { Store } from '@ag-website-shared/theming/store';
import type { AgChartThemeName } from 'ag-charts-community';
import { useAtomValue } from 'jotai';

/**
 * Which preset the current theme was started from. Persisted alongside the params
 * and the palette because it decides the exported theme's `baseTheme`. The id
 * alone: a stored copy of the definition would go stale. `null` is an imported
 * theme, on no preset at all; unset means no first visit has seeded one yet.
 */
const selectedPresetAtom = atomWithJSONStorage<string | null | undefined>('charts-preset', undefined);

export const useSelectedPresetId = () => useAtomValue(selectedPresetAtom);

export const setSelectedPresetId = (store: Store, id: string | null) => store.set(selectedPresetAtom, id);

export const getSelectedPresetId = (store: Store) => store.get(selectedPresetAtom);

/**
 * A base theme that came from imported code rather than from a preset. Kept apart
 * from the preset id, which stays the source of the palette and the page colour;
 * choosing a preset clears this.
 */
const importedBaseThemeAtom = atomWithJSONStorage<AgChartThemeName | undefined>('charts-base-theme', undefined);

export const useImportedBaseTheme = () => useAtomValue(importedBaseThemeAtom);

export const setImportedBaseTheme = (store: Store, baseTheme: AgChartThemeName | undefined) =>
    store.set(importedBaseThemeAtom, baseTheme);

export const getImportedBaseTheme = (store: Store) => store.get(importedBaseThemeAtom);
