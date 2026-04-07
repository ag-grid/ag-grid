import type { CellNote, ElementParams, GridInputTextArea } from 'ag-grid-community';
import {
    AgInputTextAreaSelector,
    BeanStub,
    Component,
    RefPlaceholder,
    _getDocument,
    _setDisplayed,
} from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';
import { cloneCellNote } from './notesUtils';

const DEFAULT_SIZE = {
    width: 320,
    height: 220,
    minWidth: 240,
    minHeight: 180,
};

const NotesPopupContentElement: ElementParams = {
    tag: 'div',
    cls: 'ag-notes-popup-content',
    children: [
        { tag: 'div', ref: 'eMeta', cls: 'ag-notes-popup-meta' },
        {
            tag: 'div',
            cls: 'ag-notes-popup-body',
            children: [{ tag: 'ag-input-text-area', ref: 'eEditor', cls: 'ag-notes-popup-editor' }],
        },
        { tag: 'div', ref: 'eFooter', cls: 'ag-notes-popup-footer' },
    ],
};

class AgNotesPopupContent extends Component {
    private readonly eMeta: HTMLElement = RefPlaceholder;
    private readonly eFooter: HTMLElement = RefPlaceholder;
    private readonly eEditor: GridInputTextArea = RefPlaceholder;
    private readonly initialText: string;

    constructor(
        private readonly note: CellNote | undefined,
        private readonly readOnly: boolean
    ) {
        super(NotesPopupContentElement, [AgInputTextAreaSelector]);
        this.initialText = note?.text.trim() ?? '';
    }

    public postConstruct(): void {
        const translate = this.getLocaleTextFunc();

        const author = this.note?.author?.trim();
        const timestamp = this.note?.updatedAt?.trim() || this.note?.createdAt?.trim();
        const metaParts = [author, timestamp].filter((part): part is string => !!part);
        this.eMeta.textContent = metaParts.join(' · ');
        _setDisplayed(this.eMeta, !!metaParts.length);

        this.eFooter.textContent = this.readOnly
            ? translate(
                  'cellNoteReadOnlyHint',
                  'Read-only note. Select text to copy. Drag the corner to resize. Press Esc to close.'
              )
            : translate(
                  'cellNoteHint',
                  'Hover to preview. Click inside to edit. Drag the corner to resize. Press Esc to close.'
              );

        this.eEditor
            .setInputPlaceholder(this.readOnly ? undefined : translate('cellNotePlaceholder', 'Add a note...'))
            .setRows(8)
            .setValue(this.note?.text ?? '', true)
            .setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));

        const inputEl = this.eEditor.getInputElement();
        inputEl.setAttribute('title', '');
        inputEl.readOnly = this.readOnly;
    }

    public focusEditor(): void {
        const focusable = this.eEditor.getFocusableElement();
        focusable.focus();

        const inputEl = this.eEditor.getInputElement();
        const valueLength = inputEl.value.length;
        inputEl.setSelectionRange(valueLength, valueLength);
    }

    public getEditedNote(): CellNote | undefined {
        const text = this.eEditor.getValue()?.trim();
        if (!text) {
            return undefined;
        }

        return {
            ...(this.note ?? {}),
            text,
        };
    }

    public isDirty(): boolean {
        if (this.readOnly) {
            return false;
        }

        return (this.eEditor.getValue()?.trim() ?? '') !== this.initialText;
    }
}

export class AgNotesPopup extends BeanStub {
    private dialog?: Dialog;
    private contentComp?: AgNotesPopupContent;
    private saveOnClose = true;
    private closed = false;
    private isResizing = false;

    constructor(
        private readonly params: {
            note?: CellNote;
            readOnly?: boolean;
            anchorToElement: HTMLElement;
            focusEditor?: boolean;
            onClosed: (
                noteChanged: boolean,
                note: CellNote | undefined,
                closeEvent?: MouseEvent | TouchEvent | KeyboardEvent
            ) => void;
            onPopupEnter: () => void;
            onPopupLeave: () => void;
        }
    ) {
        super();
    }

    public postConstruct(): void {
        const note = cloneCellNote(this.params.note);
        const contentComp = this.createManagedBean(new AgNotesPopupContent(note, !!this.params.readOnly));
        this.contentComp = contentComp;

        const { x, y } = this.computeInitialPosition();

        const dialog = this.createManagedBean(
            new Dialog({
                ...DEFAULT_SIZE,
                resizable: true,
                movable: false,
                closable: false,
                hideTitleBar: true,
                cssIdentifier: 'notes',
                x,
                y,
                closedCallback: (event) => this.onDialogClosed(event),
            })
        );
        this.dialog = dialog;
        dialog.setBodyComponent(contentComp);

        const eGui = dialog.getGui();
        const translate = this.getLocaleTextFunc();
        eGui.classList.add('ag-notes-popup');
        eGui.classList.toggle('ag-notes-popup-read-only', !!this.params.readOnly);
        eGui.setAttribute('aria-label', translate('cellNote', 'Cell Note'));

        this.addManagedElementListeners(eGui, {
            mousedown: (event: MouseEvent) => this.onMouseDown(event),
            pointerenter: () => this.params.onPopupEnter(),
            pointerleave: () => {
                if (!this.isResizing) {
                    this.params.onPopupLeave();
                }
            },
        });
        this.addManagedElementListeners(_getDocument(this.beans), {
            mouseup: () => this.onMouseUp(),
        });

        if (this.params.focusEditor) {
            contentComp.focusEditor();
        }
    }

    public hide(save = true): void {
        this.saveOnClose = save;
        this.dialog?.close();
    }

    public focusEditor(): void {
        this.contentComp?.focusEditor();
    }

    private computeInitialPosition(): { x: number; y: number } {
        const anchorRect = this.params.anchorToElement.getBoundingClientRect();
        const parentRect = this.beans.popupSvc!.getParentRect();

        const isRtl = this.gos.get('enableRtl');
        const xPosition = isRtl
            ? anchorRect.left - parentRect.left - DEFAULT_SIZE.width
            : anchorRect.right - parentRect.left;
        const yPosition = anchorRect.top - parentRect.top;
        const xPadding = 10 * (isRtl ? 1 : -1);
        const yPadding = 10;
        const x = xPosition + xPadding;
        const y = yPosition + yPadding;

        return { x, y };
    }

    /** Called by Dialog's closedCallback (Escape key, click outside, etc.) */
    private onDialogClosed(event?: MouseEvent | TouchEvent | KeyboardEvent): void {
        if (this.closed) {
            return;
        }

        this.closed = true;
        this.notifyClosed(event);
    }

    private onMouseDown(event: MouseEvent): void {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('.ag-resizer')) {
            return;
        }

        this.isResizing = true;
        this.params.onPopupEnter();
    }

    private onMouseUp(): void {
        if (!this.isResizing) {
            return;
        }

        this.isResizing = false;

        if (!this.dialog?.getGui().matches(':hover')) {
            this.params.onPopupLeave();
        }
    }

    public override destroy(): void {
        if (!this.closed) {
            this.closed = true;
            this.notifyClosed();
        }
        super.destroy();
    }

    private notifyClosed(closeEvent?: MouseEvent | TouchEvent | KeyboardEvent): void {
        const noteChanged = this.saveOnClose && (this.contentComp?.isDirty() ?? false);
        const editedNote = noteChanged ? this.contentComp?.getEditedNote() : undefined;
        this.params.onClosed(noteChanged, editedNote, closeEvent);
    }
}
