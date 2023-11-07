import { useAtomValue, useSetAtom } from 'jotai';
import { atomWithJSONStorage } from './JSONStorage';

export const colorSchemeAtom = atomWithJSONStorage<string | null>(
  'theme-builder.color-scheme',
  null,
);

export const useColorScheme = () => useAtomValue(colorSchemeAtom);
export const useSetColorScheme = () => useSetAtom(colorSchemeAtom);
