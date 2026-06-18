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

/** Matches module names (e.g. `RowGroupingModule`) so they can be wrapped in a code block within the prose. */
const MODULE_NAME_REGEX = /\b[A-Z]\w*Module\b/g;

function createTextEl(text: string): HTMLElement {
    const eText = document.createElement('div');
    eText.className = 'ag-overlay-error-message';
    appendTextWithModules(eText, text);
    return eText;
}

/** Appends `text` to `el`, wrapping each module name in a `<code>` element so it stands out from the surrounding prose. */
function appendTextWithModules(el: HTMLElement, text: string): void {
    MODULE_NAME_REGEX.lastIndex = 0;
    let lastIndex = 0;
    let match = MODULE_NAME_REGEX.exec(text);
    while (match) {
        if (match.index > lastIndex) {
            el.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const eCode = document.createElement('code');
        eCode.className = 'ag-overlay-error-module';
        eCode.textContent = match[0];
        el.appendChild(eCode);
        lastIndex = match.index + match[0].length;
        match = MODULE_NAME_REGEX.exec(text);
    }
    if (lastIndex < text.length) {
        el.appendChild(document.createTextNode(text.slice(lastIndex)));
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
