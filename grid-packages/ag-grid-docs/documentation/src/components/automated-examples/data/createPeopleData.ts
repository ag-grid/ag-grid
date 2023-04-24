import { randomBetween, simpleRandomSort } from '../lib/random';
import { countries, firstNames, lastNames, months } from './constants';

const DEFAULT_ROW_COUNT = 100;

interface createPeopleDataParams {
    rowCount?: number;
    randomize?: boolean;
}

interface YearRecord {
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
    nov: number;
    dec: number;
}

interface PersonRecord extends YearRecord {
    name: string;
    country: string;
    continent: string;
    language: string;
    totalWinnings: number;
}

function createRowData({ rowCount, randomize }: { rowCount: number; randomize?: boolean }): PersonRecord[] {
    const data: PersonRecord[] = [];
    for (let i = 0; i < rowCount; i++) {
        const personRecord = createPersonRecord({ row: i, randomize });
        data.push(personRecord);
    }
    return data;
}

function createPersonRecord({ row, randomize }: { row: number; randomize?: boolean }): PersonRecord {
    const firstName = firstNames[row % firstNames.length];
    const lastNameIndex = randomize ? randomBetween(0, lastNames.length - 1) : row % lastNames.length;
    const lastName = lastNames[lastNameIndex];
    const name = `${firstName} ${lastName}`;

    const countriesToPickFrom = Math.floor(countries.length * (((row % 3) + 1) / 3));
    const countryData = countries[(row * 19) % countriesToPickFrom];
    const country = countryData.country;
    const continent = countryData.continent;
    const language = countryData.language;

    let totalWinnings = 0;
    const yearRecord: YearRecord = {} as YearRecord;
    months.forEach((month) => {
        const value = randomBetween(10000, 100000);
        yearRecord[month.toLocaleLowerCase()] = value;
        totalWinnings += value;
    });

    const rowItem: PersonRecord = {
        name,
        country,
        continent,
        language,
        ...yearRecord,
        totalWinnings,
    };

    return rowItem;
}

export function createPeopleData({ rowCount = DEFAULT_ROW_COUNT, randomize }: createPeopleDataParams): PersonRecord[] {
    return randomize ? simpleRandomSort(createRowData({ rowCount, randomize })) : createRowData({ rowCount });
}
