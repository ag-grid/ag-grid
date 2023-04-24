export function getData(): any[] {
    var countries = [
        'Ireland',
        'Spain',
        'United Kingdom',
        'France',
        'Germany',
        'Luxembourg',
        'Sweden',
        'Norway',
        'Italy',
        'Greece',
        'Iceland',
        'Portugal',
        'Malta',
        'Brazil',
        'Argentina',
        'Colombia',
        'Peru',
        'Venezuela',
        'Uruguay',
        'Belgium',
    ]

    return countries.map(function (country) {
        return {
            country: country,
            sugar: Math.floor(Math.floor(Math.random() * 50)),
            fat: Math.floor(Math.floor(Math.random() * 100)),
            weight: Math.floor(Math.floor(Math.random() * 200)),
        }
    })
}