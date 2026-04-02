import type {
    AgColumn,
    BeanCollection,
    CellCtrl,
    CellNote,
    ICellNotesFeature,
    RowCtrl,
    RowGui,
} from 'ag-grid-community';

import { AgNotesPopup } from './agNotesPopup';
import type { ICellNotePopupOwner, INotesFeatureSupport, NoteTarget } from './notesShared';

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

        if (this.activeTarget && !this.notesSvc.getCellNoteAccess(this.activeTarget)?.canView) {
            this.closeNotePopup(false);
        }
    }

    public show(params?: { focusEditor?: boolean; column?: AgColumn }): void {
        const target = this.getTarget(params?.column);
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

        const access = target && this.notesSvc.getCellNoteAccess(target);
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

    protected abstract getTarget(column?: AgColumn): NoteTarget | undefined;

    private openPopup(target: NoteTarget, focusEditor = false): void {
        const access = this.notesSvc.getCellNoteAccess(target);
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
                column: target.column,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: true,
                sourceEvent: closeEvent,
            });
        }

        if (!noteChanged || !target) {
            return;
        }

        this.notesSvc.setCellNote({
            ...target,
            note,
            previousNote: this.notesSvc.getCellNoteAccess(target)?.note,
            source: 'ui',
        });
    }

    private matchesActiveTarget(target: NoteTarget): boolean {
        return this.activeTarget?.rowNode === target.rowNode && this.activeTarget?.column === target.column;
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
        };
    }

    protected getTarget(_column?: AgColumn): NoteTarget {
        return {
            ...this.getPosition(),
            anchorElement: this.ctrl.eGui,
        };
    }
}

export class AgFullWidthRowNotesFeature extends BaseNotesFeature {
    private readonly registeredElements = new WeakSet<HTMLElement>();

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
        if (this.registeredElements.has(gui.element)) {
            return;
        }

        this.registeredElements.add(gui.element);
        gui.compBean.addManagedListeners(gui.element, {
            pointerenter: (event: PointerEvent) => this.onPointerEnter(this.getTargetForGui(gui), event),
            pointerleave: (event: PointerEvent) => this.onPointerLeave(event),
            contextmenu: () => this.onContextMenu(),
        });
    }

    private getPositionForGui(gui: RowGui) {
        const column = this.ctrl.getColumnForFullWidth(gui);
        if (!column) {
            return undefined;
        }

        return {
            rowNode: this.ctrl.rowNode,
            column,
        };
    }

    private getTargetForGui(gui: RowGui): NoteTarget | undefined {
        const position = this.getPositionForGui(gui);
        if (!position) {
            return undefined;
        }

        return {
            ...position,
            anchorElement: gui.element,
        };
    }

    protected getTarget(column?: AgColumn): NoteTarget | undefined {
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

            if (!column || target.column === column) {
                matchedTarget = target;
            }
        });

        return matchedTarget ?? firstTarget;
    }
}
