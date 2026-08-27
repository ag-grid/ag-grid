import { _parseDateTimeFromString } from 'ag-stack';

import type { LogService } from '../../../validation/logService';
import type { IDateFilterParams } from './iDateFilter';

const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;

/** A Date Filter's validity bounds resolved once. */
export interface ResolvedDateBounds {
    readonly minValidYear: number;
    readonly maxValidYear: number;
    readonly minValidDate: Date | null;
    readonly maxValidDate: Date | null;
    /** What the date input is actually held to: the date where one was given, else the year's edge. */
    readonly minBound: Date | null;
    readonly maxBound: Date | null;
}

const readYear = (
    params: IDateFilterParams,
    param: 'minValidYear' | 'maxValidYear',
    fallback: number,
    log: LogService | undefined,
    colId: string
): number => {
    const value = params[param];
    if (value == null) {
        return fallback;
    }
    const year = Number(value);
    if (Number.isNaN(year)) {
        log?.warn(82, { param, colId }); // a validity year that is not a number
        return fallback;
    }
    return year;
};

/** Built from the resolved year, so a year the filter fell back on is not held to the one it rejected. */
const yearEdge = (named: unknown, year: number, monthDay: string): Date | null =>
    named != null && Number.isFinite(year) ? _parseDateTimeFromString(`${year}-${monthDay}`) : null;

/**
 * One definition, so the bounds the filter holds inputs to and the bounds reported at configuration
 * cannot describe different rules.
 */
export const resolveDateBounds = (
    params: IDateFilterParams,
    log?: LogService,
    colId: string = ''
): ResolvedDateBounds => {
    const minValidYear = readYear(params, 'minValidYear', DEFAULT_MIN_YEAR, log, colId);
    const maxValidYear = readYear(params, 'maxValidYear', DEFAULT_MAX_YEAR, log, colId);
    const yearsInverted = minValidYear > maxValidYear;
    if (yearsInverted) {
        log?.warn(83, { colId }); // `minValidYear` above `maxValidYear`
    }

    const { minValidDate: min, maxValidDate: max } = params;
    const minValidDate = min instanceof Date ? min : _parseDateTimeFromString(min);
    const maxValidDate = max instanceof Date ? max : _parseDateTimeFromString(max);
    const datesInverted = !!minValidDate && !!maxValidDate && minValidDate > maxValidDate;
    if (datesInverted) {
        log?.warn(84, { colId }); // `minValidDate` above `maxValidDate`
    }

    // A date given for an end supersedes a year given for the same end, so the year is only ever the edge
    // of an end that has no date. Reported from the parsed date: a malformed one supersedes nothing.
    const minBound = minValidDate ?? yearEdge(params.minValidYear, minValidYear, '01-01');
    const maxBound = maxValidDate ?? yearEdge(params.maxValidYear, maxValidYear, '12-31');
    if (minValidDate && params.minValidYear) {
        log?.warn(85, { colId }); // `minValidYear` ignored, `minValidDate` supersedes it
    }
    if (maxValidDate && params.maxValidYear) {
        log?.warn(86, { colId }); // `maxValidYear` ignored, `maxValidDate` supersedes it
    }
    // Only where neither end has already been reported: 83 and 84 name the pair that inverted them, so 87
    // as well would report one misconfiguration twice.
    if (!yearsInverted && !datesInverted && minBound && maxBound && minBound > maxBound) {
        log?.warn(87, { colId }); // the effective bounds are inverted, whichever end came from a year
    }

    return { minValidYear, maxValidYear, minValidDate, maxValidDate, minBound, maxBound };
};
