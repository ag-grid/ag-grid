import { atomWithJSONStorage } from '@ag-website-shared/theming/JSONStorage';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { type GridConfig, buildGridOptions, defaultConfigFields } from './grid-options';

const gridConfigAtom = atomWithJSONStorage<GridConfig>(
    'grid-config',
    Object.fromEntries(defaultConfigFields.map((field) => [field, true]))
);

export const useGridConfigAtom = () => useAtom(gridConfigAtom);

const useGridConfig = () => useAtomValue(gridConfigAtom);

export const useGridOptions = () => {
    const config = useGridConfig();
    const gridOptions = useMemo(() => buildGridOptions(config), [config]);
    return { gridOptions, config, previewKey: JSON.stringify(config) };
};
