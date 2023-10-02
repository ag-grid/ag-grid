import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Feature, allFeatures } from 'model/features';
import { currentFeatureAtom } from './currentFeature';

export const enabledFeaturesAtom = atom(allFeatures.filter((f) => f.alwaysEnabled));

export const useEnabledFeatures = () => useAtomValue(enabledFeaturesAtom);

export const useDisabledFeatures = () => {
  const enabled = new Set(useEnabledFeatures());
  return allFeatures.filter((f) => !enabled.has(f));
};

const addEnabledFeatureAtom = atom(null, (get, set, feature: Feature) => {
  const enabled = get(enabledFeaturesAtom);
  if (!enabled.includes(feature)) {
    set(enabledFeaturesAtom, enabled.concat(feature));
    set(currentFeatureAtom, feature);
  }
});

export const useAddEnabledFeature = () => useSetAtom(addEnabledFeatureAtom);

const removeEnabledFeatureAtom = atom(null, (get, set, feature: Feature) => {
  if (!feature.alwaysEnabled) {
    set(enabledFeaturesAtom, (value) => value.filter((f) => f != feature));
  }
  if (get(currentFeatureAtom) === feature) {
    set(currentFeatureAtom, null);
  }
});

export const useRemoveEnabledFeature = () => useSetAtom(removeEnabledFeatureAtom);
