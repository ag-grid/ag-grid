import type { Theme } from '../theming/theme';

/**
 * Properties required by AG Stack that name no DOM type.
 */
export interface BaseDomFreeProperties {
    tabIndex?: number;
    suppressScrollWhenPopupsAreOpen?: boolean;
    enableRtl?: boolean;
    theme?: Theme | 'legacy';
    loadThemeGoogleFonts?: boolean;
    themeCssLayer?: string;
    styleNonce?: string;
    enableBrowserTooltips?: boolean;
    tooltipTrigger?: 'hover' | 'focus';
    tooltipShowDelay?: number;
    tooltipSwitchShowDelay?: number;
    tooltipHideDelay?: number;
    tooltipMouseTrack?: boolean;
    tooltipInteraction?: boolean;
    suppressTouch?: boolean;
    suppressInputClearButton?: boolean;
    enableInputAutoComplete?: boolean;
}
