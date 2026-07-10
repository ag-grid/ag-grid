import { _createElement } from '../../utils/element';
import type { CapturedDiagnostic } from '../logging';
import { _diagnosticKey, _meetsSeverityThreshold } from '../logging';
import { _getDevOverlayMode } from '../validationConfig';
import {
    COPY_LABEL,
    copyDiagnosticsToClipboard,
    diagnosticToMarkdown,
    flashCopied,
    renderDiagnosticSections,
} from './errorOverlayRenderer';

// Grid creation aborts before the Environment bean runs, so no theme or module CSS is injected. The
// panel therefore carries its own inline styles rather than relying on the `ag-overlay-error-*` classes.
const PANEL_STYLE = [
    'box-sizing: border-box',
    'display: flex',
    'flex-direction: column',
    'width: 100%',
    'height: 100%',
    'min-height: 120px',
    'overflow: auto',
    // No padding here: the header and body carry their own, so the header's bottom border spans 100%.
    'background: #fff',
    'color: #181d1f',
    // Match the live overlay's border: the invalid-colour red mixed with the neutral border colour.
    'border: 2px solid color-mix(in srgb, #cc222f 60%, #babfc7)',
    "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    'font-size: 13px',
    'line-height: 1.5',
].join(';');

const HEADER_STYLE = [
    'display: flex',
    'align-items: center',
    'justify-content: space-between',
    'gap: 12px',
    'padding: 12px 16px',
    // Divider under the title, mirroring the overlay header's bottom border; spans the full panel width.
    'border-bottom: 1px solid #babfc7',
].join(';');

const BODY_STYLE = ['display: flex', 'flex-direction: column', 'gap: 16px', 'padding: 12px 16px'].join(';');

const TITLE_STYLE = ['font-weight: 600', 'font-size: 14px', 'color: #cc222f'].join(';');

const COPY_STYLE = [
    'flex: none',
    'cursor: pointer',
    'padding: 2px 10px',
    'border: 1px solid #babfc7',
    'border-radius: 4px',
    'background: #f8f8f8',
    'color: inherit',
    'font: inherit',
    'font-size: 12px',
].join(';');

const MONO = "ui-monospace, sfmono-regular, menlo, consolas, 'Liberation Mono', monospace";

// `renderDiagnostic` emits `ag-overlay-error-*` elements styled by the module's errorOverlay.css, but
// that CSS resolves theme variables scoped to a grid root — which the bootstrap panel does not have (the
// abort happens before any theme is applied), and which are absent entirely in a pure bootstrap failure.
// Provide concrete, theme-free rules scoped to the panel so the content renders consistently either way.
// These are a third copy of the `.ag-overlay-error-section`/`-item`/`-message`/`-inline-code`/`-code`/`-links`
// styling: keep them in sync with errorOverlay.css (Theming API) and _common-structural.scss (Legacy).
const STYLE_ID = 'ag-overlay-error-bootstrap-styles';
const CONTENT_STYLES = `
.ag-overlay-error-bootstrap-panel .ag-overlay-error-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-section-header {
    margin: 0;
    font-weight: 700;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-divider {
    margin: 0;
    border: none;
    border-top: 1px solid #babfc7;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-inline-start: solid 3px #babfc7;
    padding-inline-start: 8px;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-item-error { border-inline-start-color: #cc222f; }
.ag-overlay-error-bootstrap-panel .ag-overlay-error-item-warning { border-inline-start-color: #d98300; }
.ag-overlay-error-bootstrap-panel .ag-overlay-error-item-deprecation { border-inline-start-color: #81878b; }
.ag-overlay-error-bootstrap-panel .ag-overlay-error-message {
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-inline-code {
    font-family: ${MONO};
    background: rgba(129, 135, 139, 0.18);
    border-radius: 4px;
    padding: 0 0.3em;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-code {
    margin: 0;
    font-family: ${MONO};
    font-size: 0.85em;
    background: #f3f4f5;
    border: 1px solid #babfc7;
    border-radius: 4px;
    padding: 8px;
    max-height: 50vh;
    overflow: auto;
    white-space: pre-wrap;
}
.ag-overlay-error-bootstrap-panel .ag-overlay-error-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}`;

