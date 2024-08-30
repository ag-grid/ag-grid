import { type GridTheme, type GridThemeUseArgs, _warnOnce } from '@ag-grid-community/core';

import type { Part } from './Part';
import { getCustomProperties } from './custom-properties';
import { type CoreParams, coreCSS, coreDefaults } from './styles/core/core-css';
import { type CssFragment } from './theme-types';

export type Theme<TParams = unknown> = GridTheme & {
    readonly id: string;
    readonly dependencies: readonly Part[];
    readonly defaults: Partial<TParams>;
    readonly css: ReadonlyArray<CssFragment>;

    /**
     * Add one or more dependent part. The part will replace any existing part
     * of the same feature
     */
    usePart<TPartParams>(part: Part<TPartParams>): Theme<TParams & TPartParams>;

    /**
     * Provide new values for theme params. You may only provide values for
     * params provided by the part's dependencies.
     */
    overrideParams(defaults: Partial<TParams>): Theme<TParams>;

    /**
     * Provide a new fragment of CSS source code.
     */
    addCss(css: CssFragment): Theme<TParams>;

    /**
     * Return the complete rendered CSS for this theme. This can be used at
     * build time to generate CSS if your application requires that CSS be
     * served from a static file.
     */
    getCSS(): string;

    /**
     * Return the params used to render the theme, taking into account default
     * values and any overrides provided
     */
    getParams(): Record<string, unknown>;
};

export const createTheme = (id: string): Theme<CoreParams> => /*#__PURE__*/ new ThemeImpl(id, [], {}, []);

const IS_SSR = typeof window !== 'object' || !window || typeof document !== 'object' || window.document !== document;
let themeClassCounter = 0;
let uninstalledLegacyCSS = false;

class ThemeImpl<TParams = unknown> implements Theme {
    constructor(
        readonly id: string,
        readonly dependencies: readonly Part[] = [],
        readonly defaults: Partial<TParams> = {},
        readonly css: ReadonlyArray<CssFragment> = []
    ) {}

    usePart<TPartParams>(part: Part<TPartParams>): Theme<TParams & TPartParams> {
        return new ThemeImpl<TParams & TPartParams>(
            this.id,
            this.dependencies.concat(part as any),
            this.defaults as TParams & TPartParams,
            this.css
        );
    }

    overrideParams(params: Partial<TParams>): Theme<TParams> {
        const newParams: any = { ...this.defaults };
        for (const [name, value] of Object.entries(params)) {
            if (value != null) {
                newParams[name] = value;
            }
        }
        return new ThemeImpl(this.id, this.dependencies, newParams, this.css);
    }

    addCss(css: CssFragment): Theme<TParams> {
        return new ThemeImpl(this.id, this.dependencies, this.defaults, this.css.concat(css));
    }

    addParams<TAdditionalParams>(defaults: TAdditionalParams): Theme<TParams & TAdditionalParams> {
        return this.overrideParams(defaults as any) as any;
    }

    getCSS(): string {
        return this._getCSSChunks()
            .map((chunk) => chunk.css)
            .join('\n\n');
    }

    private useCount = 0;

    startUse(args: GridThemeUseArgs): void {
        ++this.useCount;
        if (this.useCount === 1) {
            void this._install(args);
        }
    }

    stopUse(): void {
        --this.useCount;
        if (this.useCount === 0) {
            // delay slightly to give the new theme time to load before removing the old styles
            setTimeout(() => {
                // theme might have been used again while we were waiting
                if (this.useCount === 0) {
                    uninstallThemeCSS(this.getCssClass(), this._installRoot);
                }
            }, 1000);
        }
    }

    private _cssClass: string | undefined;
    getCssClass(): string {
        if (this._cssClass == null) {
            this._cssClass = `ag-theme-${++themeClassCounter}`;
        }
        return this._cssClass;
    }

