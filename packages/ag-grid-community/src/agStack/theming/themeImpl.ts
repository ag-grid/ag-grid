import { FORCE_LEGACY_THEMES, IS_SSR, _injectCoreAndModuleCSS, _injectGlobalCSS } from './inject';
import type { Part } from './part';
import { PartImpl, createPart, defaultModeName } from './partImpl';
import { sharedDefaults } from './shared/shared-css';
import type { SharedThemeParams } from './shared/shared-css';
import type { Theme } from './theme';
import type { ThemeLogger } from './themeLogger';
import { colorListValueToCssArray, getParamType, paramValueToCss } from './themeTypeUtils';
import type { ColorListValue, WithParamTypes } from './themeTypes';
import { paramToVariableName } from './themeUtils';

let paramsId = 0;

export const _asThemeImpl = <TParams>(theme: Theme<TParams>): ThemeImpl => {
    if (!(theme instanceof ThemeImpl)) {
        throw new Error('theme is not an object created by createTheme');
    }
    return theme;
};

export const createSharedTheme = <TParams extends SharedThemeParams>(
    themeLogger: ThemeLogger,
    overridePrefix?: string
): Theme<TParams> => new ThemeImpl({ themeLogger, overridePrefix });

type themeUseArgs = {
    loadThemeGoogleFonts: boolean | undefined;
    styleContainer: HTMLElement;
    cssLayer: string | undefined;
    nonce: string | undefined;
    moduleCss: Map<string, string[]> | undefined;
};

export class ThemeImpl {
    constructor(
        private readonly params: {
            themeLogger: ThemeLogger;
            /**
             * If a theme element is nested inside another theme element,
             * this allows the child to inherit different variables than the parent
             */
            overridePrefix?: string;
        },
        readonly parts: PartImpl[] = []
    ) {}

