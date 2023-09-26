import { atom } from 'jotai';
import { Feature, allFeatures } from 'model/features';

export const currentFeatureAtom = atom<Feature | null>(null);

export const enabledFeaturesAtom = atom(allFeatures.filter((f) => f.alwaysEnabled));
