import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export interface IGridHeaderComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setHeightAndMinHeight(height: string): void;
}
export declare class GridHeaderCtrl extends BeanStub {
    private headerNavigationService;
    private focusService;
    private columnModel;
    private visibleColsService;
    private ctrlsService;
    private filterManager?;
    private menuService;
    wireBeans(beans: BeanCollection): void;
    private comp;
    private eGui;
    private headerHeight;
    setComp(comp: IGridHeaderComp, eGui: HTMLElement, eFocusableElement: HTMLElement): void;
    private setupHeaderHeight;
    getHeaderHeight(): number;
    private setHeaderHeight;
    private onPivotModeChanged;
    private onDisplayedColumnsChanged;
    protected onTabKeyDown(e: KeyboardEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    private onHeaderContextMenu;
    private mockContextMenuForIPad;
}
