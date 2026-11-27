import type { IEnvironment } from '../interfaces/iEnvironment';

export interface _ThemeUseContext {
    environment: IEnvironment;
    styleContainer: HTMLElement;
    cssLayer: string | undefined;
    nonce: string | undefined;
    loadThemeGoogleFonts: boolean | undefined;
}

/**
 * What the grid uses of a theme, shared by Theming API and static CSS themes.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface _ThemeHooks {
    /** Whether the grid injects its own CSS with this theme, rather than the application loading it. */
    readonly _injectsGridCss?: boolean;
    _getCssClasses(): [inheritClass: string, applyClass: string];
    /** Injects the CSS that belongs to the theme itself, e.g. its parts and params. */
    _startUse?(ctx: _ThemeUseContext): void;
}