function ensureBootstrapPanelStyles(): void {
    if (document.getElementById(STYLE_ID)) {
        return;
    }
    const eStyle = _createElement<HTMLStyleElement>({ tag: 'style' });
    eStyle.id = STYLE_ID;
    eStyle.textContent = CONTENT_STYLES;
    document.head.appendChild(eStyle);
}

/** Removes duplicate diagnostics (same id and params), keeping the first occurrence. */
function dedupeDiagnostics(diagnostics: CapturedDiagnostic[]): CapturedDiagnostic[] {
    const seen = new Set<string>();
    const result: CapturedDiagnostic[] = [];
    for (let i = 0, len = diagnostics.length; i < len; ++i) {
        const diagnostic = diagnostics[i];
        const key = _diagnosticKey(diagnostic, i);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(diagnostic);
        }
    }
    return result;
}

/**
 * Renders the bootstrap-failure diagnostics into the grid root for the case where grid creation aborts
 * before any bean exists (e.g. a missing row-model module). Inline-styled and bean-free, reusing
 * {@link renderDiagnostic}. Honours the configured overlay mode, so `overlay: 'none'` shows nothing and
 * `overlay: 'error'` shows only errors.
 */
export function renderBootstrapPanel(container: HTMLElement, diagnostics: CapturedDiagnostic[]): void {
    // A re-created grid (e.g. React's dev/StrictMode double-invoke) calls this again against the same
    // container; remove any panel from a previous render before the mode checks below, so disabling the
    // overlay between renders clears the old panel rather than leaving it stranded.
    const previous = container.querySelectorAll('.ag-overlay-error-bootstrap-panel');
    for (let i = 0, len = previous.length; i < len; ++i) {
        previous[i].remove();
    }

    const mode = _getDevOverlayMode();
    if (mode === 'none') {
        return;
    }

    // The untied-diagnostics buffer accumulates across re-creates, so dedupe before rendering.
    const deduped = dedupeDiagnostics(diagnostics);
    const visible = deduped.filter((d) => _meetsSeverityThreshold(d.severity, mode));
    if (visible.length === 0) {
        return;
    }

    ensureBootstrapPanelStyles();

    const ePanel = _createElement({ tag: 'div', cls: 'ag-overlay-error-bootstrap-panel' });
    ePanel.style.cssText = PANEL_STYLE;

    const eHeader = _createElement({ tag: 'div' });
    eHeader.style.cssText = HEADER_STYLE;

    const eTitle = _createElement({ tag: 'span' });
    eTitle.style.cssText = TITLE_STYLE;
    eTitle.textContent = 'AG Grid failed to initialise';
    eHeader.appendChild(eTitle);

    const eCopy = _createElement<HTMLButtonElement>({ tag: 'button' });
    eCopy.type = 'button';
    eCopy.textContent = COPY_LABEL;
    eCopy.title = 'Copy diagnostics to the clipboard';
    eCopy.style.cssText = COPY_STYLE;
    eCopy.addEventListener('click', () => {
        copyDiagnosticsToClipboard(visible.map(diagnosticToMarkdown).join('\n\n'));
        flashCopied(eCopy);
    });
    eHeader.appendChild(eCopy);

    ePanel.appendChild(eHeader);

    const eBody = _createElement({ tag: 'div' });
    eBody.style.cssText = BODY_STYLE;
    // No `showsUnattributedOrigin`: there is no grid here to contrast against, so the flag would be noise.
    eBody.append(...renderDiagnosticSections(visible));
    ePanel.appendChild(eBody);

    container.appendChild(ePanel);
}
