import type {
    BeanCollection,
    CellCtrl,
    FullWidthTarget,
    GetNoteParams,
    INotesFeature,
    Note,
    RowCtrl,
} from 'ag-grid-community';
import { _interpretAsRightClick, _isStopPropagationForAgGrid } from 'ag-grid-community';

import { AgNotesPopup } from './agNotesPopup';
import type { INotePopupOwner, INotesFeatureSupport, NoteTarget } from './notesShared';
import { isFullWidthRowNoteParams } from './notesShared';

const CSS_HAS_CELL_NOTES = 'ag-has-cell-notes';

abstract class BaseNotesFeature implements INotesFeature, INotePopupOwner {
    private popup?: AgNotesPopup;
    private activeTarget?: NoteTarget;
    private showTimer = 0;
    private hideTimer = 0;
    private suppressHoverUntilPointerLeave = false;

    // when this feature replaces its own popup (for example switching between embedded full-width
    // sections), closing the old popup would normally unregister this feature as the active owner. We
    // need to keep ownership through this close process so NotesService can still close the popup if another
    // cell or row opens a note next. (This is only relevant for embedded full-width row notes).
    private preserveActivePopupOwnerOnClose = false;

    constructor(
        protected readonly beans: BeanCollection,
        protected readonly notesSvc: INotesFeatureSupport
    ) {}

    public refresh(): void {
        this.refreshHasNotesStyling();

        if (!this.activeTarget) {
            return;
        }

        const { canView, canCreate } = this.notesSvc.getNoteAccess(this.activeTarget.noteParams) || {};
        if (!canView && !canCreate) {
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

    protected getNoteTrigger(): 'hover' | 'click' {
        return this.beans.gos.get('noteTrigger') === 'click' ? 'click' : 'hover';
    }

    protected onPointerEnter(target: NoteTarget | undefined, event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        if (this.suppressHoverUntilPointerLeave) {
            return;
        }

        if (this.getNoteTrigger() !== 'hover') {
            if (target && this.matchesActiveTarget(target)) {
                this.cancelHide();
            }
            return;
        }

        const access = target && this.notesSvc.getNoteAccess(target.noteParams);
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
        }, this.beans.gos.get('noteShowDelay'));
    }

    protected onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        this.suppressHoverUntilPointerLeave = false;
        this.clearShowTimer();

        if (this.popup?.hasFocus()) {
            return;
        }

