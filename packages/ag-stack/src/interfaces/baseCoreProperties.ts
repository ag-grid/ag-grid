import type { Theme } from '../theming/theme';

/**
 * Properties required by AG Stack that name no DOM type.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface BaseCoreProperties {
    tabIndex?: number;
    suppressScrollWhenPopupsAreOpen?: boolean;
    enableRtl?: boolean;
    theme?: Theme | 'legacy';
    loadThemeGoogleFonts?: boolean;
    themeCssLayer?: string;
    styleNonce?: string;
    enableBrowserTooltips?: boolean;
    tooltipTrigger?: 'hover' | 'focus' | 'hoverOrFocus';
    tooltipShowDelay?: number;
    tooltipSwitchShowDelay?: number;
    tooltipHideDelay?: number;
    tooltipMouseTrack?: boolean;
    tooltipAnchor?: 'target' | 'pointer';
    tooltipOffset?: number;
    tooltipInteraction?: boolean | ((params: any) => boolean);
    suppressTouch?: boolean;
    suppressInputClearButton?: boolean;
    enableInputAutoComplete?: boolean;
}
