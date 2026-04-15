import type { BeanCollection, CellCtrl, INoteAccess } from 'ag-grid-community';

import { AgNotesFeature } from './agNotesFeature';
import type { INotesFeatureSupport } from './notesShared';

describe('AgNotesFeature', () => {
    let beans: BeanCollection;
    let ctrl: Pick<
        CellCtrl,
        'addManagedElementListeners' | 'column' | 'comp' | 'eGui' | 'isNoteHoverSuppressed' | 'rowNode'
    >;
    let otherCtrl: Pick<
        CellCtrl,
        'addManagedElementListeners' | 'column' | 'comp' | 'eGui' | 'isNoteHoverSuppressed' | 'rowNode'
    >;
    let listeners: Record<string, (event: PointerEvent) => void>;
    let popup: { hide: jest.Mock; focusEditor: jest.Mock; hasFocus: jest.Mock };
    let context: { createBean: jest.Mock; destroyBean: jest.Mock };
    let access: INoteAccess;
    let notesSvc: Pick<
        INotesFeatureSupport,
        'clearActivePopupOwner' | 'getNoteAccess' | 'getHoverGeneration' | 'replaceActivePopupOwner' | 'setNote'
    >;

    beforeEach(() => {
        jest.useFakeTimers();

        listeners = {};
        popup = {
            hide: jest.fn(),
            focusEditor: jest.fn(),
            hasFocus: jest.fn(() => false),
        };
        context = {
            createBean: jest.fn(() => popup),
            destroyBean: jest.fn(),
        };

        ctrl = {
            eGui: document.createElement('div'),
            rowNode: { id: '1', rowIndex: 0, rowPinned: null } as unknown as CellCtrl['rowNode'],
            column: { getColId: () => 'athlete' } as unknown as CellCtrl['column'],
            comp: { toggleCss: jest.fn() } as unknown as CellCtrl['comp'],
            addManagedElementListeners: jest.fn((_element, managedListeners) => {
                listeners = managedListeners as typeof listeners;
            }),
            isNoteHoverSuppressed: jest.fn(() => false),
        };
        otherCtrl = {
            eGui: document.createElement('div'),
            rowNode: { id: '2', rowIndex: 1, rowPinned: null } as unknown as CellCtrl['rowNode'],
            column: { getColId: () => 'country' } as unknown as CellCtrl['column'],
            comp: { toggleCss: jest.fn() } as unknown as CellCtrl['comp'],
            addManagedElementListeners: jest.fn(),
            isNoteHoverSuppressed: jest.fn(() => false),
        };

        access = {
            params: { rowNode: ctrl.rowNode, column: ctrl.column },
            rowNode: ctrl.rowNode,
            column: ctrl.column,
            note: { text: 'Note' },
            isReadOnly: false,
            isSuppressed: false,
            canView: true,
            canCreate: false,
            canEdit: true,
            canDelete: true,
        };

        beans = {
            gos: {
                get: jest.fn((key: string) => {
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
                setFocusedCell: jest.fn(),
            },
        } as unknown as BeanCollection;

        notesSvc = {
            getNoteAccess: jest.fn(() => access),
            getHoverGeneration: jest.fn(() => 0),
            replaceActivePopupOwner: jest.fn(() => undefined),
            clearActivePopupOwner: jest.fn(),
            setNote: jest.fn(),
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('uses noteShowDelay before opening a note on hover', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);

        jest.advanceTimersByTime(24);
        expect(context.createBean).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(context.createBean).toHaveBeenCalledTimes(1);
    });

    it('uses noteHideDelay before hiding an open note', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        feature.show();
        listeners.pointerleave?.({ pointerType: 'mouse' } as PointerEvent);

        jest.advanceTimersByTime(39);
        expect(popup.hide).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(popup.hide).toHaveBeenCalledWith(true);
    });

    it('does not hide an open note when leaving the owner cell while the popup is focused', () => {
        popup.hasFocus.mockReturnValue(true);

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        feature.show({ focusEditor: true });
        listeners.pointerleave?.({ pointerType: 'mouse' } as PointerEvent);

        jest.advanceTimersByTime(40);
        expect(popup.hide).not.toHaveBeenCalled();
    });

    it('suppresses hover opens and hides the earmark when note hover is suppressed', () => {
        (ctrl.isNoteHoverSuppressed as jest.Mock).mockReturnValue(true);

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        expect(ctrl.comp.toggleCss as jest.Mock).toHaveBeenCalledWith('ag-has-cell-notes', false);

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        jest.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('cancels pending hover opens when note hover becomes suppressed', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        (ctrl.isNoteHoverSuppressed as jest.Mock).mockReturnValue(true);

        feature.refresh();
        jest.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('still allows explicit note opens when hover is suppressed', () => {
        (ctrl.isNoteHoverSuppressed as jest.Mock).mockReturnValue(true);

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();
        feature.show({ focusEditor: true });

        expect(context.createBean).toHaveBeenCalledTimes(1);
    });

    it('does not discard a draft note during refresh while the cell is still creatable', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();
        feature.show({ focusEditor: true });

        access = {
            ...access,
            note: undefined,
            canView: false,
            canCreate: true,
            canEdit: false,
            canDelete: false,
        };

        feature.refresh();

        expect(popup.hide).not.toHaveBeenCalled();
    });

    it('closes the current popup when another owner opens after a same-owner reopen transition', () => {
        let activeOwner: unknown;
        const createdPopups: { hide: jest.Mock; focusEditor: jest.Mock }[] = [];

        context.createBean = jest.fn((popupComp: any) => {
            const createdPopup = {
                hide: jest.fn((_save = true) => {
                    popupComp.params.onClosed(false, undefined);
                }),
                focusEditor: jest.fn(),
                hasFocus: jest.fn(() => false),
            };
            createdPopups.push(createdPopup);
            return createdPopup;
        });

        notesSvc.replaceActivePopupOwner = jest.fn((owner) => {
            const previousOwner = activeOwner;
            if (previousOwner === owner) {
                return undefined;
            }
            activeOwner = owner;
            return previousOwner as any;
        });

        notesSvc.clearActivePopupOwner = jest.fn((owner) => {
            if (activeOwner === owner) {
                activeOwner = undefined;
            }
        });

        notesSvc.getNoteAccess = jest.fn((params) => ({
            ...access,
            params,
            rowNode: params.rowNode,
            column: 'column' in params ? (params.column as any) : access.column,
        }));

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();
        feature.show({ focusEditor: true });

        (ctrl as { column: CellCtrl['column'] }).column = {
            getColId: () => 'sport',
        } as unknown as CellCtrl['column'];

        feature.show({ focusEditor: true });

        const otherFeature = new AgNotesFeature(beans, otherCtrl as CellCtrl, notesSvc);
        otherFeature.initialise();
        otherFeature.show({ focusEditor: true });

        expect(createdPopups).toHaveLength(3);
        expect(createdPopups[0].hide).toHaveBeenCalledWith(true);
        expect(createdPopups[1].hide).toHaveBeenCalledWith(true);
    });
});
