import { getMenuItemFromPageName } from './getMenuItemFromPageName';

describe('getMenuItemFromPageName', () => {
    test.each([
        {
            menuItems: [],
            pageName: 'something',
            expected: undefined,
        },
        {
            menuItems: [
                {
                    title: 'Overview',
                    path: 'grid-interface',
                },
            ],
            pageName: 'grid-interface',
            expected: {
                title: 'Overview',
                path: 'grid-interface',
            },
        },
        {
            menuItems: [
                {
                    title: 'Other',
                    path: 'other',
                },
                {
                    title: 'Grid Interface',
                    path: 'grid-interface',
                },
            ],
            pageName: 'grid-interface',
            expected: {
                title: 'Grid Interface',
                path: 'grid-interface',
            },
        },
        {
            menuItems: [
                {
                    title: 'Other',
                    path: 'other',
                },
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Grid Interface',
                            path: 'grid-interface',
                        },
                    ],
                },
            ],
            pageName: 'grid-interface',
            expected: { title: 'Grid Interface', path: 'grid-interface' },
        },
        {
            menuItems: [
                {
                    title: 'Other',
                    path: 'other',
                },
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Grid Interface',
                            path: 'grid-interface',
                        },
                    ],
                },
            ],
            pageName: 'other',
            expected: {
                title: 'Other',
                path: 'other',
            },
        },
        {
            menuItems: [
                {
                    title: 'Other',
                    path: 'other',
                },
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Grid Interface',
                            path: 'grid-interface',
                        },
                    ],
                },
            ],
            pageName: 'something-else',
            expected: undefined,
        },
        {
            menuItems: [
                {
                    title: 'Other',
                    path: 'other',
                },
                {
                    title: 'Overview',
                    path: 'overview',
                    items: [
                        {
                            title: 'Grid Interface',
                            path: 'grid-interface',
                        },
                    ],
                },
            ],
            pageName: 'overview',
            expected: {
                title: 'Overview',
                path: 'overview',
                items: [
                    {
                        title: 'Grid Interface',
                        path: 'grid-interface',
                    },
                ],
            },
        },
    ])('returns "$expected" for $pageName in $menuItems', ({ menuItems, pageName, expected }) => {
        expect(getMenuItemFromPageName({ menuItems, pageName })).toEqual(expected);
    });
});
