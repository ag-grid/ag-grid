import type { BeanCollection } from '../context/context';
import type { GridOptionsService } from '../gridOptionsService';
import { _isDomLayout } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _getCellCtrlForEventTarget } from '../rendering/renderUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getCellPositionForEvent(
    gos: GridOptionsService,
    event: MouseEvent | KeyboardEvent | Touch
): CellPosition | null {
    return _getCellCtrlForEventTarget(gos, event.target)?.getFocusedCellPosition() ?? null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getNormalisedMousePosition(
    beans: BeanCollection,
    event: MouseEvent | { x: number; y: number }
): { x: number; y: number } {
    const gridPanelHasScrolls = _isDomLayout(beans.gos, 'normal');
    const e = event as MouseEvent;
    let x: number;
    let y: number;

    if (e.clientX != null || e.clientY != null) {
        x = e.clientX;
        y = e.clientY;
    } else {
        x = e.x;
        y = e.y;
        y -= getRowAreaTopOffset(beans, event);
    }

    const { pageFirstPixel } = beans.pageBounds.getCurrentPagePixelRange();
    y += pageFirstPixel;

    if (gridPanelHasScrolls) {
        const scrollFeature = beans.ctrlsSvc.getScrollFeature();
        const vRange = scrollFeature.getVScrollPosition();
        const hRange = scrollFeature.getHScrollPosition();
        x += hRange.left;
        y += vRange.top;
    }

    return { x, y };
}

function getRowAreaTopOffset(beans: BeanCollection, event: MouseEvent | { x: number; y: number }): number {
    const { eGridViewport, eScrollingRows } = beans.ctrlsSvc.getGridBodyCtrl();

    const eventWithDropZone = event as { dropZoneTarget?: EventTarget | null };
    const eViewport = (eventWithDropZone.dropZoneTarget ?? eGridViewport) as HTMLElement;

    if (!eScrollingRows) {
        return 0;
    }

    const visibleOffset = eScrollingRows.getBoundingClientRect().top - eViewport.getBoundingClientRect().top;
    // `event.y` is viewport-relative. Convert the measured visible offset into
    // the scroll-content offset so it remains stable while scrolling.
    const offset = visibleOffset + eGridViewport.scrollTop;
    return offset > 0 ? offset : 0;
}
