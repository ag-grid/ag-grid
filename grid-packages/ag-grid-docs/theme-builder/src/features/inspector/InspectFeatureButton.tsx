import styled from '@emotion/styled';
import { Feature } from 'model/features';
import { useCurrentFeatureAtom } from './inspectorHooks';

type InspectFeatureButtonProps = {
  feature: Feature;
};

export const InspectFeatureButton = ({ feature }: InspectFeatureButtonProps) => {
  const [, setInspectedFeature] = useCurrentFeatureAtom();

  return <Button onClick={() => setInspectedFeature(feature)}>{feature.displayName}</Button>;
};

const Button = styled('button')`
  background-color: #fff;
  --button-text-color: #000;
  text-align: left;
  display: flex;

  &:after {
    content: '>';
    margin-left: auto;
  }

  &:hover,
  &:active {
    background-color: #eee !important;
  }
`;
