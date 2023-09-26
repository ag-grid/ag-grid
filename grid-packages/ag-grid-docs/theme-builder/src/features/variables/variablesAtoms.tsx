import { atom, useAtom, useAtomValue } from 'jotai';
import { Value } from 'model/values';
import { allVariableNames } from 'model/variables';

const valueAtoms = Object.fromEntries(
  allVariableNames.map((variableName) => [variableName, atom<Value | null>(null)]),
);

export const useVariableValueAtom = (variableName: string) => {
  const atom = valueAtoms[variableName];
  if (!atom) {
    throw new Error(`Invalid variable name "${variableName}"`);
  }
  return useAtom(atom);
};

const valuesAtom = atom((get) =>
  Object.fromEntries(
    allVariableNames
      .map((variableName): [string, Value | null] => [variableName, get(valueAtoms[variableName])])
      .filter(([, value]) => value != null),
  ),
);

export const useVariableValues = () => useAtomValue(valuesAtom);
