import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
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
    // Fresh Emotion cache per mount so styles are always re-inserted after Astro's
    // view-transition head swap removes the previous <style> elements. Without this,
    // Emotion's module-level cache marks styles as "inserted" but the DOM nodes are
    // gone, leaving Emotion class names with no CSS rules on the second visit.
    const emotionCache = useMemo(() => createCache({ key: 'tb' }), []);
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
        <CacheProvider value={emotionCache}>
            <Provider store={store}>
                <LoadFontFamilyMenuFonts />
                {initialised && <RootContainer />}
            </Provider>
        </CacheProvider>
    );
};
