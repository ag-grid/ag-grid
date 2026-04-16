export interface SalesRecord {
    id: string;
    region: string;
    country: string;
    sales: number;
}

export function getData(): SalesRecord[] {
    return [
        // Europe
        { id: 'fr-1', region: 'Europe', country: 'France', sales: 120 },
        { id: 'fr-2', region: 'Europe', country: 'France', sales: 80 },
        { id: 'de-1', region: 'Europe', country: 'Germany', sales: 150 },
        { id: 'de-2', region: 'Europe', country: 'Germany', sales: 110 },
        { id: 'es-1', region: 'Europe', country: 'Spain', sales: 90 },
        { id: 'es-2', region: 'Europe', country: 'Spain', sales: 70 },

        // Americas
        { id: 'us-1', region: 'Americas', country: 'USA', sales: 200 },
        { id: 'us-2', region: 'Americas', country: 'USA', sales: 160 },
        { id: 'ca-1', region: 'Americas', country: 'Canada', sales: 100 },
        { id: 'ca-2', region: 'Americas', country: 'Canada', sales: 80 },
        { id: 'br-1', region: 'Americas', country: 'Brazil', sales: 70 },
        { id: 'br-2', region: 'Americas', country: 'Brazil', sales: 50 },

        // Asia Pacific
        { id: 'jp-1', region: 'Asia Pacific', country: 'Japan', sales: 180 },
        { id: 'jp-2', region: 'Asia Pacific', country: 'Japan', sales: 140 },
        { id: 'au-1', region: 'Asia Pacific', country: 'Australia', sales: 110 },
        { id: 'au-2', region: 'Asia Pacific', country: 'Australia', sales: 90 },
    ];
}
