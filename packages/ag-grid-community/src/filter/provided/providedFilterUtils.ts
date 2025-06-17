import type { FilterWrapperParams } from '../../interfaces/iFilter';
import { _warn } from '../../validation/logging';
import type { IProvidedFilterParams } from './iProvidedFilter';

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
