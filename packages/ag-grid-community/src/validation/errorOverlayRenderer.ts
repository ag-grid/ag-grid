import type { OverlayError } from './logging';
import { _getRawErrorMessage, getErrorLink } from './logging';

const DOC_LINK_REGEX = /\s*(See|Visit) https?:\/\/\S+/g;
const MODULES_LINK_REGEX = /\s*For more info see:\s*(https?:\/\/\S+)/;
const IMPORT_LINE_REGEX = /^\s*import\s/;
const CODE_LINE_PREFIX_REGEX = /^(import |const |let |function |class |ModuleRegistry|<|>|\}|\))/;

/** Delimiter the error messages use to mark inline code (reasons, module names). See `asCode` in errorText.ts. */
const CODE_DELIMITER = '`';

/** Message and documentation links for a captured error, split out for separate rendering in the overlay. */
interface OverlayErrorContent {
    /** Human-readable explanation, rendered as prose above the code snippet. */
    message: string;
    /** Module-registration snippet, rendered in its own code block. Absent when the error has no snippet. */
    code?: string;
    /** Trailing prose shown below the code snippet (e.g. "The item will not be rendered."). */
    note?: string;
    /** Present for module-registration errors: link to the modules docs, rendered outside the snippet. */
    modulesDocLink?: string;
}

/**
 * Builds the developer-facing content for a captured error, for display in the error overlay.
 * Inline documentation references (`See`/`Visit <link>` and the module guidance's `For more info see: <link>`)
 * are removed because the overlay renders them as separate links; the registration snippet, when present, is
 * split out from the surrounding explanation so the overlay can render it as a distinct code block.
 */
function getOverlayErrorContent(id: OverlayError['id'], params: any, defaultMessage?: string): OverlayErrorContent {
    const raw = _getRawErrorMessage(id, params, defaultMessage);
    const modulesDocLink = raw.match(MODULES_LINK_REGEX)?.[1];
    const text = raw.replace(DOC_LINK_REGEX, '').replace(MODULES_LINK_REGEX, '').trim();
    return { ...splitCodeSnippet(text), modulesDocLink };
}

function isCodeLine(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed === '') {
        return false;
    }
    return CODE_LINE_PREFIX_REGEX.test(trimmed) || /[;{(]$/.test(trimmed) || trimmed.includes('=>');
}

/**
 * Separates a registration snippet (a contiguous run of code lines starting at the first `import`) from the
 * explanation before it and any note after it. Returns the whole message untouched when there is no snippet.
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

function createTextEl(text: string): HTMLElement {
    const eText = document.createElement('div');
    eText.className = 'ag-overlay-error-message';
    appendTextWithCode(eText, text);
    return eText;
}

/**
 * Appends `text` to `el`, rendering backtick-delimited spans (marked at the message source) as `<code>`
 * elements so reasons and module names stand out from the surrounding prose.
 */
function appendTextWithCode(el: HTMLElement, text: string): void {
    const parts = text.split(CODE_DELIMITER);
    for (let i = 0, len = parts.length; i < len; ++i) {
        const part = parts[i];
        if (part === '') {
            continue;
        }
        // Odd segments sit between a pair of delimiters, so they are the code spans.
        if (i % 2 === 1) {
            const eCode = document.createElement('code');
            eCode.className = 'ag-overlay-error-inline-code';
            eCode.textContent = part;
            el.appendChild(eCode);
        } else {
            el.appendChild(document.createTextNode(part));
        }
    }
}

function createLink(href: string, text: string): HTMLAnchorElement {
    const eLink = document.createElement('a');
    eLink.className = 'ag-overlay-error-link';
    eLink.href = href;
    eLink.target = '_blank';
    eLink.rel = 'noopener noreferrer';
    eLink.textContent = text;
    return eLink;
}

/** Ordered documentation links for an error: the per-error link, plus a modules link when present. */
function getErrorLinks(error: OverlayError, modulesDocLink?: string): { href: string; text: string }[] {
    const links = [{ href: getErrorLink(error.id, error.params), text: `AG Grid Error #${error.id}` }];
    if (modulesDocLink) {
        links.push({ href: modulesDocLink, text: 'Modules Documentation' });
    }
    return links;
}

/** Builds the rich DOM for a single captured error. Registered with the overlay via the ValidationModule. */
export function renderOverlayError(error: OverlayError): HTMLElement {
    const eError = document.createElement('div');
    eError.className = 'ag-overlay-error-item';

    const { message, code, note, modulesDocLink } = getOverlayErrorContent(
        error.id,
        error.params,
        error.defaultMessage
    );

    if (message) {
        eError.appendChild(createTextEl(message));
    }
    if (code) {
        const eCode = document.createElement('pre');
        eCode.className = 'ag-overlay-error-code';
        eCode.textContent = code;
        eError.appendChild(eCode);
    }
    if (note) {
        eError.appendChild(createTextEl(note));
    }

    const eLinks = document.createElement('div');
    eLinks.className = 'ag-overlay-error-links';
    const links = getErrorLinks(error, modulesDocLink);
    for (let i = 0, len = links.length; i < len; ++i) {
        eLinks.appendChild(createLink(links[i].href, links[i].text));
    }
    eError.appendChild(eLinks);

    return eError;
}
