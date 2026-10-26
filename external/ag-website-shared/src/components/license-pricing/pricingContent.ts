// The pricing page and its markdown twin both render from here. No paid price figures: those live only in ecommerce.

/** In-page anchors. Other sites link to the product anchors, so treat them as public URLs. */
export const PRICING_ANCHORS = {
    products: 'products',
    grid: 'ag-grid',
    charts: 'ag-charts',
    studio: 'ag-studio',
    features: 'features',
    faqs: 'pricing-questions',
    contact: 'contact-sales',
} as const;

export const ECOMMERCE_URLS = {
    grid: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=aggrid',
    charts: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=agcharts',
    bundle: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=both',
} as const;

/** Relative to the Studio site root. */
export const STUDIO_TRIAL_PATH = '/license-pricing/?tab=trial';

/** Relative to the Grid docs root. */
export const INTEGRATED_CHARTS_PATH = './integrated-charts/';

/** Relative to the Grid or Charts docs root; both sites host the trial licence request at this anchor. */
export const ENTERPRISE_TRIAL_PATH = './community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence';

export const ONLINE_PURCHASE = {
    limit: 'Buy online for 1–10 developer licences for internal applications.',
    otherwise: 'For larger teams or external customer-facing applications, contact sales.',
};

export const PRICING_PAGE = {
    title: 'Pricing: AG Grid, AG Charts and AG Studio',
    description:
        'Pricing for AG Grid, AG Charts and AG Studio. Start free with Community, buy Enterprise licences online for a small team, or contact sales for tailored pricing for your application.',
};

export const PRICING_HERO = {
    eyebrow: 'AG Grid / AG Charts / AG Studio',
    headline: 'Pricing for what you’re building',
    intro: 'Choose AG Grid, AG Charts or AG Studio for your application. Start free with Community, buy Enterprise licences online for a small team, or talk to us about pricing for your requirements.',
};

export interface Tier {
    name: string;
    description: string;
}

export interface LibraryProduct {
    id: 'grid' | 'charts';
    category: string;
    name: string;
    tagline: string;
    enterprise: Tier;
}

export const LIBRARY_PRODUCTS: LibraryProduct[] = [
    {
        id: 'grid',
        category: 'Data grids',
        name: 'AG Grid',
        tagline: 'Build applications that make complex data easier to work with.',
        enterprise: { name: 'Enterprise', description: 'Add advanced capabilities for more demanding data workflows.' },
    },
    {
        id: 'charts',
        category: 'Charting',
        name: 'AG Charts',
        tagline: 'Bring interactive charts into your application.',
        enterprise: { name: 'Enterprise', description: 'Add advanced chart types and interactions.' },
    },
];

export const STUDIO_PRODUCT = {
    category: 'Embedded analytics',
    name: 'AG Studio',
    tagline: 'Add embedded analytics that feels like part of your application.',
    pricing: 'Subscription with tailored pricing.',
    description:
        'From internal dashboards to customer-facing analytics, we’ll help you choose a subscription for your application and its scale.',
    trialNote: 'Explore the full Enterprise capabilities before choosing a subscription.',
};

export const BUNDLE_LINE = {
    heading: 'Enterprise bundle',
    subheading: 'Need Grid and Charts?',
    body: 'Buy the Enterprise Bundle online for 1–10 developer licences for internal applications. For larger teams or customer-facing applications, contact sales.',
    integratedCharts:
        'The bundle also unlocks Integrated Charts, so your users can create charts straight from the data in AG Grid. Charts stay in sync with the grid as users sort and filter.',
    integratedChartsLink: 'Explore Integrated Charts',
};

export const BUYING_ROUTES = {
    online: {
        heading: 'Buying for a small team?',
        body: 'Buy AG Grid Enterprise, AG Charts Enterprise or the Enterprise Bundle online for 1–10 developer licences for internal applications. Choose your product and licence configuration to see your price.',
    },
    tailored: {
        heading: 'Pricing that fits your application',
        body: 'Building an application for customers or other external users? Need more than 10 developer licences? Talk to us about pricing based on how you’ll use our products and the scale of your application.',
        supporting:
            'Tell us what you’re building, who will use it and which products you need. We’ll help you find the right licence or subscription.',
    },
};

export const COMMUNITY = {
    heading: 'Start free with Community',
    body: 'AG Grid Community and AG Charts Community are free and open source under the MIT licence, including for production use. Choose Community when its features meet your needs.',
    studioNote: 'AG Studio is a commercial subscription product. You can evaluate it with a free 45-day trial.',
};

export const FEATURES = {
    heading: 'Find the features you need',
    intro: 'Compare Community and Enterprise features for AG Grid and AG Charts.',
    columns: ['Feature', 'Community', 'Enterprise', 'Enterprise Bundle'],
    bundleIncludes: 'AG Grid Enterprise & AG Charts Enterprise',
};

export const FAQS_HEADING = 'Pricing questions';

export const PRICING_FAQS: { question: string; answer: string }[] = [
    {
        question: 'Can I use Community for free in production?',
        answer: 'Yes. AG Grid Community and AG Charts Community are free and open source under the MIT licence, including production use. Enterprise features require a commercial licence.',
    },
    {
        question: 'When can I buy online?',
        answer: 'You can buy AG Grid Enterprise, AG Charts Enterprise or the Enterprise Bundle online for 1–10 developer licences for internal applications. For larger teams or applications used by customers or other external users, contact sales.',
    },
    {
        question: 'What if my team has 10 or fewer developers but builds a customer facing application?',
        answer: 'Contact sales. We’ll help you choose pricing and a licence for your application and how it will be used.',
    },
    {
        question: 'How many developer licences do I need?',
        answer: 'All front-end developers on the project need a licence, including those who do not work directly with AG Grid or AG Charts. If you’re unsure how to count your team, contact us.',
    },
    {
        question: 'How is AG Studio priced?',
        answer: 'AG Studio is available by subscription, with pricing tailored to your application, how it will be used and its scale. Contact sales to discuss your requirements.',
    },
    {
        question: 'Is AG Studio free?',
        answer: 'AG Studio is a commercial subscription product. A free 45-day trial lets you evaluate its full Enterprise capabilities before choosing a subscription.',
    },
    {
        question: 'What is included in the Enterprise Bundle?',
        answer: 'The Enterprise Bundle combines AG Grid Enterprise and AG Charts Enterprise. AG Studio has separate subscription pricing; contact sales to discuss what you need.',
    },
    {
        question: 'Can I get pricing for several products?',
        answer: 'Yes. Tell us which products you need and how you plan to use them. Our team will help you find the right licence or subscription for your requirements.',
    },
    {
        question: 'What if I already have a licence?',
        answer: 'Contact us about renewals, additional developer licences or changes to your application. We’ll help you identify the appropriate next step.',
    },
];

export const CONTACT = {
    heading: 'Tell us what you’re building',
    intro: 'Share a few details about your application. We’ll help you choose the right products and pricing for your requirements.',
    socialProof: 'Millions use AG Grid every day:',
};
