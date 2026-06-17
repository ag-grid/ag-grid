import { RefPlaceholder } from 'ag-stack';

import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type { OverlayError } from '../../validation/logging';
import { _getErrorMessage, getErrorLink } from '../../validation/logging';
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

        const eMessage = document.createElement('pre');
        eMessage.className = 'ag-overlay-error-message';
        eMessage.textContent = _getErrorMessage(error.id, error.params, error.defaultMessage);
        eError.appendChild(eMessage);

        const eLink = document.createElement('a');
        eLink.className = 'ag-overlay-error-link';
        eLink.href = getErrorLink(error.id, error.params);
        eLink.target = '_blank';
        eLink.rel = 'noopener noreferrer';
        eLink.textContent = 'View documentation';
        eError.appendChild(eLink);

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

function getCopyText(error: OverlayError): string {
    const message = _getErrorMessage(error.id, error.params, error.defaultMessage);
    return `${message}\n${getErrorLink(error.id, error.params)}`;
}
