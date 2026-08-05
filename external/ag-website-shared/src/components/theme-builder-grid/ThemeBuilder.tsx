import { LoadFontFamilyMenuFonts } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { ThemeBuilderProvider } from '@ag-website-shared/components/theme-builder/ThemeBuilderProvider';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useMemo } from 'react';

import { RootContainer } from './components/general/RootContainer';
import { darkModePreset, lightModePreset } from './components/presets/presets';
import './model/registerParamDocs';
import './registerEditorConfig';

export const ThemeBuilder = () => {
    const isDarkMode = document.documentElement.dataset.darkMode === 'true';

    // A head swap removes Emotion's <style> elements while its module-level cache still
    // considers them inserted, so each mount needs its own cache.
    const emotionCache = useMemo(() => createCache({ key: 'tb' }), []);

    return (
        <CacheProvider value={emotionCache}>
            <ThemeBuilderProvider initialPreset={isDarkMode ? darkModePreset : lightModePreset}>
                <LoadFontFamilyMenuFonts />
                <RootContainer />
            </ThemeBuilderProvider>
        </CacheProvider>
    );
};
