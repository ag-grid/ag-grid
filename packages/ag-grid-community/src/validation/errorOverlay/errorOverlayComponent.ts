import { RefPlaceholder } from 'ag-stack';

import { OverlayComponent } from '../../rendering/overlays/overlayComponent';
import type { IErrorOverlayParams, IOverlayComp } from '../../rendering/overlays/overlayComponent';
import type { ElementParams } from '../../utils/element';
import { _createElement } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type { CapturedDiagnostic } from '../logging';
import {
    COPY_LABEL,
    copyDiagnosticsToClipboard,
    diagnosticToMarkdown,
    flashCopied,
    renderDiagnostic,
} from './errorOverlayRenderer';

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

/**
 * Dev-only overlay (ValidationModule) listing the captured validation diagnostics for the grid, with
 * dismiss and copy controls. Reads diagnostics from {@link ErrorOverlayService} and re-renders in place
 * when they change. Styling comes from `errorOverlay.css` (Theming API) and the mirrored rules in the
 * Legacy Themes' `_common-structural.scss`.
 */
export class ErrorOverlayComponent extends OverlayComponent<any, any, IErrorOverlayParams> implements IOverlayComp {
    private readonly eTitle: HTMLElement = RefPlaceholder;
    private readonly eCopy: HTMLButtonElement = RefPlaceholder;
    private readonly eDismiss: HTMLButtonElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    private copyResetTimeout: number | undefined;

    public init(): void {
        const { beans } = this;
        this.setTemplate(ErrorOverlayElement);

        this.eCopy.type = 'button';
        this.eCopy.textContent = COPY_LABEL;
        this.eCopy.title = 'Copy diagnostics to the clipboard';
        this.addManagedElementListeners(this.eCopy, { click: () => this.copyDiagnostics() });

        this.eDismiss.type = 'button';
        this.eDismiss.setAttribute('aria-label', 'Dismiss');
        this.eDismiss.title = 'Dismiss';
        const eIcon = _createIconNoSpan('cancel', beans, null);
        if (eIcon) {
            this.eDismiss.appendChild(eIcon);
        } else {
            this.eDismiss.textContent = '✕';
        }
        this.addManagedElementListeners(this.eDismiss, { click: () => beans.errorOverlay?.dismiss() });

        this.renderBody();

        const removeUpdateListener = beans.errorOverlay?.addUpdateListener(() => this.renderBody());
        if (removeUpdateListener) {
            this.addDestroyFunc(removeUpdateListener);
        }
    }

    public override destroy(): void {
        if (this.copyResetTimeout !== undefined) {
            window.clearTimeout(this.copyResetTimeout);
        }
        super.destroy();
    }

    private renderBody(): void {
        const diagnostics = this.beans.errorOverlay?.getDiagnostics() ?? [];
        this.eTitle.textContent = getTitle(diagnostics);

        this.eBody.replaceChildren();
        for (let i = 0, len = diagnostics.length; i < len; ++i) {
            if (i > 0) {
                this.eBody.appendChild(_createElement({ tag: 'div', cls: 'ag-overlay-error-divider' }));
            }
            this.eBody.appendChild(renderDiagnostic(diagnostics[i]));
        }

        this.beans.ariaAnnounce?.announceValue(this.eTitle.textContent ?? '', 'overlay');
    }

    private copyDiagnostics(): void {
        const diagnostics = this.beans.errorOverlay?.getDiagnostics() ?? [];
        if (!diagnostics.length) {
            return;
        }
        const text = diagnostics.map(diagnosticToMarkdown).join('\n\n');
        copyDiagnosticsToClipboard(text);
        if (this.copyResetTimeout !== undefined) {
            window.clearTimeout(this.copyResetTimeout);
        }
        this.copyResetTimeout = flashCopied(this.eCopy);
    }
}

const SEVERITY_LABELS: Record<CapturedDiagnostic['severity'], string> = {
    error: 'error',
    warning: 'warning',
    deprecation: 'deprecation',
};

function getTitle(diagnostics: readonly CapturedDiagnostic[]): string {
    const counts: Record<CapturedDiagnostic['severity'], number> = { error: 0, warning: 0, deprecation: 0 };
    for (let i = 0, len = diagnostics.length; i < len; ++i) {
        counts[diagnostics[i].severity]++;
    }
    const parts: string[] = [];
    const severities: CapturedDiagnostic['severity'][] = ['error', 'warning', 'deprecation'];
    for (let i = 0, len = severities.length; i < len; ++i) {
        const severity = severities[i];
        const count = counts[severity];
        if (count > 0) {
            parts.push(`${count} ${SEVERITY_LABELS[severity]}${count > 1 ? 's' : ''}`);
        }
    }
    return parts.length ? `AG Grid found ${parts.join(', ')}` : 'AG Grid';
}