    withPart(part: Part | (() => Part)): ThemeImpl {
        if (typeof part === 'function') {
            part = part();
        }
        if (!(part instanceof PartImpl)) {
            // Can't use validation service as this is API is designed to be used before modules are registered
            this.params.themeLogger.preInitErr(259, 'Invalid part', { part });
            return this;
        }
        return new ThemeImpl(this.params, [...this.parts, part]);
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

    _getCssClass(this: ThemeImpl): string {
        if (FORCE_LEGACY_THEMES) {
            return 'ag-theme-quartz';
        }

        return (this._cssClassCache ??= deduplicatePartsByFeature(this.parts)
            .map((part) => part.use(undefined, undefined, undefined))
            .filter(Boolean)
            .concat(this._getParamsClassName())
            .join(' '));
    }

    private _paramsClassName?: string;
    private _variableParamsDebugId?: string;

    _getParamsClassName(): string {
        return (this._paramsClassName ??= `ag-theme-params-${++paramsId}`);
    }

    _getDynamicParamsDebugId(): string {
        return (this._variableParamsDebugId ??= this._paramsClassName!.replace('ag-theme-', 'ag-theme-dynamic-'));
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
    private _dynamicParamsCssCache?: string | null;

    _getParamsCss(): string {
        if (!this._paramsCssCache) {
            return this._generateParamsCss();
        }
        return this._paramsCssCache;
    }

    _getDynamicParamsCss(): string | null {
        // if it's null, there are no dynamic params
        if (this._dynamicParamsCssCache === undefined) {
            return this._generateParamsCss();
        }
        return this._dynamicParamsCssCache;
    }

    private readonly _dynamicParams: ModalParamValues = {};

    private _generateParamsCssGeneric<TParamValues>(
        modeParams: { [mode: string]: Record<string, TParamValues> },
        getParamValue: (params: Record<string, TParamValues>, key: string, mode: string) => unknown,
        addToVariablesCss: (cssString: string, isDynamic?: boolean) => void,
        addToInheritanceCss: (cssString: string, isDynamic?: boolean) => void
    ): (variablesCssString: string, inheritanceCssString: string) => string {
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
        const { overridePrefix, themeLogger } = this.params;
        const cssOverridePrefix = overridePrefix ? `--ag-${overridePrefix}-` : undefined;
        const _dynamicParams = this._dynamicParams;
        for (const mode of Object.keys(modeParams)) {
            const params = modeParams[mode];
            if (mode !== defaultModeName) {
                const escapedMode = typeof CSS === 'object' ? CSS.escape(mode) : mode; // check for CSS global in case we're running in tests
                const wrapPrefix = `:where([data-ag-theme-mode="${escapedMode}"]) & {\n`;
                addToVariablesCss(wrapPrefix);
                addToInheritanceCss(wrapPrefix);
            }
            // NOSONAR - these are not localised
            for (const key of Object.keys(params).sort()) {
                const value = getParamValue(params, key, mode);
                const paramType = getParamType(key);
                const addParam = (currentKey: string, currentCssValue: string | false, isVariable: boolean) => {
                    if (currentCssValue === false) {
                        themeLogger.error(107, { key, value });
                    } else {
                        const cssName = paramToVariableName(currentKey);
                        const overrideName = cssOverridePrefix ? cssName.replace('--ag-', cssOverridePrefix) : cssName;
                        const inheritedName = cssName.replace('--ag-', '--ag-inherited-');
                        addToVariablesCss(`\t${cssName}: var(${inheritedName}, ${currentCssValue});\n`, isVariable);
                        addToInheritanceCss(`\t${inheritedName}: var(${overrideName});\n`, isVariable);
                    }
                };
                if (paramType === 'colorList') {
                    const providedLengthValue = getParamValue(params, `${key}Scale`, mode);
                    const cssValues = colorListValueToCssArray(
                        value as ColorListValue,
                        typeof providedLengthValue === 'number' ? providedLengthValue : undefined
                    );
                    if (Array.isArray(cssValues)) {
                        const arrayLength = cssValues.length;
                        for (let i = 0; i < arrayLength; ++i) {
                            addParam(`${key}${i + 1}`, cssValues[i], true);
                        }
                        _dynamicParams[mode] ??= {};
                        _dynamicParams[mode][key] = arrayLength;
                    } else {
                        // show warning
                        addParam(key, cssValues, false);
                    }
                } else {
                    const cssValue = paramValueToCss(key, value, themeLogger, paramType);
                    addParam(key, cssValue, false);
                }
                const cssValue = paramValueToCss(key, value, themeLogger, paramType);
                if (Array.isArray(cssValue)) {
                    for (let i = 0; i < cssValue.length; ++i) {
                        addParam(`${key}${i + 1}`, cssValue[i], true);
                    }
                }
            }
            if (mode !== defaultModeName) {
                addToVariablesCss('}\n');
                addToInheritanceCss('}\n');
            }
        }
        return (variablesCssString: string, inheritanceCssString: string) => {
            const selectorPlaceholder = `:where(.${this._getParamsClassName()})`;
            let cssString = `${selectorPlaceholder} {\n${variablesCssString}}\n`;
            // Create --ag-inherited-foo variable values on the parent element, unless
            // the parent is itself a root (which can happen if popupParent is
            // ag-root-wrapper)
            cssString += `:has(> ${selectorPlaceholder}):not(${selectorPlaceholder}) {\n${inheritanceCssString}}\n`;
            return cssString;
        };
    }

    private _generateParamsCss(): string {
        let variablesCss = '';
        let inheritanceCss = '';
        let variableVariablesCss = '';
        let variableInheritanceCss = '';
        const addToVariablesCss = (cssString: string, isVariable?: boolean) => {
            if (isVariable !== true) {
                variablesCss += cssString;
            }
            if (isVariable !== false) {
                variableVariablesCss += cssString;
            }
        };
        const addToInheritanceCss = (cssString: string, isVariable?: boolean) => {
            if (isVariable !== true) {
                inheritanceCss += cssString;
            }
            if (isVariable !== false) {
                variableInheritanceCss += cssString;
            }
        };
        const modeParams = this._getModeParams();
        const generateCss = this._generateParamsCssGeneric(
            modeParams,
            (params, key) => params[key],
            addToVariablesCss,
            addToInheritanceCss
        );
        const css = generateCss(variablesCss, inheritanceCss);
        const hasDynamicParams = Object.keys(this._dynamicParams).length > 0;
        const variableCss = hasDynamicParams ? generateCss(variableVariablesCss, variableInheritanceCss) : null;
        this._paramsCssCache = css;
        this._dynamicParamsCssCache = variableCss;
        return css;
    }

    _onDynamicParamsChange(paramLengths: Record<string, number>): boolean {
        const params = this._dynamicParams;
        let changed = false;
        for (const key of Object.keys(paramLengths)) {
            const newValue = paramLengths[key];
            for (const paramsForMode of Object.values(params)) {
                // we don't know the current mode, so just update all of them
                const oldValue = paramsForMode[key];
                if (oldValue !== newValue) {
                    changed = true;
                    paramsForMode[key] = newValue;
                }
            }
        }
        if (changed) {
            this._generateDynamicParamsCss();
        }
        return changed;
    }

    _getDynamicParamKeys(): string[] {
        const dynamicParams = new Set<string>();
        for (const paramsForMode of Object.values(this._dynamicParams)) {
            for (const param of Object.keys(paramsForMode)) {
                dynamicParams.add(param);
            }
        }
        return Array.from(dynamicParams);
    }

    private _generateDynamicParamsCss(): void {
        const params = this._dynamicParams;
        if (Object.keys(params).length === 0) {
            this._dynamicParamsCssCache = null;
            return;
        }
        let variablesCss = '';
        let inheritanceCss = '';
        const addToVariablesCss = (cssString: string) => {
            variablesCss += cssString;
        };
        const addToInheritanceCss = (cssString: string) => {
            inheritanceCss += cssString;
        };
        const modeParams = this._getModeParams();
        const generateCss = this._generateParamsCssGeneric(
            params,
            // Will either be the length value or the color list.
            // For the length we want to return the calculated value.
            // For the color list, return the array.
            (_, key, mode) => (key.endsWith('Scale') ? params[mode][key.slice(0, -5)] : modeParams[mode][key]),
            addToVariablesCss,
            addToInheritanceCss
        );
        const css = generateCss(variablesCss, inheritanceCss);
        this._dynamicParamsCssCache = css;
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
