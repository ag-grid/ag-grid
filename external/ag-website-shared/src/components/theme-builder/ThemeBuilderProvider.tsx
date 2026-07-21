import { Provider } from 'jotai';
import { type ReactNode, useLayoutEffect, useMemo, useState } from 'react';

import { allParamModels } from '../../theming/ParamModel';
import { allFeatureModels } from '../../theming/PartModel';
import { addChangedModelItem, getChangedModelItemCount } from '../../theming/changed-model-items';
import { type Preset, applyPreset } from '../../theming/preset';
import { initialiseStore } from '../../theming/store';

interface Props {
    initialPreset: Preset;
    children: ReactNode;
}

export const ThemeBuilderProvider = ({ initialPreset, children }: Props) => {
    const store = useMemo(() => initialiseStore(), []);
    const [initialised, setInitialised] = useState(false);

    useLayoutEffect(() => {
        const hasChanges = getChangedModelItemCount(store) !== 0;
        if (!hasChanges) {
            applyPreset(store, initialPreset);
        }
        const detectChange = (name: string) => {
            addChangedModelItem(store, name);
        };
        const listeners = [
            ...allParamModels().map((param) => store.sub(param.valueAtom, () => detectChange(param.property))),
            ...allFeatureModels().map((feature) =>
                store.sub(feature.selectedPartAtom, () => detectChange(feature.featureName))
            ),
        ];
        if (!initialised) {
            setInitialised(true);
        }
        return () => listeners.forEach((listener) => listener());
    }, []);

    return <Provider store={store}>{initialised && children}</Provider>;
};
