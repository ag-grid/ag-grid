import type { CtrlsService } from '../ctrlsService';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import { clientXToSectionX, normaliseX } from './internalColumnMoveUtils';

function createSectionElements(layout: { left: number; pinnedLeftWidth: number; scrollingWidth: number }) {
    const { left, pinnedLeftWidth, scrollingWidth } = layout;

    const viewport = document.createElement('div');
    const headerRow = document.createElement('div');
    headerRow.classList.add('ag-header-row');

    const pinnedLeft = document.createElement('div');
    pinnedLeft.classList.add('ag-grid-pinned-left-cells');
    pinnedLeft.getBoundingClientRect = () => ({ left, width: pinnedLeftWidth }) as DOMRect;

    const scrolling = document.createElement('div');
    scrolling.classList.add('ag-grid-scrolling-cells');
    scrolling.getBoundingClientRect = () => ({ left: left + pinnedLeftWidth, width: scrollingWidth }) as DOMRect;

    const pinnedRight = document.createElement('div');
    pinnedRight.classList.add('ag-grid-pinned-right-cells');
    const pinnedRightLeft = left + pinnedLeftWidth + scrollingWidth;
    pinnedRight.getBoundingClientRect = () => ({ left: pinnedRightLeft, width: 50 }) as DOMRect;

    headerRow.append(pinnedLeft, scrolling, pinnedRight);
    viewport.appendChild(headerRow);

    const totalWidth = pinnedLeftWidth + scrollingWidth + 50;
    Object.defineProperty(headerRow, 'clientWidth', { configurable: true, get: () => totalWidth });
    Object.defineProperty(viewport, 'clientWidth', { configurable: true, get: () => totalWidth });

    return viewport;
}

function createCtrlsSvc(viewport: HTMLElement): CtrlsService {
    return {
        getHeaderRowContainerCtrl: () => ({ eViewport: viewport }),
    } as CtrlsService;
}

describe('normaliseX', () => {
    test('returns x unchanged in LTR mode', () => {
        const viewport = createSectionElements({ left: 100, pinnedLeftWidth: 50, scrollingWidth: 900 });
        const result = normaliseX({
            x: 250,
            isRtl: false,
            ctrlsSvc: createCtrlsSvc(viewport),
        });

        expect(result).toBe(250);
    });
});

describe('clientXToSectionX', () => {
    test('center section uses scrolling element left offset', () => {
        const viewport = createSectionElements({ left: 100, pinnedLeftWidth: 50, scrollingWidth: 900 });

        const result = clientXToSectionX(400, null, createCtrlsSvc(viewport));

        // 400 - scrollingCells.left(150) = 250
        expect(result).toBe(250);
    });

    test('pinned-left section uses pinned-left element left offset', () => {
        const viewport = createSectionElements({ left: 100, pinnedLeftWidth: 50, scrollingWidth: 900 });

        const pinned: ColumnPinnedType = 'left';
        const result = clientXToSectionX(130, pinned, createCtrlsSvc(viewport));

        // 130 - pinnedLeftCells.left(100) = 30
        expect(result).toBe(30);
    });

    test('pinned-right section uses pinned-right element left offset', () => {
        const viewport = createSectionElements({ left: 100, pinnedLeftWidth: 50, scrollingWidth: 900 });

        const pinned: ColumnPinnedType = 'right';
        const result = clientXToSectionX(1080, pinned, createCtrlsSvc(viewport));

        // 1080 - pinnedRightCells.left(1050) = 30
        expect(result).toBe(30);
    });

    test('returns raw clientX when section element is not found', () => {
        const viewport = document.createElement('div');
        // No header row or section elements

        const result = clientXToSectionX(500, null, createCtrlsSvc(viewport));

        expect(result).toBe(500);
    });
});
