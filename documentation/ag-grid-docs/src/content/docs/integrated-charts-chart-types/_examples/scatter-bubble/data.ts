export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise((resolve) => setTimeout(() => resolve(generateData()), delay));
}

function generateData(): any[] {
    return [
        { division: 'Sales', resource: 'Online sales', revenue: 1587123, expenses: 151497, headcount: 168 },
        { division: 'Sales', resource: 'Retail stores', revenue: 1304696, expenses: 389271, headcount: 783 },
        { division: 'Sales', resource: 'Wholesale distribution', revenue: 971658, expenses: 263971, headcount: 629 },
        { division: 'Marketing', resource: 'Online marketing', revenue: 65829, expenses: 185736, headcount: 59 },
        { division: 'Marketing', resource: 'Public relations', revenue: 152696, expenses: 182745, headcount: 37 },
        {
            division: 'Research',
            resource: 'Research and development',
            revenue: 108547,
            expenses: 294572,
            headcount: 83,
        },
        { division: 'Operations', resource: 'Customer service', revenue: 0, expenses: 258392, headcount: 72 },
        { division: 'Operations', resource: 'Logistics', revenue: 134830, expenses: 412378, headcount: 48 },
        { division: 'Operations', resource: 'Human resources', revenue: 0, expenses: 179364, headcount: 16 },
        { division: 'Operations', resource: 'Legal', revenue: 49794, expenses: 152638, headcount: 12 },
        { division: 'Operations', resource: 'Quality assurance', revenue: 0, expenses: 213572, headcount: 27 },
        { division: 'Operations', resource: 'Sales operations', revenue: 116543, expenses: 359812, headcount: 52 },
        {
            division: 'Operations',
            resource: 'Supply chain management',
            revenue: 91638,
            expenses: 146298,
            headcount: 29,
        },
        {
            division: 'Operations',
            resource: 'Training and development',
            revenue: 25146,
            expenses: 19872,
            headcount: 17,
        },
        {
            division: 'Information technology',
            resource: 'IT services',
            revenue: 29259,
            expenses: 472135,
            headcount: 87,
        },
        { division: 'Finance', resource: 'Accounting', revenue: 0, expenses: 209573, headcount: 14 },
        { division: 'Finance', resource: 'Loans', revenue: 117451, expenses: 327198, headcount: 23 },
        { division: 'Finance', resource: 'Investments', revenue: 217451, expenses: 37198, headcount: 6 },
        { division: 'Operations', resource: 'Facilities management', revenue: 859451, expenses: 263819, headcount: 58 },
    ];
}
