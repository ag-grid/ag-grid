import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
/** @deprecated v31.1 */
export declare function showColumnMenuAfterButtonClick(beans: BeanCollection, colKey: string | Column, buttonElement: HTMLElement): void;
/** @deprecated v31.1 */
export declare function showColumnMenuAfterMouseClick(beans: BeanCollection, colKey: string | Column, mouseEvent: MouseEvent | Touch): void;
export declare function showColumnMenu(beans: BeanCollection, colKey: string | Column): void;
export declare function hidePopupMenu(beans: BeanCollection): void;
