import { atomWithJSONStorage } from '@components/theme-builder/model/JSONStorage';
import { atom, useAtom, useAtomValue } from 'jotai';

import type { ParamModel } from './ParamModel';

const enabledAdvancedParamsStorageAtom = atomWithJSONStorage<string[]>('advanced-properties', []);

export const enabledAdvancedParamsAtom = atom(
    (get) => new Set(get(enabledAdvancedParamsStorageAtom)),
    (_, set, newValue: Set<string>) => {
        set(enabledAdvancedParamsStorageAtom, Array.from(newValue));
    }
);

export const useSetAdvancedParamEnabled = () => {
    const [all, setAll] = useAtom(enabledAdvancedParamsAtom);
    return (param: ParamModel<unknown>, enabled: boolean) => {
        const copy = new Set(all);
        if (enabled) {
            copy.add(param.property);
        } else {
            copy.delete(param.property);
        }
        setAll(copy);
    };
};

export const useAdvancedParamIsEnabled = () => {
    const all = useAtomValue(enabledAdvancedParamsAtom);

    return (param: ParamModel<unknown>) => {
        return all.has(param.property);
    };
};
