import { _createElement } from '../../utils/element';
import { getError } from '../errorMessages/errorText';
import type { CapturedDiagnostic } from '../logging';
import { getErrorLink } from '../logging';

const DOC_LINK_REGEX = /\s*(See|Visit) https?:\/\/\S+/g;
/** The general "For more info see: <url>" convention messages use to point at documentation. */
const MORE_INFO_LINK_REGEX = /\s*For more info see:\s*(https?:\/\/\S+)/;
const IMPORT_LINE_REGEX = /^\s*import\s/;
const CODE_LINE_PREFIX_REGEX = /^(import |const |let |function |class |ModuleRegistry|<|>|\}|\))/;
const URL_REGEX = /https?:\/\/\S+/g;
/** Trailing punctuation that follows a URL in prose rather than being part of it. */
const URL_TRAILING_PUNCTUATION_REGEX = /[.,;:)\]]+$/;

/** Delimiter the error messages use to mark inline code (reasons, module names). See `asCode` in errorText.ts. */
const CODE_DELIMITER = '`';

/** Note warning that an untied diagnostic, broadcast to every grid, may not be from the one showing it. */
function unattributedNote(severity: CapturedDiagnostic['severity']): string {
    return `This ${severity} may not have originated from this grid`;
}

/** Message and documentation links for a captured diagnostic, split out for separate rendering. */
interface DiagnosticContent {
    /** Human-readable explanation, rendered as prose above the code snippet. */
    message: string;
    /** Module-registration snippet, rendered in its own code block. Absent when there is no snippet. */
    code?: string;
    /** Trailing prose shown below the code snippet (e.g. "The item will not be rendered."). */
    note?: string;
    /** Documentation URL from the message's "For more info see:" hint, rendered as a link. */
    docLink?: string;
}

function stringifyPart(part: any): string {
    if (typeof part === 'string') {
        return part;
    }
    if (part == null) {
        return '';
    }
    // Non-string parts are logged objects/values; serialise to JSON and wrap in backticks so the
    // overlay renders them as inline code rather than bare JSON in the prose.
    let serialised: string;
    try {
        serialised = JSON.stringify(part);
    } catch {
        serialised = String(part);
    }
    return `\`${serialised}\``;
}

/** Full message text for a diagnostic, sourced from the ValidationModule's error definitions. */
function getRawMessage(diagnostic: CapturedDiagnostic): string {
    const { id, params, defaultMessage } = diagnostic;
    const raw = getError(id, params as any)
        .map(stringifyPart)
        .join(' ')
        .trim();
    return raw || defaultMessage || '';
}

/**
 * Builds the developer-facing content from a raw message. The `For more info see: <link>` hint is
 * captured into `docLink` and rendered as a separate documentation link. Bare `See`/`Visit <link>`
 * references are stripped and discarded, not surfaced: they would otherwise render as raw inline URLs in
 * the prose, and the canonical `AG Grid #<id>` link the overlay always shows already points at the docs.
 * The registration snippet, when present, is split out so the overlay can render it as a distinct code block.
 * @knipIgnore Used in tests
 */
export function parseDiagnosticText(raw: string): DiagnosticContent {
    const docLink = raw.match(MORE_INFO_LINK_REGEX)?.[1];
    const text = raw.replace(DOC_LINK_REGEX, '').replace(MORE_INFO_LINK_REGEX, '').trim();
    return { ...splitCodeSnippet(text), docLink };
}

function getDiagnosticContent(diagnostic: CapturedDiagnostic): DiagnosticContent {
    return parseDiagnosticText(getRawMessage(diagnostic));
}

