import { Provider } from 'jotai';
import { useLayoutEffect, useMemo, useState } from 'react';

import { LoadFontFamilyMenuFonts } from './components/editors/FontFamilyValueEditor';
import { RootContainer } from './components/general/RootContainer';
import { applyPreset, darkModePreset, lightModePreset } from './components/presets/presets';
import { allParamModels } from './model/ParamModel';
import { allFeatureModels } from './model/PartModel';
import { addChangedModelItem, getChangedModelItemCount } from './model/changed-model-items';
import { initialiseStore } from './model/store';

export const ThemeBuilder = () => {
    const store = useMemo(() => initialiseStore(), []);

    const [initialised, setInitialised] = useState(false);

    useLayoutEffect(() => {
        const hasChanges = getChangedModelItemCount(store) !== 0;
        if (!hasChanges) {
            const isDarkMode = document.documentElement.dataset.darkMode === 'true';
            applyPreset(store, isDarkMode ? darkModePreset : lightModePreset);
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
            // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initialisation flag
            setInitialised(true);
        }
        return () => listeners.forEach((listener) => listener());
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time initialisation, store is stable
    }, []);

    return (
        <Provider store={store}>
            <LoadFontFamilyMenuFonts />
            {initialised && <RootContainer />}
        </Provider>
    );
};
