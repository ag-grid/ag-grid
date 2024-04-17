import { useAtom, useAtomValue } from 'jotai';
import { atomWithJSONStorage } from '../../model/JSONStorage';
import { buildGridOptions, type GridConfig } from './grid-options';
import { useMemo, useRef } from 'react';

const gridConfigAtom = atomWithJSONStorage<GridConfig>('grid-config', {
  rowGrouping: true,
  columnsToolPanel: true,
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
}