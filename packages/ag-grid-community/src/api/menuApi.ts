import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import { _errorOnce } from '../utils/function';

export function showColumnMenu(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.columnModel.getCol(colKey);
    if (!column) {
        _errorOnce(`column '${colKey}' not found`);
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
