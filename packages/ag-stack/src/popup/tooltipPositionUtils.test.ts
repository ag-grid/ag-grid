import { findBestPlacement } from './popupPositionUtils';
import type { TooltipPosition } from './tooltipPositionUtils';
import { findTooltipPosition } from './tooltipPositionUtils';

describe('tooltip placement', () => {
    const reference = { top: 200, left: 200, right: 300, bottom: 280 };
    const size = { width: 80, height: 40 };
    const bounds = { width: 600, height: 600 };
    const options = { gap: 6, enableRtl: false, arrowPadding: 8 };

    test.each<[TooltipPosition, number, number]>([
        ['top', 210, 154],
        ['top-start', 200, 154],
        ['top-end', 220, 154],
        ['bottom', 210, 286],
        ['bottom-start', 200, 286],
        ['bottom-end', 220, 286],
        ['left', 114, 220],
        ['left-start', 114, 200],
        ['left-end', 114, 240],
        ['right', 306, 220],
        ['right-start', 306, 200],
        ['right-end', 306, 240],
    ])('aligns %s', (position, x, y) => {
        expect(findTooltipPosition(reference, size, bounds, { ...options, position })).toMatchObject({
            x,
            y,
            position,
        });
    });

    test.each<[TooltipPosition, TooltipPosition, typeof reference]>([
        ['top-start', 'bottom-start', { top: 0, left: 200, right: 300, bottom: 80 }],
        ['bottom-end', 'top-end', { top: 520, left: 200, right: 300, bottom: 600 }],
        ['left', 'right', { top: 200, left: 0, right: 100, bottom: 280 }],
        ['right', 'left', { top: 200, left: 500, right: 600, bottom: 280 }],
    ])('flips %s to %s', (position, opposite, rect) => {
        expect(findTooltipPosition(rect, size, bounds, { ...options, position }).position).toBe(opposite);
    });

    test('flips above a pointer instead of clamping over it', () => {
        const pointer = { top: 590, bottom: 590, left: 250, right: 250 };
        expect(findTooltipPosition(pointer, size, bounds, { ...options, position: 'bottom-start' })).toMatchObject({
            position: 'top-start',
            x: 250,
            y: 544,
        });
    });

    test('shifts along the side and updates the arrow offset', () => {
        const edge = { top: 200, bottom: 280, left: 0, right: 50 };
        expect(findTooltipPosition(edge, size, bounds, { ...options, position: 'top-end' })).toEqual({
            position: 'top-end',
            x: 0,
            y: 154,
            arrowOffset: 38,
        });
    });

    test('uses the side with more room when neither side fits', () => {
        const rect = { top: 30, bottom: 40, left: 50, right: 100 };
        expect(
            findTooltipPosition(
                rect,
                { width: 80, height: 70 },
                { width: 200, height: 100 },
                {
                    ...options,
                    position: 'top-start',
                }
            ).position
        ).toBe('bottom-start');
    });

    test.each([20, 90])("uses each placement's dimensions when the opposite height is %s", (height) => {
        const measure = vi.fn((position: TooltipPosition) => ({
            width: position === 'top-end' ? 80 : 120,
            height: position === 'top-end' ? 40 : height,
        }));
        const result = findTooltipPosition(
            { top: 30, bottom: 40, left: 100, right: 150 },
            measure,
            { width: 200, height: 100 },
            { ...options, position: 'top-end' }
        );
        expect(result).toMatchObject(
            height === 20
                ? { position: 'bottom-end', x: 30, y: 46, arrowOffset: 108 }
                : { position: 'top-end', x: 70, y: 0, arrowOffset: 68 }
        );
        expect(measure).toHaveBeenCalledTimes(2);
    });

    test('preserves the gap rather than squeezing it to keep the preferred side', () => {
        const rect = { top: 60, bottom: 80, left: 50, right: 100 };
        expect(
            findTooltipPosition(
                rect,
                { width: 80, height: 20 },
                { width: 200, height: 100 },
                {
                    ...options,
                    position: 'bottom-start',
                }
            ).position
        ).toBe('top-start');
    });

    test('mirrors start/end horizontally in RTL, without changing physical left/right', () => {
        expect(
            findTooltipPosition(reference, size, bounds, { ...options, position: 'top-start', enableRtl: true })
        ).toEqual({
            x: 220,
            y: 154,
            position: 'top-start',
            arrowOffset: 68,
        });
        expect(
            findTooltipPosition(reference, size, bounds, { ...options, position: 'left-start', enableRtl: true })
        ).toEqual({
            x: 114,
            y: 200,
            position: 'left-start',
            arrowOffset: 12,
        });
    });

    test('centres the arrow on small targets and keeps it clear of corners after shifting', () => {
        const small = { top: 200, bottom: 220, left: 200, right: 210 };
        expect(findTooltipPosition(small, size, bounds, { ...options, position: 'top-start' }).arrowOffset).toBe(8);
        expect(findTooltipPosition(small, size, bounds, { ...options, position: 'top' }).arrowOffset).toBe(40);
    });

    test('defaults to the first placement when no placement fits', () => {
        expect(
            findBestPlacement(
                { top: 10, left: 10, right: 90, bottom: 90 },
                { width: 320, height: 220 },
                { width: 100, height: 100 },
                ['tl-tr', 'tr-tl'],
                0
            )
        ).toEqual({
            x: 0,
            y: 0,
            alignment: 'tl-tr',
        });
    });
});
