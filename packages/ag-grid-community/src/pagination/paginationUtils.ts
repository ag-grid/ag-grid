import type { LocaleTextFunc } from '../agStack/interfaces/iLocaleService';
import type { GridOptionsService } from '../gridOptionsService';
import type { PaginationNumberFormatterParams } from '../interfaces/iCallbackParams';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import { _formatNumberCommas } from '../utils/number';

export function _formatPaginationNumber(
    value: number,
    gos: GridOptionsService,
    getLocaleTextFunc: () => LocaleTextFunc
): string {
    const userFunc = gos.getCallback('paginationNumberFormatter');
    if (userFunc) {
        const params: WithoutGridCommon<PaginationNumberFormatterParams> = { value };
        return userFunc(params);
    }
    return _formatNumberCommas(value, getLocaleTextFunc);
}
