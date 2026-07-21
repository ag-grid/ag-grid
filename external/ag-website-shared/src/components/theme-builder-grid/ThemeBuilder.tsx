import { LoadFontFamilyMenuFonts } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { ThemeBuilderProvider } from '@ag-website-shared/components/theme-builder/ThemeBuilderProvider';

import { RootContainer } from './components/general/RootContainer';
import { darkModePreset, lightModePreset } from './components/presets/presets';
import './model/registerParamDocs';
import './registerEditorConfig';

export const ThemeBuilder = () => {
    const isDarkMode = document.documentElement.dataset.darkMode === 'true';

    return (
        <ThemeBuilderProvider initialPreset={isDarkMode ? darkModePreset : lightModePreset}>
            <LoadFontFamilyMenuFonts />
            <RootContainer />
        </ThemeBuilderProvider>
    );
};
