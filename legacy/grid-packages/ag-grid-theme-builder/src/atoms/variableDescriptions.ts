import { atom, useAtomValue, useSetAtom } from 'jotai';

export type VariableDescriptions = Record<string, string | undefined>;

export const variableDescriptionsAtom = atom<VariableDescriptions>({});

export const useVariableDescription = (variableName: string) =>
  useAtomValue(variableDescriptionsAtom)[variableName] || null;

export const useUpdateVariableDescriptions = () => useSetAtom(variableDescriptionsAtom);
