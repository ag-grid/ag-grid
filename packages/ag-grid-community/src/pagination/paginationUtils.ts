import type { LocaleTextFunc } from '../agStack/interfaces/iLocaleService';
import type { GridOptionsService } from '../gridOptionsService';
import { _formatNumberCommas } from '../utils/number';

export function _formatPaginationNumber(
    value: number,
    gos: GridOptionsService,
    getLocaleTextFunc: () => LocaleTextFunc
): string {
    const userFunc = gos.getCallback('paginationNumberFormatter');
    if (userFunc) {
        return userFunc({ value });
    }
    return _formatNumberCommas(value, getLocaleTextFunc);
}