    private _getParamsCache?: Record<string, unknown>;
    public getParams(): Record<string, unknown> {
        if (this._getParamsCache) return this._getParamsCache;

        const mergedParams: any = { ...coreDefaults };
        for (const part of this._getFlatUnits()) {
            for (const [param, value] of Object.entries(part.defaults)) {
                const partParamValue = value != null ? value : (coreDefaults as any)[param];
                if (partParamValue != null) {
                    mergedParams[param] = partParamValue;
                }
            }
        }

        return (this._getParamsCache = mergedParams);
    }

    private _installRoot: HTMLElement;
    private async _install({ container, loadThemeGoogleFonts }: GridThemeUseArgs) {
        if (IS_SSR) return;

        if (!uninstalledLegacyCSS) {
            uninstalledLegacyCSS = true;
            // Remove the CSS from @ag-grid-community/styles that is
            // automatically injected by the UMD bundle
            uninstallThemeCSS('legacy', document.head);
        }

        let root = container.getRootNode() as HTMLElement;
        if (!(root instanceof ShadowRoot)) {
            root = document.head;
        }
        this._installRoot = root;

        const loadPromises: Promise<void>[] = [];

        // Core CSS is loaded once per shadow root and shared between themes
        loadPromises.push(installCSS({ css: coreCSS, part: 'core', root }));

        for (const googleFont in getGoogleFontsUsed(this)) {
            if (loadThemeGoogleFonts) {
                loadGoogleFont(googleFont);
            } else if (loadThemeGoogleFonts == null) {
                _warnOnce(
                    `${this.id} uses google font ${googleFont} but no value for loadThemeGoogleFonts was provided. Pass true to load fonts from ${googleFontsDomain} or false to silence this warning.`
                );
            }
        }

        for (const chunk of this._getCSSChunks()) {
            installCSS({ css: chunk.css, part: chunk.id, scope: this.getCssClass(), root });
        }

        return Promise.all(loadPromises);
    }

    private _getFlatUnitsCache?: ThemeUnit[];
    private _getFlatUnits(): ThemeUnit[] {
        if (this._getFlatUnitsCache) return this._getFlatUnitsCache;

        let noFeaturePartCounter = 0;
        const visit = (part: ThemeUnit, accumulator: Record<string, ThemeUnit>) => {
            for (const dep of part.dependencies) {
                visit(dep, accumulator);
            }
            const feature = part.feature || 'noFeature-' + String(++noFeaturePartCounter);

            // remove any existing item before overwriting, so that the newly added
            // part is ordered at the end of the list
            delete accumulator[feature];
            accumulator[feature] = part;
        };

        const accumulator: Record<string, ThemeUnit> = {};
        visit(this, accumulator);

        return (this._getFlatUnitsCache = Object.values(accumulator));
    }

    private _getCssChunksCache?: ThemeCssChunk[];
    private _getCSSChunks(): ThemeCssChunk[] {
        if (this._getCssChunksCache) return this._getCssChunksCache;

        const chunks: ThemeCssChunk[] = [];

        chunks.push(makeVariablesChunk(this));

        for (const part of this._getFlatUnits()) {
            if (part.css.length > 0) {
                let css = `/* Part ${part.id} */`;
                css += part.css.map((p) => (typeof p === 'function' ? p() : p)).join('\n') + '\n';
                css = `.${this.getCssClass()} {\n\t${css}\n}`;
                chunks.push({ css, id: part.id });
            }
        }

        return (this._getCssChunksCache = chunks);
    }
}

// a theme or part
type ThemeUnit = {
    readonly id: string;
    readonly feature?: string;
    readonly dependencies: readonly Part[];
    readonly defaults: Record<string, unknown>;
    readonly css: ReadonlyArray<CssFragment>;
};

