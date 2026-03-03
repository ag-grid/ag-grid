import type { VisibleColsService } from '../columns/visibleColsService';
import type { CtrlsService } from '../ctrlsService';
import type { GridOptionsService } from '../gridOptionsService';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import { normaliseX } from './internalColumnMoveUtils';

describe('internalColumnMoveUtils.normaliseX', () => {
    function createHeaderViewport({ left = 0, width = 500 }: { left?: number; width?: number }) {
        const viewport = document.createElement('div');
        Object.defineProperty(viewport, 'clientWidth', { configurable: true, get: () => width });
        viewport.getBoundingClientRect = () =>
            ({
                left,
                top: 0,
                right: left + width,
                bottom: 100,
                width,
                height: 100,
                x: left,
                y: 0,
                toJSON: () => ({}),
            }) as DOMRect;
        return viewport;
    }

    function createCtrlsSvc(scrollLeft: number, viewport: HTMLElement): CtrlsService {
        return {
            getHeaderRowContainerCtrl: () => ({ eViewport: viewport }),
            get: (key: string) => {
                if (key === 'scrollingCenter') {
                    return {
                        getCenterViewportScrollLeft: () => scrollLeft,
                    };
                }
                return undefined;
            },
        } as unknown as CtrlsService;
    }

    function createGos(enableRtl = false): GridOptionsService {
        return {
            get: (key: string) => (key === 'enableRtl' ? enableRtl : undefined),
        } as unknown as GridOptionsService;
    }

    function createVisibleCols(leftPinnedWidth: number, rightPinnedWidth: number): VisibleColsService {
        return {
            getLeftStickyColumnContainerWidth: () => leftPinnedWidth,
            getRightStickyColumnContainerWidth: () => rightPinnedWidth,
        } as unknown as VisibleColsService;
    }

    test('does not add center scroll padding for mouse-derived coordinates', () => {
        const viewport = createHeaderViewport({ left: 10, width: 500 });
        const result = normaliseX({
            x: 250,
            pinned: null,
            gos: createGos(false),
            ctrlsSvc: createCtrlsSvc(120, viewport),
        });

        expect(result).toBe(250);
    });

    test('adds center scroll padding for keyboard-derived coordinates', () => {
        const viewport = createHeaderViewport({ left: 10, width: 500 });
        const visibleCols = createVisibleCols(30, 40);

        const result = normaliseX({
            x: 250,
            pinned: null,
            fromKeyboard: true,
            gos: createGos(false),
            ctrlsSvc: createCtrlsSvc(120, viewport),
            visibleCols,
        });

        // 250 - viewportLeft(10) - leftPinnedOffset(30) + scrollLeft(120)
        expect(result).toBe(330);
    });

    test('does not add center scroll padding for pinned sections', () => {
        const viewport = createHeaderViewport({ left: 10, width: 500 });
        const visibleCols = createVisibleCols(30, 40);

        const pinned: ColumnPinnedType = 'left';
        const result = normaliseX({
            x: 250,
            pinned,
            fromKeyboard: true,
            gos: createGos(false),
            ctrlsSvc: createCtrlsSvc(120, viewport),
            visibleCols,
        });

        // 250 - viewportLeft(10) - pinnedLeftOffset(0)
        expect(result).toBe(240);
    });
});
