export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise(resolve => setTimeout(() => resolve(generateData()), delay));
}

function generateData(): any[] {
    return [
        {
            financials: 'Income\nTax',
            amount: 185,
        },
        {
            financials: 'VAT',
            amount: 145,
        },
        {
            financials: 'NI',
            amount: 134,
        },
        {
            financials: 'Corp\nTax',
            amount: 55,
        },
        {
            financials: 'Council\nTax',
            amount: 34,
        },
        {
            financials: 'Social\nProtection',
            amount: -252,
        },
        {
            financials: 'Health',
            amount: -155,
        },
        {
            financials: 'Education',
            amount: -112,
        },
        {
            financials: 'Defence',
            amount: -65,
        },
        {
            financials: 'Debt\nInterest',
            amount: -63,
        },
        {
            financials: 'Housing',
            amount: -31,
        },
    ];
}
