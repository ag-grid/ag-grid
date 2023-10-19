import styled from '@emotion/styled';
import { useParentTheme } from 'atoms/parentTheme';
import { VariableControl } from 'components/controls/VariableControl';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { Feature } from 'model/features';
import { getThemeChain } from 'model/themes';
import { getVariableInfo } from 'model/variableInfo';
import { memo } from 'react';

export type FeatureEditorProps = {
  feature: Feature;
};

const FeatureEditor = ({ feature }: FeatureEditorProps) => {
  const parentTheme = useParentTheme();

  return (
    <Container>
      {feature.variableNames
        .filter((v) => {
          const specificToTheme = getVariableInfo(v)?.specificToTheme;
          if (specificToTheme == null) return true;
          return getThemeChain(parentTheme).find((t) => t.name === specificToTheme) != null;
        })
        .map((name) => (
          <VariableControl key={name} variableName={name} feature={feature} />
        ))}
    </Container>
  );
};

const FeatureEditorWrapped = memo(withErrorBoundary(FeatureEditor));

export { FeatureEditorWrapped as FeatureEditor };

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
