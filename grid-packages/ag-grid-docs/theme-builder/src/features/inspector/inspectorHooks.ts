import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Feature, allFeatures } from 'model/features';
import { currentFeatureAtom, enabledFeaturesAtom } from './inspectorAtoms';

export const useCurrentFeatureAtom = () => useAtom(currentFeatureAtom);

export const useEnabledFeatures = () => useAtomValue(enabledFeaturesAtom);

const enableFeatureAtom = atom(null, (get, set, feature: Feature) => {
  const enabled = get(enabledFeaturesAtom);
  if (!enabled.includes(feature)) {
    set(enabledFeaturesAtom, enabled.concat(feature));
    set(currentFeatureAtom, feature);
  }
});

export const useEnableFeature = () => useSetAtom(enableFeatureAtom);

const disableFeatureAtom = atom(null, (get, set, feature: Feature) => {
  if (!feature.alwaysEnabled) {
    set(enabledFeaturesAtom, (value) => value.filter((f) => f != feature));
  }
  if (get(currentFeatureAtom) === feature) {
    set(currentFeatureAtom, null);
  }
});

export const useDisableFeature = () => useSetAtom(disableFeatureAtom);

export const useDisabledFeatures = () => {
  const enabled = new Set(useEnabledFeatures());
  return allFeatures.filter((f) => !enabled.has(f));
};
