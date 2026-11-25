export interface SaleRow {
    region: string;
    product: string;
    units: number;
    revenue: number;
    unitPrice: number;
}

export function getData(): SaleRow[] {
    return [
        { region: 'North', product: 'Laptop', units: 2, revenue: 2400, unitPrice: 1200 },
        { region: 'North', product: 'Mouse', units: 40, revenue: 800, unitPrice: 20 },
        { region: 'North', product: 'Monitor', units: 5, revenue: 1500, unitPrice: 300 },
        { region: 'South', product: 'Laptop', units: 6, revenue: 6600, unitPrice: 1100 },
        { region: 'South', product: 'Mouse', units: 10, revenue: 250, unitPrice: 25 },
        { region: 'South', product: 'Keyboard', units: 20, revenue: 1000, unitPrice: 50 },
    ];
}
