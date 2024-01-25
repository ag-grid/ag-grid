import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { Column } from "../entities/column";
import { ContainerType } from "../interfaces/iAfterGuiAttachedParams";
import { RowNode } from "../entities/rowNode";

interface BaseShowMenuParams {
    column: Column,
}

interface BaseShowFilterMenuParams extends BaseShowMenuParams {
    containerType: ContainerType;
}

interface MouseShowMenuParams {
    mouseEvent: MouseEvent | Touch;
}

interface ButtonShowMenuParams {
    buttonElement: HTMLElement;
}

function isButtonShowMenuParams(params: (ButtonShowMenuParams | MouseShowMenuParams)): params is ButtonShowMenuParams {
    return !!(params as ButtonShowMenuParams).buttonElement;
}

export type ShowColumnMenuParams = (MouseShowMenuParams | ButtonShowMenuParams) & BaseShowMenuParams;

export type ShowFilterMenuParams = (MouseShowMenuParams | ButtonShowMenuParams) & BaseShowFilterMenuParams;

interface BaseShowContextMenuParams { 
    rowNode?: RowNode | null,
    column?: Column | null,
    value: any,
    anchorToElement: HTMLElement
}

interface MouseShowContextMenuParams {
    mouseEvent: MouseEvent;
}

interface TouchShowContextMenuParam {
    touchEvent: TouchEvent;
}

export type ShowContextMenuParams = (MouseShowContextMenuParams | TouchShowContextMenuParam) & BaseShowContextMenuParams;

@Bean('menuService')
export class MenuService extends BeanStub {
    @Optional('enterpriseMenuFactory') private readonly enterpriseMenuFactory? : IMenuFactory;
    @Autowired('filterMenuFactory') private readonly filterMenuFactory: IMenuFactory;
    @Optional('contextMenuFactory') private readonly contextMenuFactory?: IContextMenuFactory;

    private activeMenuFactory: IMenuFactory;

    @PostConstruct
    private postConstruct(): void {
        this.activeMenuFactory = this.enterpriseMenuFactory ?? this.filterMenuFactory;
    }

    public showColumnMenu(params: ShowColumnMenuParams): void {
        if (isButtonShowMenuParams(params)) {
            const { column, buttonElement } = params;
            this.activeMenuFactory.showMenuAfterButtonClick(column, buttonElement, 'columnMenu');
        } else {
            const { column, mouseEvent } = params;
            this.activeMenuFactory.showMenuAfterMouseEvent(column, mouseEvent, 'columnMenu');
        }
    }

    public showFilterMenu(params: ShowFilterMenuParams): void {
        const { column, containerType } = params;
        const menuFactory: IMenuFactory = !column.getMenuParams()?.enableNewFormat && this.enterpriseMenuFactory
            ? this.enterpriseMenuFactory
            : this.filterMenuFactory;
        if (isButtonShowMenuParams(params)) {
            const { buttonElement } = params;
            menuFactory.showMenuAfterButtonClick(column, buttonElement, containerType, true);
        } else {
            const { mouseEvent } = params;
            menuFactory.showMenuAfterMouseEvent(column, mouseEvent, containerType, true);
        }
    }

    public showHeaderContextMenu(column: Column, mouseEvent?: MouseEvent, touchEvent?: TouchEvent): void {
        this.activeMenuFactory.showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent);
    }

    public showContextMenu(
        params: ShowContextMenuParams
    ): void {
        const { column, anchorToElement, rowNode, value } = params;
        this.contextMenuFactory?.onContextMenu(
            (params as MouseShowContextMenuParams).mouseEvent ?? null,
            (params as TouchShowContextMenuParam).touchEvent ?? null,
            rowNode ?? null,
            column ?? null,
            value,
            anchorToElement
        );
    }

    public hidePopupMenu(): void {
        // hide the context menu if in enterprise
        this.contextMenuFactory?.hideActiveMenu();
        // and hide the column menu always
        this.activeMenuFactory.hideActiveMenu();
    }

    public isMenuEnabled(column: Column): boolean {
        return this.activeMenuFactory.isMenuEnabled(column);
    }
}
