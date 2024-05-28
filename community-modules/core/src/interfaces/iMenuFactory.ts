import type { InternalColumn } from '../entities/column';
import type { ContainerType } from './iAfterGuiAttachedParams';

export interface IMenuFactory {
    showMenuAfterButtonClick(
        column: InternalColumn | undefined,
        eventSource: HTMLElement,
        containerType: ContainerType,
        filtersOnly?: boolean
    ): void;
    showMenuAfterMouseEvent(
        column: InternalColumn | undefined,
        mouseEvent: MouseEvent | Touch,
        containerType: ContainerType,
        filtersOnly?: boolean
    ): void;
    showMenuAfterContextMenuEvent(
        column: InternalColumn | undefined,
        mouseEvent?: MouseEvent | null,
        touchEvent?: TouchEvent | null
    ): void;
    isMenuEnabled(column: InternalColumn): boolean;
    hideActiveMenu(): void;
}
