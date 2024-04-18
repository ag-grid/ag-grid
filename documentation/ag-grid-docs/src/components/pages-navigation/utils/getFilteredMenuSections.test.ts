import { getFilteredMenuSections } from './getFilteredMenuSections';

describe('getFilteredMenuSections', () => {
    test.each([
        {
            title: 'No sections',
            menuSections: [],
            framework: 'react',
            expected: [],
        },
        {
            title: 'Simple menu sections',
            menuSections: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some guide',
                        },
                    ],
                },
            ],
            framework: 'react',
            expected: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some guide',
                        },
                    ],
                },
            ],
        },
        {
            title: 'Simple menu sections not filtered',
            menuSections: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some React guide',
                            frameworks: ['react'],
                        },
                    ],
                },
            ],
            framework: 'react',
            expected: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some React guide',
                            frameworks: ['react'],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Simple menu sections filtered out',
            menuSections: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some JavaScript Guide',
                            frameworks: ['javascript'],
                        },
                    ],
                },
            ],
            framework: 'react',
            expected: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                    ],
                },
            ],
        },
        {
            title: 'Simple menu sections filter out other framework',
            menuSections: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some JavaScript Guide',
                            frameworks: ['javascript'],
                        },
                        {
                            title: 'Some React guide',
                            frameworks: ['react'],
                        },
                    ],
                },
            ],
            framework: 'react',
            expected: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some React guide',
                            frameworks: ['react'],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Multiple framework menu sections',
            menuSections: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some Guide',
                            frameworks: ['javascript', 'react'],
                        },
                        {
                            title: 'Some React guide',
                            frameworks: ['react'],
                        },
                    ],
                },
            ],
            framework: 'react',
            expected: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Quick Start',
                        },
                        {
                            title: 'Some Guide',
                            frameworks: ['javascript', 'react'],
                        },
                        {
                            title: 'Some React guide',
                            frameworks: ['react'],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Nested multiple framework menu sections',
            menuSections: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Get Started',
                            items: [
                                {
                                    title: 'Quick Start',
                                },
                                {
                                    title: 'Some Guide',
                                    frameworks: ['javascript', 'react'],
                                },
                                {
                                    title: 'Some React guide',
                                    frameworks: ['react'],
                                },
                            ],
                        },
                    ],
                },
            ],
            framework: 'javascript',
            expected: [
                {
                    title: 'Overview',
                    items: [
                        {
                            title: 'Get Started',
                            items: [
                                {
                                    title: 'Quick Start',
                                },
                                {
                                    title: 'Some Guide',
                                    frameworks: ['javascript', 'react'],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ])('$title', ({ menuSections, framework, expected }) => {
        expect(getFilteredMenuSections({ menuSections, framework })).toEqual(expected);
    });
});
