import { _makeNull } from 'ag-stack';

import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export function getAllowedCharPattern(filterParams?: INumberFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

/** A number input holds only its own grammar, which is neither what a pattern admits nor what a formatter writes. */
export function usesTextInput(filterParams?: INumberFilterParams): boolean {
    return filterParams?.allowedCharPattern != null || filterParams?.numberFormatter != null;
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
