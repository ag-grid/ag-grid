import styled from '@emotion/styled';
import { useSetCurrentFeature } from 'atoms/currentFeature';
import { useRemoveEnabledFeature } from 'atoms/enabledFeatures';
import { Feature } from 'model/features';
import { useEffect, useRef } from 'react';
import useTransition from 'react-transition-state';
import { FeatureEditor } from './FeatureEditor';

type FeatureEditorPanelProps = {
  feature: Feature | null;
};

export const FeatureEditorPanel = (props: FeatureEditorPanelProps) => {
  const disableFeature = useRemoveEnabledFeature();
  const setInspectedFeature = useSetCurrentFeature();

  const featureRef = useRef(props.feature);
  if (props.feature) {
    featureRef.current = props.feature;
  }

  const [transition, toggleTransition] = useTransition({
    // enter: props.feature != null,
    timeout: 200,
  });

  const mounted =
    transition.status === 'entering' ||
    transition.status === 'entered' ||
    transition.status === 'exiting';

  const hasFeature = !!props.feature;
  useEffect(() => {
    toggleTransition(hasFeature);
  }, [hasFeature]);

  const feature = mounted ? featureRef.current : null;

  return (
    <Container className={`transition-${transition.status}`}>
      {mounted && feature && (
        <>
          <Title>{feature.displayName}</Title>
          <FeatureEditor feature={feature} />
          <Buttons>
            <DoneButton onClick={() => setInspectedFeature(null)}>Done</DoneButton>
            <DisableButton onClick={() => disableFeature(feature)}>
              Turn off {feature.displayName}
            </DisableButton>
          </Buttons>
        </>
      )}
    </Container>
  );
};

const Container = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: var(--default-background-color);
  display: flex;
  flex-direction: column;

  transform: scale(1);
  opacity: 1;

  transition:
    opacity 0.2s,
    transform 0.2s;

  &.transition-entering {
    transition-timing-function: cubic-bezier(0.34, 1.4, 0.64, 1);
    transform: scale(1);
    opacity: 1;
  }

  &.transition-exiting,
  &.transition-exited {
    transition-timing-function: ease-in-out;
    opacity: 0;
    transform: scale(0.5);
  }

  &.transition-exited {
    visibility: hidden;
  }
`;

const Title = styled('div')`
  font-size: 1.2em;
`;

const Buttons = styled('div')`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  gap: 20px;
`;

const DisableButton = styled('button')`
  background-color: var(--default-background-color);
  --button-text-color: var(--text-color);
  border-color: var(--button-color);

  &:hover,
  &:active {
    background-color: color-mix(in hsl, transparent, var(--button-color) 25%) !important;
  }
`;

const DoneButton = styled('button')`
  /* background-color: #ccc; */
`;
