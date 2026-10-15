import type { GridOptions } from '../entities/gridOptions';
import { _getGlobalGridOption } from '../globalGridOptions';
import type { Params } from '../grid';

/**
 * Some host pages style every `input` and `button` with selectors that outrank the grid's single-class rules.
 * Inside a known host of that kind, returns a new element in `eGridDiv` whose shadow root the grid renders into,
 * so document-level rules cannot reach it. The caller removes it with the grid.
 * Page CSS for classes the application adds (`cellClass`, `rowClass`, renderers) is cut off too; inline styles and
 * theme params still apply.
 */
export function _createIsolationHost(
    eGridDiv: HTMLElement,
    gridOptions: GridOptions,
    params: Params | undefined
): HTMLElement | undefined {
    if (hasFrameworkOverrides(params) || rendersOutsideGrid(gridOptions) || !isInHostWithLeakingStyles(eGridDiv)) {
        return undefined;
    }
    const host = eGridDiv.ownerDocument.createElement('div');
    // `display: contents` keeps the host out of layout, so the grid sizes against `eGridDiv` as before.
    host.style.display = 'contents';
    host.attachShadow({ mode: 'open' });
    eGridDiv.appendChild(host);
    return host;
}

/** Framework components are styled from the document, which cannot reach into a shadow root. */
function hasFrameworkOverrides(params: Params | undefined): boolean {
    return params != null && 'frameworkOverrides' in params;
}

/**
 * CSS file themes and an explicit theme style container put the grid's styles outside the shadow root, and an
 * explicit popup parent puts popups there, out of reach of the styles inside it.
 */
function rendersOutsideGrid(gridOptions: GridOptions): boolean {
    const theme = gridOptions.theme ?? _getGlobalGridOption('theme');
    const themeStyleContainer = gridOptions.themeStyleContainer ?? _getGlobalGridOption('themeStyleContainer');
    const popupParent = gridOptions.popupParent ?? _getGlobalGridOption('popupParent');
    return theme === 'legacy' || themeStyleContainer != null || popupParent != null;
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
            // Duck-typed: rules from another window's stylesheets fail `instanceof` against this window's CSSStyleRule.
            if (
                'selectorText' in rule &&
                typeof rule.selectorText === 'string' &&
                rule.selectorText.includes('form.elicit')
            ) {
                return true;
            }
        }
    }
    return false;
}
