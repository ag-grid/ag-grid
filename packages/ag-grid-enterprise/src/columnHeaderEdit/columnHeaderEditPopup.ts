import { RefPlaceholder } from 'ag-stack';

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
}

export class ColumnHeaderEditPopup extends BeanStub {
    private dialog?: Dialog;
    private contentComp?: ColumnHeaderEditContent;
    private saveOnClose = true;
    private closed = false;

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
                modal: true,
                closable: true,
                movable: false,
                resizable: false,
                cssIdentifier: 'column-header-edit',
                closedCallback: () => this.onDialogClosed(),
            })
        );
        this.dialog = dialog;
        dialog.setBodyComponent(contentComp);

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

        contentComp.focusEditor();
    }

    public hide(save: boolean): void {
        this.saveOnClose = save;
        this.dialog?.close();
    }

    private onDialogClosed(): void {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.params.onClosed(this.saveOnClose, this.contentComp?.getValue() ?? '');
    }

    public override destroy(): void {
        if (!this.closed) {
            this.closed = true;
            this.params.onClosed(false, this.contentComp?.getValue() ?? '');
        }
        super.destroy();
    }
}
