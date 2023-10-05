import styled from '@emotion/styled';
import { useSetCurrentFeature } from 'atoms/currentFeature';
import { Feature } from 'model/features';

type InspectFeatureButtonProps = {
  feature: Feature;
};

export const InspectFeatureButton = ({ feature }: InspectFeatureButtonProps) => {
  const setInspectedFeature = useSetCurrentFeature();

  return <Button onClick={() => setInspectedFeature(feature)}>{feature.displayName}</Button>;
};

const Button = styled('button')`
  background-color: var(--default-background-color);
  --button-text-color: var(--text-color);
  font-weight: bold;
  text-align: left;
  display: flex;

  &:after {
    content: '>';
    margin-left: auto;
  }

  &:hover,
  &:active {
    background-color: var(--neutral-200) !important;
  }
`;
