import type { GridDraggingEvent } from '../../dragAndDrop/dragAndDropService';
import type { GridOptionsService } from '../../gridOptionsService';
import { MoveColumnFeature } from './moveColumnFeature';

describe('MoveColumnFeature', () => {
    test('uses raw drag x for center auto-scroll checks', () => {
        const feature = new MoveColumnFeature(null) as any;
        const eViewport = document.createElement('div');
        Object.defineProperty(eViewport, 'clientWidth', {
            configurable: true,
            get: () => 1000,
        });

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

        feature.checkCenterForScrolling = jest.fn();
        feature.handleColumnDragWhileSuppressingMovement = jest.fn();
        feature.handleColumnDragWhileAllowingMovement = jest.fn();
        feature.lastDraggingEvent = null;

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
});
