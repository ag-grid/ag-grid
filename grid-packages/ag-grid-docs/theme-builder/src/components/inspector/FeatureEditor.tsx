import styled from '@emotion/styled';
import { useParentThemeVariables } from 'atoms/parentTheme';
import { VariableControl } from 'components/controls/VariableControl';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { Feature } from 'model/features';
import { memo } from 'react';

export type FeatureEditorProps = {
  feature: Feature;
};

const FeatureEditor = ({ feature }: FeatureEditorProps) => {
  const themeVariables = useParentThemeVariables();

  return (
    <Container>
      {feature.variableNames
        .filter((v) => themeVariables.has(v))
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
