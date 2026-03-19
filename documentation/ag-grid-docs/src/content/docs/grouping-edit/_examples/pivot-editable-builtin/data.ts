export interface SalesRecord {
    id: string;
    region: string;
    country: string;
    product: string;
    amount: number;
}

export const getData = (): SalesRecord[] => [
    // Europe - Electronics
    { id: 'eu-fr-elec', region: 'Europe', country: 'France', product: 'Electronics', amount: 120 },
    { id: 'eu-de-elec', region: 'Europe', country: 'Germany', product: 'Electronics', amount: 150 },
    { id: 'eu-es-elec', region: 'Europe', country: 'Spain', product: 'Electronics', amount: 80 },
    { id: 'eu-uk-elec', region: 'Europe', country: 'UK', product: 'Electronics', amount: 140 },
    // Europe - Clothing
    { id: 'eu-fr-cloth', region: 'Europe', country: 'France', product: 'Clothing', amount: 60 },
    { id: 'eu-de-cloth', region: 'Europe', country: 'Germany', product: 'Clothing', amount: 90 },
    { id: 'eu-es-cloth', region: 'Europe', country: 'Spain', product: 'Clothing', amount: 50 },
    { id: 'eu-uk-cloth', region: 'Europe', country: 'UK', product: 'Clothing', amount: 75 },
    // Europe - Food
    { id: 'eu-fr-food', region: 'Europe', country: 'France', product: 'Food', amount: 40 },
    { id: 'eu-de-food', region: 'Europe', country: 'Germany', product: 'Food', amount: 55 },
    { id: 'eu-es-food', region: 'Europe', country: 'Spain', product: 'Food', amount: 35 },
    { id: 'eu-uk-food', region: 'Europe', country: 'UK', product: 'Food', amount: 48 },
    // Americas - Electronics
    { id: 'am-us-elec', region: 'Americas', country: 'USA', product: 'Electronics', amount: 200 },
    { id: 'am-ca-elec', region: 'Americas', country: 'Canada', product: 'Electronics', amount: 100 },
    { id: 'am-br-elec', region: 'Americas', country: 'Brazil', product: 'Electronics', amount: 70 },
    // Americas - Clothing
    { id: 'am-us-cloth', region: 'Americas', country: 'USA', product: 'Clothing', amount: 80 },
    { id: 'am-ca-cloth', region: 'Americas', country: 'Canada', product: 'Clothing', amount: 45 },
    { id: 'am-br-cloth', region: 'Americas', country: 'Brazil', product: 'Clothing', amount: 30 },
    // Americas - Food
    { id: 'am-us-food', region: 'Americas', country: 'USA', product: 'Food', amount: 60 },
    { id: 'am-ca-food', region: 'Americas', country: 'Canada', product: 'Food', amount: 35 },
    { id: 'am-br-food', region: 'Americas', country: 'Brazil', product: 'Food', amount: 25 },
];
