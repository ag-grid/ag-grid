import type { GridDraggingEvent } from '../../dragAndDrop/dragAndDropService';
import type { GridOptionsService } from '../../gridOptionsService';
import { MoveColumnFeature } from './moveColumnFeature';

describe('MoveColumnFeature', () => {
    function createFeature(pinned: 'left' | 'right' | null) {
        const feature = new MoveColumnFeature(pinned) as any;
        const eViewport = document.createElement('div');
        Object.defineProperty(eViewport, 'clientWidth', {
            configurable: true,
            get: () => 1000,
        });

        const eGridViewport = document.createElement('div');
        eGridViewport.getBoundingClientRect = () =>
            ({ left: 100, top: 0, width: 1000, height: 600, right: 1100, bottom: 600 }) as DOMRect;

        feature.beans = {
            gos: {
                get: (key: string) => {
                    if (key === 'suppressMoveWhenColumnDragging') {
                        return true;
                    }
                    if (key === 'enableRtl') {
                        return false;
                    }
                    return undefined;
                },
            } as GridOptionsService,
            ctrlsSvc: {
                getHeaderRowContainerCtrl: () => ({ eViewport }),
                get: () => ({
                    getCenterViewportScrollLeft: () => 0,
                }),
            },
            visibleCols: {
                getLeftStickyColumnContainerWidth: () => 50,
                getRightStickyColumnContainerWidth: () => 50,
            },
        };

        feature.gridBodyCon = { eGridViewport };
        feature.checkCenterForScrolling = jest.fn();
        feature.handleColumnDragWhileSuppressingMovement = jest.fn();
        feature.handleColumnDragWhileAllowingMovement = jest.fn();
        feature.lastDraggingEvent = null;

        return feature;
    }

    test('uses raw drag x for center auto-scroll checks', () => {
        const feature = createFeature(null);

        const draggingEvent = {
            x: 777,
            y: 0,
            hDirection: 'right',
            vDirection: null,
            dragItem: { columns: [] },
        } as unknown as GridDraggingEvent;

        feature.onDragging(draggingEvent, false, false, false);

        expect(feature.checkCenterForScrolling).toHaveBeenCalledWith(777);
        expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
            draggingEvent,
            false,
            false,
            727,
            false
        );
    });

    test('pinned-left sectionX uses viewport-relative coordinates', () => {
        const feature = createFeature('left');

        const draggingEvent = {
            x: 500, // content-relative (includes scroll offset) — should be ignored for pinned
            y: 0,
            hDirection: 'right',
            vDirection: null,
            dragItem: { columns: [] },
            event: { clientX: 130 }, // viewport left is 100, so viewport-relative = 30
        } as unknown as GridDraggingEvent;

        feature.onDragging(draggingEvent, false, false, false);

        // sectionX = clientX(130) - viewportRect.left(100) = 30
        expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
            draggingEvent,
            false,
            false,
            30,
            false
        );
    });

    test('pinned-right sectionX subtracts left offset to right section', () => {
        const feature = createFeature('right');

        const draggingEvent = {
            x: 500,
            y: 0,
            hDirection: 'left',
            vDirection: null,
            dragItem: { columns: [] },
            event: { clientX: 1080 }, // viewport left=100, width=1000, rightPinned=50
        } as unknown as GridDraggingEvent;

        feature.onDragging(draggingEvent, false, false, false);

        // sectionX = clientX(1080) - viewportRect.left(100) - max(0, 1000 - 50)
        //          = 980 - 950 = 30
        expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
            draggingEvent,
            false,
            false,
            30,
            false
        );
    });
});
