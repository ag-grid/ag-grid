import { useAtom } from 'jotai';

import { type PersistentAtom, atomWithJSONStorage } from './JSONStorage';

export type ApplicationConfig = {
    previewPaneBackgroundColor: string;
    welcomeModalDismissed: boolean | undefined;
    expandedEditors: string[];
};

const configAtoms: Record<string, any> = {};

export const getApplicationConfigAtom = <K extends keyof ApplicationConfig>(
    key: K
): PersistentAtom<ApplicationConfig[K] | null> =>
    configAtoms[key] || (configAtoms[key] = atomWithJSONStorage<ApplicationConfig[K] | null>(`config.${key}`, null));

export const useApplicationConfigAtom = <K extends keyof ApplicationConfig>(key: K) =>
    useAtom(getApplicationConfigAtom(key));
