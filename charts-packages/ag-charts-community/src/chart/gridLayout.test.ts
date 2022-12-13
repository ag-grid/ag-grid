import { describe, expect, test } from '@jest/globals';
import { gridLayout, Orientation } from './gridLayout';
import { BBox } from '../scene/bbox';

describe('horizontal layout', () => {
    test('one row, multiple columns, one page', () => {
        const MAX_HEIGHT = 23;
        const MAX_WIDTH = 510;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Horizontal,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two rows, multiple columns, one page', () => {
        const MAX_HEIGHT = 47;
        const MAX_WIDTH = 510;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Horizontal,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two rows, multiple columns, one page, mixed item widths in single column ', () => {
        const MAX_HEIGHT = 47;
        const MAX_WIDTH = 510;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 100, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Horizontal,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two rows, multiple columns, two pages', () => {
        const MAX_HEIGHT = 47;
        const MAX_WIDTH = 510;
        const BBOXES: BBox[] = [
            // page 1
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),

            // page 2
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Horizontal,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two rows, multiple columns, two page, mixed item widths in single column ', () => {
        const MAX_HEIGHT = 47;
        const MAX_WIDTH = 510;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 100, 23),
        ];

        // 100, 120, 140, 140
        // 140, 140, 120, 100

        // 100, 120, 140,
        // 140, 140, 120,

        // 120, 100

        const { pages } = gridLayout({
            orientation: Orientation.Horizontal,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        console.log({ pages });

        expect(pages).toMatchSnapshot();
    });
});

describe('vertical layout', () => {
    test('one column, multiple rows, one page', () => {
        const MAX_HEIGHT = 100;
        const MAX_WIDTH = 150;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Vertical,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two columns, multiple rows, one page', () => {
        const MAX_HEIGHT = 100;
        const MAX_WIDTH = 290;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Vertical,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two columns, multiple rows, one page, mixed item widths in single column ', () => {
        const MAX_HEIGHT = 100;
        const MAX_WIDTH = 290;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 100, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Vertical,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two columns, multiple rows, two pages', () => {
        const MAX_HEIGHT = 100;
        const MAX_WIDTH = 290;
        const BBOXES: BBox[] = [
            // page 1
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),

            // page 2
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 140, 23),
            new BBox(0, 0, 140, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Vertical,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });

    test('two columns, multiple rows, two page, mixed item widths in single column ', () => {
        const MAX_HEIGHT = 100;
        const MAX_WIDTH = 290;
        const BBOXES: BBox[] = [
            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 100, 23),

            new BBox(0, 0, 100, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 130, 23),
            new BBox(0, 0, 125, 23),
            new BBox(0, 0, 120, 23),
            new BBox(0, 0, 100, 23),
        ];

        const { pages } = gridLayout({
            orientation: Orientation.Vertical,
            bboxes: BBOXES,
            maxHeight: MAX_HEIGHT,
            maxWidth: MAX_WIDTH,
        });

        expect(pages).toMatchSnapshot();
    });
});
