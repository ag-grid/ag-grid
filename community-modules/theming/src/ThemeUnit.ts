import { _errorOnce, _warnOnce } from '@ag-grid-community/core';

import { coreCSS, coreDefaults } from './parts/core/core-part';
import { paramValueToCss } from './theme-types';
import type { CssFragment, ThemeInstallArgs } from './theme-types';
import { paramToVariableName } from './theme-utils';

const IS_SSR = typeof window !== 'object' || !window || typeof document !== 'object' || window.document !== document;

export class ThemeUnit<TParams = unknown> {
    constructor(
        readonly feature: string | undefined,
        readonly variant: string,
        readonly dependencies: readonly ThemeUnit[] = [],
        readonly defaults: Partial<TParams> = {},
        readonly css: ReadonlyArray<CssFragment> = []
    ) {}

    get id(): string {
        return `${this.feature}/${this.variant}`;
    }

    usePart<TPartParams>(part: ThemeUnit<TPartParams>): ThemeUnit<TParams & TPartParams> {
        return new ThemeUnit<TParams & TPartParams>(
            this.feature,
            this.variant,
            this.dependencies.concat(part as any),
            this.defaults as TParams & TPartParams,
            this.css
        );
    }

    overrideParams(params: Partial<TParams>): ThemeUnit<TParams> {
        const newParams: any = { ...this.defaults };
        for (const [name, value] of Object.entries(params)) {
            if (value != null) {
                newParams[name] = value;
            }
        }
        return new ThemeUnit(this.feature, this.variant, this.dependencies, newParams, this.css);
    }

    addCss(css: CssFragment): ThemeUnit<TParams> {
        return new ThemeUnit(this.feature, this.variant, this.dependencies, this.defaults, this.css.concat(css));
    }

    createVariant(variant: string): ThemeUnit<TParams> {
        return new ThemeUnit(this.feature, variant, this.dependencies, this.defaults, this.css);
    }

    addParams<TAdditionalParams>(defaults: TAdditionalParams): ThemeUnit<TParams & TAdditionalParams> {
        return this.overrideParams(defaults as any) as any;
    }

    getCSS(): string {
        return this._getCSSChunks()
            .map((chunk) => chunk.css)
            .join('\n\n');
    }

    async install(args: ThemeInstallArgs = {}) {
        if (this.feature !== 'theme') {
            throw new Error(`${this.id} can't be installed directly, it must be used by a theme instead`);
        }
        if (IS_SSR) return;

        let container = args.container || null;
        const loadPromises: Promise<void>[] = [];
        if (!container) {
            container = document.querySelector('head');
            if (!container) throw new Error("Can't install theme before document head is created");
        }
        const chunks = this._getCSSChunks().filter((chunk) => {
            if (chunk.id === 'googleFonts') {
                const { loadThemeGoogleFonts } = args;
                if (loadThemeGoogleFonts == null) {
                    getGoogleFontsUsed(this).forEach((font) =>
                        _warnOnce(
                            `${this.id} uses google font ${font} but no value for loadThemeGoogleFonts was provided. Pass true to load fonts from ${googleFontsDomain} or false to silence this warning.`
                        )
                    );
                }
                return !!loadThemeGoogleFonts;
            }
            return true;
        });
        const activeChunkIds = new Set(chunks.map((chunk) => chunk.id));
        const existingStyles = Array.from(
            container.querySelectorAll(':scope > [data-ag-injected-style-id]')
        ) as AnnotatedStyleElement[];
        existingStyles.forEach((style) => {
            if (!activeChunkIds.has(style.dataset.agInjectedStyleId!)) {
                style.remove();
            }
        });
        let lastExistingStyle: AnnotatedStyleElement | undefined = existingStyles[existingStyles.length - 1];
        for (const chunk of chunks) {
            let style = existingStyles.find((s) => s.dataset.agInjectedStyleId === chunk.id);
            if (!style) {
                style = document.createElement('style');
                style.dataset.agInjectedStyleId = chunk.id;
                // insert <style> elements at the start of the head so that
                // application stylesheets take precedence
                if (!lastExistingStyle) {
                    container.insertBefore(style, container.firstChild);
                } else {
                    container.insertBefore(style, lastExistingStyle.nextSibling || null);
                }
                lastExistingStyle = style;
            }
            if (style._agTextContent !== chunk.css) {
                style.textContent = chunk.css;
                style._agTextContent = chunk.css;
                loadPromises.push(resolveOnLoad(style));
            }
        }

        await Promise.all(loadPromises);
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

    private _getFlatUnitsCache?: ThemeUnit[];
    private _getFlatUnits(): ThemeUnit[] {
        if (this._getFlatUnitsCache) return this._getFlatUnitsCache;

        let noFeaturePartCounter = 0;
        const visit = (part: ThemeUnit<any>, accumulator: Record<string, ThemeUnit<any>>) => {
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

        const googleFontsChunk = makeGoogleFontsChunk(this);
        if (googleFontsChunk) {
            chunks.push(googleFontsChunk);
        }

        chunks.push(makeVariablesChunk(this));

        chunks.push({ id: 'core', css: coreCSS });

        for (const part of this._getFlatUnits()) {
            if (part.css.length > 0) {
                let css = `/* Part ${part.id} */`;
                css += part.css.map((p) => (typeof p === 'function' ? p() : p)).join('\n') + '\n';
                chunks.push({ css, id: part.id });
            }
        }

        return (this._getCssChunksCache = chunks);
    }
}

const makeVariablesChunk = (theme: ThemeUnit<any>): ThemeCssChunk => {
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
    const renderedParams: Record<string, string> = {};
    for (const [name, value] of Object.entries(theme.getParams())) {
        const rendered = paramValueToCss(name, value);
        if (rendered === false) {
            _errorOnce(`Invalid value for param ${name} - ${describeValue(value)}`);
        } else if (rendered) {
            renderedParams[name] = rendered;
        }
    }
    for (const [name, defaultValue] of Object.entries(renderedParams)) {
        const variable = paramToVariableName(name);
        const inheritedVariable = variable.replace('--ag-', '--ag-inherited-');
        variablesCss += `\t${variable}: var(${inheritedVariable}, ${defaultValue});\n`;
        inheritanceCss += `\t${inheritedVariable}: var(${variable});\n`;
    }
    const rootSelector =
        ':where(.ag-root-wrapper, .ag-measurement-container, .ag-apply-theme-variables, .ag-popup, .ag-dnd-ghost)';
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

const getGoogleFontsUsed = (theme: ThemeUnit<any>): string[] => {
    const googleFonts = new Set<string>();
    for (const value of Object.values(theme.getParams())) {
        const potentialFonts: any[] = value ? (Array.isArray(value) ? value : [value]) : [];
        for (const potentialFont of potentialFonts) {
            const googleFont = potentialFont?.googleFont;
            if (typeof googleFont === 'string') {
                googleFonts.add(googleFont);
            }
        }
    }
    return Array.from(googleFonts).sort();
};

const makeGoogleFontsChunk = (theme: ThemeUnit<any>): ThemeCssChunk | null => {
    const googleFonts = getGoogleFontsUsed(theme);
    return googleFonts.length > 0
        ? {
              id: 'googleFonts',
              css: googleFonts
                  .sort()
                  .map((font) => {
                      return `@import url('https://${googleFontsDomain}/css2?family=${encodeURIComponent(font)}:wght@100;200;300;400;500;600;700;800;900&display=swap');\n`;
                  })
                  .join(''),
          }
        : null;
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

const describeValue = (value: any): string => {
    if (value == null) return String(value);
    return `${typeof value} ${value}`;
};
