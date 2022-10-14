// Source: https://www.gov.uk/government/statistical-data-sets/fire-statistics-data-tables
export function getData(): any[] {
    return [
        { type: 'House - single occupancy', '2018/19': 15349 },
        { type: 'Bungalow - single occupancy', '2018/19': 1656 },
        { type: 'Converted Flat/Maisonette - single occupancy', '2018/19': 2147 },
        { type: 'Purpose Built Low Rise (1-3) Flats/Maisonettes', '2018/19': 4954 },
        { type: 'Purpose Built Medium Rise (4-9) Flats', '2018/19': 1887 },
        { type: 'Purpose Built High Rise (10+) Flats', '2018/19': 820 },
        { type: 'Dwelling - multiple occupancy', '2018/19': 610 },
        { type: 'Other dwelling', '2018/19': 2147 },
    ];
}
