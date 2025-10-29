import type { BeanCollection } from '../context/context';
import type { GridOptionsService } from '../gridOptionsService';
import { _isDomLayout } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _getCellCtrlForEventTarget } from '../rendering/renderUtils';

export function _getCellPositionForEvent(
    gos: GridOptionsService,
    event: MouseEvent | KeyboardEvent | Touch
): CellPosition | null {
    return _getCellCtrlForEventTarget(gos, event.target)?.getFocusedCellPosition() ?? null;
}

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
