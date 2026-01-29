export const getData = (): SalesRecord[] => [
    // Europe - Electronics
    { id: 'eu-fr-elec', region: 'Europe', country: 'France', product: 'Electronics', amount: 120 },
    { id: 'eu-de-elec', region: 'Europe', country: 'Germany', product: 'Electronics', amount: 150 },
    { id: 'eu-es-elec', region: 'Europe', country: 'Spain', product: 'Electronics', amount: 80 },
    { id: 'eu-uk-elec', region: 'Europe', country: 'UK', product: 'Electronics', amount: 140 },
    { id: 'eu-it-elec', region: 'Europe', country: 'Italy', product: 'Electronics', amount: 95 },
    // Europe - Clothing
    { id: 'eu-fr-cloth', region: 'Europe', country: 'France', product: 'Clothing', amount: 60 },
    { id: 'eu-de-cloth', region: 'Europe', country: 'Germany', product: 'Clothing', amount: 90 },
    { id: 'eu-es-cloth', region: 'Europe', country: 'Spain', product: 'Clothing', amount: 50 },
    { id: 'eu-uk-cloth', region: 'Europe', country: 'UK', product: 'Clothing', amount: 75 },
    { id: 'eu-it-cloth', region: 'Europe', country: 'Italy', product: 'Clothing', amount: 85 },
    // Europe - Food
    { id: 'eu-fr-food', region: 'Europe', country: 'France', product: 'Food', amount: 40 },
    { id: 'eu-de-food', region: 'Europe', country: 'Germany', product: 'Food', amount: 55 },
    { id: 'eu-es-food', region: 'Europe', country: 'Spain', product: 'Food', amount: 35 },
    { id: 'eu-uk-food', region: 'Europe', country: 'UK', product: 'Food', amount: 48 },
    { id: 'eu-it-food', region: 'Europe', country: 'Italy', product: 'Food', amount: 52 },
    // Americas - Electronics
    { id: 'am-us-elec', region: 'Americas', country: 'USA', product: 'Electronics', amount: 200 },
    { id: 'am-ca-elec', region: 'Americas', country: 'Canada', product: 'Electronics', amount: 100 },
    { id: 'am-br-elec', region: 'Americas', country: 'Brazil', product: 'Electronics', amount: 70 },
    { id: 'am-mx-elec', region: 'Americas', country: 'Mexico', product: 'Electronics', amount: 65 },
    { id: 'am-ar-elec', region: 'Americas', country: 'Argentina', product: 'Electronics', amount: 45 },
    // Americas - Clothing
    { id: 'am-us-cloth', region: 'Americas', country: 'USA', product: 'Clothing', amount: 80 },
    { id: 'am-ca-cloth', region: 'Americas', country: 'Canada', product: 'Clothing', amount: 45 },
    { id: 'am-br-cloth', region: 'Americas', country: 'Brazil', product: 'Clothing', amount: 30 },
    { id: 'am-mx-cloth', region: 'Americas', country: 'Mexico', product: 'Clothing', amount: 35 },
    { id: 'am-ar-cloth', region: 'Americas', country: 'Argentina', product: 'Clothing', amount: 28 },
    // Americas - Food
    { id: 'am-us-food', region: 'Americas', country: 'USA', product: 'Food', amount: 60 },
    { id: 'am-ca-food', region: 'Americas', country: 'Canada', product: 'Food', amount: 35 },
    { id: 'am-br-food', region: 'Americas', country: 'Brazil', product: 'Food', amount: 25 },
    { id: 'am-mx-food', region: 'Americas', country: 'Mexico', product: 'Food', amount: 32 },
    { id: 'am-ar-food', region: 'Americas', country: 'Argentina', product: 'Food', amount: 22 },
    // Asia Pacific - Electronics
    { id: 'ap-jp-elec', region: 'Asia Pacific', country: 'Japan', product: 'Electronics', amount: 180 },
    { id: 'ap-cn-elec', region: 'Asia Pacific', country: 'China', product: 'Electronics', amount: 220 },
    { id: 'ap-kr-elec', region: 'Asia Pacific', country: 'South Korea', product: 'Electronics', amount: 160 },
    { id: 'ap-au-elec', region: 'Asia Pacific', country: 'Australia', product: 'Electronics', amount: 85 },
    { id: 'ap-in-elec', region: 'Asia Pacific', country: 'India', product: 'Electronics', amount: 110 },
    // Asia Pacific - Clothing
    { id: 'ap-jp-cloth', region: 'Asia Pacific', country: 'Japan', product: 'Clothing', amount: 70 },
    { id: 'ap-cn-cloth', region: 'Asia Pacific', country: 'China', product: 'Clothing', amount: 120 },
    { id: 'ap-kr-cloth', region: 'Asia Pacific', country: 'South Korea', product: 'Clothing', amount: 55 },
    { id: 'ap-au-cloth', region: 'Asia Pacific', country: 'Australia', product: 'Clothing', amount: 40 },
    { id: 'ap-in-cloth', region: 'Asia Pacific', country: 'India', product: 'Clothing', amount: 95 },
    // Asia Pacific - Food
    { id: 'ap-jp-food', region: 'Asia Pacific', country: 'Japan', product: 'Food', amount: 45 },
    { id: 'ap-cn-food', region: 'Asia Pacific', country: 'China', product: 'Food', amount: 75 },
    { id: 'ap-kr-food', region: 'Asia Pacific', country: 'South Korea', product: 'Food', amount: 38 },
    { id: 'ap-au-food', region: 'Asia Pacific', country: 'Australia', product: 'Food', amount: 30 },
    { id: 'ap-in-food', region: 'Asia Pacific', country: 'India', product: 'Food', amount: 55 },
];
