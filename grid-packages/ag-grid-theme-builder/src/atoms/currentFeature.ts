import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Feature } from 'model/features';

export const currentFeatureAtom = atom<Feature | null>(null);

export const useCurrentFeature = () => useAtomValue(currentFeatureAtom);
export const useSetCurrentFeature = () => useSetAtom(currentFeatureAtom);
