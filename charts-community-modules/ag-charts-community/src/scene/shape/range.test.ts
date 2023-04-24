import { describe, expect, it } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { setupMockCanvas, extractImageData } from '../../chart/test/utils';
import { Range } from './range';

expect.extend({ toMatchImageSnapshot });
const CANVAS_WIDTH = 1150;

describe('Range', () => {
    describe('rendering', () => {
        const canvasCtx = setupMockCanvas();

        const GAP = 25;
        const COORDINATES: Partial<Range> = { x1: 0, y1: 0, x2: 200, y2: 100 };
        const STYLE_TC_PARAMS = {
            stroke: 'black',
            fill: 'rgba(238,102,102, 0.2)',
        };
        const BASE_TEST_CASES: (Partial<Range> | undefined)[] = [
            {
                startLine: true,
                endLine: true,
                isRange: true,
            },
            {
                startLine: true,
                endLine: false,
                isRange: true,
            },
            {
                startLine: false,
                endLine: true,
                isRange: true,
            },
            {
                startLine: false,
                endLine: false,
                isRange: true,
            },
            {
                startLine: true,
                endLine: true,
                isRange: false,
            },
        ];
        const STROKE_WIDTH_CASES = [0, 3, 8, 10, 20];
        const LINE_DASH_CASES = [[1], [6, 4, 3], [5, 10], [2, 4], [10, 4]];
        const FILL_OPACITY_CASES = [0.2, 0.4, 0.6, 0.8, 1];

        const TEST_CASES: (Partial<Range> | undefined)[][] = [
            BASE_TEST_CASES,
            // Stroke-width cases.
            STROKE_WIDTH_CASES.map((strokeWidth, index) => ({
                ...BASE_TEST_CASES[index],
                strokeWidth,
            })),
            LINE_DASH_CASES.map((lineDash, index) => ({
                ...BASE_TEST_CASES[index],
                strokeWidth: 2,
                lineDash,
            })),
            FILL_OPACITY_CASES.map((fillOpacity, index) => ({
                ...BASE_TEST_CASES[index],
                fillOpacity,
                fill: 'rgb(238,102,102)',
            })),
        ];

        it('should render as expected', () => {
            const ctx = canvasCtx.nodeCanvas!.getContext('2d');
            (ctx as any).canvas.width = CANVAS_WIDTH;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, CANVAS_WIDTH, canvasCtx.nodeCanvas?.height ?? 0);

            let currY = 0;
            let rowHeight = 0;
            for (const testCaseRow of TEST_CASES) {
                let currX = GAP;
                currY = currY + rowHeight + GAP;
                rowHeight = 0;

                for (const testCase of testCaseRow) {
                    const range = Object.assign(new Range(), { ...COORDINATES, ...STYLE_TC_PARAMS }, testCase);

                    // Position Range.
                    range.translationX = currX;
                    range.translationY = currY;

                    // Render.
                    ctx.save();
                    range.render({ ctx, forceRender: true, resized: false, debugNodes: {} });
                    ctx.restore();

                    // Prepare for next case.
                    currX += range.x2 - range.x1 + GAP;
                    rowHeight = Math.max(range.y2 - range.y1, rowHeight);
                }
            }

            // Check rendering.
            const imageData = extractImageData(canvasCtx);
            (expect(imageData) as any).toMatchImageSnapshot();
        });
    });
});
