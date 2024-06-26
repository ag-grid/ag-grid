import type { ParamTypes } from './GENERATED-param-types';
import type { InferParams, Part } from './theme-types';
export type ThemeArgs = {
    parts: Part | Part[];
    params?: Partial<ParamTypes>;
};
export type ThemeInstallArgs = {
    container?: HTMLElement;
};
export declare class Theme {
    private args;
    constructor(args: ThemeArgs);
    private parts?;
    getParts(): Part[];
    private mergedParams?;
    /**
     * Return the actual params used to render the theme, including defaults
     * provided by the theme parts and params passed to the Theme constructor
     */
    getParams(): Partial<ParamTypes>;
    private renderedParams?;
    /**
     * Return the values of the params as CSS strings
     */
    getRenderedParams(): Record<string, string>;
    private cssChunks?;
    getCSSChunks(): ThemeCssChunk[];
    /**
     * Inject CSS for this theme into the head of the current page. A promise is
     * returned that resolves when all inserted stylesheets have loaded.
     *
     * Only one theme can be loaded at a time. Calling this method will replace
     * any previously installed theme.
     *
     * @param args.container The container that the grid is rendered within. If
     * the grid is rendered inside a shadow DOM root, you must pass the grid's
     * parent element to ensure that the styles are adopted into the shadow DOM.
     */
    install(args?: ThemeInstallArgs): Promise<void>;
    getCSS(): string;
    private makeGoogleFontsChunk;
    private makeVariablesChunk;
}
export type ThemeCssChunk = {
    css: string;
    id: string;
};
export type PickVariables<P extends Part, V extends object> = {
    [K in InferParams<P>]?: K extends keyof V ? V[K] : never;
};
export declare const installDocsUrl = "https://www.ag-grid.com/javascript-data-grid/applying-theme-builder-styling-grid/";
