export type LicenseData = {
    id: string;
    subHeading: string;
    priceFullDollars: string;
    buyLink: string;
    description: string;
    tabGroup: string;
};

export const DEV_LICENSE_DATA: LicenseData[] = [
    {
        id: 'community',
        subHeading: 'AG Grid Community',
        description: '',
        priceFullDollars: '0',
        buyLink: '/javascript-data-grid/getting-started/',
        tabGroup: 'grid',
    },
    {
        id: 'enterprise-grid',
        subHeading: 'AG Grid Enterprise',
        description: '',
        priceFullDollars: '999',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=aggrid',
        tabGroup: 'grid',
    },
    {
        id: 'community',
        subHeading: 'AG Charts Community',
        description: '',
        priceFullDollars: '0',
        buyLink: 'https://www.ag-grid.com/charts/javascript/quick-start/',
        tabGroup: 'charts',
    },
    {
        id: 'enterprise-charts',
        subHeading: 'AG Charts Enterprise',
        description: '',
        priceFullDollars: '499',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=agcharts',
        tabGroup: 'charts',
    },
    {
        id: 'together',
        subHeading: 'Enterprise Bundle',
        description: 'AG Grid Enterprise &<br />AG Charts Enterprise',
        priceFullDollars: '1,498',
        buyLink: 'https://www.ag-grid.com/ecommerce/#/ecommerce/?licenseType=single&productType=both',
        tabGroup: 'both',
    },
];
