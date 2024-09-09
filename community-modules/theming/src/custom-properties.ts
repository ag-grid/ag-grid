import { _errorOnce } from '@ag-grid-community/core';

import type { CoreParams } from './styles/core/core-css';
import type { CheckboxStyleParams } from './styles/parts/checkbox-style/checkbox-styles';
import type { InputStyleParams } from './styles/parts/input-style/input-styles';
import type { TabStyleParams } from './styles/parts/tab-style/tab-styles';
import type { PrimaryColorParams } from './styles/parts/theme/primary-color';
import { paramValueToCss } from './theme-types';
import { paramToVariableName } from './theme-utils';

type AllParams = CoreParams & CheckboxStyleParams & TabStyleParams & InputStyleParams & PrimaryColorParams;

/**
 * Set theme params as custom properties on an element.
 *
 * e.g. theme.applyCustomProperties({ gridSize: 4 }, document.body) is
 * equivalent to document.body.style.setProperty('--ag-grid-size', '4px');
 *
 * This method is equivalent to the global applyCustomProperties function,
 * except that it provides typescript validation of the params object, only
 * permitting values that are supported by the current theme.
 */
export const applyCustomProperties = (params: Partial<AllParams>, el: HTMLElement) => {
    for (const [key, value] of getCustomProperties(params)) {
        el.style.setProperty(key, value);
    }
    return this;
};

export const getCustomProperties = (params: Record<string, unknown>): Array<[string, string]> => {
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
