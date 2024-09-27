import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { _ErrorType } from '../validation/logging';
import { _errorOnce1 } from '../validation/logging';

export function showColumnMenu(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.columnModel.getCol(colKey);
    if (!column) {
        _errorOnce1<_ErrorType.NoColumnFoundForKey>(12, { colKey });
        return;
    }
    beans.menuService.showColumnMenu({
        column,
        positionBy: 'auto',
    });
}

export function hidePopupMenu(beans: BeanCollection): void {
    beans.menuService.hidePopupMenu();
}
