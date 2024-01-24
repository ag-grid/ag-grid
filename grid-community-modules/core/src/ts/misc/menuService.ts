import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { Column } from "../entities/column";
import { ContainerType } from "../interfaces/iAfterGuiAttachedParams";

interface BaseShowMenuParams {
    column: Column,
}

interface BaseShowColumnMenuParams extends BaseShowMenuParams {
    defaultTab?: string,
    restrictToTabs?: string[],
}

interface MouseShowMenuParams {
    mouseEvent: MouseEvent | Touch;
}

interface ButtonShowMenuParams {
    buttonElement: HTMLElement;
    containerType?: ContainerType;
}

function isButtonShowMenuParams(params: (ButtonShowMenuParams | MouseShowMenuParams)): params is ButtonShowMenuParams {
    return !!(params as ButtonShowMenuParams).buttonElement;
}

export type ShowColumnMenuParams = (MouseShowMenuParams | ButtonShowMenuParams) & BaseShowColumnMenuParams;

export type ShowFilterMenuParams = (MouseShowMenuParams | ButtonShowMenuParams) & BaseShowMenuParams;

@Bean('menuService')
export class MenuService extends BeanStub {
    @Optional('tabbedMenuFactory') private readonly tabbedMenuFactory: IMenuFactory;
    @Autowired('filterMenuFactory') private readonly filterMenuFactory: IMenuFactory;
    @Optional('contextMenuFactory') private readonly contextMenuFactory: IContextMenuFactory;

    private activeMenuFactory: IMenuFactory;
    private useTabs: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.activeMenuFactory = this.tabbedMenuFactory ?? this.filterMenuFactory;
        this.useTabs = !this.gridOptionsService.get('enableNewColumnMenu');
    }

    public showColumnMenu(params: ShowColumnMenuParams): void {
        if (isButtonShowMenuParams(params)) {
            const { column, buttonElement, containerType, defaultTab, restrictToTabs } = params;
            this.showColumnMenuAfterButtonClick(column, buttonElement, defaultTab, restrictToTabs, containerType);
        } else {
            const { column, mouseEvent, defaultTab, restrictToTabs } = params;
            this.showColumnMenuAfterMouseClick(column, mouseEvent, defaultTab, restrictToTabs);
        }
    }

    public showFilterMenu(params: ShowFilterMenuParams): void {
        const menuFactory: IMenuFactory = this.useTabs ? this.tabbedMenuFactory : this.filterMenuFactory;
        if (isButtonShowMenuParams(params)) {
            const { column, buttonElement, containerType } = params;
            menuFactory.showMenuAfterButtonClick(column, buttonElement, containerType ?? 'columnMenu', 'filterMenuTab', ['filterMenuTab']);
        } else {
            const { column, mouseEvent } = params;
            menuFactory.showMenuAfterMouseEvent(column, mouseEvent, 'filterMenuTab', ['filterMenuTab']);
        }
    }

    public showColumnMenuAfterButtonClick(
        column: Column,
        buttonElement: HTMLElement,
        defaultTab?: string,
        restrictToTabs?: string[],
        containerType: ContainerType = 'columnMenu'
    ): void {
        this.activeMenuFactory.showMenuAfterButtonClick(column, buttonElement, containerType, defaultTab, restrictToTabs);
    }

    public showColumnMenuAfterMouseClick(column: Column, mouseEvent: MouseEvent | Touch, defaultTab?: string, restrictToTabs?: string[]): boolean {
        this.activeMenuFactory.showMenuAfterMouseEvent(column, mouseEvent, defaultTab, restrictToTabs);
        // TODO - return whether this was handled or not
        return true;
    }

    public hidePopupMenu(): void {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.activeMenuFactory.hideActiveMenu();
    }

    public isMenuEnabled(column: Column): boolean {
        return this.activeMenuFactory.isMenuEnabled(column);
    }
}
