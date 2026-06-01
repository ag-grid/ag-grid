import type { Theme } from '../theming/theme';

/**
 * Properties required by AG Stack
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface BaseProperties {
    tabIndex?: number;
    suppressScrollWhenPopupsAreOpen?: boolean;
    enableRtl?: boolean;
    popupParent?: HTMLElement | null;
    theme?: Theme | 'legacy';
    loadThemeGoogleFonts?: boolean;
    themeCssLayer?: string;
    styleNonce?: string;
    themeStyleContainer?: HTMLElement | (() => HTMLElement | void);
    enableBrowserTooltips?: boolean;
    tooltipTrigger?: 'hover' | 'focus';
    tooltipShowDelay?: number;
    tooltipSwitchShowDelay?: number;
    tooltipHideDelay?: number;
    tooltipMouseTrack?: boolean;
    tooltipInteraction?: boolean;
    getDocument?: () => Document;
    suppressTouch?: boolean;
}
