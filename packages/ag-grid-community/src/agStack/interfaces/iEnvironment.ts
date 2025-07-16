export interface IEnvironment {
    addGlobalCSS(css: string, debugId: string): void;

    applyThemeClasses(el: HTMLElement): void;
}
