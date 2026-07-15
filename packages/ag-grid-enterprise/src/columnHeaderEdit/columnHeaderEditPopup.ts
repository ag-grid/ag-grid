import { RefPlaceholder, _getActiveDomElement } from 'ag-stack';

import type { ElementParams, GridInputTextField } from 'ag-grid-community';
import { AgInputTextFieldSelector, BeanStub, Component, KeyCode } from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';

const DEFAULT_SIZE = {
    width: 300,
    height: 100,
    minWidth: 240,
    minHeight: 100,
};

const ColumnHeaderEditContentElement: ElementParams = {
    tag: 'div',
    cls: 'ag-column-header-edit-popup-content',
    children: [{ tag: 'ag-input-text-field', ref: 'eEditor', cls: 'ag-column-header-edit-popup-editor' }],
};

class ColumnHeaderEditContent extends Component {
    private readonly eEditor: GridInputTextField = RefPlaceholder;

    constructor(private readonly initialValue: string) {
        super(ColumnHeaderEditContentElement, [AgInputTextFieldSelector]);
    }

    public postConstruct(): void {
        const translate = this.getLocaleTextFunc();
        this.eEditor
            .setValue(this.initialValue, true)
            .setInputAriaLabel(translate('ariaColumnHeaderNameEditor', 'Column Name Editor'));
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
    private saveOnClose = false;
    private closed = false;
    private restoreFocusEl: HTMLElement | null = null;
    private focusEditorTimeout?: number;

    constructor(
        private readonly params: {
            initialValue: string;
            onClosed: (committed: boolean, value: string) => void;
        }
    ) {
        super();
    }

    public postConstruct(): void {
        const contentComp = this.createManagedBean(new ColumnHeaderEditContent(this.params.initialValue));
        this.contentComp = contentComp;

        const translate = this.getLocaleTextFunc();
        const dialog = this.createManagedBean(
            new Dialog({
                ...DEFAULT_SIZE,
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
                    this.hide(true);
                } else if (event.key === KeyCode.ESCAPE) {
                    this.hide(false);
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

    public hide(save: boolean): void {
        this.saveOnClose = save;
        this.dialog?.close();
    }

    public setValue(value: string): void {
        this.contentComp?.setValue(value);
    }

    private onDialogClosed(): void {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.restoreFocus();
        this.params.onClosed(this.saveOnClose, this.contentComp?.getValue() ?? '');
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
            this.params.onClosed(false, this.contentComp?.getValue() ?? '');
        }
        super.destroy();
    }
}
