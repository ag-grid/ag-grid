import { RefPlaceholder } from 'ag-stack';

import { OverlayComponent } from '../../rendering/overlays/overlayComponent';
import type { IOverlayComp } from '../../rendering/overlays/overlayComponent';
import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type { CapturedDiagnostic } from '../logging';
import {
    COPY_LABEL,
    SEVERITY_ORDER,
    copyDiagnosticsToClipboard,
    diagnosticToMarkdown,
    flashCopied,
    renderDiagnosticSections,
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
                {
                    tag: 'button',
                    ref: 'eCopy',
                    cls: 'ag-overlay-error-button ag-overlay-error-copy',
                    attrs: { type: 'button', title: 'Copy diagnostics to the clipboard' },
                    children: COPY_LABEL,
                },
                {
                    tag: 'button',
                    ref: 'eDismiss',
                    cls: 'ag-overlay-error-button ag-overlay-error-dismiss',
                    attrs: { type: 'button', title: 'Dismiss', 'aria-label': 'Dismiss' },
                },
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
export class ErrorOverlayComponent extends OverlayComponent implements IOverlayComp {
    private readonly eTitle: HTMLElement = RefPlaceholder;
    private readonly eCopy: HTMLButtonElement = RefPlaceholder;
    private readonly eDismiss: HTMLButtonElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    private copyResetTimeout: number | undefined;

    public init(): void {
        const { beans } = this;
        this.setTemplate(ErrorOverlayElement);

        this.addManagedElementListeners(this.eCopy, { click: () => this.copyDiagnostics() });

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
        this.eBody.replaceChildren(...renderDiagnosticSections(diagnostics, { showsUnattributedOrigin: true }));
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
    for (let i = 0, len = SEVERITY_ORDER.length; i < len; ++i) {
        const severity = SEVERITY_ORDER[i];
        const count = counts[severity];
        if (count > 0) {
            parts.push(`${count} ${SEVERITY_LABELS[severity]}${count > 1 ? 's' : ''}`);
        }
    }
    return parts.length ? `AG Grid found ${parts.join(', ')}` : 'AG Grid';
}
