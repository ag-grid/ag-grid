import { RefPlaceholder } from 'ag-stack';

import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type { OverlayError } from '../../validation/logging';
import { _getOverlayErrorRenderer, _isModuleError, baseDocLink } from '../../validation/logging';
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
    private readonly eDismiss: HTMLButtonElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    public init(): void {
        const { beans } = this;
        this.setTemplate(ErrorOverlayElement);

        const errors = beans.overlays?.getErrors() ?? [];

        const closeIcon = _createIconNoSpan('cancel', beans, null);
        if (closeIcon) {
            this.eDismiss.appendChild(closeIcon);
        } else {
            this.eDismiss.textContent = '✕';
        }
        this.eDismiss.title = "Dismiss (suppress permanently with suppressOverlays: ['error'])";
        this.addManagedElementListeners(this.eDismiss, { click: () => beans.overlays?.dismissErrorOverlay() });

        // With the ValidationModule registered for this grid we have a rich renderer and full message text
        // for every error. Without it the overlay is only shown to developers who have registered no modules
        // at all, so we render a minimal bootstrap message that guides them towards module registration.
        const renderError = beans.validation ? _getOverlayErrorRenderer() : null;
        if (renderError) {
            this.renderErrors(errors, renderError);
        } else {
            this.renderBootstrap(errors);
        }

        beans.ariaAnnounce?.announceValue(this.eTitle.textContent ?? '', 'overlay');
    }

    private renderErrors(errors: readonly OverlayError[], renderError: (error: OverlayError) => HTMLElement): void {
        const isPlural = errors.length > 1;
        this.eTitle.textContent = `AG Grid found ${errors.length} configuration ${isPlural ? 'errors' : 'error'}`;

        for (let i = 0, len = errors.length; i < len; ++i) {
            if (i > 0) {
                const eDivider = document.createElement('div');
                eDivider.className = 'ag-overlay-error-divider';
                this.eBody.appendChild(eDivider);
            }
            this.eBody.appendChild(renderError(errors[i]));
        }
    }

    private renderBootstrap(errors: readonly OverlayError[]): void {
        this.eTitle.textContent = 'AG Grid requires modules to be registered';

        this.eBody.appendChild(
            createMessageEl('AG Grid is modular: you must register the modules you need before creating a grid.')
        );

        const moduleNames = getMissingModuleNames(errors);
        if (moduleNames.length) {
            const isPlural = moduleNames.length > 1;
            this.eBody.appendChild(
                createMessageEl(`Register the following module${isPlural ? 's' : ''}: ${moduleNames.join(', ')}.`)
            );
        }

        this.eBody.appendChild(
            createMessageEl(
                'While developing, also register the ValidationModule to see full error details here and in the console.'
            )
        );

        const eLinks = document.createElement('div');
        eLinks.className = 'ag-overlay-error-links';
        eLinks.appendChild(createLink(`${baseDocLink}/modules`, 'Modules Documentation'));
        this.eBody.appendChild(eLinks);
    }
}

function createMessageEl(text: string): HTMLElement {
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

/** Distinct user-facing module names to register, gathered from the captured module-registration errors. */
function getMissingModuleNames(errors: readonly OverlayError[]): string[] {
    const names = new Set<string>();
    for (let i = 0, len = errors.length; i < len; ++i) {
        const error = errors[i];
        if (!_isModuleError(error.id, error.params)) {
            continue;
        }
        const moduleName = error.params?.moduleName;
        const moduleList = Array.isArray(moduleName) ? moduleName : [moduleName];
        for (let j = 0, jLen = moduleList.length; j < jLen; ++j) {
            const name = moduleList[j];
            if (name) {
                names.add(`${name}Module`);
            }
        }
    }
    return Array.from(names);
}
