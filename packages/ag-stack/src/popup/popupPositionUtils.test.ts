import type { Alignment } from './popupPositionUtils';
import {
    computeAlignedPosition,
    findBestPlacement,
    getEffectivePlacements,
    toRelativeRect,
} from './popupPositionUtils';

describe('popupPositionUtils', () => {
    describe('toRelativeRect', () => {
        it('converts absolute rect to parent-relative coordinates', () => {
            const rect = { top: 150, left: 200, right: 400, bottom: 250 };
            const parentRect = { top: 100, left: 50 };

            expect(toRelativeRect(rect, parentRect)).toEqual({
                top: 50,
                left: 150,
                right: 350,
                bottom: 150,
            });
        });

        it('handles zero-offset parent', () => {
            const rect = { top: 10, left: 20, right: 120, bottom: 60 };
            const parentRect = { top: 0, left: 0 };

            expect(toRelativeRect(rect, parentRect)).toEqual(rect);
        });
    });

    describe('computeAlignedPosition', () => {
        // Reference rect: a 100x50 cell at (200, 100)
        const ref = { top: 100, left: 200, right: 300, bottom: 150 };
        // Target popup: 320x220
        const target = { width: 320, height: 220 };

        describe('all 9 anchor combinations with matching anchors (overlay)', () => {
            it.each([
                ['tl-tl', { x: 200, y: 100 }],
                ['tc-tc', { x: 90, y: 100 }],
                ['tr-tr', { x: -20, y: 100 }],
                ['l-l', { x: 200, y: 15 }],
                ['c-c', { x: 90, y: 15 }],
                ['r-r', { x: -20, y: 15 }],
                ['bl-bl', { x: 200, y: -70 }],
                ['bc-bc', { x: 90, y: -70 }],
                ['br-br', { x: -20, y: -70 }],
            ] as [Alignment, { x: number; y: number }][])(
                '%s aligns target anchor to same reference anchor',
                (alignment, expected) => {
                    const result = computeAlignedPosition(ref, target, alignment);
                    expect(result.x).toBeCloseTo(expected.x, 5);
                    expect(result.y).toBeCloseTo(expected.y, 5);
                }
            );
        });

        describe('common placement patterns', () => {
            it('tl-tr places target to the right of reference', () => {
                const pos = computeAlignedPosition(ref, target, 'tl-tr');
                // Target top-left at reference top-right
                expect(pos).toEqual({ x: 300, y: 100 });
            });

            it('tr-tl places target to the left of reference', () => {
                const pos = computeAlignedPosition(ref, target, 'tr-tl');
                // Target top-right at reference top-left
                expect(pos).toEqual({ x: -120, y: 100 });
            });

            it('tl-bl places target below reference', () => {
                const pos = computeAlignedPosition(ref, target, 'tl-bl');
                // Target top-left at reference bottom-left
                expect(pos).toEqual({ x: 200, y: 150 });
            });

            it('bl-tl places target above reference', () => {
                const pos = computeAlignedPosition(ref, target, 'bl-tl');
                // Target bottom-left at reference top-left
                expect(pos).toEqual({ x: 200, y: -120 });
            });

            it('tc-bc places target below, centred horizontally', () => {
                const pos = computeAlignedPosition(ref, target, 'tc-bc');
                // Target top-centre at reference bottom-centre
                // ref bc.x = 250, target tc offset.x = 160
                expect(pos).toEqual({ x: 90, y: 150 });
            });

            it('bc-tc places target above, centred horizontally', () => {
                const pos = computeAlignedPosition(ref, target, 'bc-tc');
                // ref tc.x = 250, target bc offset.x = 160
                expect(pos).toEqual({ x: 90, y: -120 });
            });
        });

        describe('gap', () => {
            it('pushes target right for tl-tr', () => {
                const withoutGap = computeAlignedPosition(ref, target, 'tl-tr');
                const withGap = computeAlignedPosition(ref, target, 'tl-tr', 10);
                expect(withGap.x).toBe(withoutGap.x + 10);
                expect(withGap.y).toBe(withoutGap.y); // no vertical gap (both top)
            });

            it('pushes target left for tr-tl', () => {
                const withoutGap = computeAlignedPosition(ref, target, 'tr-tl');
                const withGap = computeAlignedPosition(ref, target, 'tr-tl', 10);
                expect(withGap.x).toBe(withoutGap.x - 10);
                expect(withGap.y).toBe(withoutGap.y);
            });

            it('pushes target down for tl-bl', () => {
                const withoutGap = computeAlignedPosition(ref, target, 'tl-bl');
                const withGap = computeAlignedPosition(ref, target, 'tl-bl', 10);
                expect(withGap.x).toBe(withoutGap.x);
                expect(withGap.y).toBe(withoutGap.y + 10);
            });

            it('pushes target up for bl-tl', () => {
                const withoutGap = computeAlignedPosition(ref, target, 'bl-tl');
                const withGap = computeAlignedPosition(ref, target, 'bl-tl', 10);
                expect(withGap.x).toBe(withoutGap.x);
                expect(withGap.y).toBe(withoutGap.y - 10);
            });

            it('pushes diagonally for tl-br', () => {
                const withoutGap = computeAlignedPosition(ref, target, 'tl-br');
                const withGap = computeAlignedPosition(ref, target, 'tl-br', 10);
                expect(withGap.x).toBe(withoutGap.x + 10);
                expect(withGap.y).toBe(withoutGap.y + 10);
            });

            it('applies no gap when anchors are identical', () => {
                const withoutGap = computeAlignedPosition(ref, target, 'tl-tl');
                const withGap = computeAlignedPosition(ref, target, 'tl-tl', 10);
                expect(withGap).toEqual(withoutGap);
            });
        });

        describe('zero-size target', () => {
            it('positions a zero-size target at the anchor point', () => {
                const pos = computeAlignedPosition(ref, { width: 0, height: 0 }, 'tl-br');
                expect(pos).toEqual({ x: 300, y: 150 });
            });
        });
    });

    describe('findBestPlacement', () => {
        // Cell at the right edge of a 800x600 parent
        const parentSize = { width: 800, height: 600 };
        const targetSize = { width: 320, height: 220 };

        it('picks the first placement that fits without overlap', () => {
            // Cell in the middle — plenty of room to the right
            const cellRect = { top: 200, left: 300, right: 400, bottom: 240 };

            const pos = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr', 'tr-tl'], 10);
            // tl-tr should work: x = 400 + 10 = 410, fits within 800
            expect(pos.x).toBe(410);
        });

        it('falls back to second placement when first would overlap after clamping', () => {
            // Cell near the right edge — no room to the right
            const cellRect = { top: 200, left: 600, right: 700, bottom: 240 };

            const pos = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr', 'tr-tl'], 10);
            // tl-tr: x = 710, clamped to 480 (800-320), overlaps cell (480 < 700)
            // tr-tl: x = 600 - 320 - 10 = 270, no overlap (270 + 320 = 590 < 600)
            expect(pos.x).toBe(270);
        });

        it('tries vertical placements when horizontal ones all overlap', () => {
            // Cell spanning nearly full width — no room left or right
            const cellRect = { top: 100, left: 50, right: 750, bottom: 140 };

            const pos = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr', 'tr-tl', 'tc-bc', 'bc-tc'], 10);
            // Both horizontal placements will overlap after clamping
            // tc-bc: y = 140 + 10 = 150, fits (150 + 220 = 370 < 600)
            expect(pos.y).toBe(150);
        });

        it('falls back to first placement clamped to parent when nothing fits', () => {
            // Tiny parent — nothing will fit without overlap
            const tinyParent = { width: 100, height: 100 };
            const cellRect = { top: 10, left: 10, right: 90, bottom: 90 };

            const pos = findBestPlacement(cellRect, targetSize, tinyParent, ['tl-tr', 'tr-tl'], 10);
            // All overlap, falls back to first (tl-tr) clamped to parent bounds
            // Raw x = 100, maxX = max(100-320, 0) = 0 → clamped to 0
            expect(pos.x).toBe(0);
        });

        it('respects gap in placement calculations', () => {
            const cellRect = { top: 200, left: 300, right: 400, bottom: 240 };

            const withGap = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr'], 20);
            const noGap = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr'], 0);

            expect(withGap.x).toBe(noGap.x + 20);
        });

        it('handles cell at top-left corner', () => {
            const cellRect = { top: 0, left: 0, right: 100, bottom: 40 };

            const pos = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr', 'tr-tl', 'tc-bc'], 10);
            // tl-tr: x = 110, fits (110 + 320 = 430 < 800), no horizontal overlap
            expect(pos.x).toBe(110);
        });

        it('handles cell at bottom-right corner', () => {
            const cellRect = { top: 560, left: 700, right: 800, bottom: 600 };

            const pos = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr', 'tr-tl', 'tc-bc', 'bc-tc'], 10);
            // tl-tr: x = 810, clamped to 480, overlaps (480+320=800 > 700)
            // tr-tl: x = 370, clamped y = 380, no overlap (370+320=690 < 700) ✓
            expect(pos.x).toBe(370);
            // y is clamped to fit within parent (raw 560 → clamped 380)
            expect(pos.y).toBe(380);
        });

        it('clamps returned position so popup stays within parent bounds', () => {
            // Cell near the bottom — raw tr-tl y=460 would place the 220px popup
            // mostly outside the 500px parent. The returned y must be clamped to 280
            // so the popup is fully visible and does not cover the cell.
            const smallParent = { width: 1000, height: 500 };
            const cellRect = { top: 460, left: 900, right: 1000, bottom: 500 };

            const pos = findBestPlacement(cellRect, targetSize, smallParent, ['tl-tr', 'tr-tl'], 10);
            // tl-tr: x=1010, clamped to 680 → 680+320=1000 > 900 → overlaps
            // tr-tl: raw (570, 460), clamped (570, 280) → 570+320=890 < 900 → no overlap
            expect(pos).toEqual({ x: 570, y: 280 });
        });

        it('can mirror placements for RTL when requested', () => {
            expect(getEffectivePlacements(['tl-tr', 'bl-tr', 'tr-br'], true)).toEqual(['tr-tl', 'br-tl', 'tl-bl']);
        });

        it('does not mirror placements in RTL when the flag is disabled', () => {
            expect(getEffectivePlacements(['tl-tr', 'bl-tr', 'tr-br'], true, false)).toEqual([
                'tl-tr',
                'bl-tr',
                'tr-br',
            ]);
        });

        it('uses mirrored placements when RTL mirroring is enabled', () => {
            const cellRect = { top: 200, left: 500, right: 600, bottom: 240 };

            const pos = findBestPlacement(cellRect, targetSize, parentSize, ['tl-tr', 'tr-tl'], {
                gap: 10,
                enableRtl: true,
            });

            expect(pos.x).toBe(500 - 320 - 10);
        });
    });
});
