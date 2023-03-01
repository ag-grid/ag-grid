// Source: https://www.gov.uk/government/statistical-data-sets/structure-of-the-livestock-industry-in-england-at-december
// Source: http://beefandlamb.ahdb.org.uk/markets/industry-reports/uk-statistics/
let year = new Date().getFullYear() - 7;
export function getData(): any[] {
    return [
        { year: `${year++}`, male: 1480, female: 3843, exportedTonnes: 105311 },
        { year: `${year++}`, male: 1440, female: 3868, exportedTonnes: 112260 },
        { year: `${year++}`, male: 1457, female: 3900, exportedTonnes: 100491 },
        { year: `${year++}`, male: 1460, female: 3895, exportedTonnes: 110428 },
        { year: `${year++}`, male: 1456, female: 3891, exportedTonnes: 105601 },
        { year: `${year++}`, male: 1425, female: 3837, exportedTonnes: 110508 },
        { year: `${year++}`, male: 1371, female: 3775, exportedTonnes: 135198 },
    ];
}