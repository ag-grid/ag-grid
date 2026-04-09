import type {
    BeanCollection,
    BeanStub,
    CellCtrl,
    CellNote,
    GetNoteParams,
    ICellNotesFeature,
    RowCtrl,
    RowGui,
} from 'ag-grid-community';

import { AgNotesPopup } from './agNotesPopup';
import type { ICellNotePopupOwner, INotesFeatureSupport, NoteTarget } from './notesShared';
import { isFullWidthRowNoteParams } from './notesShared';

const CSS_HAS_CELL_NOTES = 'ag-has-cell-notes';
const NOTE_SHOW_DELAY = 180;
const NOTE_HIDE_DELAY = 220;

abstract class BaseNotesFeature implements ICellNotesFeature, ICellNotePopupOwner {
    private popup?: AgNotesPopup;
    private activeTarget?: NoteTarget;
    private showTimer = 0;
    private hideTimer = 0;
    private suppressHoverUntilPointerLeave = false;

    constructor(
        protected readonly beans: BeanCollection,
        protected readonly notesSvc: INotesFeatureSupport
    ) {}

    public refresh(): void {
        this.refreshHasNotesStyling();

        if (this.activeTarget && !this.notesSvc.getCellNoteAccess(this.activeTarget.noteParams)?.canView) {
            this.closeNotePopup(false);
        }
    }

    public show(params?: { focusEditor?: boolean; pinned?: 'left' | 'right' }): void {
        const target = this.getTarget(params?.pinned);
        if (!target) {
            return;
        }

        this.openPopup(target, params?.focusEditor);
    }

    public hide(save = true): void {
        this.closeNotePopup(save);
    }

    public closeNotePopup(save = true): void {
        this.clearShowTimer();
        this.cancelHide();
        this.popup?.hide(save);
    }

    public destroy(): void {
        this.closeNotePopup(false);
    }

    protected onPointerEnter(target: NoteTarget | undefined, event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        if (this.suppressHoverUntilPointerLeave) {
            return;
        }

        const access = target && this.notesSvc.getCellNoteAccess(target.noteParams);
        this.cancelHide();

        if (!target || !access?.canView) {
            return;
        }

        if (this.matchesActiveTarget(target)) {
            return;
        }

        this.clearShowTimer();
        const hoverGeneration = this.notesSvc.getHoverGeneration();
        this.showTimer = window.setTimeout(() => {
            // the NotesService increments the generation on scroll so delayed hover opens do not fire
            // after the grid has moved and the original hover target is no longer relevant.
            if (hoverGeneration !== this.notesSvc.getHoverGeneration()) {
                return;
            }

            this.openPopup(target);
        }, NOTE_SHOW_DELAY);
    }

    protected onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        this.suppressHoverUntilPointerLeave = false;
        this.clearShowTimer();
        this.scheduleHide();
    }

    protected onContextMenu(): void {
        this.suppressHoverUntilPointerLeave = true;
        this.closeNotePopup();
    }

    protected abstract refreshHasNotesStyling(): void;

    protected abstract getTarget(pinned?: 'left' | 'right'): NoteTarget | undefined;

    private openPopup(target: NoteTarget, focusEditor = false): void {
        const access = this.notesSvc.getCellNoteAccess(target.noteParams);
        if (!access || (!access.canView && !(focusEditor && access.canCreate))) {
            return;
        }

        this.cancelHide();
        this.clearShowTimer();

        if (this.matchesActiveTarget(target) && this.popup) {
            if (focusEditor) {
                this.popup.focusEditor();
            }
            return;
        }

        this.notesSvc.replaceActivePopupOwner(this)?.closeNotePopup();

        const popup = this.beans.context.createBean(
            new AgNotesPopup({
                note: access.note ?? { text: '' },
                readOnly: access.canView && !access.canEdit,
                anchorToElement: target.anchorElement,
                focusEditor,
                onClosed: (noteChanged, note, closeEvent) => this.onPopupClosed(noteChanged, note, closeEvent),
                onPopupEnter: () => this.cancelHide(),
                onPopupLeave: () => this.scheduleHide(),
            })
        );

        this.popup = popup;
        this.activeTarget = target;
    }

    private onPopupClosed(
        noteChanged: boolean,
        note: CellNote | undefined,
        closeEvent?: MouseEvent | TouchEvent | KeyboardEvent
    ): void {
        const target = this.activeTarget;
        const popup = this.popup;

        this.popup = undefined;
        this.activeTarget = undefined;
        this.notesSvc.clearActivePopupOwner(this);

        if (popup) {
            this.beans.context.destroyBean(popup);
        }

        if (target && closeEvent instanceof KeyboardEvent && closeEvent.key === 'Escape') {
            this.beans.focusSvc.setFocusedCell({
                rowIndex: target.rowNode.rowIndex!,
                rowPinned: target.rowNode.rowPinned,
                column: target.focusColumn,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: true,
                sourceEvent: closeEvent,
            });
        }

        if (!noteChanged || !target) {
            return;
        }

        this.notesSvc.setCellNote({
            ...target.noteParams,
            note,
            previousNote: this.notesSvc.getCellNoteAccess(target.noteParams)?.note,
            source: 'ui',
        });
    }

    private matchesActiveTarget(target: NoteTarget): boolean {
        return areSameNoteParams(this.activeTarget?.noteParams, target.noteParams);
    }

    private scheduleHide(): void {
        this.cancelHide();
        this.hideTimer = window.setTimeout(() => this.closeNotePopup(), NOTE_HIDE_DELAY);
    }

    private cancelHide(): void {
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
            this.hideTimer = 0;
        }
    }

    private clearShowTimer(): void {
        if (this.showTimer) {
            window.clearTimeout(this.showTimer);
            this.showTimer = 0;
        }
    }
}

