import type { VisibleColsService } from '../columns/visibleColsService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { DragSourceType } from '../dragAndDrop/dragAndDropService';
import type { GridSizeChangedEvent } from '../events';
import type { FocusService } from '../focusService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IWatermark } from '../interfaces/iWatermark';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import { _last } from '../utils/array';
import type { ComponentSelector } from '../widgets/component';

export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): HTMLElement[];
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

export class GridCtrl extends BeanStub {
    private beans: BeanCollection;
    private focusService: FocusService;
    private visibleColsService: VisibleColsService;

    public wireBeans(beans: BeanCollection) {
        this.beans = beans;
        this.eGridWrapperDiv = beans.eGridDiv;
        this.focusService = beans.focusService;
        this.visibleColsService = beans.visibleColsService;
    }

    private view: IGridComp;
    private eGridHostDiv: HTMLElement;
    private eGridWrapperDiv: HTMLElement;
    private eGui: HTMLElement;

    public setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;

        this.eGui.setAttribute('grid-id', this.gridId);

        const { dragAndDropService, mouseEventService, ctrlsService, resizeObserverService } = this.beans;

        // this drop target is just used to see if the drop event is inside the grid
        dragAndDropService.addDropTarget({
            getContainer: () => this.eGui,
            isInterestedIn: (type) => type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel,
            getIconName: () => 'notAllowed',
        });

        mouseEventService.stampTopLevelGridCompWithGridInstance(eGridDiv);

        this.createManagedBean(new LayoutFeature(this.view));

        this.addRtlSupport();

        this.applyDefaultHeight();

        const unsubscribeFromResize = resizeObserverService.observeResize(
            this.eGridHostDiv,
            this.onGridSizeChanged.bind(this)
        );
        this.addDestroyFunc(() => unsubscribeFromResize());

        ctrlsService.register('gridCtrl', this);
    }

    public isDetailGrid(): boolean {
        const el = this.focusService.findTabbableParent(this.getGui());

        return el?.getAttribute('row-id')?.startsWith('detail') || false;
    }

    public getOptionalSelectors(): OptionalGridComponents {
        const beans = this.beans;
        return {
            paginationSelector: beans.paginationService?.getPaginationSelector(),
            gridHeaderDropZonesSelector: beans.columnDropZonesService?.getDropZoneComponent(),
            sideBarSelector: beans.sideBarService?.getSideBarSelector(),
            statusBarSelector: beans.statusBarService?.getStatusPanelSelector(),
            watermarkSelector: (beans.licenseManager as IWatermark)?.getWatermarkSelector(),
        };
    }

    private onGridSizeChanged(): void {
        this.applyDefaultHeight();
        const event: WithoutGridCommon<GridSizeChangedEvent> = {
            type: 'gridSizeChanged',
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight,
        };
        this.eventService.dispatchEvent(event);
    }

    private applyDefaultHeight(): void {
        if (this.eGui.offsetParent == null) {
            return;
        }
        // If the application has not given the host div a height, then we want
        // to apply a default height in order to prevent the grid from being
        // zero height. However we can't just test whether the host div is 0px
        // high, because it might have been explicitly set to 0px. So we vary
        // the height of the main grid element and check whether the container
        // resizes to fit. It it does, it has no explicit height set and we need a default height.
        const gui = this.eGui;
        const wrapper = this.eGridWrapperDiv;
        gui.style.boxSizing = 'border-box';
        gui.style.height = '0';
        gui.style.padding = '0';
        const firstMeasurement = wrapper.clientHeight;
        gui.style.height = '10px';
        const secondMeasurement = wrapper.clientHeight;
        // difference should be 10px but allow some margin of error if the layout is scaled
        const hasIntrinsicHeight = secondMeasurement - firstMeasurement <= 5;
        gui.style.boxSizing = '';
        gui.style.height = '';
        gui.style.padding = '';
        gui.classList.toggle('ag-default-height', !hasIntrinsicHeight);
    }

    private addRtlSupport(): void {
        const cssClass = this.gos.get('enableRtl') ? 'ag-rtl' : 'ag-ltr';
        this.view.setRtlClass(cssClass);
    }

    public destroyGridUi(): void {
        this.view.destroyGridUi();
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public setResizeCursor(on: boolean): void {
        this.view.setCursor(on ? 'ew-resize' : null);
    }

    public disableUserSelect(on: boolean): void {
        this.view.setUserSelect(on ? 'none' : null);
    }

    public focusNextInnerContainer(backwards: boolean): boolean {
        const focusableContainers = this.view.getFocusableContainers();
        const activeEl = this.gos.getActiveDomElement();
        const idxWithFocus = focusableContainers.findIndex((container) => container.contains(activeEl));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);

        if (nextIdx <= 0 || nextIdx >= focusableContainers.length) {
            return false;
        }

        return this.focusService.focusInto(focusableContainers[nextIdx]);
    }

    public focusInnerElement(fromBottom?: boolean): boolean {
        const focusableContainers = this.view.getFocusableContainers();
        const allColumns = this.visibleColsService.getAllCols();

        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusService.focusInto(_last(focusableContainers), true);
            }

            const lastColumn = _last(allColumns);
            if (this.focusService.focusGridView(lastColumn, true)) {
                return true;
            }
        }

        if (this.gos.get('headerHeight') === 0 || this.gos.get('suppressHeaderFocus')) {
            if (this.focusService.focusGridView(allColumns[0])) {
                return true;
            }

            for (let i = 1; i < focusableContainers.length; i++) {
                if (this.focusService.focusInto(focusableContainers[i])) {
                    return true;
                }
            }
            return false;
        }

        return this.focusService.focusFirstHeader();
    }

    public forceFocusOutOfContainer(up = false): void {
        this.view.forceFocusOutOfContainer(up);
    }
}
