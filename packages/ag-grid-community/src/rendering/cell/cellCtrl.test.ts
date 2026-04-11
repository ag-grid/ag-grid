import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { CellCtrl } from './cellCtrl';

describe('CellCtrl', () => {
    const createCellCtrl = (params?: { editing?: boolean; formulaError?: boolean; cellValidationError?: boolean }) => {
        const { editing = false, formulaError = false, cellValidationError = false } = params ?? {};
        const ctrl = Object.create(CellCtrl.prototype) as CellCtrl;

        (ctrl as unknown as { column: AgColumn }).column = {} as AgColumn;
        (ctrl as unknown as { rowNode: RowNode }).rowNode = {} as RowNode;
        (ctrl as unknown as { editSvc: { isEditing: jest.Mock } }).editSvc = {
            isEditing: jest.fn(() => editing),
        };
        (ctrl as unknown as { beans: Partial<BeanCollection> }).beans = {
            formula: {
                getFormulaError: jest.fn(() => (formulaError ? { message: 'Formula error' } : null)),
            },
            editModelSvc: {
                getCellValidationModel: () => ({
                    hasCellValidation: jest.fn(() => cellValidationError),
                }),
            },
        };

        return ctrl;
    };

    it.each([
        ['editing', { editing: true }],
        ['formula errors', { formulaError: true }],
        ['cell validation errors', { cellValidationError: true }],
    ])('suppresses note hover when the cell has %s', (_reason, params) => {
        const ctrl = createCellCtrl(params);

        expect(ctrl.isCellNoteHoverSuppressed()).toBe(true);
    });

    it('does not suppress note hover when the cell is not editing and has no errors', () => {
        const ctrl = createCellCtrl();

        expect(ctrl.isCellNoteHoverSuppressed()).toBe(false);
    });

    describe('range refresh scheduling', () => {
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        const originalCancelAnimationFrame = window.cancelAnimationFrame;

        const createRangeRefreshCtrl = () => {
            const ctrl = Object.create(CellCtrl.prototype) as CellCtrl & {
                rangeHandleRefreshFrameId: number | null;
                scheduleRangeHandleRefresh: () => void;
                clearPendingRangeHandleRefresh: () => void;
                beans: Partial<BeanCollection>;
                rangeFeature: { refreshRangeStyleAndHandle: jest.Mock };
                isAlive: () => boolean;
                onCompAttachedFuncs: (() => void)[];
                onEditorAttachedFuncs: (() => void)[];
                cellPosition: any;
            };

            ctrl.beans = {
                eRootDiv: document.createElement('div'),
                gos: { get: jest.fn() } as any,
                focusSvc: {
                    isCellFocused: jest.fn(() => false),
                    attemptToRecoverFocus: jest.fn(),
                } as any,
            };
            ctrl.rangeFeature = {
                refreshRangeStyleAndHandle: jest.fn(),
            };
            ctrl.rangeHandleRefreshFrameId = null;
            ctrl.isAlive = () => !(ctrl as any).destroyed;
            ctrl.onCompAttachedFuncs = [];
            ctrl.onEditorAttachedFuncs = [];
            ctrl.cellPosition = {} as any;

            (ctrl as any).destroyFunctions = [];
            (ctrl as any).destroyed = false;

            return ctrl;
        };

        afterEach(() => {
            window.requestAnimationFrame = originalRequestAnimationFrame;
            window.cancelAnimationFrame = originalCancelAnimationFrame;
            jest.restoreAllMocks();
        });

        it('cancels the previous range refresh frame before scheduling another one', () => {
            const callbacks = new Map<number, FrameRequestCallback>();
            let nextFrameId = 0;

            window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
                const frameId = ++nextFrameId;
                callbacks.set(frameId, callback);
                return frameId;
            });
            window.cancelAnimationFrame = jest.fn((frameId: number) => {
                callbacks.delete(frameId);
            });

            const ctrl = createRangeRefreshCtrl();

            ctrl.scheduleRangeHandleRefresh();
            ctrl.scheduleRangeHandleRefresh();

            expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
            expect(callbacks.has(1)).toBe(false);
            expect(callbacks.has(2)).toBe(true);

            callbacks.get(2)?.(0);

            expect(ctrl.rangeFeature.refreshRangeStyleAndHandle).toHaveBeenCalledTimes(1);
            expect(ctrl.rangeHandleRefreshFrameId).toBeNull();
        });

        it('clears the pending range refresh frame without running it', () => {
            window.requestAnimationFrame = jest.fn(() => 7);
            window.cancelAnimationFrame = jest.fn();

            const ctrl = createRangeRefreshCtrl();

            ctrl.scheduleRangeHandleRefresh();
            ctrl.clearPendingRangeHandleRefresh();

            expect(window.cancelAnimationFrame).toHaveBeenCalledWith(7);
            expect(ctrl.rangeFeature.refreshRangeStyleAndHandle).not.toHaveBeenCalled();
            expect(ctrl.rangeHandleRefreshFrameId).toBeNull();
        });

        it('clears the pending range refresh frame when the cell is destroyed', () => {
            const callbacks = new Map<number, FrameRequestCallback>();
            let nextFrameId = 0;

            window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
                const frameId = ++nextFrameId;
                callbacks.set(frameId, callback);
                return frameId;
            });
            window.cancelAnimationFrame = jest.fn((frameId: number) => {
                callbacks.delete(frameId);
            });

            const ctrl = createRangeRefreshCtrl();

            ctrl.scheduleRangeHandleRefresh();
            const queuedCallback = callbacks.get(1);

            ctrl.destroy();

            expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
            expect(callbacks.has(1)).toBe(false);
            expect(ctrl.rangeFeature.refreshRangeStyleAndHandle).not.toHaveBeenCalled();

            queuedCallback?.(0);

            expect(ctrl.rangeFeature.refreshRangeStyleAndHandle).not.toHaveBeenCalled();
            expect(ctrl.rangeHandleRefreshFrameId).toBeNull();
        });
    });
});
