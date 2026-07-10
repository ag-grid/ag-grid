import type { BeanCollection } from '../../context/context';
import type { Column } from '../../interfaces/iColumn';

export function showColumnMenu(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.colModel.getCol(colKey);
    if (!column) {
        // No column found, can't show menu
        beans.log.error(12, { colKey });
        return;
    }
    beans.menuSvc?.showColumnMenu({
        column,
        positionBy: 'auto',
    });
}

export function hidePopupMenu(beans: BeanCollection): void {
    beans.menuSvc?.hidePopupMenu();
}
