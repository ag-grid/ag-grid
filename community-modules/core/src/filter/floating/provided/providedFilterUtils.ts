import { _warnOnce } from '../../../utils/function';
import type { ProvidedFilterParams } from '../../provided/iProvidedFilter';

export function getDebounceMs(params: ProvidedFilterParams, debounceDefault: number): number {
    if (isUseApplyButton(params)) {
        if (params.debounceMs != null) {
            _warnOnce('AG Grid: debounceMs is ignored when apply button is present');
        }

        return 0;
    }

    return params.debounceMs != null ? params.debounceMs : debounceDefault;
}

export function isUseApplyButton(params: ProvidedFilterParams): boolean {
    return !!params.buttons && params.buttons.indexOf('apply') >= 0;
}
