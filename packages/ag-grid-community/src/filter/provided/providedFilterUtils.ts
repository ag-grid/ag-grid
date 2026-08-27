import type { LocaleTextFunc } from 'ag-stack';

import type { FilterWrapperParams } from '../../interfaces/iFilter';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import { translateFilterOptionKey, translateForFilter } from '../filterLocaleText';
import type { FilterOptionKey, FilterPlaceholderFunction } from './iSimpleFilter';
import type { ResolvedSimpleFilterConfig } from './resolvedFilterConfig';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isUseApplyButton(params: FilterWrapperParams): boolean {
    return (params.buttons?.indexOf('apply') ?? -1) >= 0;
}

/** A Custom Filter Option has no built-in locale entry, so its own `displayKey`/`displayName` are the lookup. */
export function translateFilterOption(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    filterConfig: ResolvedSimpleFilterConfig,
    filterOptionKey: FilterOptionKey
): string {
    const customOption = filterConfig.getCustomOption(filterOptionKey);
    return customOption
        ? bean.getLocaleTextFunc()(customOption.displayKey, customOption.displayName)
        : translateFilterOptionKey(bean, filterOptionKey);
}

export function getPlaceholderText(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    filterPlaceholder: string | FilterPlaceholderFunction | undefined,
    defaultPlaceholder: FilterLocaleTextKey,
    filterOptionKey: FilterOptionKey,
    filterConfig: ResolvedSimpleFilterConfig
): string {
    let placeholder = translateForFilter(bean, defaultPlaceholder);
    if (typeof filterPlaceholder === 'function') {
        const filterOption = translateFilterOption(bean, filterConfig, filterOptionKey);
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
