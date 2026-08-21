import type { IconName } from '@ag-website-shared/components/icon/Icon';

/** Anchor of the sales form further down the pricing page, used by plans that are quoted rather than priced. */
export const CONTACT_SALES_ANCHOR_ID = 'contact-sales';

export type LicenseData = {
    id: string;
    /** Plan name, as it appears on the pricing card and in the sticky pricing bar. */
    subHeading: string;
    /** Price per developer, in whole dollars. Omitted for plans that are quoted rather than priced. */
    priceFullDollars?: string;
    buyLink: string;
    /** Single line beneath the plan name on the pricing card. */
    description: string;
    /** Ticked list at the foot of the pricing card. */
    features: string[];
    ctaLabel: string;
    ctaIcon?: IconName;
    /** DOM id of the plan's call to action. Tracked, so it is stated rather than derived. */
    ctaId: string;
    /** Renders as the emphasised, inverted card. */
    highlighted?: boolean;
    /**
     * Heading this plan contributes to the feature-comparison table. Plans without one — the
     * quoted plans — contribute no column, keeping card and column headings from drifting apart.
     */
    tableColumn?: {
        name: string;
        subHeading: string;
    };
    tabGroup: string;
};

export const DEV_LICENSE_DATA: LicenseData[] = [
    {
        id: 'community',
        subHeading: 'Grid Community',
        description: 'Free for everyone, including production use',
        priceFullDollars: '0',
        buyLink: '/javascript-data-grid/getting-started/',
        features: ['Free to use', 'Basic grid features', 'Theming and customisations'],
        ctaLabel: 'Get started for free',
        ctaId: 'get-started',
        ctaIcon: 'github',
        tableColumn: {
            name: 'Community',
            subHeading: 'Free to use',
        },
        tabGroup: 'grid',
    },
    {
        id: 'enterprise-grid',
        subHeading: 'Grid Enterprise',
        description: 'All the grid features and support via Zendesk',
        priceFullDollars: '999',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=aggrid',
        features: ['Enterprise support', 'Basic grid features', 'Advanced grid features'],
        ctaLabel: 'Get a license',
        ctaId: 'buy-now',
        tableColumn: {
            name: 'Grid Enterprise',
            subHeading: 'Enterprise support',
        },
        tabGroup: 'grid',
    },
    {
        id: 'community',
        subHeading: 'Charts Community',
        description: 'Free for everyone, including production use',
        priceFullDollars: '0',
        buyLink: 'https://www.ag-grid.com/charts/javascript/quick-start/',
        features: ['Free to use', 'Basic chart features', 'Theming and customisations'],
        ctaLabel: 'Get started for free',
        ctaId: 'get-started',
        ctaIcon: 'github',
        tableColumn: {
            name: 'Community',
            subHeading: 'Free to use',
        },
        tabGroup: 'charts',
    },
    {
        id: 'enterprise-charts',
        subHeading: 'Charts Enterprise',
        description: 'All the chart features and support via Zendesk',
        priceFullDollars: '499',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=agcharts',
        features: ['Enterprise support', 'Basic chart features', 'Advanced chart features'],
        ctaLabel: 'Get a license',
        ctaId: 'buy-now',
        tableColumn: {
            name: 'Charts Enterprise',
            subHeading: 'Enterprise support',
        },
        tabGroup: 'charts',
    },
    {
        id: 'together',
        subHeading: 'Enterprise Bundle',
        description: 'Combine Grid and Charts for unrivalled performance',
        priceFullDollars: '1,498',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=both',
        features: ['AG Grid Enterprise', 'AG Charts Enterprise', 'Everything else in Community'],
        ctaLabel: 'Get a license',
        ctaId: 'bundle-buy-now',
        tableColumn: {
            name: 'Enterprise Bundle',
            subHeading: 'Enterprise support',
        },
        tabGroup: 'both',
    },
    {
        id: 'custom',
        subHeading: 'Custom',
        description: 'Need more than 10 licences? Contact us to learn more & request a demo',
        buyLink: `#${CONTACT_SALES_ANCHOR_ID}`,
        features: [
            '30 day enterprise trials',
            'Custom enterprise bundles',
            'Scalable pricing for teams',
            'Access to enterprise support',
        ],
        ctaLabel: 'Contact us',
        // Not `contact-sales`, which is the id of the form section this links to.
        ctaId: 'contact-sales-cta',
        highlighted: true,
        tabGroup: 'both',
    },
];
