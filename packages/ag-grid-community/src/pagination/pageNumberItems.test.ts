import { _getPageNumberItems } from './pageNumberItems';

describe('_getPageNumberItems', () => {
    describe('no truncation when all pages fit contiguously', () => {
        it.each([
            [0, 1, [1]],
            [0, 5, [1, 2, 3, 4, 5]],
            [2, 5, [1, 2, 3, 4, 5]],
            [4, 5, [1, 2, 3, 4, 5]],
        ])('currentPage %i of %i pages', (currentPage, totalPages, expected) => {
            expect(_getPageNumberItems(currentPage, totalPages, true)).toEqual(expected);
        });

        it('fills single-page gaps with the page rather than an ellipsis', () => {
            // page 4 of 7 keeps 1, 7 and 3-4-5; the 1->3 and 5->7 gaps are single pages so 2 and 6 are shown
            expect(_getPageNumberItems(3, 7, true)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('truncation patterns for large page counts', () => {
        it('start pattern: 1 2 3 4 5 ... N', () => {
            expect(_getPageNumberItems(1, 51, true)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 51]);
        });

        it('middle pattern: 1 ... X Y Z ... N', () => {
            expect(_getPageNumberItems(9, 51, true)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 51]);
        });

        it('middle pattern with 10 pages: 1 ... 4 5 6 ... 10', () => {
            expect(_getPageNumberItems(4, 10, true)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
        });

        it('end pattern: 1 ... N-4 N-3 N-2 N-1 N', () => {
            expect(_getPageNumberItems(50, 51, true)).toEqual([1, 'ellipsis', 47, 48, 49, 50, 51]);
        });

        it('end pattern with 10 pages: 1 ... 6 7 8 9 10', () => {
            expect(_getPageNumberItems(9, 10, true)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
        });

        it('first page of a large set expands the edge block: 1 2 3 4 5 ... N', () => {
            expect(_getPageNumberItems(0, 51, true)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 51]);
        });
    });

    describe('single page', () => {
        it.each([
            [0, 0],
            [0, 1],
        ])('renders a single item for currentPage %i of %i pages', (currentPage, totalPages) => {
            expect(_getPageNumberItems(currentPage, totalPages, true)).toEqual([1]);
        });
    });

    describe('last page not known', () => {
        it('never pins a concrete last page and ends with a trailing ellipsis', () => {
            expect(_getPageNumberItems(0, 5, false)).toEqual([1, 2, 3, 'ellipsis']);
        });

        it('keeps the first page and a window around the current page', () => {
            expect(_getPageNumberItems(9, 20, false)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis']);
        });

        it('shows just the first page and ellipsis when only one page has loaded', () => {
            expect(_getPageNumberItems(0, 1, false)).toEqual([1, 'ellipsis']);
        });
    });

    describe('out-of-range current page is clamped', () => {
        it('does not render page buttons beyond the known total', () => {
            expect(_getPageNumberItems(99, 10, true)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
        });

        it('treats a negative current page as the first page', () => {
            expect(_getPageNumberItems(-5, 10, true)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
        });
    });
});
