import { BeanStub } from "../../../context/beanStub";
import { IMenuFactory } from '../../../interfaces/iMenuFactory';
import { Column } from '../../../entities/column';
import { ContainerType } from '../../../interfaces/iAfterGuiAttachedParams';
export declare class StandardMenuFactory extends BeanStub implements IMenuFactory {
    private filterManager;
    private popupService;
    private focusService;
    private ctrlsService;
    private menuService;
    private hidePopup;
    private tabListener;
    private activeMenu?;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column | undefined, mouseEvent: MouseEvent | Touch, containerType: ContainerType): void;
    showMenuAfterButtonClick(column: Column | undefined, eventSource: HTMLElement, containerType: ContainerType): void;
    private showPopup;
    private trapFocusWithin;
    private dispatchVisibleChangedEvent;
    isMenuEnabled(column: Column): boolean;
    showMenuAfterContextMenuEvent(): void;
    protected destroy(): void;
}
