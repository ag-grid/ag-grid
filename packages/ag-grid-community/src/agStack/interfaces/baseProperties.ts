import type { Theme } from '../theming/Theme';

export interface BaseProperties {
    tabIndex?: number;
    suppressScrollWhenPopupsAreOpen?: boolean;
    enableRtl?: boolean;
    popupParent?: HTMLElement | null;
    theme?: Theme | 'legacy';
    loadThemeGoogleFonts?: boolean;
    themeCssLayer?: string;
    styleNonce?: string;
    themeStyleContainer?: HTMLElement;
}
