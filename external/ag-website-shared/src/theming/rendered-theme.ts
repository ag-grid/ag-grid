import { _asThemeImpl } from 'ag-stack';
import { atom, useAtomValue } from 'jotai';

import { type Theme, themeQuartz } from 'ag-grid-community';

import { allParamModels } from './ParamModel';
import type { PartModel } from './PartModel';
import { FeatureModel } from './PartModel';
import { enabledAdvancedParamsAtom } from './advanced-params';
import { getReinterpretationElement } from './utils';

export type RenderedThemeInfo = {
    theme: Theme;
    overriddenParams: Record<string, unknown>;
    usedParts: PartModel[];
};

let baseTheme: Theme = themeQuartz;

/**
 * Hosts supply the base theme the preview renders from (e.g. Studio's
 * studioTheme). Defaults to grid's themeQuartz.
 */
export const setBaseTheme = (theme: Theme) => {
    baseTheme = theme;
};

let renderedFeatureNames: string[] = ['iconSet'];

/**
 * Hosts supply which swappable-part features feed into the rendered preview
 * theme. Defaults to grid's ['iconSet']. Hosts without parts supply [].
 */
export const setRenderedFeatures = (featureNames: string[]) => {
    renderedFeatureNames = featureNames;
};

let previousStyleSheet: CSSStyleSheet | null = null;

const renderedThemeInfoAtom = atom((get): RenderedThemeInfo => {
    const enabledAdvancedParams = get(enabledAdvancedParamsAtom);

    let theme = baseTheme;

    const usedParts: PartModel[] = [];
    for (const featureName of renderedFeatureNames) {
        const feature = FeatureModel.for(featureName);
        const partModel = get(feature.selectedPartAtom);
        if (partModel.part !== feature.defaultPart.part) {
            usedParts.push(partModel);
            theme = theme.withPart(partModel.part);
        }
    }

    const overriddenParams = Object.fromEntries(
        allParamModels()
            // filter out params where we still have a value saved in
            // localStorage, but the param is turned off so the value is not
            // added to the current theme
            .filter((param) => enabledAdvancedParams.has(param.property) || !param.onlyEditableAsAdvancedParam)
            .map((param) => [param.property, get(param.valueAtom)])
    );
    theme = theme.withParams(overriddenParams);

    // globally install the theme CSS, because form widgets use reinterpretCSSValue
    // which requires that the CSS variable values are available
    const themeImpl = _asThemeImpl(theme);
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(themeImpl._getParamsCss());

    const previousStyleSheetIndex =
        previousStyleSheet != null ? document.adoptedStyleSheets.indexOf(previousStyleSheet) : -1;
    if (previousStyleSheetIndex !== -1) {
        document.adoptedStyleSheets.splice(previousStyleSheetIndex, 1);
    }

    previousStyleSheet = stylesheet;

    document.adoptedStyleSheets.push(stylesheet);
    getReinterpretationElement().className = themeImpl._getParamsClassName();

    return {
        theme,
        overriddenParams,
        usedParts,
    };
});

export const useRenderedTheme = () => _asThemeImpl(useAtomValue(renderedThemeInfoAtom).theme);

export const useRenderedThemeInfo = () => useAtomValue(renderedThemeInfoAtom);
