import { FORCE_LEGACY_THEMES, IS_SSR, _injectCoreAndModuleCSS, _injectGlobalCSS } from './inject';
import type { Part } from './part';
import { PartImpl, createPart, defaultModeName } from './partImpl';
import { sharedDefaults } from './shared/shared-css';
import type { SharedThemeParams } from './shared/shared-css';
import type { Theme } from './theme';
import type { ThemeLogger } from './themeLogger';
import { paramValueToCss } from './themeTypeUtils';
import type { WithParamTypes } from './themeTypes';
import { paramToVariableName } from './themeUtils';

export const _asThemeImpl = <TParams>(theme: Theme<TParams>): ThemeImpl => {
    if (!(theme instanceof ThemeImpl)) {
        throw new Error('theme is not an object created by createTheme');
    }
    return theme;
};

export const createSharedTheme = <TParams extends SharedThemeParams>(themeLogger: ThemeLogger): Theme<TParams> =>
    new ThemeImpl(themeLogger);
type themeUseArgs = {
    loadThemeGoogleFonts: boolean | undefined;
    styleContainer: HTMLElement;
    cssLayer: string | undefined;
    nonce: string | undefined;
    moduleCss: Map<string, string[]> | undefined;
};

export class ThemeImpl {
    constructor(
        private readonly themeLogger: ThemeLogger,
        readonly parts: PartImpl[] = []
    ) {}

    withPart(part: Part | (() => Part)): ThemeImpl {
        if (typeof part === 'function') {
            part = part();
        }
        if (!(part instanceof PartImpl)) {
            // Can't use validation service as this is API is designed to be used before modules are registered
            this.themeLogger.preInitErr(259, 'Invalid part', { part });
            return this;
        }
        return new ThemeImpl(this.themeLogger, [...this.parts, part]);
    }

    withoutPart(feature: string): ThemeImpl {
        return this.withPart(createPart({ feature }));
    }

    withParams(params: WithParamTypes<unknown>, mode = defaultModeName): ThemeImpl {
        return this.withPart(
            createPart({
                modeParams: { [mode]: params },
            })
        );
    }

    /**
     * Called by a grid instance when it starts using the theme. This installs
     * the theme's parts into document head, or the shadow DOM if the provided
     * container is within a shadow root.
     */
    _startUse({ styleContainer, cssLayer, nonce, loadThemeGoogleFonts, moduleCss }: themeUseArgs): void {
        if (IS_SSR) {
            return;
        }

        if (FORCE_LEGACY_THEMES) {
            return;
        }

        uninstallLegacyCSS();

        _injectCoreAndModuleCSS(styleContainer, cssLayer, nonce, moduleCss);

        const googleFontsUsed = getGoogleFontsUsed(this);
        if (googleFontsUsed.length > 0) {
            for (const googleFont of googleFontsUsed) {
                if (loadThemeGoogleFonts) {
                    loadGoogleFont(googleFont, nonce);
                }
            }
        }

        for (const part of this.parts) {
            part.use(styleContainer, cssLayer, nonce);
        }
    }

    private _cssClassCache?: string;
    /**
     * Return CSS that that applies the params of this theme to elements with
     * the provided class name
     */
    _getCssClass(this: ThemeImpl): string {
        if (FORCE_LEGACY_THEMES) {
            return 'ag-theme-quartz';
        }

        return (this._cssClassCache ??= deduplicatePartsByFeature(this.parts)
            .map((part) => part.use(undefined, undefined, undefined))
            .filter(Boolean)
            .join(' '));
    }

