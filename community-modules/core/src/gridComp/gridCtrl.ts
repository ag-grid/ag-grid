import { BeanStub } from "../context/beanStub";
import { DragAndDropService, DragSourceType } from "../dragAndDrop/dragAndDropService";
import { Events } from "../eventKeys";
import { GridSizeChangedEvent } from "../events";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ModuleNames } from "../modules/moduleNames";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { last } from "../utils/array";

export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): HTMLElement[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
}

export class GridCtrl extends BeanStub {

    private view: IGridComp;
    private eGridHostDiv: HTMLElement;
    private eGui: HTMLElement;

    public setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;
        const { dragAndDropService, mouseEventService, resizeObserverService, ctrlsService } = this.beans;

        this.eGui.setAttribute('grid-id', this.beans.context.getGridId());

        // this drop target is just used to see if the drop event is inside the grid
        dragAndDropService.addDropTarget({
            getContainer: () => this.eGui,
            isInterestedIn: (type) => type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel,
            getIconName: () => DragAndDropService.ICON_NOT_ALLOWED,
        });

        mouseEventService.stampTopLevelGridCompWithGridInstance(eGridDiv);

        this.createManagedBean(new LayoutFeature(this.view));

        this.addRtlSupport();

        const unsubscribeFromResize = resizeObserverService.observeResize(
            this.eGridHostDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());

        ctrlsService.registerGridCtrl(this);
    }

    public isDetailGrid(): boolean {
        const el = this.beans.focusService.findTabbableParent(this.getGui());

        return el?.getAttribute('row-id')?.startsWith('detail') || false;
    }

    public showDropZones(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.RowGroupingModule, this.beans.context.getGridId());
    }

    public showSideBar(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.SideBarModule, this.beans.context.getGridId());
    }

    public showStatusBar(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.StatusBarModule, this.beans.context.getGridId());
    }

    public showWatermark(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.beans.context.getGridId());
    }

    private onGridSizeChanged(): void {
        const event: WithoutGridCommon<GridSizeChangedEvent> = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight
        };
        this.beans.eventService.dispatchEvent(event);
    }

    private addRtlSupport(): void {
        const cssClass = this.beans.gos.get('enableRtl') ? 'ag-rtl' : 'ag-ltr';
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
        const activeEl = this.beans.gos.getActiveDomElement();
        const idxWithFocus = focusableContainers.findIndex(container => container.contains(activeEl));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);

        if (nextIdx <= 0 || nextIdx >= focusableContainers.length) {
            return false;
        }

        return this.beans.focusService.focusInto(focusableContainers[nextIdx]);
    }

    public focusInnerElement(fromBottom?: boolean): boolean {
        const focusableContainers = this.view.getFocusableContainers();
        const { columnModel, focusService } = this.beans;
        const allColumns = columnModel.getAllDisplayedColumns();

        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return focusService.focusInto(last(focusableContainers), true);
            }

            const lastColumn = last(allColumns);
            if (focusService.focusGridView(lastColumn, true)) { return true; }
        }

        if (this.beans.gos.get('headerHeight') === 0 || this.beans.gos.get('suppressHeaderFocus')) {
            if (focusService.focusGridView(allColumns[0])) {
                return true;
            }

            for (let i = 1; i < focusableContainers.length; i++) {
                if (focusService.focusInto(focusableContainers[i])) {
                    return true;
                }
            }
            return false;
        }

        return focusService.focusFirstHeader();
    }

    public forceFocusOutOfContainer(up = false): void {
        this.view.forceFocusOutOfContainer(up);
    }
}