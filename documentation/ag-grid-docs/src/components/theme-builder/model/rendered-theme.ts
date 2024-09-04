import { type Part, type Theme, themeQuartz } from '@ag-grid-community/theming';
import { atom, useAtomValue } from 'jotai';

import { allParamModels } from './ParamModel';
import { FeatureModel } from './PartModel';
import { enabledAdvancedParamsAtom } from './advanced-params';
import { setCurrentThemeCssClass } from './utils';

export type RenderedThemeInfo = {
    theme: Theme;
    overriddenParams: Record<string, unknown>;
    usedParts: Part[];
};

const renderedThemeInfoAtom = atom((get): RenderedThemeInfo => {
    const enabledAdvancedParams = get(enabledAdvancedParamsAtom);

    let theme = themeQuartz;

    const usedParts: Part[] = [];
    for (const feature of ['iconSet'] as const) {
        const part = get(FeatureModel.for(feature).selectedPartAtom).part;
        if (part) {
            usedParts.push(part);
            theme = theme.usePart(part);
        }
    }

    const overriddenParams = Object.fromEntries(
        allParamModels()
            .filter((param) => enabledAdvancedParams.has(param.property) || !param.onlyEditableAsAdvancedParam)
            .map((param) => [param.property, get(param.valueAtom)])
    );
    theme = theme.overrideParams(overriddenParams);

    // globally install the theme CSS, because form widgets use reinterpretCSSValue
    // which requires that the CSS variable values are available
    setCurrentThemeCssClass(theme.getCssClass());
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(theme.getCSS());
    document.adoptedStyleSheets = [stylesheet];

    return {
        theme,
        overriddenParams,
        usedParts,
    };
});

export const useRenderedTheme = () => useAtomValue(renderedThemeInfoAtom).theme;

export const useRenderedThemeInfo = () => useAtomValue(renderedThemeInfoAtom);
