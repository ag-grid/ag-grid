import { createContext, useContext } from 'react';

export type VariableDescriptions = Record<string, string | undefined>;

const VariableDescriptionsContext = createContext<VariableDescriptions>({});

export const VariableDescriptionsProvider = VariableDescriptionsContext.Provider;

export const useVariableDescriptions = () => useContext(VariableDescriptionsContext);
export const useVariableDescription = (variableName: string) =>
  useVariableDescriptions()[variableName];
