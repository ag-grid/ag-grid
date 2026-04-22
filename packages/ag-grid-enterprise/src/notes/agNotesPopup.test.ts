import { buildEditedNote, findNotesPopupPosition, getNotesPopupPlacements } from './agNotesPopup';

describe('AgNotesPopup positioning', () => {
    const popupSize = { width: 320, height: 220 };
    const parentRect = { top: 0, left: 0, right: 800, bottom: 600 };

    it('uses the expected placement order for normal cells', () => {
        expect(getNotesPopupPlacements('cell')).toEqual(['tl-tr', 'tr-br', 'br-tr', 'tr-tl', 'br-tl']);
    });

    it('mirrors the horizontal placements in RTL', () => {
        expect(getNotesPopupPlacements('cell', true)).toEqual(['tr-tl', 'tl-bl', 'bl-tl', 'tl-tr', 'bl-tr']);
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
        ).toEqual({ x: 200, y: 99 });
    });

    it('falls back below before trying placements on the left', () => {
        const anchorRect = { top: 100, left: 450, right: 550, bottom: 140 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 230, y: 140 });
    });

    it('falls back above before trying placements on the left', () => {
        const anchorRect = { top: 500, left: 100, right: 200, bottom: 540 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 0, y: 280 });
    });

    it('falls back to the left after below and above fail', () => {
        const constrainedParentRect = { top: 0, left: 0, right: 800, bottom: 250 };
        const anchorRect = { top: 180, left: 700, right: 800, bottom: 220 };

        expect(
            findNotesPopupPosition({
                anchorRect,
                parentRect: constrainedParentRect,
                popupSize,
                placementMode: 'cell',
                enableRtl: false,
            })
        ).toEqual({ x: 380, y: 30 });
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

describe('buildEditedNote', () => {
    it('preserves custom metadata when note text is edited', () => {
        expect(
            buildEditedNote(
                {
                    text: 'Existing text',
                    author: 'AG Grid',
                    metadata: {
                        type: 'team',
                        priority: 'high',
                    },
                },
                '  Updated text  '
            )
        ).toEqual({
            text: 'Updated text',
            author: 'AG Grid',
            metadata: {
                type: 'team',
                priority: 'high',
            },
        });
    });
});
