function getData() {
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

    return countries.map(function (country, index) {
        var group = index % 2 === 0 ? 'Group A' : 'Group B'

        return {
            country: country,
            group: group,
            gold: Math.floor(((index + 1 / 7) * 333) % 100),
            silver: Math.floor(((index + 1 / 3) * 555) % 100),
            bronze: Math.floor(((index + 1 / 7.3) * 777) % 100),
            a: Math.floor(Math.random() * 1000),
            b: Math.floor(Math.random() * 1000),
            c: Math.floor(Math.random() * 1000),
            d: Math.floor(Math.random() * 1000),
        }
    })
}