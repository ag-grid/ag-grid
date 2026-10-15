import type { GridOptions } from '../entities/gridOptions';
import { _getGlobalGridOption } from '../globalGridOptions';
import type { Params } from '../grid';

/**
 * Some host pages style every `input` and `button` with selectors that outrank the grid's single-class rules.
 * Inside a known host of that kind, the grid renders into a shadow root so document-level rules cannot reach it.
 */
export function _getGridMountTarget(
    eGridDiv: HTMLElement,
    gridOptions: GridOptions,
    params: Params | undefined
): HTMLElement | ShadowRoot {
    if (hasFrameworkOverrides(params) || usesLegacyTheme(gridOptions) || !isInHostWithLeakingStyles(eGridDiv)) {
        return eGridDiv;
    }
    try {
        return eGridDiv.shadowRoot ?? eGridDiv.attachShadow({ mode: 'open' });
    } catch {
        // `attachShadow` throws for elements that cannot host a shadow root, or that already host a closed one
        return eGridDiv;
    }
}

/** Framework components are styled from the document, which cannot reach into a shadow root. */
function hasFrameworkOverrides(params: Params | undefined): boolean {
    return params != null && 'frameworkOverrides' in params;
}

/** CSS file themes are styled by page stylesheets, which cannot reach into a shadow root. */
function usesLegacyTheme(gridOptions: GridOptions): boolean {
    return (gridOptions.theme ?? _getGlobalGridOption('theme')) === 'legacy';
}

function isInHostWithLeakingStyles(eGridDiv: HTMLElement): boolean {
    return isInClaudeVisualiser(eGridDiv);
}

/** claude.ai's inline visualiser: its `button` rule carries ID weight, so no class-based grid rule can win. */
function isInClaudeVisualiser(eGridDiv: HTMLElement): boolean {
    return eGridDiv.closest('#vis-container') != null && hasClaudeVisualiserStylesheet(eGridDiv.ownerDocument);
}

/** The visualiser's base styles exempt its own `form.elicit` controls, which no other page is likely to name. */
function hasClaudeVisualiserStylesheet(doc: Document): boolean {
    const { styleSheets } = doc;
    for (let i = 0, len = styleSheets.length; i < len; ++i) {
        let rules: CSSRuleList;
        try {
            rules = styleSheets[i].cssRules;
        } catch {
            // cross-origin stylesheets cannot be read
            continue;
        }
        for (let j = 0, rulesLen = rules.length; j < rulesLen; ++j) {
            const rule = rules[j];
            if (rule instanceof CSSStyleRule && rule.selectorText.includes('form.elicit')) {
                return true;
            }
        }
    }
    return false;
}
