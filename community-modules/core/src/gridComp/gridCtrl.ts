import type { VisibleColsService } from '../columns/visibleColsService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import { DragAndDropService, DragSourceType } from '../dragAndDrop/dragAndDropService';
import { Events } from '../eventKeys';
import type { GridSizeChangedEvent } from '../events';
import type { FocusService } from '../focusService';
import type { MouseEventService } from '../gridBodyComp/mouseEventService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ResizeObserverService } from '../misc/resizeObserverService';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import { _last } from '../utils/array';

export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): HTMLElement[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
}

export class GridCtrl extends BeanStub {
    private focusService: FocusService;
    private resizeObserverService: ResizeObserverService;
    private visibleColsService: VisibleColsService;
    private ctrlsService: CtrlsService;
    private mouseEventService: MouseEventService;
    private dragAndDropService: DragAndDropService;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.focusService = beans.focusService;
        this.resizeObserverService = beans.resizeObserverService;
        this.visibleColsService = beans.visibleColsService;
        this.ctrlsService = beans.ctrlsService;
        this.mouseEventService = beans.mouseEventService;
        this.dragAndDropService = beans.dragAndDropService;
    }

    private view: IGridComp;
    private eGridHostDiv: HTMLElement;
    private eGui: HTMLElement;

    public setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;

        this.eGui.setAttribute('grid-id', this.gridId);

        // this drop target is just used to see if the drop event is inside the grid
        this.dragAndDropService.addDropTarget({
            getContainer: () => this.eGui,
            isInterestedIn: (type) => type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel,
            getIconName: () => DragAndDropService.ICON_NOT_ALLOWED,
        });

        this.mouseEventService.stampTopLevelGridCompWithGridInstance(eGridDiv);

        this.createManagedBean(new LayoutFeature(this.view));

        this.addRtlSupport();

        const unsubscribeFromResize = this.resizeObserverService.observeResize(
            this.eGridHostDiv,
            this.onGridSizeChanged.bind(this)
        );
        this.addDestroyFunc(() => unsubscribeFromResize());

        this.ctrlsService.register('gridCtrl', this);
    }

    public isDetailGrid(): boolean {
        const el = this.focusService.findTabbableParent(this.getGui());

        return el?.getAttribute('row-id')?.startsWith('detail') || false;
    }

    public showDropZones(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.RowGroupingModule, this.gridId);
    }

    public showSideBar(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.SideBarModule, this.gridId);
    }

    public showStatusBar(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.StatusBarModule, this.gridId);
    }

    public showWatermark(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.gridId);
    }

    private onGridSizeChanged(): void {
        const event: WithoutGridCommon<GridSizeChangedEvent> = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
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