export class AgCellNotesFeature extends BaseNotesFeature {
    constructor(
        beans: BeanCollection,
        private readonly ctrl: CellCtrl,
        notesSvc: INotesFeatureSupport
    ) {
        super(beans, notesSvc);
    }

    public initialise(): void {
        this.ctrl.addManagedElementListeners(this.ctrl.eGui, {
            pointerenter: (event: PointerEvent) => this.onPointerEnter(this.getTarget(), event),
            pointerleave: (event: PointerEvent) => this.onPointerLeave(event),
            contextmenu: () => this.onContextMenu(),
        });
        this.refresh();
    }

    protected refreshHasNotesStyling(): void {
        this.ctrl.comp.toggleCss(CSS_HAS_CELL_NOTES, !!this.notesSvc.getCellNoteAccess(this.getPosition())?.note);
    }

    private getPosition() {
        return {
            rowNode: this.ctrl.rowNode,
            column: this.ctrl.column,
        } satisfies GetNoteParams;
    }

    protected getTarget(): NoteTarget {
        return {
            noteParams: this.getPosition(),
            rowNode: this.ctrl.rowNode,
            focusColumn: this.ctrl.column,
            anchorElement: this.ctrl.eGui,
        };
    }
}

export class AgFullWidthRowNotesFeature extends BaseNotesFeature {
    private readonly registeredGuis = new WeakSet<BeanStub>();

    constructor(
        beans: BeanCollection,
        private readonly ctrl: RowCtrl,
        notesSvc: INotesFeatureSupport
    ) {
        super(beans, notesSvc);
    }

    public initialise(): void {
        this.refresh();
    }

    protected refreshHasNotesStyling(): void {
        if (!this.ctrl.isFullWidth()) {
            return;
        }

        this.ctrl.forEachGui(undefined, (gui) => {
            this.registerGui(gui);

            const position = this.getPositionForGui(gui);
            const hasNote = !!position && !!this.notesSvc.getCellNoteAccess(position)?.note;
            gui.rowComp.toggleCss(CSS_HAS_CELL_NOTES, hasNote);
        });
    }

    private registerGui(gui: RowGui): void {
        const { compBean, element } = gui;
        if (this.registeredGuis.has(compBean)) {
            return;
        }

        this.registeredGuis.add(compBean);
        compBean.addManagedListeners(element, {
            pointerenter: (event: PointerEvent) => this.onPointerEnter(this.getTargetForGui(gui), event),
            pointerleave: (event: PointerEvent) => this.onPointerLeave(event),
            contextmenu: () => this.onContextMenu(),
        });
    }

    private getPositionForGui(gui: RowGui): GetNoteParams {
        const pinned = this.ctrl.getPinnedForFullWidth(gui);
        const normalisedPinned = pinned === 'left' || pinned === 'right' ? pinned : undefined;
        return {
            rowNode: this.ctrl.rowNode,
            location: 'fullWidthRow',
            pinned: normalisedPinned,
        };
    }

    private getTargetForGui(gui: RowGui): NoteTarget | undefined {
        const position = this.getPositionForGui(gui);
        const focusColumn = this.ctrl.getColumnForFullWidth(gui);
        if (!focusColumn) {
            return undefined;
        }

        return {
            noteParams: position,
            rowNode: this.ctrl.rowNode,
            focusColumn,
            anchorElement: gui.element,
        };
    }

    protected getTarget(pinned?: 'left' | 'right'): NoteTarget | undefined {
        let matchedTarget: NoteTarget | undefined;
        let firstTarget: NoteTarget | undefined;

        this.ctrl.forEachGui(undefined, (gui) => {
            if (matchedTarget) {
                return;
            }

            const target = this.getTargetForGui(gui);
            if (!target) {
                return;
            }

            if (!firstTarget) {
                firstTarget = target;
            }

            if (isFullWidthRowNoteParams(target.noteParams) && target.noteParams.pinned === pinned) {
                matchedTarget = target;
            }
        });

        return matchedTarget ?? firstTarget;
    }
}

function areSameNoteParams(left?: GetNoteParams, right?: GetNoteParams): boolean {
    if (!left || !right) {
        return left === right;
    }

    if (isFullWidthRowNoteParams(left) || isFullWidthRowNoteParams(right)) {
        return (
            isFullWidthRowNoteParams(left) &&
            isFullWidthRowNoteParams(right) &&
            left.rowNode === right.rowNode &&
            left.pinned === right.pinned
        );
    }

    return left.rowNode === right.rowNode && left.column === right.column;
}
