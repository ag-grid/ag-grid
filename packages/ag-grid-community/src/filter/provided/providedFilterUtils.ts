import type { LocaleTextFunc } from '../../agStack/interfaces/iLocaleService';
import type { FilterWrapperParams } from '../../interfaces/iFilter';
import { _warn } from '../../validation/logging';
import { translateForFilter } from '../filterLocaleText';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import type { IProvidedFilterParams } from './iProvidedFilter';
import type { FilterPlaceholderFunction, ISimpleFilterModelType } from './iSimpleFilter';

export function getDebounceMs(params: IProvidedFilterParams, debounceDefault: number): number {
    const { debounceMs } = params;
    if (_isUseApplyButton(params)) {
        if (debounceMs != null) {
            _warn(71);
        }

        return 0;
    }

    return debounceMs ?? debounceDefault;
}

export function _isUseApplyButton(params: FilterWrapperParams): boolean {
    return (params.buttons?.indexOf('apply') ?? -1) >= 0;
}

export function getPlaceholderText(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    filterPlaceholder: string | FilterPlaceholderFunction | undefined,
    defaultPlaceholder: FilterLocaleTextKey,
    filterOptionKey: ISimpleFilterModelType
): string {
    let placeholder = translateForFilter(bean, defaultPlaceholder);
    if (typeof filterPlaceholder === 'function') {
        const filterOption = translateForFilter(bean, filterOptionKey);
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
