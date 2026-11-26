import type { LocaleTextFunc } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { translateColumnFilterLabel } from '../filterAriaLabels';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getFloatingFilterAriaLabel(
    beans: BeanCollection,
    column: AgColumn,
    translate: LocaleTextFunc
): string {
    return translateColumnFilterLabel(beans, column, translate, 'filterInput');
}
