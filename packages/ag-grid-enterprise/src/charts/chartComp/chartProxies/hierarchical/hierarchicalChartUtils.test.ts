import { describe, expect, it } from '@jest/globals';

import { createAutoGroupHierarchy, createCategoryHierarchy } from './hierarchicalChartUtils';

describe(createCategoryHierarchy as any, () => {
    it('should return a flat list of leaves with null category labels if there are no categories', () => {
        const input = [{ value: 1 }, { value: 2 }, { value: 3 }];
        const categoryKeys: Array<keyof (typeof input)[number]> = [];
        const actual = createCategoryHierarchy(input, categoryKeys);
        const expected = [
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, value: 1 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, value: 2 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, value: 3 },
        ];
        expect(actual).toEqual(expected);
    });

    it('should return a flat list of leaves with their respective category keys if there is a single category level', () => {
        const input = [
            { value: 1, y: 'foo' },
            { value: 2, y: 'bar' },
            { value: 3, y: 'baz' },
        ];
        const categoryKeys: Array<keyof (typeof input)[number]> = ['y'];
        const actual = createCategoryHierarchy(input, categoryKeys);
        const expected = [
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 1, y: 'foo' },
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 2, y: 'bar' },
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 3, y: 'baz' },
        ];
        expect(actual).toEqual(expected);
    });

    it('should group items by the category value if there are two category levels', () => {
        const input = [
            { value: 1, y: 'foo', z: 'a' },
            { value: 2, y: 'bar', z: 'a' },
            { value: 3, y: 'baz', z: 'a' },
            { value: 4, y: 'foo', z: 'b' },
            { value: 5, y: 'bar', z: 'b' },
            { value: 6, y: 'baz', z: 'b' },
        ];
        const categoryKeys: Array<keyof (typeof input)[number]> = ['z', 'y'];
        const actual = createCategoryHierarchy(input, categoryKeys);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'a',
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 1, y: 'foo', z: 'a' },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 2, y: 'bar', z: 'a' },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 3, y: 'baz', z: 'a' },
                ],
            },
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'b',
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 4, y: 'foo', z: 'b' },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 5, y: 'bar', z: 'b' },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 6, y: 'baz', z: 'b' },
                ],
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should group items by the category value if there are multiple category levels', () => {
        const input = [
            { value: 1, y: 'foo', z: 'a', w: 'x' },
            { value: 2, y: 'bar', z: 'a', w: 'x' },
            { value: 3, y: 'baz', z: 'a', w: 'x' },
            { value: 4, y: 'foo', z: 'b', w: 'x' },
            { value: 5, y: 'bar', z: 'b', w: 'x' },
            { value: 6, y: 'baz', z: 'b', w: 'x' },
            { value: 7, y: 'foo', z: 'a', w: 'y' },
            { value: 8, y: 'bar', z: 'a', w: 'y' },
            { value: 9, y: 'baz', z: 'a', w: 'y' },
            { value: 10, y: 'foo', z: 'b', w: 'y' },
            { value: 11, y: 'bar', z: 'b', w: 'y' },
            { value: 12, y: 'baz', z: 'b', w: 'y' },
        ];
        const categoryKeys: Array<keyof (typeof input)[number]> = ['w', 'z', 'y'];
        const actual = createCategoryHierarchy(input, categoryKeys);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'x',
                children: [
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'a',
                        children: [
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 1, y: 'foo', z: 'a', w: 'x' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 2, y: 'bar', z: 'a', w: 'x' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 3, y: 'baz', z: 'a', w: 'x' },
                        ],
                    },
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'b',
                        children: [
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 4, y: 'foo', z: 'b', w: 'x' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 5, y: 'bar', z: 'b', w: 'x' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 6, y: 'baz', z: 'b', w: 'x' },
                        ],
                    },
                ],
            },
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'y',
                children: [
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'a',
                        children: [
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 7, y: 'foo', z: 'a', w: 'y' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 8, y: 'bar', z: 'a', w: 'y' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 9, y: 'baz', z: 'a', w: 'y' },
                        ],
                    },
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'b',
                        children: [
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', value: 10, y: 'foo', z: 'b', w: 'y' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'bar', value: 11, y: 'bar', z: 'b', w: 'y' },
                            { 'AG-GRID-DEFAULT-LABEL-KEY': 'baz', value: 12, y: 'baz', z: 'b', w: 'y' },
                        ],
                    },
                ],
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should format numeric category labels as strings', () => {
        const input = [
            { x: 1, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 5 },
        ];
        const categoryKeys: Array<keyof (typeof input)[number]> = ['x', 'y'];
        const actual = createCategoryHierarchy(input, categoryKeys);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': '1',
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': '3', x: 1, y: 3 },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': '4', x: 1, y: 4 },
                ],
            },
            { 'AG-GRID-DEFAULT-LABEL-KEY': '2', children: [{ 'AG-GRID-DEFAULT-LABEL-KEY': '5', x: 2, y: 5 }] },
        ];
        expect(actual).toEqual(expected);
    });

    it('should retain null category labels', () => {
        const input = [
            { x: null, y: 1 },
            { x: null, y: 2 },
            { x: undefined, y: 3 },
            { x: undefined, y: 4 },
            { x: 'foo', y: 5 },
        ];
        const categoryKeys: Array<keyof (typeof input)[number]> = ['x', 'y'];
        const actual = createCategoryHierarchy(input, categoryKeys);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': null,
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': '1', x: null, y: 1 },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': '2', x: null, y: 2 },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': '3', x: undefined, y: 3 },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': '4', x: undefined, y: 4 },
                ],
            },
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'foo', children: [{ 'AG-GRID-DEFAULT-LABEL-KEY': '5', x: 'foo', y: 5 }] },
        ];
        expect(actual).toEqual(expected);
    });
});

