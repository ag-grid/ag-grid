import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import type { LayoutView } from '../styling/layoutFeature';
import type { ComponentSelector } from '../widgets/component';
export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): FocusableContainer[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
}
export interface OptionalGridComponents {
    paginationSelector?: ComponentSelector;
    gridHeaderDropZonesSelector?: ComponentSelector;
    sideBarSelector?: ComponentSelector;
    statusBarSelector?: ComponentSelector;
    watermarkSelector?: ComponentSelector;
}
export declare class GridCtrl extends BeanStub {
    private beans;
    private focusService;
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    private view;
    private eGridHostDiv;
    private eGui;
    private additionalFocusableContainers;
    setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void;
    isDetailGrid(): boolean;
    getOptionalSelectors(): OptionalGridComponents;
    private onGridSizeChanged;
    private addRtlSupport;
    destroyGridUi(): void;
    getGui(): HTMLElement;
    setResizeCursor(on: boolean): void;
    disableUserSelect(on: boolean): void;
    focusNextInnerContainer(backwards: boolean): boolean;
    focusInnerElement(fromBottom?: boolean): boolean;
    forceFocusOutOfContainer(up?: boolean): void;
    addFocusableContainer(container: FocusableContainer): void;
    removeFocusableContainer(container: FocusableContainer): void;
    private focusContainer;
    private getFocusableContainers;
    destroy(): void;
}
