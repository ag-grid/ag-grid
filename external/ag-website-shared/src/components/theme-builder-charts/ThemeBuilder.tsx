import { LoadFontFamilyMenuFonts } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { NarrowScreenNotice } from '@ag-website-shared/components/theme-builder/NarrowScreenNotice';
import { ThemeBuilderProvider } from '@ag-website-shared/components/theme-builder/ThemeBuilderProvider';

import { RootContainer } from './RootContainer';
import { DEFAULT_DARK_PRESET, DEFAULT_PRESET, toSharedPreset } from './presets';
import './registerThemeBuilderConfig';

export const ThemeBuilder = ({ isDark }: { isDark: boolean }) => {
    // The site's theme chooses where a first visit starts, and nothing after
    // that: the presets are fixed light or dark designs, so following the toggle
    // would redesign a theme the user is part-way through editing.
    const initialPreset = isDark ? DEFAULT_DARK_PRESET : DEFAULT_PRESET;

    return (
        <ThemeBuilderProvider initialPreset={toSharedPreset(initialPreset)}>
            <LoadFontFamilyMenuFonts />
            <RootContainer initialPreset={initialPreset} />
            <NarrowScreenNotice>
                Visit us on a larger device to explore our preset themes, customise colours, typography and spacing, and
                download your own AG Charts theme.
            </NarrowScreenNotice>
        </ThemeBuilderProvider>
    );
};