describe(createAutoGroupHierarchy as any, () => {
    function getRowAutoGroupLabels(item: object): string[] | null {
        return (item as { 'ag-Grid-AutoColumn'?: { labels: string[] } })['ag-Grid-AutoColumn']?.labels ?? null;
    }

    it('should return a flat list of leaves with null category labels if there are no auto group labels', () => {
        const input = [
            { x: 1, y: 4 },
            { x: 2, y: 5 },
            { x: 3, y: 6 },
        ];
        const actual = createAutoGroupHierarchy(input, getRowAutoGroupLabels);
        const expected = [
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, x: 1, y: 4 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, x: 2, y: 5 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, x: 3, y: 6 },
        ];
        expect(actual).toEqual(expected);
    });

    it('should return a flat list of leaves with null category labels if all auto group labels are empty', () => {
        const input = [
            { 'ag-Grid-AutoColumn': { labels: [] }, x: 1, y: 4 },
            { 'ag-Grid-AutoColumn': { labels: [] }, x: 2, y: 5 },
            { 'ag-Grid-AutoColumn': { labels: [] }, x: 3, y: 6 },
        ];
        const actual = createAutoGroupHierarchy(input, getRowAutoGroupLabels);
        const expected = [
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, 'ag-Grid-AutoColumn': { labels: [] }, x: 1, y: 4 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, 'ag-Grid-AutoColumn': { labels: [] }, x: 2, y: 5 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': null, 'ag-Grid-AutoColumn': { labels: [] }, x: 3, y: 6 },
        ];
        expect(actual).toEqual(expected);
    });

    it('should return a flat list of leaves with the correct category labels if there is one level of grouping keys for each item', () => {
        const input = [
            { 'ag-Grid-AutoColumn': { labels: ['a'] }, x: 1, y: 4 },
            { 'ag-Grid-AutoColumn': { labels: ['b'] }, x: 2, y: 5 },
            { 'ag-Grid-AutoColumn': { labels: ['c'] }, x: 3, y: 6 },
        ];
        const actual = createAutoGroupHierarchy(input, getRowAutoGroupLabels);
        const expected = [
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'a', 'ag-Grid-AutoColumn': { labels: ['a'] }, x: 1, y: 4 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'b', 'ag-Grid-AutoColumn': { labels: ['b'] }, x: 2, y: 5 },
            { 'AG-GRID-DEFAULT-LABEL-KEY': 'c', 'ag-Grid-AutoColumn': { labels: ['c'] }, x: 3, y: 6 },
        ];
        expect(actual).toEqual(expected);
    });

    it('should group items by the correct category value if there are two levels of grouping keys for each item', () => {
        const input = [
            { 'ag-Grid-AutoColumn': { labels: ['a', 'foo'] }, x: 1, y: 5 },
            { 'ag-Grid-AutoColumn': { labels: ['b', 'foo'] }, x: 2, y: 6 },
            { 'ag-Grid-AutoColumn': { labels: ['c', 'foo'] }, x: 3, y: 7 },
            { 'ag-Grid-AutoColumn': { labels: ['d', 'bar'] }, x: 4, y: 8 },
        ];
        const actual = createAutoGroupHierarchy(input, getRowAutoGroupLabels);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'foo',
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'a', 'ag-Grid-AutoColumn': { labels: ['a', 'foo'] }, x: 1, y: 5 },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'b', 'ag-Grid-AutoColumn': { labels: ['b', 'foo'] }, x: 2, y: 6 },
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'c', 'ag-Grid-AutoColumn': { labels: ['c', 'foo'] }, x: 3, y: 7 },
                ],
            },
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'bar',
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'd', 'ag-Grid-AutoColumn': { labels: ['d', 'bar'] }, x: 4, y: 8 },
                ],
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should group items by the correct category value if there are multiple levels of grouping keys for each item', () => {
        const input = [
            { 'ag-Grid-AutoColumn': { labels: ['a', 'foo', 'x'] }, x: 1, y: 5 },
            { 'ag-Grid-AutoColumn': { labels: ['b', 'foo', 'x'] }, x: 2, y: 6 },
            { 'ag-Grid-AutoColumn': { labels: ['c', 'foo', 'x'] }, x: 3, y: 7 },
            { 'ag-Grid-AutoColumn': { labels: ['d', 'bar', 'y'] }, x: 4, y: 8 },
        ];
        const actual = createAutoGroupHierarchy(input, getRowAutoGroupLabels);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'x',
                children: [
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'foo',
                        children: [
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'a',
                                'ag-Grid-AutoColumn': { labels: ['a', 'foo', 'x'] },
                                x: 1,
                                y: 5,
                            },
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'b',
                                'ag-Grid-AutoColumn': { labels: ['b', 'foo', 'x'] },
                                x: 2,
                                y: 6,
                            },
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'c',
                                'ag-Grid-AutoColumn': { labels: ['c', 'foo', 'x'] },
                                x: 3,
                                y: 7,
                            },
                        ],
                    },
                ],
            },
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'y',
                children: [
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'bar',
                        children: [
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'd',
                                'ag-Grid-AutoColumn': { labels: ['d', 'bar', 'y'] },
                                x: 4,
                                y: 8,
                            },
                        ],
                    },
                ],
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should group items by the correct category value if there are unequal levels of grouping keys for each item', () => {
        const input = [
            { 'ag-Grid-AutoColumn': { labels: ['a', 'foo', 'x'] }, x: 1, y: 5 },
            { 'ag-Grid-AutoColumn': { labels: ['b', 'foo'] }, x: 2, y: 6 },
            { 'ag-Grid-AutoColumn': { labels: ['c', 'foo', 'x'] }, x: 3, y: 7 },
            { 'ag-Grid-AutoColumn': { labels: ['d', 'bar', 'y'] }, x: 4, y: 8 },
            { 'ag-Grid-AutoColumn': { labels: ['foo', 'x'] }, z: 9 },
            { 'ag-Grid-AutoColumn': { labels: ['baz', 'x'] }, z: 10 },
        ];
        const actual = createAutoGroupHierarchy(input, getRowAutoGroupLabels);
        const expected = [
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'x',
                children: [
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'foo',
                        children: [
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'a',
                                'ag-Grid-AutoColumn': { labels: ['a', 'foo', 'x'] },
                                x: 1,
                                y: 5,
                            },
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'c',
                                'ag-Grid-AutoColumn': { labels: ['c', 'foo', 'x'] },
                                x: 3,
                                y: 7,
                            },
                        ],
                        'ag-Grid-AutoColumn': { labels: ['foo', 'x'] },
                        z: 9,
                    },
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'baz',
                        'ag-Grid-AutoColumn': { labels: ['baz', 'x'] },
                        z: 10,
                    },
                ],
            },
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'foo',
                children: [
                    { 'AG-GRID-DEFAULT-LABEL-KEY': 'b', 'ag-Grid-AutoColumn': { labels: ['b', 'foo'] }, x: 2, y: 6 },
                ],
            },
            {
                'AG-GRID-DEFAULT-LABEL-KEY': 'y',
                children: [
                    {
                        'AG-GRID-DEFAULT-LABEL-KEY': 'bar',
                        children: [
                            {
                                'AG-GRID-DEFAULT-LABEL-KEY': 'd',
                                'ag-Grid-AutoColumn': { labels: ['d', 'bar', 'y'] },
                                x: 4,
                                y: 8,
                            },
                        ],
                    },
                ],
            },
        ];
        expect(actual).toEqual(expected);
    });
});
