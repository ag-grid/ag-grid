import type { Alignment } from 'ag-stack';
import {
    RefPlaceholder,
    _computeAlignedPosition,
    _findBestPlacement,
    _fitsWithinBounds,
    _getActiveDomElement,
    _getEffectivePlacements,
    _getRectSize,
    _setDisplayed,
    _toRelativeRect,
} from 'ag-stack';

import type { ElementParams, GridInputTextArea, Note } from 'ag-grid-community';
import { AgInputTextAreaSelector, BeanStub, Component, KeyCode } from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';
import { cloneNote } from './notesUtils';

const DEFAULT_SIZE = {
    width: 290,
    height: 150,
    minWidth: 240,
    minHeight: 150,
};

const CELL_PLACEMENTS: Alignment[] = ['tl-tr', 'tr-br', 'br-tr', 'tr-tl', 'br-tl'];
const FULL_WIDTH_ROW_PLACEMENTS: Alignment[] = ['tl-tr', 'tr-br', 'br-tr'];
type NotesPopupPlacementMode = 'cell' | 'fullWidthRow';
type BoundsRect = Pick<DOMRectReadOnly, 'top' | 'left' | 'right' | 'bottom'>;
type PopupSize = Pick<DOMRectReadOnly, 'width' | 'height'>;

interface NotesPopupPositionParams {
    anchorRect: BoundsRect;
    parentRect: BoundsRect;
    popupSize: PopupSize;
    placementMode: NotesPopupPlacementMode;
    enableRtl: boolean;
}

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
    ],
};

class AgNotesPopupContent extends Component {
    private readonly eMeta: HTMLElement = RefPlaceholder;
    private readonly eEditor: GridInputTextArea = RefPlaceholder;
    private readonly initialText: string;

    constructor(
        private readonly note: Note | undefined,
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

        this.eEditor
            .setInputPlaceholder(this.readOnly ? undefined : translate('notePlaceholder', 'Add a note...'))
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

    public getEditedNote(): Note | undefined {
        return buildEditedNote(this.note, this.eEditor.getValue());
    }

    public isDirty(): boolean {
        if (this.readOnly) {
            return false;
        }

        return (this.eEditor.getValue()?.trim() ?? '') !== this.initialText;
    }
}

/** @knipIgnore Used in tests */
export function buildEditedNote(note: Note | undefined, nextText: string | null | undefined): Note | undefined {
    const text = nextText?.trim();
    if (!text) {
        return undefined;
    }

    return {
        ...(note ?? {}),
        text,
    };
}

export class AgNotesPopup extends BeanStub {
    private dialog?: Dialog;
    private contentComp?: AgNotesPopupContent;
    private saveOnClose = true;
    private closed = false;

    constructor(
        private readonly params: {
            note?: Note;
            readOnly?: boolean;
            anchorToElement: HTMLElement;
            placementMode: NotesPopupPlacementMode;
            focusEditor?: boolean;
            onClosed: (
                noteChanged: boolean,
                note: Note | undefined,
                closeEvent?: MouseEvent | TouchEvent | KeyboardEvent
            ) => void;
            onPopupEnter: () => void;
            onPopupLeave: () => void;
        }
    ) {
        super();
    }

    public postConstruct(): void {
        const note = cloneNote(this.params.note);
        const contentComp = this.createManagedBean(new AgNotesPopupContent(note, !!this.params.readOnly));
        this.contentComp = contentComp;

        const { x, y } = this.computeInitialPosition();

        const dialog = this.createManagedBean(
            new Dialog({
                ...DEFAULT_SIZE,
                modal: true,
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
        eGui.setAttribute('aria-label', translate('note', 'Note'));

        this.addManagedElementListeners(eGui, {
            keydown: (event: KeyboardEvent) => {
                if (event.key === KeyCode.TAB) {
                    event.preventDefault();
                }
            },
            pointerenter: () => this.params.onPopupEnter(),
            pointerout: (event: PointerEvent) => this.onPotentialLeave(event.relatedTarget, true),
            focusout: (event: FocusEvent) => {
                if (dialog.isResizing) {
                    return;
                }

                this.onPotentialLeave(event.relatedTarget, false);
            },
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

    public hasFocus(): boolean {
        return !!this.dialog?.getGui().contains(_getActiveDomElement(this.beans));
    }

    private onPotentialLeave(relatedTarget: EventTarget | null, keepOpenWhileFocused: boolean): void {
        const eGui = this.dialog?.getGui();
        if (!eGui) {
            return;
        }

        if (relatedTarget && eGui.contains(relatedTarget as Element)) {
            return;
        }

        if (keepOpenWhileFocused && this.hasFocus()) {
            return;
        }

        this.params.onPopupLeave();
    }

    private computeInitialPosition(): { x: number; y: number } {
        return findNotesPopupPosition({
            anchorRect: this.params.anchorToElement.getBoundingClientRect(),
            parentRect: this.beans.popupSvc!.getParentRect(),
            popupSize: DEFAULT_SIZE,
            placementMode: this.params.placementMode,
            enableRtl: this.gos.get('enableRtl'),
        });
    }

    /** Called by Dialog's closedCallback (Escape key, click outside, etc.) */
    private onDialogClosed(event?: MouseEvent | TouchEvent | KeyboardEvent): void {
        if (this.closed) {
            return;
        }

        this.closed = true;
        this.notifyClosed(event);
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

/** @knipIgnore Used in tests */
export function findNotesPopupPosition(params: NotesPopupPositionParams): { x: number; y: number } {
    const { anchorRect, parentRect, popupSize, placementMode, enableRtl } = params;
    const referenceRect = _toRelativeRect(anchorRect, parentRect);
    const parentSize = _getRectSize(parentRect);
    const basePlacements = placementMode === 'fullWidthRow' ? FULL_WIDTH_ROW_PLACEMENTS : CELL_PLACEMENTS;
    const placements = _getEffectivePlacements(basePlacements, enableRtl);

    for (const alignment of placements) {
        const position = _computeAlignedPosition(referenceRect, popupSize, alignment, 0);

        if (alignment === 'tl-tr' || alignment === 'tr-tl') {
            position.y -= 1;
        }

        if (_fitsWithinBounds(position, popupSize, parentSize)) {
            return position;
        }
    }

    return _findBestPlacement(referenceRect, popupSize, parentSize, [...basePlacements.slice(1), basePlacements[0]], {
        gap: 0,
        enableRtl,
    });
}

/** @knipIgnore Used in tests */
export function getNotesPopupPlacements(mode: NotesPopupPlacementMode, enableRtl?: boolean): Alignment[] {
    const placements = mode === 'fullWidthRow' ? FULL_WIDTH_ROW_PLACEMENTS : CELL_PLACEMENTS;
    return _getEffectivePlacements(placements, enableRtl);
}
