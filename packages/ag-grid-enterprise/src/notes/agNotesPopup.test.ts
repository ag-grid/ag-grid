import { findNotesPopupPosition, getNotesPopupPlacements } from './agNotesPopup';

describe('AgNotesPopup positioning', () => {
    const popupSize = { width: 320, height: 220 };
    const parentRect = { top: 0, left: 0, right: 800, bottom: 600 };

    it('uses the expected placement order for normal cells', () => {
        expect(getNotesPopupPlacements('cell')).toEqual(['tl-tr', 'bl-tr', 'tr-tl', 'br-tl', 'tr-br', 'br-tr']);
    });

    it('mirrors the horizontal placements in RTL', () => {
        expect(getNotesPopupPlacements('cell', true)).toEqual(['tr-tl', 'br-tl', 'tl-tr', 'bl-tr', 'tl-bl', 'bl-tl']);
    });

    it('opens flush to the right edge of a normal cell when there is room', () => {
        const anchorRect = { top: 100, left: 100, right: 200, bottom: 140 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 200, y: 100 });
    });

    it('falls back to right-above for a normal cell near the bottom edge', () => {
        const anchorRect = { top: 500, left: 100, right: 200, bottom: 540 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 200, y: 280 });
    });

    it('falls back to left-top when there is no room to the right', () => {
        const anchorRect = { top: 100, left: 700, right: 800, bottom: 140 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 380, y: 100 });
    });

    it('falls back below and right-aligned when the parent is too narrow for side placement', () => {
        const anchorRect = { top: 100, left: 50, right: 750, bottom: 140 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 430, y: 140 });
    });

    it('falls back above and right-aligned when the parent is narrow and the cell is near the bottom', () => {
        const anchorRect = { top: 500, left: 50, right: 750, bottom: 540 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 430, y: 280 });
    });

    it('never centres a full-width row note when falling below', () => {
        const anchorRect = { top: 100, left: 0, right: 800, bottom: 196 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'fullWidthRow',
                enableRtl: false,
            })
        ).toEqual({ x: 480, y: 196 });
    });

    it('never centres a full-width row note when falling above', () => {
        const anchorRect = { top: 500, left: 0, right: 800, bottom: 596 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'fullWidthRow',
                enableRtl: false,
            })
        ).toEqual({ x: 480, y: 280 });
    });
});