    private _paramsCache?: ModalParamValues;
    _getModeParams(): ModalParamValues {
        let paramsCache = this._paramsCache;
        if (!paramsCache) {
            const mergedModeParams: ModalParamValues = {
                // NOTE: defining the default mode here is important, it ensures
                // that the default mode is first in iteration order, which puts
                // it first in outputted CSS, allowing other modes to override it
                [defaultModeName]: { ...sharedDefaults },
            };
            for (const part of deduplicatePartsByFeature(this.parts)) {
                for (const partMode of Object.keys(part.modeParams)) {
                    const partParams = part.modeParams[partMode];
                    if (partParams) {
                        const mergedParams = (mergedModeParams[partMode] ??= {});
                        const partParamNames = new Set<string>();
                        for (const partParamName of Object.keys(partParams)) {
                            const partParamValue = partParams[partParamName];
                            if (partParamValue !== undefined) {
                                mergedParams[partParamName] = partParamValue;
                                partParamNames.add(partParamName);
                            }
                        }
                        // If a later part has added default mode params, remove any non-default mode
                        // values for the same param. We need to do this because the last value set
                        // for a param should always take precedence. Consider this:
                        // const redInDarkMode = themeQuartz.withParams({accentColor: 'red'}, 'dark');
                        // const alwaysBlue = redInDarkMode.withParams({accentColor: 'blue'});
                        // Setting theme.withParams({accentColor: 'blue'}) is expected to produce a theme
                        // whose accent color is always blue, end of story. So we remove the accentColor
                        // value from the `dark` mode params otherwise it would override the default
                        // accent color.
                        if (partMode === defaultModeName) {
                            for (const mergedMode of Object.keys(mergedModeParams)) {
                                const mergedParams = mergedModeParams[mergedMode];
                                if (mergedMode !== defaultModeName) {
                                    for (const partParamName of partParamNames) {
                                        delete mergedParams[partParamName as any];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            this._paramsCache = paramsCache = mergedModeParams;
        }
        return paramsCache;
    }

    private _paramsCssCache?: string;
    /**
     * Return the CSS chunk that is inserted into the grid DOM, and will
     * therefore be removed automatically when the grid is destroyed or it
     * starts to use a new theme.
     *
     * @param className a unique class name on the grid wrapper used to scope the returned CSS to the grid instance
     */
    _getPerInstanceCss(className: string): string {
        const selectorPlaceholder = '##SELECTOR##';
        let innerParamsCss = this._paramsCssCache;
        if (!innerParamsCss) {
            // Ensure that every variable has a value set on root elements ("root"
            // elements are those containing grid UI, e.g. ag-root-wrapper and
            // ag-popup)
            //
            // Simply setting .ag-root-wrapper { --ag-foo: default-value } is not
            // appropriate because it will override any values set on parent
            // elements. An application should be able to set `--ag-spacing: 4px`
            // on the document body and have it picked up by all grids on the page.
            //
            // To allow this we capture the application-provided value of --ag-foo
            // into --ag-inherited-foo on the *parent* element of the root, and then
            // use --ag-inherited-foo as the value for --ag-foo on the root element,
            // applying our own default if it is unset.
            let variablesCss = '';
            let inheritanceCss = '';
            const modeParams = this._getModeParams();
            for (const mode of Object.keys(modeParams)) {
                const params = modeParams[mode];
                if (mode !== defaultModeName) {
                    const escapedMode = typeof CSS === 'object' ? CSS.escape(mode) : mode; // check for CSS global in case we're running in tests
                    const wrapPrefix = `:where([data-ag-theme-mode="${escapedMode}"]) & {\n`;
                    variablesCss += wrapPrefix;
                    inheritanceCss += wrapPrefix;
                }
                // NOSONAR - these are not localised
                for (const key of Object.keys(params).sort()) {
                    const value = params[key];
                    const cssValue = paramValueToCss(key, value, this.themeLogger);
                    if (cssValue === false) {
                        this.themeLogger.error(107, { key, value });
                    } else {
                        const cssName = paramToVariableName(key);
                        const inheritedName = cssName.replace('--ag-', '--ag-inherited-');
                        variablesCss += `\t${cssName}: var(${inheritedName}, ${cssValue});\n`;
                        inheritanceCss += `\t${inheritedName}: var(${cssName});\n`;
                    }
                }
                if (mode !== defaultModeName) {
                    variablesCss += '}\n';
                    inheritanceCss += '}\n';
                }
            }
            let css = `${selectorPlaceholder} {\n${variablesCss}}\n`;
            // Create --ag-inherited-foo variable values on the parent element, unless
            // the parent is itself a root (which can happen if popupParent is
            // ag-root-wrapper)
            css += `:has(> ${selectorPlaceholder}):not(${selectorPlaceholder}) {\n${inheritanceCss}}\n`;
            this._paramsCssCache = innerParamsCss = css;
        }
        return innerParamsCss.replaceAll(selectorPlaceholder, `:where(.${className})`);
    }
}
type ParamValues = Record<string, unknown>;
type ModalParamValues = {
    [mode: string]: ParamValues;
};
// Remove parts with the same feature, keeping only the last one
const deduplicatePartsByFeature = (parts: readonly PartImpl[]): PartImpl[] => {
    const lastPartByFeature = new Map<string | undefined, PartImpl>();
    for (const part of parts) {
        lastPartByFeature.set(part.feature, part);
    }
    const result: PartImpl[] = [];
    for (const part of parts) {
        if (!part.feature || lastPartByFeature.get(part.feature) === part) {
            result.push(part);
        }
    }
    return result;
};
const getGoogleFontsUsed = (theme: ThemeImpl): string[] => {
    const googleFontsUsed = new Set<string>();
    const visitParamValue = (paramValue: any) => {
        // font value can be a font object or array of font objects
        if (Array.isArray(paramValue)) {
            paramValue.forEach(visitParamValue);
        } else {
            const googleFont = paramValue?.googleFont;
            if (typeof googleFont === 'string') {
                googleFontsUsed.add(googleFont);
            }
        }
    };
    const allModeValues = Object.values(theme._getModeParams());
    const allValues = allModeValues.flatMap((mv) => Object.values(mv));
    allValues.forEach(visitParamValue);
    // NOSONAR - these are not localised
    return Array.from(googleFontsUsed).sort();
};
let uninstalledLegacyCSS = false;
// Remove the CSS from @ag-grid-community/styles that is automatically injected
// by the UMD bundle
const uninstallLegacyCSS = () => {
    if (uninstalledLegacyCSS) {
        return;
    }
    uninstalledLegacyCSS = true;
    for (const style of Array.from(document.head.querySelectorAll('style[data-ag-scope="legacy"]'))) {
        style.remove();
    }
};
const loadGoogleFont = async (font: string, nonce: string | undefined) => {
    const css = `@import url('https://${googleFontsDomain}/css2?family=${encodeURIComponent(font)}:wght@100;200;300;400;500;600;700;800;900&display=swap');\n`;
    // fonts are always installed in the document head, they are inherited in
    // shadow DOM without the need for separate installation
    _injectGlobalCSS(css, document.head, `googleFont:${font}`, undefined, 0, nonce);
};
const googleFontsDomain = 'fonts.googleapis.com';
