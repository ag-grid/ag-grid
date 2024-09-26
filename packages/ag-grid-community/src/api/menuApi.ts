import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { _ErrorType } from '../validation/errorMessages/errorText';
import { _errorOnce1 } from '../validation/logging';

/** @deprecated v31.1 */
export function showColumnMenuAfterButtonClick(
    beans: BeanCollection,
    colKey: string | Column,
    buttonElement: HTMLElement
): void {
    // use grid column so works with pivot mode
    const column = beans.columnModel.getCol(colKey)!;
    beans.menuService.showColumnMenu({
        column,
        buttonElement,
        positionBy: 'button',
    });
}

/** @deprecated v31.1 */
export function showColumnMenuAfterMouseClick(
    beans: BeanCollection,
    colKey: string | Column,
    mouseEvent: MouseEvent | Touch
): void {
    // use grid column so works with pivot mode
    let column = beans.columnModel.getCol(colKey);
    if (!column) {
        column = beans.columnModel.getColDefCol(colKey);
    }
    if (!column) {
        _errorOnce1<_ErrorType.NoColumnFoundForKey>(12, colKey);
        return;
    }
    beans.menuService.showColumnMenu({
        column,
        mouseEvent,
        positionBy: 'mouse',
    });
}

export function showColumnMenu(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.columnModel.getCol(colKey);
    if (!column) {
        _errorOnce1<_ErrorType.NoColumnFoundForKey>(12, colKey);
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
