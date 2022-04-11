import { BeanStub } from "../context/beanStub";
export interface IGridHeaderComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setHeightAndMinHeight(height: string): void;
}
export declare class GridHeaderCtrl extends BeanStub {
    private headerNavigationService;
    private focusService;
    private columnModel;
    private ctrlsService;
    private comp;
    private eGui;
    setComp(comp: IGridHeaderComp, eGui: HTMLElement, eFocusableElement: HTMLElement): void;
    private setupHeaderHeight;
    private setHeaderHeight;
    private onPivotModeChanged;
    protected onTabKeyDown(e: KeyboardEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onFocusOut(e: FocusEvent): void;
}