const makeVariablesChunk = (theme: Theme): ThemeCssChunk => {
    // Ensure that every variable has a value set on root elements ("root"
    // elements are those containing grid UI, e.g. ag-root-wrapper and
    // ag-popup)
    //
    // Simply setting .ag-root-wrapper { --ag-foo: default-value } is not
    // appropriate because it will override any values set on parent
    // elements. An application should be able to set `--ag-grid-size: 4px`
    // on the document body and have it picked up by all grids on the page.
    //
    // To allow this we capture the application-provided value of --ag-foo
    // into --ag-inherited-foo on the *parent* element of the root, and then
    // use --ag-inherited-foo as the value for --ag-foo on the root element,
    // applying our own default if it is unset.
    let variablesCss = '';
    let inheritanceCss = '';
    for (const [cssName, cssValue] of getCustomProperties(theme.getParams())) {
        const inheritedName = cssName.replace('--ag-', '--ag-inherited-');
        variablesCss += `\t${cssName}: var(${inheritedName}, ${cssValue});\n`;
        inheritanceCss += `\t${inheritedName}: var(${cssName});\n`;
    }
    const rootSelector = `:where(.${theme.getCssClass()})`;
    let css = `${rootSelector} {\n${variablesCss}}\n`;
    // Create --ag-inherited-foo variable values on the parent element, unless
    // the parent is itself a root (which can happen if popupParent is
    // ag-root-wrapper)
    css += `:has(> ${rootSelector}):not(${rootSelector}) {\n${inheritanceCss}}\n`;
    return {
        css,
        id: 'variables',
    };
};

const getGoogleFontsUsed = (theme: Theme): string[] =>
    Array.from(
        new Set(
            Object.values(theme.getParams())
                .flat()
                .filter((value: any) => value?.googleFont)
                .filter((value) => typeof value === 'string') as string[]
        )
    ).sort();

// <style data-ag-part="core">
// <style data-ag-part="googleFont:Plex Sans">
// <style data-ag-scope="ag-theme-1" data-ag-part="variables">
// <style data-ag-scope="ag-theme-1" data-ag-part="iconSet/alpine">

type InstallCSSArgs = {
    root: HTMLElement;
    css: string;
    part: string;
    scope?: string;
};

const installCSS = async ({ root, part, scope, css }: InstallCSSArgs) => {
    let selector = `:scope > style[data-ag-part="${part}"]`;
    if (scope) {
        selector += `[data-ag-scope="${scope}"]`;
    }
    let style: AnnotatedStyleElement | null = root.querySelector(selector);
    if (!style) {
        style = document.createElement('style');
        style.dataset.agPart = part;
        if (scope) {
            style.dataset.agScope = scope;
        }
        // insert <style> elements at the start of the head so that
        // application stylesheets take precedence
        const existingStyles = root.querySelectorAll(':scope > style[data-ag-part]');
        const lastExistingStyle = existingStyles[existingStyles.length - 1];
        if (lastExistingStyle) {
            lastExistingStyle.insertAdjacentElement('afterend', style);
        } else if (root.firstElementChild) {
            root.firstElementChild.insertAdjacentElement('beforebegin', style);
        } else {
            root.appendChild(style);
        }
    }
    if (style._agTextContent !== css) {
        style.textContent = css;
        style._agTextContent = css;
        return resolveOnLoad(style);
    }
};

const uninstallThemeCSS = (scope: string, root: HTMLElement) => {
    for (const style of Array.from(root.querySelectorAll(`:scope > style[data-ag-scope="${scope}"]`))) {
        style.remove();
    }
};

const googleFontsLoaded = new Set<string>();

const loadGoogleFont = async (font: string) => {
    if (googleFontsLoaded.has(font)) return;
    googleFontsLoaded.add(font);
    const css = `@import url('https://${googleFontsDomain}/css2?family=${encodeURIComponent(font)}:wght@100;200;300;400;500;600;700;800;900&display=swap');\n`;
    // fonts are always installed in the document head, they are inherited in
    // shadow DOM without the need for separate installation
    return installCSS({ css, part: `googleFont:${font}`, root: document.head });
};

const googleFontsDomain = 'fonts.googleapis.com';

const resolveOnLoad = (element: HTMLStyleElement) =>
    new Promise<void>((resolve) => {
        const handler = () => {
            element.removeEventListener('load', handler);
            resolve();
        };
        element.addEventListener('load', handler);
    });

type ThemeCssChunk = {
    css: string;
    id: string;
};

type AnnotatedStyleElement = HTMLStyleElement & {
    _agTextContent?: string;
};
