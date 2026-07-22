import type { Library } from '@ag-grid-types';

export type Feature = {
    icon: string;
    title: string;
    description: string;
    link: string;
};

export const FEATURE_MAP: Record<Library, Feature[]> = {
    grid: [
        {
            icon: 'concepts',
            title: 'Key Features',
            description: 'Browse an overview of our commonly used features',
            link: './key-features/',
        },
        {
            icon: 'tutorials',
            title: 'Tutorials',
            description: 'Get started with our step-by-step tutorials',
            link: './deep-dive/',
        },
        {
            icon: 'communityEnterprise',
            title: 'Community vs. Enterprise',
            description: 'Understand the differences between each version',
            link: './community-vs-enterprise/',
        },
    ],
    charts: [
        {
            icon: 'concepts',
            title: 'Key Features',
            description: 'Browse an overview of our commonly used features',
            link: './key-features/',
        },
        {
            icon: 'tutorials',
            title: 'Tutorials',
            description: 'Get started with our step-by-step tutorials',
            link: './create-a-basic-chart/',
        },
        {
            icon: 'communityEnterprise',
            title: 'Community vs. Enterprise',
            description: 'Understand the differences between each version',
            link: './community-vs-enterprise/',
        },
    ],
    studio: [
        {
            icon: 'listBoxes',
            title: 'Overview',
            description: 'Learn about AG Studio and its key features.',
            link: './overview/',
        },
        {
            icon: 'code',
            title: 'Developers',
            description: 'Embed AG Studio into your application.',
            link: './quick-start/',
        },
        {
            icon: 'edit',
            title: 'Analysts',
            description: 'Learn how to build self-service reports.',
            link: './user-interface/',
        },
    ],
};
