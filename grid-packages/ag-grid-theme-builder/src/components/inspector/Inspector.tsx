import styled from '@emotion/styled';
import {
  useAddEnabledFeature,
  useEnabledFeatures,
  useRemoveEnabledFeature,
} from 'atoms/enabledFeatures';
import { allFeatures, getFeatureOrThrow } from 'model/features';

export const Inspector = () => {
  const enabled = useEnabledFeatures();
  const addEnabledFeature = useAddEnabledFeature();
  const removeEnabledFeature = useRemoveEnabledFeature();
  const inspectable = allFeatures.filter((f) => !f.alwaysEnabled);

  return (
    <Container>
      {inspectable.map((feature) => (
        <div key={feature.name}>
          <input
            type="checkbox"
            value={feature.name}
            checked={enabled.includes(feature)}
            onChange={(e) => {
              const feature = getFeatureOrThrow(e.target.value);
              const enabled = e.target.checked;
              if (enabled) {
                addEnabledFeature(feature);
              } else {
                removeEnabledFeature(feature);
              }
            }}
          />{' '}
          {feature.displayName}
        </div>
      ))}
      {/* {inline.map((feature) => (
        <FeatureEditor key={feature.name} feature={feature} />
      ))}
      <Divider />
      <EnableFeatureButton />
      {inspectable.map((feature) => (
        <InspectFeatureButton key={feature.name} feature={feature} />
      ))}
      <FeatureEditorPanel feature={current} /> */}
    </Container>
  );
};

const Container = styled('div')`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled('div')`
  border-bottom: solid 1px var(--border-color);
`;
