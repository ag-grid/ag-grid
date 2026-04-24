import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useRef } from 'react';

import { atomWithJSONStorage } from '../../model/JSONStorage';
import { type GridConfig, buildGridOptions, defaultConfigFields } from './grid-options';

const gridConfigAtom = atomWithJSONStorage<GridConfig>(
    'grid-config',
    Object.fromEntries(defaultConfigFields.map((field) => [field, true]))
);

export const useGridConfigAtom = () => useAtom(gridConfigAtom);

export const useGridConfig = () => useAtomValue(gridConfigAtom);

export const useGridOptions = () => {
    const config = useGridConfig();
    const gridOptions = useMemo(() => {
        return buildGridOptions(config);
    }, [config]);
    /* eslint-disable react-hooks/refs -- intentionally reading/writing ref during render to track config changes */
    const state = useRef({ updateCount: 1, prevConfig: config });
    if (config !== state.current.prevConfig) {
        state.current.updateCount += 1;
        state.current.prevConfig = config;
    }
    return {
        gridOptions,
        config,
        updateCount: state.current.updateCount,
    };
    /* eslint-enable react-hooks/refs */
};
