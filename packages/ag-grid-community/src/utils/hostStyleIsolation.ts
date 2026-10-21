import type { GridOptions } from '../entities/gridOptions';
import type { Params } from '../grid';
import { _getGridOption } from '../gridOptionsUtils';

const THEME_MODE_ATTRIBUTE = 'data-ag-theme-mode';
const THEME_MODE_ANCESTOR = `.ag-theme-mode[${THEME_MODE_ATTRIBUTE}]`;

export interface IsolationHost {
    /** The child of `eGridDiv` that holds the shadow root. */
    readonly host: HTMLElement;
    /** The element in the shadow root that the grid mounts into. */
    readonly mount: HTMLElement;
    destroy(): void;
}

/**
 * Some host pages style every `input` and `button` with selectors that outrank the grid's single-class rules.
 * When `enableShadowDom` asks for it, or by default inside a known host of that kind, adds an element to
 * `eGridDiv` whose shadow root the grid renders into, so document-level rules cannot reach it.
 * Page CSS for classes the application adds (`cellClass`, `rowClass`, renderers) is cut off too; inline styles and
 * theme params still apply.
 */
export function _createIsolationHost(
    eGridDiv: HTMLElement,
    gridOptions: GridOptions,
    params: Params | undefined
): IsolationHost | undefined {
    if (!shouldIsolate(eGridDiv, gridOptions, params)) {
        return undefined;
    }
    const doc = eGridDiv.ownerDocument;
    // `display: contents` keeps both elements out of layout, so the grid sizes against `eGridDiv` as before.
    const host = doc.createElement('div');
    host.style.display = 'contents';
    const mount = doc.createElement('div');
    mount.style.display = 'contents';
    mount.classList.add('ag-theme-mode');
    host.attachShadow({ mode: 'open' }).appendChild(mount);
    eGridDiv.appendChild(host);

    const themeModeObserver = mirrorThemeMode(eGridDiv, mount);
    return {
        host,
        mount,
        destroy: () => {
            themeModeObserver.disconnect();
            host.remove();
        },
    };
}

/**
 * Theme CSS reads the mode from `html`, `body` or an `.ag-theme-mode` ancestor, which selectors inside the shadow
 * root cannot see. The nearest of these wins; where the page sets conflicting modes, CSS order would decide instead.
 */
function mirrorThemeMode(eGridDiv: HTMLElement, mount: HTMLElement): MutationObserver {
    const { documentElement, body } = eGridDiv.ownerDocument;
    const sync = () => {
        const mode =
            eGridDiv.closest(THEME_MODE_ANCESTOR)?.getAttribute(THEME_MODE_ATTRIBUTE) ??
            body?.getAttribute(THEME_MODE_ATTRIBUTE) ??
            documentElement.getAttribute(THEME_MODE_ATTRIBUTE);
        if (mode == null) {
            mount.removeAttribute(THEME_MODE_ATTRIBUTE);
        } else {
            mount.setAttribute(THEME_MODE_ATTRIBUTE, mode);
        }
    };
    sync();
    const observer = new MutationObserver(sync);
    const observed: MutationObserverInit = { attributeFilter: ['class', THEME_MODE_ATTRIBUTE] };
    for (let element: Element | null = eGridDiv; element; element = element.parentElement) {
        observer.observe(element, observed);
    }
    return observer;
}

function shouldIsolate(eGridDiv: HTMLElement, gridOptions: GridOptions, params: Params | undefined): boolean {
    if (hasFrameworkOverrides(params) || rendersOutsideGrid(gridOptions)) {
        return false;
    }
    const enableShadowDom = _getGridOption(gridOptions, 'enableShadowDom');
    return enableShadowDom ?? isInHostWithLeakingStyles(eGridDiv);
}

/** Framework components are styled from the document, which cannot reach into a shadow root. */
function hasFrameworkOverrides(params: Params | undefined): boolean {
    return params != null && 'frameworkOverrides' in params;
}

/**
 * CSS file themes and an explicit theme style container put the grid's styles outside the shadow root, and an
 * explicit popup parent, chart container or Advanced Filter parent puts those parts of the grid there, out of reach
 * of the styles inside it.
 */
function rendersOutsideGrid(gridOptions: GridOptions): boolean {
    const theme = _getGridOption(gridOptions, 'theme');
    const themeStyleContainer = _getGridOption(gridOptions, 'themeStyleContainer');
    const popupParent = _getGridOption(gridOptions, 'popupParent');
    const createChartContainer = _getGridOption(gridOptions, 'createChartContainer');
    const advancedFilterParent = _getGridOption(gridOptions, 'advancedFilterParent');
    return (
        theme === 'legacy' ||
        themeStyleContainer != null ||
        popupParent != null ||
        createChartContainer != null ||
        advancedFilterParent != null
    );
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
