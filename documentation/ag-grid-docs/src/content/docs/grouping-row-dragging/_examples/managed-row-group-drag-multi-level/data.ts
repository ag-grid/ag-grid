export interface ExpansionPlan {
    id: string;
    region: 'EMEA' | 'AMER' | 'APAC';
    country: string;
    stream: 'Retail' | 'Logistics' | 'Marketplace';
    milestone: string;
    lead: string;
}

export function getExpansionPlans(): ExpansionPlan[] {
    return [
        {
            id: '1',
            region: 'EMEA',
            country: 'Germany',
            stream: 'Retail',
            milestone: 'Pilot hub in Berlin',
            lead: 'Jonas',
        },
        {
            id: '2',
            region: 'EMEA',
            country: 'Germany',
            stream: 'Marketplace',
            milestone: 'Seller marketing push',
            lead: 'Paula',
        },
        { id: '3', region: 'EMEA', country: 'Spain', stream: 'Logistics', milestone: 'Cold chain RFP', lead: 'Aria' },
        { id: '4', region: 'EMEA', country: 'Spain', stream: 'Retail', milestone: 'Pop-up stores', lead: 'Luis' },
        { id: '5', region: 'AMER', country: 'USA', stream: 'Marketplace', milestone: 'LA seller summit', lead: 'Dev' },
        { id: '6', region: 'AMER', country: 'USA', stream: 'Logistics', milestone: 'Oakland cross-dock', lead: 'Mara' },
        {
            id: '7',
            region: 'AMER',
            country: 'Canada',
            stream: 'Retail',
            milestone: 'Quebec localization',
            lead: 'Chloe',
        },
        {
            id: '8',
            region: 'AMER',
            country: 'Canada',
            stream: 'Marketplace',
            milestone: 'New partner incentives',
            lead: 'Rita',
        },
        {
            id: '9',
            region: 'APAC',
            country: 'Japan',
            stream: 'Marketplace',
            milestone: 'Tokyo onboarding blitz',
            lead: 'Haru',
        },
        {
            id: '10',
            region: 'APAC',
            country: 'Japan',
            stream: 'Logistics',
            milestone: 'Osaka relay station',
            lead: 'Kenji',
        },
        {
            id: '11',
            region: 'APAC',
            country: 'Australia',
            stream: 'Retail',
            milestone: 'Sydney flagship',
            lead: 'Noor',
        },
        {
            id: '12',
            region: 'APAC',
            country: 'Australia',
            stream: 'Logistics',
            milestone: 'Western corridor tender',
            lead: 'Imogen',
        },
    ];
}
