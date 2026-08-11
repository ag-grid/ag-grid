import type { LocaleTextFunc } from 'ag-stack';

import type { FilterWrapperParams } from '../../interfaces/iFilter';
import type { LogService } from '../../validation/logService';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import { translateForFilter } from '../filterLocaleText';
import type { IProvidedFilterParams } from './iProvidedFilter';
import type { FilterOptionKey, FilterPlaceholderFunction } from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';

export function getDebounceMs(log: LogService, params: IProvidedFilterParams, debounceDefault: number): number {
    const { debounceMs } = params;
    if (_isUseApplyButton(params)) {
        if (debounceMs != null) {
            log.warn(71);
        }

        return 0;
    }

    return debounceMs ?? debounceDefault;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isUseApplyButton(params: FilterWrapperParams): boolean {
    return (params.buttons?.indexOf('apply') ?? -1) >= 0;
}

export function getPlaceholderText(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    filterPlaceholder: string | FilterPlaceholderFunction | undefined,
    defaultPlaceholder: FilterLocaleTextKey,
    filterOptionKey: FilterOptionKey,
    optionsFactory: OptionsFactory
): string {
    let placeholder = translateForFilter(bean, defaultPlaceholder);
    if (typeof filterPlaceholder === 'function') {
        // Localised through its own `displayKey`, as the dropdown label for the same option is.
        const customOption = optionsFactory.getCustomOption(filterOptionKey);
        const filterOption = customOption
            ? bean.getLocaleTextFunc()(customOption.displayKey, customOption.displayName)
            : translateForFilter(bean, filterOptionKey as FilterLocaleTextKey);
        placeholder = filterPlaceholder({
            filterOptionKey,
            filterOption,
            placeholder,
        });
    } else if (typeof filterPlaceholder === 'string') {
        placeholder = filterPlaceholder;
    }

    return placeholder;
}