function isCodeLine(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed === '') {
        return false;
    }
    return CODE_LINE_PREFIX_REGEX.test(trimmed) || /[;{(]$/.test(trimmed) || trimmed.includes('=>');
}

/**
 * Separates a registration snippet (a contiguous run of code lines starting at the first `import`) from
 * the explanation before it and any note after it. Returns the whole message untouched when there is no
 * snippet — the common case for warnings and deprecations.
 */
function splitCodeSnippet(text: string): { message: string; code?: string; note?: string } {
    const lines = text.split('\n');
    let start = -1;
    for (let i = 0, len = lines.length; i < len; ++i) {
        if (IMPORT_LINE_REGEX.test(lines[i])) {
            start = i;
            break;
        }
    }
    if (start === -1) {
        return { message: text };
    }
    let end = start;
    for (let i = start, len = lines.length; i < len; ++i) {
        if (lines[i].trim() === '' || isCodeLine(lines[i])) {
            end = i;
        } else {
            break;
        }
    }
    const message = lines.slice(0, start).join('\n').trim();
    const code = lines
        .slice(start, end + 1)
        .join('\n')
        .trim();
    const note = lines
        .slice(end + 1)
        .join('\n')
        .trim();
    return { message, code, note: note || undefined };
}

/**
 * Appends `text` to `el`, rendering backtick-delimited spans (marked at the message source) as `<code>`
 * elements so reasons and option names stand out, and any URLs as clickable links.
 */
function appendRichText(el: HTMLElement, text: string): void {
    const parts = text.split(CODE_DELIMITER);
    for (let i = 0, len = parts.length; i < len; ++i) {
        const part = parts[i];
        if (part === '') {
            continue;
        }
        // Odd segments sit between a pair of delimiters, so they are the code spans.
        if (i % 2 === 1) {
            const eCode = _createElement({ tag: 'code', cls: 'ag-overlay-error-inline-code' });
            eCode.textContent = part;
            el.appendChild(eCode);
        } else {
            appendTextWithLinks(el, part);
        }
    }
}

/** Appends `text` to `el`, rendering any embedded URLs as clickable links. */
function appendTextWithLinks(el: HTMLElement, text: string): void {
    let lastIndex = 0;
    URL_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = URL_REGEX.exec(text)) !== null) {
        if (match.index > lastIndex) {
            el.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        // Keep trailing sentence punctuation out of the href.
        let href = match[0];
        const trailing = URL_TRAILING_PUNCTUATION_REGEX.exec(href)?.[0] ?? '';
        if (trailing) {
            href = href.slice(0, href.length - trailing.length);
        }
        el.appendChild(createLink(href, href));
        if (trailing) {
            el.appendChild(document.createTextNode(trailing));
        }
        lastIndex = URL_REGEX.lastIndex;
    }
    if (lastIndex < text.length) {
        el.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
}

/**
 * Capitalises a leading lowercase letter. A message beginning with a code span (backtick) is left
 * untouched, since the regex only matches a lowercase letter at position 0 — the identifier is
 * case-sensitive and must not be altered.
 */
function capitaliseLeadingProse(text: string): string {
    return text.replace(/^[a-z]/, (c) => c.toUpperCase());
}

function createTextEl(text: string): HTMLElement {
    const eText = _createElement({ tag: 'div', cls: 'ag-overlay-error-message' });
    appendRichText(eText, text);
    return eText;
}

function createLink(href: string, text: string): HTMLAnchorElement {
    const eLink = _createElement<HTMLAnchorElement>({ tag: 'a', cls: 'ag-overlay-error-link' });
    eLink.href = href;
    eLink.target = '_blank';
    eLink.rel = 'noopener noreferrer';
    eLink.textContent = text;
    return eLink;
}

/**
 * Builds the rich DOM for a diagnostic's parsed content. Split out from getError lookup for testing.
 * @knipIgnore Used in tests
 */
export function renderDiagnosticElement(
    severity: CapturedDiagnostic['severity'],
    content: DiagnosticContent,
    errorLink: string,
    errorLinkText: string,
    unattributed = false
): HTMLElement {
    const eItem = _createElement({ tag: 'div', cls: `ag-overlay-error-item ag-overlay-error-item-${severity}` });
    const { message, code, note, docLink } = content;

    if (unattributed) {
        const eUnattributed = _createElement({ tag: 'div', cls: 'ag-overlay-error-unattributed' });
        eUnattributed.textContent = unattributedNote(severity);
        eItem.appendChild(eUnattributed);
    }

    if (message) {
        eItem.appendChild(createTextEl(capitaliseLeadingProse(message)));
    }
    if (code) {
        const eCode = _createElement({ tag: 'pre', cls: 'ag-overlay-error-code' });
        eCode.textContent = code;
        eItem.appendChild(eCode);
    }
    if (note) {
        eItem.appendChild(createTextEl(note));
    }

    const eLinks = _createElement({ tag: 'div', cls: 'ag-overlay-error-links' });
    eLinks.appendChild(createLink(errorLink, errorLinkText));
    if (docLink) {
        eLinks.appendChild(createLink(docLink, 'Documentation'));
    }
    eItem.appendChild(eLinks);

    return eItem;
}

/** Options shared by the diagnostic render entry points, describing the surface being rendered into. */
interface RenderDiagnosticOptions {
    /** When set, flags untied diagnostics as possibly not from this grid. Off for the grid-less bootstrap panel. */
    showsUnattributedOrigin?: boolean;
}

/**
 * Builds the rich DOM for a single captured diagnostic.
 * @knipIgnore Used in tests
 */
export function renderDiagnostic(diagnostic: CapturedDiagnostic, options: RenderDiagnosticOptions = {}): HTMLElement {
    return renderDiagnosticElement(
        diagnostic.severity,
        getDiagnosticContent(diagnostic),
        getErrorLink(diagnostic.id, diagnostic.params),
        `AG Grid #${diagnostic.id}`,
        // Only this grid's own and untied diagnostics reach here, so an absent gridId means unattributed.
        !!options.showsUnattributedOrigin && diagnostic.gridId === undefined
    );
}

/** Severity display order, most-to-least severe. Shared by the overlay title and the grouped sections. */
export const SEVERITY_ORDER: CapturedDiagnostic['severity'][] = ['error', 'warning', 'deprecation'];

/** Title-case, pluralised section headings keyed by severity. */
const SECTION_LABELS: Record<CapturedDiagnostic['severity'], string> = {
    error: 'Errors',
    warning: 'Warnings',
    deprecation: 'Deprecations',
};

function renderSection(
    severity: CapturedDiagnostic['severity'],
    items: CapturedDiagnostic[],
    options: RenderDiagnosticOptions
): HTMLElement {
    const eSection = _createElement({
        tag: 'div',
        cls: `ag-overlay-error-section ag-overlay-error-section-${severity}`,
    });
    const eHeader = _createElement({ tag: 'div', cls: 'ag-overlay-error-section-header' });
    eHeader.textContent = `${SECTION_LABELS[severity]} (${items.length})`;
    eSection.appendChild(eHeader);
    for (let i = 0, len = items.length; i < len; ++i) {
        eSection.appendChild(renderDiagnostic(items[i], options));
    }
    return eSection;
}

/**
 * Groups diagnostics by severity (errors, then warnings, then deprecations) and renders each non-empty
 * group as a titled section with a per-severity count. Sections are separated by an `<hr>` divider; items
 * within a section are not. Returns the ordered nodes to append to the overlay body.
 */
export function renderDiagnosticSections(
    diagnostics: readonly CapturedDiagnostic[],
    options: RenderDiagnosticOptions = {}
): HTMLElement[] {
    const nodes: HTMLElement[] = [];
    for (let i = 0, len = SEVERITY_ORDER.length; i < len; ++i) {
        const severity = SEVERITY_ORDER[i];
        const items = diagnostics.filter((diagnostic) => diagnostic.severity === severity);
        if (items.length === 0) {
            continue;
        }
        if (nodes.length > 0) {
            nodes.push(_createElement({ tag: 'hr', cls: 'ag-overlay-error-divider' }));
        }
        nodes.push(renderSection(severity, items, options));
    }
    return nodes;
}

/**
 * Plain-text/markdown rendering of parsed content for the Copy button. Split out for testing.
 * @knipIgnore Used in tests
 */
export function diagnosticContentToMarkdown(
    severity: CapturedDiagnostic['severity'],
    id: CapturedDiagnostic['id'],
    content: DiagnosticContent,
    link: string
): string {
    const { message, code, note, docLink } = content;
    const severityLabel = severity[0].toUpperCase() + severity.slice(1);
    const lines = [`### [${severityLabel}] AG Grid #${id}`];
    if (message) {
        lines.push(capitaliseLeadingProse(message));
    }
    if (code) {
        lines.push('```', code, '```');
    }
    if (note) {
        lines.push(note);
    }
    if (docLink) {
        lines.push(`Documentation: ${docLink}`);
    }
    lines.push(`More info: ${link}`);
    return lines.join('\n');
}

/** Plain-text/markdown rendering of a diagnostic for the Copy button. */
export function diagnosticToMarkdown(diagnostic: CapturedDiagnostic): string {
    return diagnosticContentToMarkdown(
        diagnostic.severity,
        diagnostic.id,
        getDiagnosticContent(diagnostic),
        getErrorLink(diagnostic.id, diagnostic.params)
    );
}

export const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied';
const COPY_RESET_MS = 1500;

/**
 * Flashes a copy button's label to {@link COPIED_LABEL}, resetting it to {@link COPY_LABEL} after a short
 * delay. Returns the timeout handle so a managed caller (the overlay bean) can cancel it on destroy; the
 * bean-free bootstrap panel ignores the return value. Shared so both copy buttons behave identically.
 */
export function flashCopied(button: HTMLButtonElement): number {
    button.textContent = COPIED_LABEL;
    return window.setTimeout(() => {
        button.textContent = COPY_LABEL;
    }, COPY_RESET_MS);
}

/**
 * Writes `text` to the clipboard, falling back to a hidden textarea + execCommand in non-secure
 * contexts where `navigator.clipboard` is unavailable. Shared by the dev overlay and bootstrap panel.
 */
export function copyDiagnosticsToClipboard(text: string): void {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        return;
    }
    fallbackCopy(text);
}

function fallbackCopy(text: string): void {
    const eTextarea = _createElement<HTMLTextAreaElement>({ tag: 'textarea' });
    eTextarea.value = text;
    eTextarea.style.position = 'fixed';
    eTextarea.style.opacity = '0';
    document.body.appendChild(eTextarea);
    eTextarea.select();
    try {
        document.execCommand('copy');
    } catch {
        // Clipboard unavailable (non-secure context, restricted environment); nothing more we can do.
    }
    eTextarea.remove();
}
