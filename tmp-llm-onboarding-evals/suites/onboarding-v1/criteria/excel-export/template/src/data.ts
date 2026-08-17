export interface SaleRecord {
    id: number;
    region: string;
    product: string;
    quarter: string;
    units: number;
    revenue: number;
}

const REGIONS = ['North', 'South', 'East', 'West'];
const PRODUCTS = ['Widget', 'Gadget', 'Doohickey', 'Thingamajig'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export function makeSales(count: number): SaleRecord[] {
    const rows: SaleRecord[] = [];
    for (let i = 0; i < count; i++) {
        const units = 20 + ((i * 37) % 400);
        rows.push({
            id: i + 1,
            region: REGIONS[i % REGIONS.length],
            product: PRODUCTS[Math.floor(i / REGIONS.length) % PRODUCTS.length],
            quarter: QUARTERS[Math.floor(i / (REGIONS.length * PRODUCTS.length)) % QUARTERS.length],
            units,
            revenue: units * (12 + ((i * 13) % 40)),
        });
    }
    return rows;
}