        this.scheduleHide();
    }

    protected onContextMenu(): void {
        this.suppressHoverUntilPointerLeave = true;
        this.closeNotePopup();
    }

    protected onClick(target: NoteTarget | undefined, event: MouseEvent): void {
        if (
            this.getNoteTrigger() !== 'click' ||
            _isStopPropagationForAgGrid(event) ||
            _interpretAsRightClick(this.beans, event)
        ) {
            return;
        }

        const access = target && this.notesSvc.getNoteAccess(target.noteParams);
        if (!target || !access?.canView) {
            return;
        }

        this.suppressHoverUntilPointerLeave = false;
        this.openPopup(target);
    }

    protected abstract refreshHasNotesStyling(): void;

    protected abstract getTarget(pinned?: 'left' | 'right'): NoteTarget | undefined;

    private openPopup(target: NoteTarget, focusEditor = false): void {
        const access = this.notesSvc.getNoteAccess(target.noteParams);
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

        const previousOwner = this.notesSvc.replaceActivePopupOwner(this);

        if (previousOwner) {
            previousOwner.closeNotePopup();
        } else if (this.popup) {
            this.preserveActivePopupOwnerOnClose = true;
            this.closeNotePopup();
        }

        const popup = this.beans.context.createBean(
            new AgNotesPopup({
                note: access.note ?? { text: '' },
                readOnly: access.canView && !access.canEdit,
                anchorToElement: target.anchorElement,
                placementMode: isFullWidthRowNoteParams(target.noteParams) ? 'fullWidthRow' : 'cell',
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
        note: Note | undefined,
        closeEvent?: MouseEvent | TouchEvent | KeyboardEvent
    ): void {
        const target = this.activeTarget;
        const popup = this.popup;
        const preserveActivePopupOwner = this.preserveActivePopupOwnerOnClose;

        this.popup = undefined;
        this.activeTarget = undefined;
        this.preserveActivePopupOwnerOnClose = false;

        if (!preserveActivePopupOwner) {
            this.notesSvc.clearActivePopupOwner(this);
        }

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

        this.notesSvc.setNote({
            ...target.noteParams,
            note,
            previousNote: this.notesSvc.getNoteAccess(target.noteParams)?.note,
            source: 'ui',
        });
    }

    private matchesActiveTarget(target: NoteTarget): boolean {
        return areSameNoteParams(this.activeTarget?.noteParams, target.noteParams);
    }

    private scheduleHide(): void {
        this.cancelHide();
        this.hideTimer = window.setTimeout(() => this.closeNotePopup(), this.beans.gos.get('noteHideDelay'));
    }

    private cancelHide(): void {
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
            this.hideTimer = 0;
        }
    }

    protected clearShowTimer(): void {
        if (this.showTimer) {
            window.clearTimeout(this.showTimer);
            this.showTimer = 0;
        }
    }
}

export class AgNotesFeature extends BaseNotesFeature {
    constructor(
        beans: BeanCollection,
        private readonly ctrl: CellCtrl,
        notesSvc: INotesFeatureSupport
    ) {
        super(beans, notesSvc);
    }

    public override refresh(): void {
        if (this.ctrl.isNoteHoverSuppressed()) {
            this.clearShowTimer();
        }

        super.refresh();
    }

    public initialise(): void {
        this.ctrl.addManagedElementListeners(this.ctrl.eGui, {
            pointerenter: (event: PointerEvent) => {
                if (this.ctrl.isNoteHoverSuppressed()) {
                    return;
                }

                this.onPointerEnter(this.getTarget(), event);
            },
            pointerleave: (event: PointerEvent) => this.onPointerLeave(event),
            click: (event: MouseEvent) => {
                if (this.ctrl.isNoteHoverSuppressed()) {
                    return;
                }

                this.onClick(this.getTarget(), event);
            },
            contextmenu: () => this.onContextMenu(),
        });
        this.refresh();
    }

    protected refreshHasNotesStyling(): void {
        const hasNote = !!this.notesSvc.getNoteAccess(this.getPosition())?.note;
        this.ctrl.comp.toggleCss(CSS_HAS_CELL_NOTES, hasNote && !this.ctrl.isNoteHoverSuppressed());
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
    constructor(
        beans: BeanCollection,
        private readonly ctrl: RowCtrl,
        notesSvc: INotesFeatureSupport
    ) {
        super(beans, notesSvc);
    }

    public initialise(): void {
        for (const target of this.ctrl.getTargets()) {
            target.compBean.addManagedListeners(target.element, {
                pointerenter: (event: PointerEvent) =>
                    this.onPointerEnter(this.getTargetForElement(event.target), event),
                pointerleave: (event: PointerEvent) => this.onPointerLeave(event),
                click: (event: MouseEvent) => this.onClick(this.getTargetForElement(event.target), event),
                contextmenu: () => this.onContextMenu(),
            });
        }
        this.refresh();
    }

    protected refreshHasNotesStyling(): void {
        if (!this.ctrl.isFullWidth()) {
            return;
        }

        for (const target of this.ctrl.getTargets()) {
            const noteParams = this.getNoteParamsForTarget(target);
            const hasNote = !!this.notesSvc.getNoteAccess(noteParams)?.note;
            target.element.classList.toggle(CSS_HAS_CELL_NOTES, hasNote);
        }
    }

    private getNoteParamsForTarget(target: FullWidthTarget): GetNoteParams {
        const normalisedPinned = target.pinned === 'left' || target.pinned === 'right' ? target.pinned : undefined;
        return {
            rowNode: this.ctrl.rowNode,
            location: 'fullWidthRow',
            pinned: normalisedPinned,
        };
    }

    private getTargetForElement(element?: EventTarget | null): NoteTarget | undefined {
        const target = this.ctrl.getTarget(element);
        if (!target) {
            return undefined;
        }

        return this.getNoteTargetForFullWidthTarget(target);
    }

    private getNoteTargetForFullWidthTarget(target: FullWidthTarget): NoteTarget {
        return {
            noteParams: this.getNoteParamsForTarget(target),
            rowNode: this.ctrl.rowNode,
            focusColumn: target.column,
            anchorElement: target.element,
        };
    }

    protected getTarget(pinned?: 'left' | 'right'): NoteTarget | undefined {
        let matchedTarget: NoteTarget | undefined;
        let firstTarget: NoteTarget | undefined;

        for (const fullWidthTarget of this.ctrl.getTargets()) {
            if (matchedTarget) {
                break;
            }

            const noteTarget = this.getNoteTargetForFullWidthTarget(fullWidthTarget);

            if (!firstTarget) {
                firstTarget = noteTarget;
            }

            const normalisedPinned =
                fullWidthTarget.pinned === 'left' || fullWidthTarget.pinned === 'right'
                    ? fullWidthTarget.pinned
                    : undefined;
            if (normalisedPinned === pinned) {
                matchedTarget = noteTarget;
            }
        }

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
