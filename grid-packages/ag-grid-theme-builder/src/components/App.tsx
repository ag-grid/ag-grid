import { VariableDescriptions, useUpdateVariableDescriptions } from 'atoms/variableDescriptions';
import { registerFeatureModules } from 'model/features';
import { useEffect } from 'react';
import { RootContainer } from './RootContainer';

export type ThemeBuilderAppProps = {
  variableDescriptions: VariableDescriptions;
};

export const App = ({ variableDescriptions }: ThemeBuilderAppProps) => {
  useUpdateVariableDescriptions()(variableDescriptions);
  useEffect(registerFeatureModules, []);
  return <RootContainer />;
};
