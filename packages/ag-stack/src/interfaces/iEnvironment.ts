export interface IEnvironment {
    readonly beanName: 'environment';

    addGlobalCSS(css: string, debugId: string): void;

    getDefaultListItemHeight(): number;

    /**
     * Returns `[inheritClass, applyClass, directionClass]` for the three styled-root levels.
     * Pass `legacyThemeClassesInherited` for styled roots nested inside the legacy theme
     * element (i.e. the grid's own root), where the theme classes already apply and must not
     * be copied; detached styled roots (popups etc.) can be mounted outside it and omit it.
     */
    getStyledRootClasses(
        hasAncestorStyledRoot?: boolean,
        legacyThemeClassesInherited?: boolean
    ): [inheritClass: string, applyClass: string, directionClass: string];

    /** Subscribes to theme-change events. Returns an unsubscribe fn. */
    onThemeChanged(handler: () => void): () => void;
}
