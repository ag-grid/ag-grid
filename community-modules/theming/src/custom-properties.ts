import { _errorOnce } from '@ag-grid-community/core';

import { type AllParams, paramValueToCss } from './theme-types';
import { paramToVariableName } from './theme-utils';

/**
 * Set theme params as custom properties on an element.
 *
 * e.g. applyCustomProperties({ gridSize: 4 }, document.body) is equivalent to
 * document.body.style.setProperty('--ag-grid-size', '4px');
 */
export const applyCustomProperties = (params: Partial<AllParams>, el: HTMLElement) => {
    for (const [key, value] of getCustomProperties(params)) {
        el.style.setProperty(key, value);
    }
};

/**
 * Convert a record of params to an array of CSS custom properties name/value pair tuples
 *
 * e.g. getCustomProperties({ gridSize: 4 }) -> [['--ag-grid-size', '4px']]
 */
export const getCustomProperties = (params: Partial<AllParams>): Array<[string, string]> => {
    const result: Array<[string, string]> = [];
    for (const [key, value] of Object.entries(params)) {
        const rendered = paramValueToCss(key, value);
        if (rendered === false) {
            _errorOnce(`Invalid value for param ${key} - ${describeValue(value)}`);
        } else {
            result.push([paramToVariableName(key), rendered]);
        }
    }
    return result;
};

const describeValue = (value: any): string => {
    if (value == null) return String(value);
    return `${typeof value} ${value}`;
};
