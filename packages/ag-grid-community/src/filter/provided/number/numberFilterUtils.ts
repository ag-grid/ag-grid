import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export function getAllowedCharPattern(filterParams?: INumberFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

/** A pattern usually admits characters, and a formatter writes text, that a number input's own grammar rejects. */
export function usesTextInput(filterParams?: INumberFilterParams): boolean {
    const filterInputType = filterParams?.filterInputType;
    if (filterInputType) {
        return filterInputType === 'text';
    }
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

    const trimmed = value?.trim() ?? '';
    // The parser gets the text as typed; only the emptiness and half-typed tests want it trimmed.
    const filterText = trimmed === '' ? null : (value ?? null);

    if (numberParser) {
        return numberParser(filterText);
    }

    return filterText == null || trimmed === '-' ? null : Number.parseFloat(filterText);
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
