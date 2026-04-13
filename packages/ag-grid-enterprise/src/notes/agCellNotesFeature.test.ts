import type { Mock } from 'vitest';

import type { BeanCollection, CellCtrl, ICellNoteAccess } from 'ag-grid-community';

import { AgCellNotesFeature } from './agCellNotesFeature';
import type { INotesFeatureSupport } from './notesShared';

describe('AgCellNotesFeature', () => {
    let beans: BeanCollection;
    let ctrl: Pick<
        CellCtrl,
        'addManagedElementListeners' | 'column' | 'comp' | 'eGui' | 'isCellNoteHoverSuppressed' | 'rowNode'
    >;
    let listeners: Record<string, (event: PointerEvent) => void>;
    let popup: { hide: Mock; focusEditor: Mock };
    let context: { createBean: Mock; destroyBean: Mock };
    let access: ICellNoteAccess;
    let notesSvc: Pick<
        INotesFeatureSupport,
        'clearActivePopupOwner' | 'getCellNoteAccess' | 'getHoverGeneration' | 'replaceActivePopupOwner' | 'setCellNote'
    >;

    beforeEach(() => {
        vi.useFakeTimers();

        listeners = {};
        popup = {
            hide: vi.fn(),
            focusEditor: vi.fn(),
        };
        context = {
            createBean: vi.fn(() => popup),
            destroyBean: vi.fn(),
        };

        ctrl = {
            eGui: document.createElement('div'),
            rowNode: { id: '1', rowIndex: 0, rowPinned: null } as unknown as CellCtrl['rowNode'],
            column: { getColId: () => 'athlete' } as unknown as CellCtrl['column'],
            comp: { toggleCss: vi.fn() } as unknown as CellCtrl['comp'],
            addManagedElementListeners: vi.fn((_element, managedListeners) => {
                listeners = managedListeners as typeof listeners;
                return [];
            }),
            isCellNoteHoverSuppressed: vi.fn(() => false),
        };

        access = {
            params: { rowNode: ctrl.rowNode, column: ctrl.column },
            rowNode: ctrl.rowNode,
            column: ctrl.column,
            note: { text: 'Cell note' },
            isReadOnly: false,
            isSuppressed: false,
            canView: true,
            canCreate: false,
            canEdit: true,
            canDelete: true,
        };

        beans = {
            gos: {
                get: vi.fn((key: string) => {
                    switch (key) {
                        case 'noteShowDelay':
                            return 25;
                        case 'noteHideDelay':
                            return 40;
                        default:
                            return undefined;
                    }
                }),
            },
            context,
            focusSvc: {
                setFocusedCell: vi.fn(),
            },
        } as unknown as BeanCollection;

        notesSvc = {
            getCellNoteAccess: vi.fn(() => access),
            getHoverGeneration: vi.fn(() => 0),
            replaceActivePopupOwner: vi.fn(() => undefined),
            clearActivePopupOwner: vi.fn(),
            setCellNote: vi.fn(),
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('uses noteShowDelay before opening a note on hover', () => {
        const feature = new AgCellNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);

        vi.advanceTimersByTime(24);
        expect(context.createBean).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(context.createBean).toHaveBeenCalledTimes(1);
    });

    it('uses noteHideDelay before hiding an open note', () => {
        const feature = new AgCellNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        feature.show({ focusEditor: true });
        listeners.pointerleave?.({ pointerType: 'mouse' } as PointerEvent);

        vi.advanceTimersByTime(39);
        expect(popup.hide).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(popup.hide).toHaveBeenCalledWith(true);
    });

    it('suppresses hover opens and hides the earmark when note hover is suppressed', () => {
        (ctrl.isCellNoteHoverSuppressed as Mock).mockReturnValue(true);

        const feature = new AgCellNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        expect(ctrl.comp.toggleCss as Mock).toHaveBeenCalledWith('ag-has-cell-notes', false);

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        vi.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('cancels pending hover opens when note hover becomes suppressed', () => {
        const feature = new AgCellNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        (ctrl.isCellNoteHoverSuppressed as Mock).mockReturnValue(true);

        feature.refresh();
        vi.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('still allows explicit note opens when hover is suppressed', () => {
        (ctrl.isCellNoteHoverSuppressed as Mock).mockReturnValue(true);

        const feature = new AgCellNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();
        feature.show({ focusEditor: true });

        expect(context.createBean).toHaveBeenCalledTimes(1);
    });
});
