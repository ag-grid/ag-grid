import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useRef } from 'react';

import { atomWithJSONStorage } from '../../model/JSONStorage';
import { type GridConfig, buildGridOptions } from './grid-options';

const gridConfigAtom = atomWithJSONStorage<GridConfig>('grid-config', {
    columnResizing: true,
    pagination: true,
    rowSelection: true,
});

export const useGridConfigAtom = () => useAtom(gridConfigAtom);

export const useGridConfig = () => useAtomValue(gridConfigAtom);

export const useGridOptions = () => {
    const config = useGridConfig();
    const gridOptions = useMemo(() => {
        return buildGridOptions(config);
    }, [config]);
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
};
