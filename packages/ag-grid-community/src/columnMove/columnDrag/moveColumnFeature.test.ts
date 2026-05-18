import type { GridDraggingEvent } from '../../dragAndDrop/dragAndDropService';
import type { GridOptionsService } from '../../gridOptionsService';
import { MoveColumnFeature } from './moveColumnFeature';

function createFeature(pinned: 'left' | 'right' | null, rtl = false) {
    const feature = new MoveColumnFeature(pinned) as any;
    const eViewport = document.createElement('div');
    Object.defineProperty(eViewport, 'clientWidth', {
        configurable: true,
        get: () => 1000,
    });
    const eHeaderRow = document.createElement('div');
    eHeaderRow.classList.add('ag-header-row');
    Object.defineProperty(eHeaderRow, 'clientWidth', {
        configurable: true,
        get: () => 1000,
    });
    eViewport.appendChild(eHeaderRow);

    // Section sub-containers inside the header row
    // Physical layout: viewport starts at x=100, width=1000
    // Pinned-left is always physically left and pinned-right is always physically right.
    // Both LTR and RTL: [pinnedLeft:100..150][scrolling:150..1050][pinnedRight:1050..1100]
    const pinnedLeftCells = document.createElement('div');
    pinnedLeftCells.classList.add('ag-grid-pinned-left-cells');
    const scrollingCells = document.createElement('div');
    scrollingCells.classList.add('ag-grid-scrolling-cells');
    const pinnedRightCells = document.createElement('div');
    pinnedRightCells.classList.add('ag-grid-pinned-right-cells');
    eHeaderRow.append(pinnedLeftCells, scrollingCells, pinnedRightCells);

    pinnedLeftCells.getBoundingClientRect = () => ({ left: 100, width: 50 }) as DOMRect;
    scrollingCells.getBoundingClientRect = () => ({ left: 150, width: 900 }) as DOMRect;
    pinnedRightCells.getBoundingClientRect = () => ({ left: 1050, width: 50 }) as DOMRect;

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
                    return rtl;
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
    feature.checkCenterForScrolling = vi.fn();
    feature.handleColumnDragWhileSuppressingMovement = vi.fn();
    feature.handleColumnDragWhileAllowingMovement = vi.fn();
    feature.lastDraggingEvent = null;

    return feature;
}

describe('MoveColumnFeature', () => {
    test('passes dragging event to center auto-scroll checks', () => {
        const feature = createFeature(null);

        const draggingEvent = {
            x: 777,
            y: 0,
            hDirection: 'right',
            vDirection: null,
            dragItem: { columns: [] },
            event: { clientX: 877 },
        } as unknown as GridDraggingEvent;

        feature.onDragging(draggingEvent, false, false, false);

        // sectionX = clientX(877) - scrollingCells.rect.left(150) = 727
        expect(feature.checkCenterForScrolling).toHaveBeenCalledWith(draggingEvent);
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
            x: 500,
            y: 0,
            hDirection: 'right',
            vDirection: null,
            dragItem: { columns: [] },
            event: { clientX: 130 },
        } as unknown as GridDraggingEvent;

        feature.onDragging(draggingEvent, false, false, false);

        // sectionX = clientX(130) - pinnedLeftCells.rect.left(100) = 30
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
            event: { clientX: 1080 },
        } as unknown as GridDraggingEvent;

        feature.onDragging(draggingEvent, false, false, false);

        // sectionX = clientX(1080) - pinnedRightCells.rect.left(1050) = 30
        expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
            draggingEvent,
            false,
            false,
            30,
            false
        );
    });

    describe('RTL mode', () => {
        test('rtl center sectionX flips within scrolling section width', () => {
            const feature = createFeature(null, true);

            const draggingEvent = {
                x: 777,
                y: 0,
                hDirection: 'left',
                vDirection: null,
                dragItem: { columns: [] },
                event: { clientX: 877 },
            } as unknown as GridDraggingEvent;

            feature.onDragging(draggingEvent, false, false, false);

            // sectionX = clientX(877) - scrollingCells.rect.left(150) = 727
            // normaliseX flips within section: scrollingCells.width(900) - 727 = 173
            expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
                draggingEvent,
                false,
                false,
                173,
                false
            );
        });

        test('rtl pinned-left sectionX flips within pinned-left section width', () => {
            const feature = createFeature('left', true);

            const draggingEvent = {
                x: 500,
                y: 0,
                hDirection: 'left',
                vDirection: null,
                dragItem: { columns: [] },
                event: { clientX: 130 },
            } as unknown as GridDraggingEvent;

            feature.onDragging(draggingEvent, false, false, false);

            // sectionX = clientX(130) - pinnedLeftCells.rect.left(100) = 30
            // normaliseX does NOT flip for pinned-left in RTL mode
            expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
                draggingEvent,
                false,
                false,
                30,
                false
            );
        });

        test('rtl pinned-right sectionX flips within pinned-right section width', () => {
            const feature = createFeature('right', true);

            const draggingEvent = {
                x: 500,
                y: 0,
                hDirection: 'right',
                vDirection: null,
                dragItem: { columns: [] },
                event: { clientX: 1080 },
            } as unknown as GridDraggingEvent;

            feature.onDragging(draggingEvent, false, false, false);

            // sectionX = clientX(1080) - pinnedRightCells.rect.left(1050) = 30
            // normaliseX flips within section: pinnedRightCells.width(50) - 30 = 20
            expect(feature.handleColumnDragWhileSuppressingMovement).toHaveBeenCalledWith(
                draggingEvent,
                false,
                false,
                20,
                false
            );
        });
    });
});
