import { RefPlaceholder } from 'ag-stack';

import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type { OverlayError } from '../../validation/logging';
import { _getOverlayErrorContent, getErrorLink } from '../../validation/logging';
import type { IOverlayComp, IOverlayParams } from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

const ErrorOverlayElement: ElementParams = {
    tag: 'div',
    cls: 'ag-overlay-error-panel',
    children: [
        {
            tag: 'div',
            cls: 'ag-overlay-error-header',
            children: [
                { tag: 'span', ref: 'eTitle', cls: 'ag-overlay-error-title' },
                { tag: 'button', ref: 'eCopy', cls: 'ag-overlay-error-button ag-overlay-error-copy' },
                { tag: 'button', ref: 'eDismiss', cls: 'ag-overlay-error-button ag-overlay-error-dismiss' },
            ],
        },
        { tag: 'div', ref: 'eBody', cls: 'ag-overlay-error-body' },
    ],
};

export class ErrorOverlayComponent
    extends OverlayComponent<any, any, IOverlayParams>
    implements IOverlayComp<any, any>
{
    private readonly eTitle: HTMLElement = RefPlaceholder;
    private readonly eCopy: HTMLButtonElement = RefPlaceholder;
    private readonly eDismiss: HTMLButtonElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    public init(): void {
        const { beans } = this;
        this.setTemplate(ErrorOverlayElement);

        const errors = beans.overlays?.getErrors() ?? [];

        const isPlural = errors.length > 1;
        this.eTitle.textContent = `AG Grid found ${errors.length} configuration ${isPlural ? 'errors' : 'error'}`;

        const copyText = errors.map(getCopyText).join('\n\n');
        this.eCopy.textContent = 'Copy';
        this.eCopy.title = 'Copy the error details to the clipboard';
        this.addManagedElementListeners(this.eCopy, { click: () => this.copyToClipboard(copyText) });

        const closeIcon = _createIconNoSpan('cancel', beans, null);
        if (closeIcon) {
            this.eDismiss.appendChild(closeIcon);
        } else {
            this.eDismiss.textContent = '✕';
        }
        this.eDismiss.title = "Dismiss (suppress permanently with suppressOverlays: ['error'])";
        this.addManagedElementListeners(this.eDismiss, { click: () => beans.overlays?.dismissErrorOverlay() });

        for (let i = 0, len = errors.length; i < len; ++i) {
            if (i > 0) {
                const eDivider = document.createElement('div');
                eDivider.className = 'ag-overlay-error-divider';
                this.eBody.appendChild(eDivider);
            }
            this.eBody.appendChild(this.createErrorElement(errors[i]));
        }

        beans.ariaAnnounce?.announceValue(this.eTitle.textContent, 'overlay');
    }

    private createErrorElement(error: OverlayError): HTMLElement {
        const eError = document.createElement('div');
        eError.className = 'ag-overlay-error-item';

        const { message, code, note, modulesDocLink } = _getOverlayErrorContent(
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

    private copyToClipboard(text: string): void {
        const onDone = (label: string) => {
            this.eCopy.textContent = label;
            // Defer to ensure the label change is painted before the user moves on.
            setTimeout(() => {
                this.eCopy.textContent = 'Copy';
            }, 2000);
        };
        navigator.clipboard?.writeText(text).then(
            () => onDone('Copied'),
            () => onDone('Copy failed')
        );
    }
}

/** Delimiter the error messages use to mark inline code (reasons, module names). See `asCode` in errorText.ts. */
const CODE_DELIMITER = '`';

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

function getCopyText(error: OverlayError): string {
    const { message, code, note, modulesDocLink } = _getOverlayErrorContent(
        error.id,
        error.params,
        error.defaultMessage
    );
    const text = [message, code, note].filter(Boolean).join('\n\n');
    const links = getErrorLinks(error, modulesDocLink).map((link) => link.href);
    return `${text}\n${links.join('\n')}`;
}
