import { atom, useAtom, useAtomValue } from 'jotai';
import { Value, VariableValues } from 'model/values';
import { allVariableNames } from 'model/variableInfo';

const valueAtoms = Object.fromEntries(
  allVariableNames.map((variableName) => [variableName, atom<Value | null>(null)]),
);

export const allValueAtoms = Object.values(valueAtoms);

const getVariableValueAtom = (variableName: string) => {
  const atom = valueAtoms[variableName];
  if (!atom) {
    throw new Error(`Invalid variable name "${variableName}"`);
  }
  return atom;
};

export const useVariableValueAtom = (variableName: string) => {
  return useAtom(getVariableValueAtom(variableName));
};

export const valuesAtom = atom(
  (get) =>
    Object.fromEntries(
      allVariableNames
        .map((variableName): [string, Value | null] => [
          variableName,
          get(valueAtoms[variableName]),
        ])
        .filter(([, value]) => value != null),
    ),
  (_, set, update: VariableValues) => {
    for (const variableName in update) {
      const atom = getVariableValueAtom(variableName);
      const value = update[variableName];
      set(atom, value == null ? null : value);
    }
  },
);

export const useVariableValues = () => useAtomValue(valuesAtom);
