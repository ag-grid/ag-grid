import { describe, expect, it } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { setupMockCanvas, extractImageData, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../chart/test/utils';
import { Sector } from './sector';
import { DropShadow } from '../dropShadow';

expect.extend({ toMatchImageSnapshot });

describe('Sector', () => {
    describe('rendering', () => {
        const canvasCtx = setupMockCanvas();

        const shadowFn = (offset: number) => Object.assign(new DropShadow(), { xOffset: offset, yOffset: offset });
        const fullCircle = 2 * Math.PI;

        const GAP = 10;
        const DEFAULTS: Partial<Sector> = { startAngle: 0, endAngle: 4, innerRadius: 0, outerRadius: 20 };
        const STROKE_WIDTH_CASES = [0, 3, 10];
        const ANGLE_CASES: Partial<Sector>[] = [
            { startAngle: 0, endAngle: fullCircle },
            { startAngle: fullCircle * 0.5, endAngle: fullCircle },
            { startAngle: 0, endAngle: fullCircle - 0.5 },
            { startAngle: 2, endAngle: 4 },
        ];
        const STROKE_TC_PARAMS: Partial<Sector> = {
            strokeWidth: 2,
            stroke: 'red',
            fill: 'yellow',
        };
        const ANGLE_TC_PARAMS: Partial<Sector> = {
            strokeWidth: 2,
            stroke: 'green',
            fill: 'blue',
        };
        const TEST_CASES: (Partial<Sector> | undefined)[][] = [
            // Angle cases.
            ANGLE_CASES.map((angles) => ({
                ...angles,
                ...ANGLE_TC_PARAMS,
            })),
            ANGLE_CASES.map((angles) => ({
                ...angles,
                innerRadius: 10,
                ...ANGLE_TC_PARAMS,
            })),
            // Stroke-width cases.
            STROKE_WIDTH_CASES.map((strokeWidth) => ({
                strokeWidth,
                ...STROKE_TC_PARAMS,
            })),
            STROKE_WIDTH_CASES.map((strokeWidth) => ({
                strokeWidth,
                lineDash: [5, 10],
                ...STROKE_TC_PARAMS,
            })),
            [
                // Shadow cases.
                { fillShadow: shadowFn(5), strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
                { fillShadow: shadowFn(10), strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
                { fillShadow: shadowFn(15), strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
                // Line dash cases.
                { lineDash: [2, 4], strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
                // Opacity cases.
                { opacity: 0.5, strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
                { fillOpacity: 0.5, strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
                { strokeOpacity: 0.5, strokeWidth: 3, stroke: 'yellow', fill: 'blue' },
            ],
            // GO FOR IT!
            [{}, { lineDash: [5, 5] }, { opacity: 0.5 }].map(
                (mixin): Partial<Sector> => ({
                    fillShadow: shadowFn(10),
                    fill: 'blue',
                    strokeWidth: 3,
                    stroke: 'yellow',
                    ...mixin,
                })
            ),
        ];

        it('should render as expected', () => {
            const ctx = canvasCtx.nodeCanvas!.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            let currY = 20;
            let rowHeight = 0;
            for (const testCaseRow of TEST_CASES) {
                let currX = 20 + GAP;
                currY = currY + rowHeight + GAP;
                rowHeight = 0;

                for (const testCase of testCaseRow) {
                    const sector = Object.assign(new Sector(), { ...DEFAULTS }, testCase);

                    // Position Rect.
                    sector.centerX = currX;
                    sector.centerY = currY;

                    // Render.
                    ctx.save();
                    sector.render({ ctx, forceRender: true, resized: false, debugNodes: {} });
                    ctx.restore();

                    // Prepare for next case.
                    currX += sector.outerRadius * 2 + GAP;
                    rowHeight = Math.max(sector.outerRadius * 2, rowHeight);
                }
            }

            // Check rendering.
            const imageData = extractImageData(canvasCtx);
            (expect(imageData) as any).toMatchImageSnapshot();
        });
    });
});
