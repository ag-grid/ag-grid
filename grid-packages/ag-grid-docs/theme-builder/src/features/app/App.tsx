import { RootContainer } from 'features/app/RootContainer';
import { useEnabledFeatures } from 'features/inspector/inspectorHooks';
import { useParentThemeAtom } from 'features/parentTheme/parentThemeAtoms';
import { useVariableValues } from 'features/variables/variablesAtoms';
import { renderTheme } from 'model/render';
import { useMemo } from 'react';
import { RenderedThemeProvider } from './useRenderedTheme';
import { VariableDescriptions, VariableDescriptionsProvider } from './useVariableDescriptions';

export type ThemeBuilderAppProps = {
  variableDescriptions: VariableDescriptions;
};

export const App = ({ variableDescriptions }: ThemeBuilderAppProps) => {
  const [theme] = useParentThemeAtom();
  const features = useEnabledFeatures();
  const values = useVariableValues();

  const renderedTheme = useMemo(() => {
    return renderTheme({ theme, features, values });
  }, [theme, features, values]);

  return (
    <VariableDescriptionsProvider value={variableDescriptions}>
      <RenderedThemeProvider value={renderedTheme}>
        <RootContainer />
      </RenderedThemeProvider>
    </VariableDescriptionsProvider>
  );
};
