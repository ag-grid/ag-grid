import { Provider } from 'jotai';
import { type ReactNode, useLayoutEffect, useMemo, useState } from 'react';

import { allParamModels } from '../../theming/ParamModel';
import { allFeatureModels } from '../../theming/PartModel';
import { addChangedModelItem } from '../../theming/changed-model-items';
import { type Preset, applyPreset } from '../../theming/preset';
import { type Store, initialiseStore } from '../../theming/store';
import { hasStoredModel } from '../../theming/stored-model';

interface Props<P extends Preset> {
    initialPreset: P;
    /** For a host whose presets carry state beyond the theme params. */
    applyInitialPreset?: (store: Store, preset: P) => void;
    children: ReactNode;
}

export const ThemeBuilderProvider = <P extends Preset>({
    initialPreset,
    applyInitialPreset = applyPreset,
    children,
}: Props<P>) => {
    const store = useMemo(() => initialiseStore(), []);
    const [initialised, setInitialised] = useState(false);

    useLayoutEffect(() => {
        if (!hasStoredModel(store)) {
            applyInitialPreset(store, initialPreset);
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
