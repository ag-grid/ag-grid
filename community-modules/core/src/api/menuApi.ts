import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import { _warnOnce } from '../utils/function';

export function showColumnMenuAfterButtonClick(
    beans: BeanCollection,
    colKey: string | Column,
    buttonElement: HTMLElement
): void {
    _warnOnce(
        `'showColumnMenuAfterButtonClick' is deprecated. Use 'IHeaderParams.showColumnMenu' within a header component, or 'api.showColumnMenu' elsewhere.`
    );
    // use grid column so works with pivot mode
    const column = beans.columnModel.getCol(colKey)!;
    beans.menuService.showColumnMenu({
        column,
        buttonElement,
        positionBy: 'button',
    });
}

export function showColumnMenuAfterMouseClick(
    beans: BeanCollection,
    colKey: string | Column,
    mouseEvent: MouseEvent | Touch
): void {
    _warnOnce(
        `'showColumnMenuAfterMouseClick' is deprecated. Use 'IHeaderParams.showColumnMenuAfterMouseClick' within a header component, or 'api.showColumnMenu' elsewhere.`
    );
    // use grid column so works with pivot mode
    let column = beans.columnModel.getCol(colKey);
    if (!column) {
        column = beans.columnModel.getColDefCol(colKey);
    }
    if (!column) {
        console.error(`AG Grid: column '${colKey}' not found`);
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
        console.error(`AG Grid: column '${colKey}' not found`);
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
