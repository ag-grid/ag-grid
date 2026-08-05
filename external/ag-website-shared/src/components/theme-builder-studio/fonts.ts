import type { FontFamilyOption } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import type { FontFamilyValue } from '@ag-website-shared/theming/api';

// Presets must use these exact values rather than equivalent CSS strings: the
// Font Family dropdown matches the applied value against this list, and
// reports anything it cannot match as inherited ("Same as application").
const SYSTEM: FontFamilyValue = ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'];
const ARIAL: FontFamilyValue = ['Arial', 'sans-serif'];
const IBM_PLEX_SANS: FontFamilyValue = [{ googleFont: 'IBM Plex Sans' }, 'sans-serif'];
const TIMES_NEW_ROMAN: FontFamilyValue = ['Times New Roman', 'serif'];

export const INTER: FontFamilyValue = [{ googleFont: 'Inter' }, 'sans-serif'];
export const DM_SANS: FontFamilyValue = [{ googleFont: 'DM Sans' }, 'sans-serif'];
export const IBM_PLEX_MONO: FontFamilyValue = [{ googleFont: 'IBM Plex Mono' }, 'monospace'];
export const SPACE_GROTESK: FontFamilyValue = [{ googleFont: 'Space Grotesk' }, 'sans-serif'];
export const MERRIWEATHER: FontFamilyValue = [{ googleFont: 'Merriweather' }, 'Georgia', 'serif'];
export const FRAUNCES: FontFamilyValue = [{ googleFont: 'Fraunces' }, 'Georgia', 'serif'];

export const STUDIO_FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
    { label: 'System', value: SYSTEM },
    { label: 'Arial', value: ARIAL },
    { label: 'Inter', value: INTER },
    { label: 'DM Sans', value: DM_SANS },
    { label: 'IBM Plex Sans', value: IBM_PLEX_SANS },
    { label: 'IBM Plex Mono', value: IBM_PLEX_MONO },
    { label: 'Space Grotesk', value: SPACE_GROTESK },
    { label: 'Merriweather', value: MERRIWEATHER },
    { label: 'Fraunces', value: FRAUNCES },
    { label: 'Times New Roman', value: TIMES_NEW_ROMAN },
];
