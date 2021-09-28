import { FocusService } from "../focusService";
import { BeanStub } from "../context/beanStub";
import { LayoutView } from "../styling/layoutFeature";
export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    addOrRemoveKeyboardFocusClass(value: boolean): void;
    getFocusableContainers(): HTMLElement[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
}
export declare class GridCtrl extends BeanStub {
    private readonly columnApi;
    private readonly gridApi;
    protected readonly focusService: FocusService;
    private readonly resizeObserverService;
    private readonly columnModel;
    private readonly ctrlsService;
    private readonly mouseEventService;
    private view;
    private eGridHostDiv;
    private eGui;
    protected postConstruct(): void;
    setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void;
    showDropZones(): boolean;
    showSideBar(): boolean;
    showStatusBar(): boolean;
    showWatermark(): boolean;
    private onGridSizeChanged;
    private addRtlSupport;
    destroyGridUi(): void;
    getGui(): HTMLElement;
    setResizeCursor(on: boolean): void;
    disableUserSelect(on: boolean): void;
    focusNextInnerContainer(backwards: boolean): boolean;
    focusInnerElement(fromBottom?: boolean): boolean;
    focusGridHeader(): boolean;
    forceFocusOutOfContainer(up?: boolean): void;
}
