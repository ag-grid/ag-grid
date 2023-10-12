import { useAddEnabledFeature, useDisabledFeatures } from 'atoms/enabledFeatures';
import { getFeatureOrThrow } from 'model/features';

const defaultLabelValue = '$$label$$';

export const EnableFeatureButton = () => {
  const options = useDisabledFeatures();
  const addFeature = useAddEnabledFeature();

  if (!options.length) {
    return <></>;
  }

  return (
    <select
      value={defaultLabelValue}
      onChange={(e) => {
        const featureName = e.target.value;
        if (featureName !== defaultLabelValue) {
          addFeature(getFeatureOrThrow(featureName));
        }
      }}
    >
      <option value={defaultLabelValue}>Add Feature...</option>
      {options
        .toSorted((a, b) => (a.displayName < b.displayName ? -1 : 1))
        .map((f) => (
          <option key={f.name} value={f.name}>
            {f.displayName}
          </option>
        ))}
    </select>
  );
};
