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
    protected readonly focusService: FocusService;
    private readonly resizeObserverService;
    private readonly columnModel;
    private readonly ctrlsService;
    private readonly mouseEventService;
    private readonly dragAndDropService;
    private view;
    private eGridHostDiv;
    private eGui;
    setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void;
    isDetailGrid(): boolean;
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
    forceFocusOutOfContainer(up?: boolean): void;
}
