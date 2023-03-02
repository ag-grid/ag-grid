// Source: https://www.gov.uk/government/statistics/alcohol-bulletin
let year = new Date().getFullYear() - 20;
export function getData(): any[] {
    return [
        { year: `${year++}`, stillWine: 8880946.349, sparklingWine: 533187, wineOver15: 283625, madeWine: 3229193.201, whisky: 321370, potableSpirits: 4209658, beer: 55560000, cider: 6006000 },
        { year: `${year++}`, stillWine: 9538893.772, sparklingWine: 510478, wineOver15: 284198, madeWine: 4076047.6, whisky: 326002, potableSpirits: 4367789, beer: 55303000, cider: 5911000 },
        { year: `${year++}`, stillWine: 10325729.02, sparklingWine: 571022, wineOver15: 320255, madeWine: 1965879.301, whisky: 328875, potableSpirits: 4508147, beer: 55672000, cider: 5939000 },
        { year: `${year++}`, stillWine: 10661812.01, sparklingWine: 632942, wineOver15: 293087, madeWine: 762813.6729, whisky: 324715, potableSpirits: 4552539, beer: 58016000, cider: 5876000 },
        { year: `${year++}`, stillWine: 11762464.97, sparklingWine: 667980, wineOver15: 294419, madeWine: 858917.5762, whisky: 328304, potableSpirits: 4080834, beer: 57461000, cider: 6139000 },
        { year: `${year++}`, stillWine: 12139448.22, sparklingWine: 712725, wineOver15: 302389, madeWine: 932512.8384, whisky: 308978, potableSpirits: 4364669, beer: 56253000, cider: 6440000 },
        { year: `${year++}`, stillWine: 11663073.5, sparklingWine: 706419, wineOver15: 297984, madeWine: 844398.7679, whisky: 290537, potableSpirits: 4485270, beer: 53768000, cider: 7523000 },
        { year: `${year++}`, stillWine: 12578475.02, sparklingWine: 829693, wineOver15: 301944, madeWine: 1069907.227, whisky: 293311, potableSpirits: 5498490, beer: 51341000, cider: 8047000 },
        { year: `${year++}`, stillWine: 12426433.65, sparklingWine: 748145, wineOver15: 319985, madeWine: 994426.5698, whisky: 296016, potableSpirits: 6072239, beer: 49611000, cider: 8414000 },
        { year: `${year++}`, stillWine: 11738731.88, sparklingWine: 721709, wineOver15: 216249, madeWine: 988998.7394, whisky: 262680, potableSpirits: 5756752, beer: 45141000, cider: 9404000 },
        { year: `${year++}`, stillWine: 11896446.68, sparklingWine: 794491, wineOver15: 216078, madeWine: 1162655.461, whisky: 272850, potableSpirits: 5073551, beer: 44997000, cider: 9309000 },
        { year: `${year++}`, stillWine: 11843704, sparklingWine: 799538, wineOver15: 216517, madeWine: 1274651.293, whisky: 257294, potableSpirits: 5696986, beer: 45694000, cider: 9280000 },
        { year: `${year++}`, stillWine: 11705404.94, sparklingWine: 872345, wineOver15: 223867, madeWine: 1427115.611, whisky: 257805, potableSpirits: 6185095, beer: 42047000, cider: 8737000 },
        { year: `${year++}`, stillWine: 11585698.74, sparklingWine: 925118, wineOver15: 227717, madeWine: 1821651.405, whisky: 244905, potableSpirits: 8433710, beer: 41956000, cider: 8640000 },
        { year: `${year++}`, stillWine: 11243598.86, sparklingWine: 1117124, wineOver15: 201323, madeWine: 2187221.346, whisky: 233186, potableSpirits: 8667957, beer: 41204000, cider: 7937000 },
        { year: `${year++}`, stillWine: 11209743.85, sparklingWine: 1375241, wineOver15: 196290, madeWine: 2452432.401, whisky: 237834, potableSpirits: 8967478, beer: 41270000, cider: 7758000 },
        { year: `${year++}`, stillWine: 11181926.5, sparklingWine: 1547326, wineOver15: 205651, madeWine: 2694459.237, whisky: 244165, potableSpirits: 8602713, beer: 38084000, cider: 7214000 },
        { year: `${year++}`, stillWine: 11322702.64, sparklingWine: 1628199, wineOver15: 204102, madeWine: 2845308.372, whisky: 241039, potableSpirits: 5830893, beer: 40480000, cider: 7410000 },
        { year: `${year++}`, stillWine: 11110241.76, sparklingWine: 1606374, wineOver15: 185047, madeWine: 2783241.203, whisky: 227051, potableSpirits: 4296195, beer: 40730000, cider: 6804000 },
        { year: `${year++}`, stillWine: 10868915.29, sparklingWine: 1523396, wineOver15: 194125, madeWine: 2709812.303, whisky: 227180, potableSpirits: 3815834, beer: 40844000, cider: 3647000 },
    ];
}