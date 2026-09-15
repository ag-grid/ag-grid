import type { GridApi, SortModelItem } from 'ag-grid-community';

export interface IAthlete {
    athlete: string;
    age: number;
    date: Date;
    dateStr: string;
    hasGold: boolean;
}

/** A column of each inferable type: text, number, date, dateString and boolean. */
export const ROW_DATA: IAthlete[] = [
    { athlete: 'Michael Phelps', age: 23, date: new Date(2008, 7, 24), dateStr: '2008-08-24', hasGold: true },
    { athlete: 'Natalie Coughlin', age: 25, date: new Date(2008, 7, 24), dateStr: '2008-08-24', hasGold: false },
    { athlete: 'Aleksey Nemov', age: 24, date: new Date(2000, 9, 1), dateStr: '2000-10-01', hasGold: false },
    { athlete: 'Alicia Coutts', age: 24, date: new Date(2012, 7, 12), dateStr: '2012-08-12', hasGold: true },
    { athlete: 'Missy Franklin', age: 17, date: new Date(2012, 7, 12), dateStr: '2012-08-12', hasGold: true },
    { athlete: 'Ryan Lochte', age: 27, date: new Date(2012, 7, 12), dateStr: '2012-08-12', hasGold: true },
    { athlete: 'Allison Schmitt', age: 22, date: new Date(2012, 7, 12), dateStr: '2012-08-12', hasGold: true },
    { athlete: 'Ian Thorpe', age: 17, date: new Date(2000, 9, 1), dateStr: '2000-10-01', hasGold: true },
    { athlete: 'Dara Torres', age: 33, date: new Date(2000, 9, 1), dateStr: '2000-10-01', hasGold: false },
    { athlete: 'Kirsty Coventry', age: 24, date: new Date(2008, 7, 24), dateStr: '2008-08-24', hasGold: true },
];

/**
 * Off the Client-Side Row Model the grid does not filter or sort the rows itself: it hands the models
 * to the datasource, which is expected to apply them. These functions stand in for that server.
 */
export function queryRows(filterModel?: Record<string, any>, sortModel?: SortModelItem[]): IAthlete[] {
    let rows = ROW_DATA;
    for (const [field, model] of Object.entries(filterModel ?? {})) {
        rows = rows.filter((row) => matchesFilter(row[field as keyof IAthlete], model));
    }
    return sortRows(rows, sortModel);
}

/** The sort the user has applied, in the shape the block-based datasources are given it. */
export function getSortModel(api: GridApi): SortModelItem[] {
    return api
        .getColumnState()
        .filter(({ sort }) => sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map(({ colId, sort }) => ({ colId, sort: sort! }));
}

function asDate(value: any): number | null {
    if (value == null) {
        return null;
    }
    // date filters send 'YYYY-MM-DD hh:mm:ss', and a dateString column holds 'YYYY-MM-DD'
    const date = value instanceof Date ? value : new Date(String(value).replace(' ', 'T'));
    return isNaN(date.getTime()) ? null : new Date(date).setHours(0, 0, 0, 0);
}

function matchesFilter(value: any, model: any): boolean {
    const { filterType, type, filter, filterTo, dateFrom, dateTo } = model;
    const isBlank = value == null || value === '';

    switch (type) {
        case 'blank':
            return isBlank;
        case 'notBlank':
            return !isBlank;
        // the boolean data type's filter offers True/False, which take no input
        case 'true':
            return value === true;
        case 'false':
            return value === false;
    }

    if (filterType === 'date') {
        const cell = asDate(value);
        const from = asDate(dateFrom);
        const to = asDate(dateTo);
        if (cell == null || from == null) {
            return false;
        }
        switch (type) {
            case 'equals':
                return cell === from;
            case 'notEqual':
                return cell !== from;
            case 'greaterThan':
                return cell > from;
            case 'lessThan':
                return cell < from;
            case 'inRange':
                return to != null && cell >= from && cell <= to;
        }
        return true;
    }

    if (filterType === 'number') {
        if (value == null || filter == null) {
            return false;
        }
        switch (type) {
            case 'equals':
                return value === filter;
            case 'notEqual':
                return value !== filter;
            case 'greaterThan':
                return value > filter;
            case 'greaterThanOrEqual':
                return value >= filter;
            case 'lessThan':
                return value < filter;
            case 'lessThanOrEqual':
                return value <= filter;
            case 'inRange':
                return filterTo != null && value >= filter && value <= filterTo;
        }
        return true;
    }

    const text = String(value ?? '').toLowerCase();
    const term = String(filter ?? '').toLowerCase();
    switch (type) {
        case 'equals':
            return text === term;
        case 'notEqual':
            return text !== term;
        case 'notContains':
            return !text.includes(term);
        case 'startsWith':
            return text.startsWith(term);
        case 'endsWith':
            return text.endsWith(term);
        default:
            return text.includes(term);
    }
}

function sortRows(rows: IAthlete[], sortModel?: SortModelItem[]): IAthlete[] {
    if (!sortModel?.length) {
        return rows;
    }
    return [...rows].sort((a, b) => {
        for (const { colId, sort } of sortModel) {
            const comparison = compare(a[colId as keyof IAthlete], b[colId as keyof IAthlete]);
            if (comparison !== 0) {
                return sort === 'desc' ? -comparison : comparison;
            }
        }
        return 0;
    });
}

function compare(a: any, b: any): number {
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }
    return Number(a) - Number(b);
}
