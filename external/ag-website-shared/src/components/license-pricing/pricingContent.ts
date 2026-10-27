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
export const STUDIO_TRIAL_PATH = '/react/enterprise-licence/#request-a-45-day-trial-licence';

/** Relative to the Grid docs root. */
export const INTEGRATED_CHARTS_PATH = './integrated-charts/';

/** Relative to the Grid or Charts docs root; both sites host the trial licence request at this anchor. */
export const ENTERPRISE_TRIAL_PATH = './community-vs-enterprise/#request-a-30-day-enterprise-bundle-trial-licence';

/** Shown on every card a visitor can buy online. */
export const ONLINE_PURCHASE = 'Online purchase: 1–10 developer licences for internal applications.';

export const PRICING_PAGE = {
    title: 'Pricing: AG Grid, AG Charts and AG Studio',
    description:
        'Pricing for AG Grid, AG Charts and AG Studio. Buy Enterprise licences online or contact sales for tailored pricing for your application.',
};

export const PRICING_HERO = {
    eyebrow: 'AG Grid / AG Charts / AG Studio',
    headline: 'Pricing for what you’re building',
    intro: 'Choose AG Grid, AG Charts or AG Studio for your application. Buy licences online or talk to us about pricing for your requirements.',
};

export const LICENCE_HELP = {
    prompt: 'Not sure which licence you need?',
    link: 'We can help',
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
        enterprise: { name: 'Enterprise', description: 'Advanced grid features for demanding data workflows.' },
    },
    {
        id: 'charts',
        category: 'Charting',
        name: 'AG Charts',
        tagline: 'Bring interactive charts into your application.',
        enterprise: { name: 'Enterprise', description: 'Advanced chart types and interactions for your application.' },
    },
];

export const STUDIO_PRODUCT = {
    category: 'Embedded analytics',
    name: 'AG Studio',
    tagline: 'Add embedded analytics that feels like part of your application.',
    pricing: 'Subscription with tailored pricing',
    description:
        'For internal dashboards and customer-facing analytics. Talk to us about a subscription for your application and its scale.',
};

export const BUNDLE_LINE = {
    heading: 'Enterprise Bundle',
    body: 'Get AG Grid Enterprise and AG Charts Enterprise together in one bundle.',
    integratedCharts:
        'The bundle also unlocks Integrated Charts, so your users can create charts straight from the data in AG Grid. Charts stay in sync with the grid as users sort and filter.',
    integratedChartsLink: 'Explore Integrated Charts',
};

export const BUYING_ROUTES = {
    online: {
        heading: 'Buy online for internal applications',
        body: 'Buy AG Grid Enterprise, AG Charts Enterprise or the Enterprise Bundle online for 1–10 developer licences for internal applications. Configure your licence to see your price.',
    },
    tailored: {
        heading: 'Pricing tailored to your application',
        body: 'Contact us for AG Studio subscriptions, external customer-facing applications of any team size, or purchases of more than 10 developer licences. We’ll help you choose pricing based on how you’ll use the products and the scale of your application.',
    },
};

export const COMMUNITY = {
    heading: 'Start free with Community',
    body: 'AG Grid Community and AG Charts Community are free and open source under the MIT licence, including for production use.',
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
