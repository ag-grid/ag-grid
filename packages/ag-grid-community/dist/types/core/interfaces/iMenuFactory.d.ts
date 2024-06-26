import type { AgColumn } from '../entities/agColumn';
import type { ContainerType } from './iAfterGuiAttachedParams';
export interface IMenuFactory {
    showMenuAfterButtonClick(column: AgColumn | undefined, eventSource: HTMLElement, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterMouseEvent(column: AgColumn | undefined, mouseEvent: MouseEvent | Touch, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterContextMenuEvent(column: AgColumn | undefined, mouseEvent?: MouseEvent | null, touchEvent?: TouchEvent | null): void;
    isMenuEnabled(column: AgColumn): boolean;
    hideActiveMenu(): void;
}
