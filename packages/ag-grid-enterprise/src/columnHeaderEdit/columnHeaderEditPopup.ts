import { RefPlaceholder, _getActiveDomElement, _setDisplayed } from 'ag-stack';

import type { ElementParams, GridInputTextField } from 'ag-grid-community';
import { AgInputTextFieldSelector, BeanStub, Component, KeyCode } from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';

const WIDTH = 300;
const MIN_WIDTH = 300;

const ColumnHeaderEditContentElement: ElementParams = {
    tag: 'div',
    cls: 'ag-column-header-edit-popup-content',
    children: [
        { tag: 'ag-input-text-field', ref: 'eEditor', cls: 'ag-column-header-edit-popup-editor' },
        {
            tag: 'div',
            ref: 'eActions',
            cls: 'ag-column-header-edit-popup-actions',
            children: [
                {
                    tag: 'button',
                    ref: 'eApply',
                    cls: 'ag-button ag-standard-button ag-column-header-edit-action ag-column-header-edit-action-apply',
                },
                {
                    tag: 'button',
                    ref: 'eCancel',
                    cls: 'ag-button ag-standard-button ag-column-header-edit-action',
                },
            ],
        },
    ],
};

class ColumnHeaderEditContent extends Component {
    private readonly eEditor: GridInputTextField = RefPlaceholder;
    private readonly eActions: HTMLElement = RefPlaceholder;
    private readonly eApply: HTMLButtonElement = RefPlaceholder;
    private readonly eCancel: HTMLButtonElement = RefPlaceholder;

    constructor(
        private readonly initialValue: string,
        private readonly liveApply: boolean,
        private readonly onValueChange: (value: string) => void,
        private readonly onApply: () => void,
        private readonly onCancel: () => void
    ) {
        super(ColumnHeaderEditContentElement, [AgInputTextFieldSelector]);
    }

    public postConstruct(): void {
        const translate = this.getLocaleTextFunc();
        this.eEditor
            .setValue(this.initialValue, true)
            .setInputAriaLabel(translate('ariaColumnHeaderNameEditor', 'Column Name Editor'));

        // Live mode applies every change to the header, so no Apply/Cancel buttons are shown.
        _setDisplayed(this.eActions, !this.liveApply);
        if (this.liveApply) {
            this.eEditor.onValueChange((value) => this.onValueChange(value ?? ''));
        } else {
            this.eApply.textContent = translate('columnHeaderEditApply', 'Apply');
            this.eCancel.textContent = translate('columnHeaderEditCancel', 'Cancel');
            this.eApply.type = 'button';
            this.eCancel.type = 'button';
            this.addManagedElementListeners(this.eApply, { click: () => this.onApply() });
            this.addManagedElementListeners(this.eCancel, { click: () => this.onCancel() });
        }
    }

    public focusEditor(): void {
        const inputEl = this.eEditor.getInputElement();
        inputEl.focus();
        inputEl.select();
    }

    public getValue(): string {
        return this.eEditor.getValue() ?? '';
    }

    public setValue(value: string): void {
        this.eEditor.setValue(value, true);
    }
}

export class ColumnHeaderEditPopup extends BeanStub {
    private dialog?: Dialog;
    private contentComp?: ColumnHeaderEditContent;
    private closed = false;
    private restoreFocusEl: HTMLElement | null = null;
    private focusEditorTimeout?: number;

    constructor(
        private readonly params: {
            initialValue: string;
            liveApply: boolean;
            /** Apply `value` to the header. Live mode calls this on every change; deferred mode on commit only. */
            onApply: (value: string) => void;
            onClosed: () => void;
        }
    ) {
        super();
    }

    public postConstruct(): void {
        const { liveApply } = this.params;
        const contentComp = this.createManagedBean(
            new ColumnHeaderEditContent(
                this.params.initialValue,
                liveApply,
                (value) => this.params.onApply(value),
                () => this.commit(),
                () => this.close()
            )
        );
        this.contentComp = contentComp;

        const translate = this.getLocaleTextFunc();
        const dialog = this.createManagedBean(
            new Dialog({
                width: WIDTH,
                minWidth: MIN_WIDTH,
                // Opt out of the default minimum so the dialog sizes to its content.
                minHeight: 0,
                title: translate('editColumnName', 'Edit Column Name'),
                component: contentComp,
                closable: true,
                centered: true,
                movable: true,
                resizable: false,
                modal: false,
                alwaysOnTop: true,
                cssIdentifier: 'column-header-edit',
                closedCallback: () => this.onDialogClosed(),
            })
        );
        this.dialog = dialog;

        this.addManagedElementListeners(dialog.getGui(), {
            keydown: (event: KeyboardEvent) => {
                if (event.key === KeyCode.ENTER) {
                    event.preventDefault();
                    // Live already applied each change, so Enter just closes keeping it; deferred commits.
                    if (liveApply) {
                        this.close();
                    } else {
                        this.commit();
                    }
                } else if (event.key === KeyCode.ESCAPE) {
                    // Live keeps changes on Escape (they are already applied); deferred discards by
                    // closing without committing.
                    this.close();
                }
            },
        });

        // The launching menu refocuses its owner (chooser/tool-panel row) as it closes, after this action runs.
        // Defer so the editor wins that race, and capture the refocused element to restore on close.
        this.focusEditorTimeout = window.setTimeout(() => {
            this.focusEditorTimeout = undefined;
            this.restoreFocusEl = _getActiveDomElement(this.beans) as HTMLElement | null;
            contentComp.focusEditor();
        });
    }

    /** Deferred-mode commit: apply the current value, then close. */
    private commit(): void {
        this.params.onApply(this.contentComp?.getValue() ?? '');
        this.close();
    }

    public close(): void {
        this.dialog?.close();
    }

    public setValue(value: string): void {
        this.contentComp?.setValue(value);
    }

    public getValue(): string {
        return this.contentComp?.getValue() ?? '';
    }

    private onDialogClosed(): void {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.restoreFocus();
        this.params.onClosed();
    }

    // Return focus to the element that launched the editor (chooser/tool-panel row), unless the user has since
    // moved focus elsewhere, in which case leave it be.
    private restoreFocus(): void {
        const el = this.restoreFocusEl;
        this.restoreFocusEl = null;
        if (!el?.isConnected) {
            return;
        }
        const activeEl = _getActiveDomElement(this.beans);
        if (!activeEl || activeEl === activeEl.ownerDocument.body || this.dialog?.getGui().contains(activeEl)) {
            el.focus();
        }
    }

    public override destroy(): void {
        if (this.focusEditorTimeout != null) {
            window.clearTimeout(this.focusEditorTimeout);
            this.focusEditorTimeout = undefined;
        }
        if (!this.closed) {
            this.closed = true;
            this.restoreFocus();
            this.params.onClosed();
        }
        super.destroy();
    }
}
