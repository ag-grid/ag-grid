import type { Mock } from 'vitest';

import type { BeanCollection, CellCtrl, INoteAccess } from 'ag-grid-community';

import { AgFullWidthRowNotesFeature, AgNotesFeature } from './agNotesFeature';
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
    let listeners: Record<string, (event: MouseEvent) => void>;
    let popup: { hide: Mock; focusEditor: Mock; hasFocus: Mock };
    let context: { createBean: Mock; destroyBean: Mock };
    let access: INoteAccess;
    let noteTrigger: 'hover' | 'click';
    let notesSvc: Pick<
        INotesFeatureSupport,
        'clearActivePopupOwner' | 'getNoteAccess' | 'getHoverGeneration' | 'replaceActivePopupOwner' | 'setNote'
    >;

    beforeEach(() => {
        vi.useFakeTimers();

        listeners = {};
        popup = {
            hide: vi.fn(),
            focusEditor: vi.fn(),
            hasFocus: vi.fn(() => false),
        };
        noteTrigger = 'hover';
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
            isNoteHoverSuppressed: vi.fn(() => false),
        };
        otherCtrl = {
            eGui: document.createElement('div'),
            rowNode: { id: '2', rowIndex: 1, rowPinned: null } as unknown as CellCtrl['rowNode'],
            column: { getColId: () => 'country' } as unknown as CellCtrl['column'],
            comp: { toggleCss: vi.fn() } as unknown as CellCtrl['comp'],
            addManagedElementListeners: vi.fn(),
            isNoteHoverSuppressed: vi.fn(() => false),
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
                get: vi.fn((key: string) => {
                    switch (key) {
                        case 'noteTrigger':
                            return noteTrigger;
                        case 'noteShowDelay':
                            return 25;
                        case 'noteHideDelay':
                            return 40;
                        case 'allowContextMenuWithControlKey':
                            return false;
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
            getNoteAccess: vi.fn(() => access),
            getHoverGeneration: vi.fn(() => 0),
            replaceActivePopupOwner: vi.fn(() => undefined),
            clearActivePopupOwner: vi.fn(),
            setNote: vi.fn(),
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('uses noteShowDelay before opening a note on hover', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);

        vi.advanceTimersByTime(24);
        expect(context.createBean).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(context.createBean).toHaveBeenCalledTimes(1);
    });

    it('does not open a note on hover when noteTrigger is click', () => {
        noteTrigger = 'click';

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        vi.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('opens a note on left click when noteTrigger is click', () => {
        noteTrigger = 'click';

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.click?.({ button: 0, ctrlKey: false } as MouseEvent);

        expect(context.createBean).toHaveBeenCalledTimes(1);
    });

    it('does not open a note on click when the cell has no note', () => {
        noteTrigger = 'click';
        access = {
            ...access,
            note: undefined,
            canView: false,
            canCreate: true,
            canEdit: false,
            canDelete: false,
        };

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.click?.({ button: 0, ctrlKey: false } as MouseEvent);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('does not open a note on right click when noteTrigger is click', () => {
        noteTrigger = 'click';

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.click?.({ button: 2, ctrlKey: false } as MouseEvent);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('does not open a note on click when propagation is stopped for AG Grid', () => {
        noteTrigger = 'click';

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        const event = { button: 0, ctrlKey: false } as MouseEvent & { __ag_Grid_Stop_Propagation?: boolean };
        event.__ag_Grid_Stop_Propagation = true;

        listeners.click?.(event);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('does not open a note on click when note display is suppressed', () => {
        noteTrigger = 'click';
        (ctrl.isNoteHoverSuppressed as Mock).mockReturnValue(true);

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.click?.({ button: 0, ctrlKey: false } as MouseEvent);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('uses noteHideDelay before hiding an open note', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        feature.show();
        listeners.pointerleave?.({ pointerType: 'mouse' } as PointerEvent);

        vi.advanceTimersByTime(39);
        expect(popup.hide).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(popup.hide).toHaveBeenCalledWith(true);
    });

    it('uses noteHideDelay before hiding a click-opened note', () => {
        noteTrigger = 'click';

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.click?.({ button: 0, ctrlKey: false } as MouseEvent);
        listeners.pointerleave?.({ pointerType: 'mouse' } as PointerEvent);

        vi.advanceTimersByTime(39);
        expect(popup.hide).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(popup.hide).toHaveBeenCalledWith(true);
    });

    it('does not hide an open note when leaving the owner cell while the popup is focused', () => {
        popup.hasFocus.mockReturnValue(true);

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        feature.show({ focusEditor: true });
        listeners.pointerleave?.({ pointerType: 'mouse' } as PointerEvent);

        vi.advanceTimersByTime(40);
        expect(popup.hide).not.toHaveBeenCalled();
    });

    it('suppresses hover opens and hides the earmark when note hover is suppressed', () => {
        (ctrl.isNoteHoverSuppressed as Mock).mockReturnValue(true);

        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        expect(ctrl.comp.toggleCss as Mock).toHaveBeenCalledWith('ag-has-cell-notes', false);

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        vi.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('cancels pending hover opens when note hover becomes suppressed', () => {
        const feature = new AgNotesFeature(beans, ctrl as CellCtrl, notesSvc);
        feature.initialise();

        listeners.pointerenter?.({ pointerType: 'mouse' } as PointerEvent);
        (ctrl.isNoteHoverSuppressed as Mock).mockReturnValue(true);

        feature.refresh();
        vi.advanceTimersByTime(25);

        expect(context.createBean).not.toHaveBeenCalled();
    });

    it('still allows explicit note opens when hover is suppressed', () => {
        (ctrl.isNoteHoverSuppressed as Mock).mockReturnValue(true);

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
        const createdPopups: { hide: Mock; focusEditor: Mock }[] = [];

        context.createBean = vi.fn((popupComp: any) => {
            const createdPopup = {
                hide: vi.fn((_save = true) => {
                    popupComp.params.onClosed(false, undefined);
                }),
                focusEditor: vi.fn(),
                hasFocus: vi.fn(() => false),
            };
            createdPopups.push(createdPopup);
            return createdPopup;
        });

        notesSvc.replaceActivePopupOwner = vi.fn((owner) => {
            const previousOwner = activeOwner;
            if (previousOwner === owner) {
                return undefined;
            }
            activeOwner = owner;
            return previousOwner as any;
        });

        notesSvc.clearActivePopupOwner = vi.fn((owner) => {
            if (activeOwner === owner) {
                activeOwner = undefined;
            }
        });

        notesSvc.getNoteAccess = vi.fn((params) => ({
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

describe('AgFullWidthRowNotesFeature', () => {
    let beans: BeanCollection;
    let context: { createBean: Mock; destroyBean: Mock };
    let popup: { hide: Mock; focusEditor: Mock; hasFocus: Mock };
    let guiListeners = new Map<HTMLElement, Record<string, (event: any) => void>>();
    let leftElement: HTMLElement;
    let centerElement: HTMLElement;
    let rowCtrl: any;
    let noteTrigger: 'hover' | 'click';
    let notesSvc: Pick<
        INotesFeatureSupport,
        'clearActivePopupOwner' | 'getNoteAccess' | 'getHoverGeneration' | 'replaceActivePopupOwner' | 'setNote'
    >;

    beforeEach(() => {
        noteTrigger = 'click';
        guiListeners = new Map();
        popup = {
            hide: vi.fn(),
            focusEditor: vi.fn(),
            hasFocus: vi.fn(() => false),
        };
        context = {
            createBean: vi.fn(() => popup),
            destroyBean: vi.fn(),
        };

        leftElement = document.createElement('div');
        centerElement = document.createElement('div');

        const makeCompBean = (element: HTMLElement) => ({
            addManagedListeners: vi.fn((_el: HTMLElement, listeners: Record<string, (event: any) => void>) => {
                guiListeners.set(element, listeners);
            }),
        });

        const leftCompBean = makeCompBean(leftElement);
        const centerCompBean = makeCompBean(centerElement);

        const leftTarget = {
            compBean: leftCompBean,
            element: leftElement,
            column: { getColId: () => 'athlete' },
            pinned: 'left' as const,
        };
        const centerTarget = {
            compBean: centerCompBean,
            element: centerElement,
            column: { getColId: () => 'sport' },
            pinned: null,
        };

        rowCtrl = {
            rowNode: { id: '1', rowIndex: 0, rowPinned: null },
            isFullWidth: vi.fn(() => true),
            getTargets: vi.fn(() => [leftTarget, centerTarget]),
            getTarget: vi.fn((element?: EventTarget | null) =>
                element === leftElement || leftElement.contains(element as Node) ? leftTarget : centerTarget
            ),
        };

        beans = {
            gos: {
                get: vi.fn((key: string) => {
                    switch (key) {
                        case 'noteTrigger':
                            return noteTrigger;
                        case 'noteShowDelay':
                            return 25;
                        case 'noteHideDelay':
                            return 40;
                        case 'allowContextMenuWithControlKey':
                            return false;
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
            getNoteAccess: vi.fn(
                (params) =>
                    ({
                        params,
                        rowNode: params.rowNode,
                        column: { getColId: () => ('column' in params ? params.column.getColId() : 'athlete') },
                        note: { text: `note-${'pinned' in params ? (params.pinned ?? 'center') : 'cell'}` },
                        isReadOnly: false,
                        isSuppressed: false,
                        canView: true,
                        canCreate: false,
                        canEdit: true,
                        canDelete: true,
                    }) as unknown as INoteAccess
            ),
            getHoverGeneration: vi.fn(() => 0),
            replaceActivePopupOwner: vi.fn(() => undefined),
            clearActivePopupOwner: vi.fn(),
            setNote: vi.fn(),
        };
    });

    it('opens full-width notes on left click when noteTrigger is click', () => {
        const feature = new AgFullWidthRowNotesFeature(beans, rowCtrl, notesSvc);
        feature.initialise();

        guiListeners
            .get(leftElement)
            ?.click?.({ button: 0, ctrlKey: false, target: leftElement } as unknown as MouseEvent);

        expect(context.createBean).toHaveBeenCalledTimes(1);
        expect(notesSvc.getNoteAccess).toHaveBeenCalledWith({
            rowNode: rowCtrl.rowNode,
            location: 'fullWidthRow',
            pinned: 'left',
        });
    });

    it('keeps embedded full-width sections independent in click mode', () => {
        const feature = new AgFullWidthRowNotesFeature(beans, rowCtrl, notesSvc);
        feature.initialise();

        guiListeners
            .get(leftElement)
            ?.click?.({ button: 0, ctrlKey: false, target: leftElement } as unknown as MouseEvent);
        guiListeners
            .get(centerElement)
            ?.click?.({ button: 0, ctrlKey: false, target: centerElement } as unknown as MouseEvent);

        expect(context.createBean).toHaveBeenCalledTimes(2);
        expect(notesSvc.getNoteAccess).toHaveBeenCalledWith({
            rowNode: rowCtrl.rowNode,
            location: 'fullWidthRow',
            pinned: 'left',
        });
        expect(notesSvc.getNoteAccess).toHaveBeenCalledWith({
            rowNode: rowCtrl.rowNode,
            location: 'fullWidthRow',
            pinned: undefined,
        });
    });

    it('does not open full-width notes on right click when noteTrigger is click', () => {
        const feature = new AgFullWidthRowNotesFeature(beans, rowCtrl, notesSvc);
        feature.initialise();

        guiListeners.get(leftElement)?.click?.({ button: 2, ctrlKey: false } as MouseEvent);

        expect(context.createBean).not.toHaveBeenCalled();
    });
});
