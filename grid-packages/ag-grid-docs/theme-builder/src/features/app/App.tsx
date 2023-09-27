import { VariableDescriptions, useUpdateVariableDescriptions } from 'atoms/variableDescriptions';
import { RootContainer } from 'features/app/RootContainer';

export type ThemeBuilderAppProps = {
  variableDescriptions: VariableDescriptions;
};

export const App = ({ variableDescriptions }: ThemeBuilderAppProps) => {
  useUpdateVariableDescriptions()(variableDescriptions);
  return <RootContainer />;
};
