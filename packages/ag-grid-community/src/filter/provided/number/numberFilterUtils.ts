import { _makeNull } from 'ag-stack';

import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export function getAllowedCharPattern(filterParams?: INumberFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

/**
 * Whether `formatted` is text the mounted input can hold and the filter can read back as the same number.
 * A number input accepts only what `Number` accepts, whatever a `numberParser` could otherwise make of it.
 */
export function readsBackAsSameNumber(
    formatted: string | null,
    value: number,
    usesTextInput: boolean,
    numberParser: INumberFilterParams['numberParser']
): boolean {
    if (formatted == null || formatted.trim() === '') {
        return false;
    }
    return (usesTextInput ? stringToFloat(numberParser, formatted) : Number(formatted)) === value;
}

/** The one reading of a typed value: `numberParser` owns it wherever it is configured. */
export function stringToFloat(
    numberParser: INumberFilterParams['numberParser'],
    value?: string | number | null
): number | null {
    if (typeof value === 'number') {
        return value;
    }

    let filterText = _makeNull(value);

    if (filterText?.trim() === '') {
        filterText = null;
    }

    if (numberParser) {
        return numberParser(filterText);
    }

    return filterText == null || filterText.trim() === '-' ? null : Number.parseFloat(filterText);
}

export function processNumberFilterValue(value?: number | null): number | null {
    if (value == null) {
        return null;
    }
    return isNaN(value) ? null : value;
}

export function mapValuesFromNumberFilterModel(
    filterModel: NumberFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<number> {
    const { filter, filterTo, type } = filterModel || {};
    return [processNumberFilterValue(filter), processNumberFilterValue(filterTo)].slice(
        0,
        getNumberOfInputs(type, optionsFactory)
    );
}
