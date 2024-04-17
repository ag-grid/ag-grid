import { Autowired } from "../context/context";
import { FocusService } from "../focusService";
import { BeanStub } from "../context/beanStub";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { ModuleNames } from "../modules/moduleNames";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { GridSizeChangedEvent } from "../events";
import { ColumnModel } from "../columns/columnModel";
import { CtrlsService } from "../ctrlsService";
import { MouseEventService } from "../gridBodyComp/mouseEventService";
import { last } from "../utils/array";
import { DragAndDropService, DragSourceType } from "../dragAndDrop/dragAndDropService";
import { WithoutGridCommon } from "../interfaces/iCommon";

export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): HTMLElement[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
}

export class GridCtrl extends BeanStub {

    @Autowired('focusService') protected readonly focusService: FocusService;
    @Autowired('resizeObserverService') private readonly resizeObserverService: ResizeObserverService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('ctrlsService') private readonly ctrlsService: CtrlsService;
    @Autowired('mouseEventService') private readonly mouseEventService: MouseEventService;
    @Autowired('dragAndDropService') private readonly dragAndDropService: DragAndDropService;

    private view: IGridComp;
    private eGridHostDiv: HTMLElement;
    private eGui: HTMLElement;

    public setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;

        this.eGui.setAttribute('grid-id', this.context.getGridId());

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
            this.eGridHostDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());

        this.ctrlsService.register('gridCtrl',this);
    }

    public isDetailGrid(): boolean {
        const el = this.focusService.findTabbableParent(this.getGui());

        return el?.getAttribute('row-id')?.startsWith('detail') || false;
    }

    public showDropZones(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.RowGroupingModule, this.context.getGridId());
    }

    public showSideBar(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.SideBarModule, this.context.getGridId());
    }

    public showStatusBar(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.StatusBarModule, this.context.getGridId());
    }

    public showWatermark(): boolean {
        return ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.context.getGridId());
    }

    private onGridSizeChanged(): void {
        const event: WithoutGridCommon<GridSizeChangedEvent> = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight
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
        const idxWithFocus = focusableContainers.findIndex(container => container.contains(activeEl));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);

        if (nextIdx <= 0 || nextIdx >= focusableContainers.length) {
            return false;
        }

        return this.focusService.focusInto(focusableContainers[nextIdx]);
    }

    public focusInnerElement(fromBottom?: boolean): boolean {
        const focusableContainers = this.view.getFocusableContainers();
        const allColumns = this.columnModel.getAllDisplayedColumns();

        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusService.focusInto(last(focusableContainers), true);
            }

            const lastColumn = last(allColumns);
            if (this.focusService.focusGridView(lastColumn, true)) { return true; }
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