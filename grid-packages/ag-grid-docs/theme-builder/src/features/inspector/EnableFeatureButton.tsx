import { getFeatureOrThrow } from 'model/features';
import { useDisabledFeatures, useEnableFeature } from './inspectorHooks';

const defaultLabelValue = '$$label$$';

export const EnableFeatureButton = () => {
  const options = useDisabledFeatures();
  const enableFeature = useEnableFeature();

  if (!options.length) {
    return <></>;
  }

  return (
    <select
      value={defaultLabelValue}
      onChange={(e) => {
        const featureName = e.target.value;
        if (featureName !== defaultLabelValue) {
          enableFeature(getFeatureOrThrow(featureName));
        }
      }}
    >
      <option value={defaultLabelValue}>Add Feature...</option>
      {options.map((f) => (
        <option key={f.name} value={f.name}>
          {f.displayName}
        </option>
      ))}
    </select>
  );
};
