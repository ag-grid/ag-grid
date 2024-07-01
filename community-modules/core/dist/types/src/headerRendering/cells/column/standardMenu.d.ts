import type { NamedBean } from '../../../context/bean';
import { BeanStub } from '../../../context/beanStub';
import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { ContainerType } from '../../../interfaces/iAfterGuiAttachedParams';
import type { IMenuFactory } from '../../../interfaces/iMenuFactory';
export declare class StandardMenuFactory extends BeanStub implements NamedBean, IMenuFactory {
    beanName: "filterMenuFactory";
    private popupService;
    private focusService;
    private ctrlsService;
    private menuService;
    wireBeans(beans: BeanCollection): void;
    private hidePopup;
    private tabListener;
    private activeMenu?;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: AgColumn | undefined, mouseEvent: MouseEvent | Touch, containerType: ContainerType): void;
    showMenuAfterButtonClick(column: AgColumn | undefined, eventSource: HTMLElement, containerType: ContainerType): void;
    private showPopup;
    private trapFocusWithin;
    private dispatchVisibleChangedEvent;
    isMenuEnabled(column: AgColumn): boolean;
    showMenuAfterContextMenuEvent(): void;
    destroy(): void;
}
