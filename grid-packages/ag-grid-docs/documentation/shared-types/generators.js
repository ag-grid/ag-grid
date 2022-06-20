function getGenericInterface(tData) {
    switch (tData) {
        case 'IOlympicData':
            return `
export interface IOlympicData {
    athlete: string,
    age: number,
    country: string,
    year: number,
    date: string,
    sport: string,
    gold: number,
    silver: number,
    bronze: number,
    total: number
}`
    }

    return ''
}

module.exports = getGenericInterface