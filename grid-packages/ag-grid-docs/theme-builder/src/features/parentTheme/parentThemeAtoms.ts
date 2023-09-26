import { atom, useAtom, useAtomValue } from 'jotai';
import { alpineTheme, getThemeChain } from 'model/themes';

const parentTHeme = atom(alpineTheme);

export const useParentThemeAtom = () => useAtom(parentTHeme);

const parentThemeVariablesAtom = atom(
  (get) => new Set(getThemeChain(get(parentTHeme)).flatMap((t) => t.addedVariables)),
);

export const useParentThemeVariables = () => useAtomValue(parentThemeVariablesAtom);
