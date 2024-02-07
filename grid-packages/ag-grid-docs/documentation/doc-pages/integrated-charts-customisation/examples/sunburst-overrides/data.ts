export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise(resolve => setTimeout(() => resolve(generateData()), delay));
}

function generateData(): any[] {
    return [
        { continent: 'Americas', country: 'United States', gdp: 26.949, gdpChange: 0.06 },
        { continent: 'Americas', country: 'Canada', gdp: 2.117, gdpChange: 0 },
        { continent: 'Americas', country: 'Brazil', gdp: 2.126, gdpChange: 0.11 },
        { continent: 'Asia', country: 'China', gdp: 17.7, gdpChange: 0 },
        { continent: 'Asia', country: 'Japan', gdp: 4.23, gdpChange: 0 },
        { continent: 'Asia', country: 'India', gdp: 4.0, gdpChange: 0.2 },
        { continent: 'Europe', country: 'Germany', gdp: 4.429, gdpChange: 0.09 },
        { continent: 'Europe', country: 'France', gdp: 3.049, gdpChange: 0.1 },
        { continent: 'Europe', country: 'Italy', gdp: 2.186, gdpChange: 0.09 },
        { continent: 'Europe', country: 'United Kingdom', gdp: 3.332, gdpChange: 0.09 },
    ];
}