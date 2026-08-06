import { LoadFontFamilyMenuFonts } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { ThemeBuilderProvider } from '@ag-website-shared/components/theme-builder/ThemeBuilderProvider';
import type { ReactNode } from 'react';

import type { Theme } from 'ag-grid-community';

import { RootContainer } from './RootContainer';
import { PRESETS, toSharedPreset } from './presets';
import './registerThemeBuilderConfig';

interface Props {
    isDark: boolean;
    /**
     * Host-supplied preview, themed with the live rendered theme. `widgetBorderEnabled`
     * comes from the selected preset (page-layout state, not a theme param).
     */
    renderPreview: (theme: Theme, widgetBorderEnabled: boolean) => ReactNode;
}

const DEFAULT_PRESET = PRESETS[0];

export const ThemeBuilder = ({ isDark, renderPreview }: Props) => (
    <ThemeBuilderProvider initialPreset={toSharedPreset(DEFAULT_PRESET, isDark)}>
        <LoadFontFamilyMenuFonts />
        <RootContainer isDark={isDark} renderPreview={renderPreview} />
    </ThemeBuilderProvider>
);
