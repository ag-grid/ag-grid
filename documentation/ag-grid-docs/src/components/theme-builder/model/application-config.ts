import { useAtomValue, useSetAtom } from 'jotai';

import { type PersistentAtom, atomWithJSONStorage } from './JSONStorage';

export type ApplicationConfig = {
    previewPaneBackgroundColor: string;
};

const configAtoms: Record<string, any> = {};

export const getApplicationConfigAtom = <K extends keyof ApplicationConfig>(
    key: K
): PersistentAtom<ApplicationConfig[K] | null> =>
    configAtoms[key] || (configAtoms[key] = atomWithJSONStorage<ApplicationConfig[K] | null>(key, null));

export const useApplicationConfig = <K extends keyof ApplicationConfig>(key: K) =>
    useAtomValue(getApplicationConfigAtom(key));

export const useSetApplicationConfig = <K extends keyof ApplicationConfig>(key: K) =>
    useSetAtom(getApplicationConfigAtom(key));
