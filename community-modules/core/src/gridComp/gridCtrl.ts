import type { VisibleColsService } from '../columns/visibleColsService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { DragSourceType } from '../dragAndDrop/dragAndDropService';
import type { GridSizeChangedEvent } from '../events';
import type { FocusService } from '../focusService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { FocusableComponent } from '../interfaces/iFocusableComponent';
import type { IWatermark } from '../interfaces/iWatermark';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import { _last } from '../utils/array';
import { _findNextElementOutsideAndFocus } from '../utils/focus';
import type { ComponentSelector } from '../widgets/component';

export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): FocusableComponent[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
    getPaginationElement(): HTMLElement | undefined;
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
        this.focusService = beans.focusService;
        this.visibleColsService = beans.visibleColsService;
    }

    private view: IGridComp;
    private eGridHostDiv: HTMLElement;
    private eGui: HTMLElement;

    private additionalFocusableContainers: Set<FocusableComponent> = new Set();

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
            gridHeaderDropZonesSelector: beans.columnDropZonesService?.getDropZoneSelector(),
            sideBarSelector: beans.sideBarService?.getSideBarSelector(),
            statusBarSelector: beans.statusBarService?.getStatusPanelSelector(),
            watermarkSelector: (beans.licenseManager as IWatermark)?.getWatermarkSelector(),
        };
    }

    private onGridSizeChanged(): void {
        const event: WithoutGridCommon<GridSizeChangedEvent> = {
            type: 'gridSizeChanged',
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight,
        };
        this.eventService.dispatchEvent(event);
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
        const focusableContainers = this.getFocusableContainers();
        const activeEl = this.gos.getActiveDomElement();
        const idxWithFocus = focusableContainers.findIndex((container) => container.getGui().contains(activeEl));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);

        if (nextIdx < 0 || nextIdx >= focusableContainers.length) {
            return false;
        }

        if (nextIdx === 0) {
            if (idxWithFocus > 0) {
                const allColumns = this.visibleColsService.getAllCols();
                const lastColumn = _last(allColumns);
                if (this.focusService.focusGridView(lastColumn, true)) {
                    return true;
                }
            }
            return false;
        }

        return this.focusContainer(focusableContainers[nextIdx], backwards);
    }

    public focusInnerElement(fromBottom?: boolean): boolean {
        const focusableContainers = this.getFocusableContainers();
        const allColumns = this.visibleColsService.getAllCols();

        const userCallbackFunction = this.gos.getCallback('focusGridInnerElement');

        if (userCallbackFunction && userCallbackFunction({ fromBottom: !!fromBottom })) {
            return true;
        }

        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusContainer(_last(focusableContainers), true);
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
                if (this.focusService.focusInto(focusableContainers[i].getGui())) {
                    return true;
                }
            }
            return false;
        }

        return this.focusService.focusFirstHeader();
    }

    public forceFocusOutOfContainer(up = false): boolean {
        if (!up) {
            const ePagination = this.view.getPaginationElement();
            if (ePagination) {
                const lastFocusableElement = _last(this.focusService.findFocusableElements(ePagination, null));
                _findNextElementOutsideAndFocus(up, this.gos, this.focusService, lastFocusableElement);
                return true;
            }
        }
        this.view.forceFocusOutOfContainer(up);
        return false;
    }

    public addFocusableContainer(container: FocusableComponent): void {
        this.additionalFocusableContainers.add(container);
    }

    public removeFocusableContainer(container: FocusableComponent): void {
        this.additionalFocusableContainers.delete(container);
    }

    private focusContainer(comp: FocusableComponent, up?: boolean): boolean {
        comp?.setAllowFocus?.(true);
        const result = this.focusService.focusInto(comp.getGui(), up);
        comp?.setAllowFocus?.(false);
        return result;
    }

    private getFocusableContainers(): FocusableComponent[] {
        return [...this.view.getFocusableContainers(), ...this.additionalFocusableContainers.values()];
    }

    public override destroy(): void {
        this.additionalFocusableContainers.clear();
        super.destroy();
    }
}
