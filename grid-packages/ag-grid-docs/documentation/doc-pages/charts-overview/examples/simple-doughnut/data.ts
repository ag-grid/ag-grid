// Source: https://www.gov.uk/government/statistical-data-sets/fire-statistics-data-tables
export function getData(): any[] {
    return [
        { type: 'House - single occupancy', count: 15349 },
        { type: 'Bungalow - single occupancy', count: 1656 },
        { type: 'Converted Flat/Maisonette - single occupancy', count: 2147 },
        { type: 'Purpose Built Low Rise (1-3) Flats/Maisonettes', count: 4954 },
        { type: 'Purpose Built Medium Rise (4-9) Flats', count: 1887 },
        { type: 'Purpose Built High Rise (10+) Flats', count: 820 },
        { type: 'Dwelling - multiple occupancy', count: 610 },
        { type: 'Other dwelling', count: 2147 },
    ];
}
