export function getData(): any[] {
    const rowData: any[] = [
        { country: 'Ireland', state: null, city: 'Dublin' },
        { country: 'Ireland', state: null, city: 'Galway' },
        { country: 'Ireland', state: null, city: 'Cork' },

        { country: 'United Kingdom', state: null, city: 'London' },
        { country: 'United Kingdom', state: null, city: 'Manchester' },
        { country: 'United Kingdom', state: null, city: 'Liverpool' },

        { country: 'USA', state: 'New York', city: 'New York' },
        { country: 'USA', state: 'New York', city: 'Albany' },
        { country: 'USA', state: 'New York', city: 'Onondaga' },
        { country: 'USA', state: 'New York', city: 'Westchester' },

        { country: 'USA', state: 'California', city: 'San Diego' },
        { country: 'USA', state: 'California', city: 'San Francisco' },
    ]

    rowData.forEach(function (item, i) {
        item.val1 = ((i + 13) * 17 * 33) % 1000
        item.val2 = ((i + 23) * 17 * 33) % 1000
    })
    return rowData;
}