import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Theme, alpineTheme, getThemeChain, getThemeOrThrow } from 'model/themes';

const parentThemeNameAtom = atom(alpineTheme.name);

export const parentThemeAtom = atom(
  (get) => getThemeOrThrow(get(parentThemeNameAtom)),
  (_, set, update: Theme) => {
    set(parentThemeNameAtom, update.name);
  },
);

export const useParentTheme = () => useAtomValue(parentThemeAtom);
export const useSetParentTheme = () => useSetAtom(parentThemeAtom);

const parentThemeVariablesAtom = atom(
  (get) => new Set(getThemeChain(get(parentThemeAtom)).flatMap((t) => t.addedVariables)),
);

export const useParentThemeVariables = () => useAtomValue(parentThemeVariablesAtom);
