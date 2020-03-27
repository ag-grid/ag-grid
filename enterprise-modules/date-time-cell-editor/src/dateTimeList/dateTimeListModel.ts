export interface IDateTimeListModel {
    getPage(base: Date, number: number): Page;
}

interface Page {
    title: string;
    columns: Column[];
    entries: Entry[];
}

interface Column {
    label: string;
}

interface Entry {
    label: string;
    value: Date;
    // true if this entry has been inserted as padding to make the grid structure
    // align correctly, but is not part of the time period for the page
    isPadding?: boolean;
}

const options = {
    // return the first value of the period
    // date: an arbitrary date that falls within the period
    // offset: a positive or negative integer to return periods after or before the one indicated by {date}
    firstValueInPeriod(date: Date, offset: number) {
        return new Date(date.getFullYear(), date.getMonth() + offset, 1);
    },
    // given the first value in a period and an offset, return a value. Offset can
    // be negative or longer than the period length if the period is padded
    valueInPeriod(first: Date, offset: number) {
        return new Date(first.getFullYear(), first.getMonth(), first.getDate() + offset);
    },
    // return the number of values in a period, not including padding before and after
    periodLength(first: Date) {
        const lastDayOfMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0);
        return lastDayOfMonth.getDate();
    },
    // return the label to show on a single entry within a period
    entryLabel(value: Date) {
        return new Intl.DateTimeFormat('default', { day: 'numeric' }).format(value);
    },
    // Given the first value in a period, return the number of columns required to render the period
    columnCount(first: Date) {
        return 7;
    },
    // Return the column that a value should be in, where 0 is the first column. If numbers outside
    // the range 0 - `columnCount` are returned they will be wrapped into that range
    columnForValue(value: Date) {
        return (value.getDay() + 6) % 7;
    },
    // return the label to show on a single entry within a period
    columnTitle(value: Date) {
        return new Intl.DateTimeFormat('default', { weekday: 'narrow' }).format(value);
    },
};

export class DateTimeListModel implements IDateTimeListModel {

    public getPage(date: Date, offset: number): Page {

        const entries: Entry[] = [];
        const firstValue = options.firstValueInPeriod(date, offset);
        const columnCount = options.columnCount(firstValue);
        const paddingAtStart = modulo(options.columnForValue(firstValue), columnCount); // adds padding at start
        const periodLength = options.periodLength(firstValue);
        const lastValue = options.valueInPeriod(firstValue, periodLength - 1);
        const paddingAtEnd = modulo(columnCount - options.columnForValue(lastValue) - 2, columnCount);
        const lastOffset = periodLength + paddingAtEnd;
        for (let i = -paddingAtStart; i <= lastOffset; i++) {
            const value = options.valueInPeriod(firstValue, i);
            entries.push({
                value,
                label: options.entryLabel(value),
                isPadding: i < 0 || i >= periodLength,
            });
        }

        const columns = Array(options.columnCount(firstValue))
            .fill(null)
            .map((_, i) => ({
                label: options.columnTitle(entries[i].value)
            }));

        const titleFormat = new Intl.DateTimeFormat('default', { month: 'long', year: 'numeric' });
        return {
            entries,
            columns,
            title: titleFormat.format(firstValue),
        };
    }
}

// modulo function that, unline the JS % operator, is safe for negative numbers
const modulo = (value: number, modulo: number) => ((value % modulo) + modulo) % modulo;
