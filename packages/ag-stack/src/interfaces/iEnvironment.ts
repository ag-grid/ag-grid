export interface IEnvironment {
    readonly beanName: 'environment';

    addGlobalCSS(css: string, debugId: string): void;

    getDefaultListItemHeight(): number;

    /** Returns `[inheritClass, applyClass, directionClass]` for the three styled-root levels. */
    getStyledRootClasses(): [inheritClass: string, applyClass: string, directionClass: string];

    /** Subscribes to theme-change events. Returns an unsubscribe fn. */
    onThemeChanged(handler: () => void): () => void;
}
