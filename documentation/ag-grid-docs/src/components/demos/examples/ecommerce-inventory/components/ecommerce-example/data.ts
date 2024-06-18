export function getData() {
    const data = [
        {
            product: 'Rumours',
            artist: 'Fleetwood Mac',
            category: 'Soft Rock',
            year: '1977',
            status: 'Active',
            whenSoldOut: 'Back order',
            available: 12,
            incoming: 45,
            image: 'rumours',
            price: 40,
            sold: 15,
            priceIncrease: 5, // in percentage
            variants: 3,
            variantDetails: [
                {
                    title: 'Rumours',
                    available: '4',
                    format: 'LP, Album, Picture Disc, Reissue',
                    label: 'Warner Records',
                    cat: 'RPD1 3010',
                    country: 'Worldwide',
                    year: '2024',
                },
                {
                    title: 'Rumours',
                    available: '6',
                    format: 'Blu-Ray, Album, Reissue, Dolby Atoms',
                    label: 'Warner Records',
                    cat: 'BA2 3010',
                    country: 'Worldwide',
                    year: '2024',
                },
                {
                    title: 'Rumours',
                    available: '2',
                    format: 'CD, Album, Reissue, Remastered',
                    label: 'Warner Records',
                    cat: 'R2 599763',
                    country: 'Worldwide',
                    year: '2024',
                },
            ],
        },
        {
            product: 'Actually',
            artist: 'Pet Shop Boys',
            category: 'Synth-pop',
            year: '1987',
            status: 'Active',
            whenSoldOut: 'Discontinue',
            available: 25,
            incoming: 0,
            image: 'actually',
            price: 25,
            sold: 10,
            priceIncrease: 10,
            variants: 2,
            variantDetails: [
                {
                    title: 'Actually',
                    available: '13',
                    format: 'LP, Album, Reissue, 180 Gram',
                    label: 'Parlophone',
                    cat: '0190295832612',
                    country: 'USA & Europe',
                    year: '2018',
                },
                {
                    title: 'Actually / Further Listening 1987-1988',
                    available: '12',
                    format: 'CD, Album, Compilation; All Media, Reissue, Remastered',
                    label: 'Warner Records',
                    cat: '01902958262222',
                    country: 'Europe',
                    year: '2018',
                },
            ],
        },
    ];

    // Map products to the new structure with variant counts
    return data.map((product) => ({
        ...product,
    }));
}
