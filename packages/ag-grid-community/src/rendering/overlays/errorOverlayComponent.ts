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
        eLinks.appendChild(createLink(getErrorLink(error.id, error.params), `AG Grid Error #${error.id}`));
        if (modulesDocLink) {
            eLinks.appendChild(createLink(modulesDocLink, 'Modules Documentation'));
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

function createTextEl(text: string): HTMLElement {
    const eText = document.createElement('div');
    eText.className = 'ag-overlay-error-message';
    eText.textContent = text;
    return eText;
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

function getCopyText(error: OverlayError): string {
    const { message, code, note, modulesDocLink } = _getOverlayErrorContent(
        error.id,
        error.params,
        error.defaultMessage
    );
    const text = [message, code, note].filter(Boolean).join('\n\n');
    const links = [getErrorLink(error.id, error.params)];
    if (modulesDocLink) {
        links.push(modulesDocLink);
    }
    return `${text}\n${links.join('\n')}`;
}
