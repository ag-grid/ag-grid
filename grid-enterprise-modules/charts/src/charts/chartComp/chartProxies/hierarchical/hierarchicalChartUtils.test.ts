import { describe, expect, it } from '@jest/globals';
import { createCategoryHierarchy } from './hierarchicalChartUtils';

describe(createCategoryHierarchy, () => {
    it('should return a flat list of leaves with no category labels if there are no categories', () => {
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
        const input = [{ value: 1, y: 'foo' }, { value: 2, y: 'bar' }, { value: 3, y: 'baz' }];
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
});
