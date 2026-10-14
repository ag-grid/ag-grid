export interface CompanyRecord {
    id: string;
    name: string;
    region: string;
    sector: string;
    listed: Date;
    active: boolean;
    revenue: number;
    costOfSales: number;
    operatingCosts: number;
    assets: number;
    liabilities: number;
    headcount: number;
    rating: string;
}

const NAMES = ['Northwind', 'Contoso', 'Fabrikam', 'Tailspin', 'Litware', 'Adventure Works', 'Proseware', 'Wingtip'];
const REGIONS = ['EMEA', 'Americas', 'APAC'];
const SECTORS = ['Banking', 'Retail', 'Energy', 'Technology'];
const RATINGS = ['AAA', 'AA', 'A', 'BBB', 'BB'];

export function createRecord(index: number): CompanyRecord {
    const revenue = 400 + ((index * 137) % 900);
    return {
        id: `rec-${index}`,
        name: NAMES[index % NAMES.length] + (index >= NAMES.length ? ` ${Math.floor(index / NAMES.length) + 1}` : ''),
        region: REGIONS[index % REGIONS.length],
        sector: SECTORS[index % SECTORS.length],
        listed: new Date(1995 + ((index * 7) % 28), index % 12, 1 + ((index * 5) % 27)),
        active: index % 5 !== 3,
        revenue,
        costOfSales: Math.round(revenue * (0.45 + (index % 4) * 0.12)),
        operatingCosts: 120 + ((index * 53) % 260),
        assets: 2000 + ((index * 311) % 4000),
        liabilities: 1500 + ((index * 271) % 3800),
        headcount: 150 + ((index * 97) % 1800),
        rating: RATINGS[index % RATINGS.length],
    };
}

export function getData(): CompanyRecord[] {
    const data: CompanyRecord[] = [];
    for (let i = 0; i < 6; i++) {
        data.push(createRecord(i));
    }
    return data;
}
