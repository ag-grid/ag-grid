import {GridPanel} from "../gridPanel/gridPanel";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {Beans} from "./beans";
import {RowNode} from "../entities/rowNode";
import {CellComp} from "./cellComp";
import {ColumnController} from "../columnController/columnController";
import {_} from "../utils";
import {CellRendererHeightChangedEvent, CellValueChangedEvent, Events} from "../events";

@Bean('autoHeightCalculator')
export class AutoHeightCalculator {

    @Autowired('beans') private beans: Beans;
    @Autowired("$scope") private $scope: any;
    @Autowired("columnController") private columnController: ColumnController;

    private gridPanel: GridPanel;
    private eDummyContainer: HTMLElement;

    @PostConstruct
    private init(): void {
        if(this.columnController.isAutoRowHeightActive()){
            this.beans.eventService.addEventListener(Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged);
            this.beans.eventService.addEventListener(Events.EVENT_CELL_RENDERER_HEIGHT_CHANGED, this.onCellRendererHeightChanged);
        }
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    public getPreferredHeightForRow(rowNode: RowNode): number {
        if (!this.eDummyContainer) {
            this.eDummyContainer = document.createElement('div');

            // so any styles on row also get applied in dummy, otherwise
            // the content in dummy may differ to the real
            _.addCssClass(this.eDummyContainer, 'ag-row ag-row-no-focus');
        }

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        const eBodyContainer = this.gridPanel.getCenterContainer();
        eBodyContainer.appendChild(this.eDummyContainer);

        const dummyCellComps = this.createDummyAutoHeightCellComps(rowNode);

        this.eDummyContainer.innerHTML = dummyCellComps.map(cellComp => cellComp.getCreateTemplate()).join(' ');

        // this gets any cellComps that are using components to put the components in
        dummyCellComps.forEach(cellComp => cellComp.afterAttached());

        // we should be able to just take the height of the row at this point, however
        // the row isn't expanding to cover the cell heights, i don't know why, i couldn't
        // figure it out so instead looking at the individual cells instead
        for (let i = 0; i < this.eDummyContainer.children.length; i++) {
            const child = this.eDummyContainer.children[i] as HTMLElement;
            const colId = dummyCellComps[i].getColumn().getColId();

            // sync heights need to be cached as they could contain the max cell height
            this.cacheCellElement(rowNode, colId, child);
        }

        this.calculateRowHeight(rowNode);

        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(this.eDummyContainer);

        dummyCellComps.forEach(cellComp => {
            // dunno why we need to detach first, doing it here to be consistent with code in RowComp
            cellComp.detach();
            cellComp.destroy();
        });

        // in case anything left over from last time
        _.clearElement(this.eDummyContainer);

        // unmark rowNode as 'dirty'
        if (rowNode.__autoHeightChanged) {
            rowNode.__autoHeightChanged = false;
        }

        return rowNode.__autoRowHeight;
    }

    private createDummyAutoHeightCellComps(rowNode: RowNode) {
        const autoRowHeightCols = this.columnController.getAllAutoRowHeightCols();
        const visibleAutoRowHeightCols = autoRowHeightCols.filter(col => col.isVisible());

        // first time in and after row comps are destroyed the element cache doesn't to manage the memory footprint
        if (!rowNode.__autoHeightCellRendererElements) {
            rowNode.__autoHeightCellRendererElements = {};
        }

        // we don't need / want to create cell comps for async comps, however if there are no existing cell
        const elements = rowNode.__autoHeightCellRendererElements;
        return visibleAutoRowHeightCols
            .filter(col => !_.exists(elements[col.getColId()]) || !elements[col.getColId()].async)
            .map(col => {
                const cellComp = new CellComp(this.$scope, this.beans, col, rowNode, null, true, false);
                cellComp.setParentRow(this.eDummyContainer);
                return cellComp;
            });
    }

    public onCellRendererHeightChanged = (event: CellRendererHeightChangedEvent) => {
        const rowNode = event.rowNode;

        const previousRowHeight = rowNode.__autoRowHeight;

        this.cacheCellElement(rowNode, event.column.getColId(), event.cellRendererGui, true);
        this.calculateRowHeight(rowNode);

        if (rowNode.__autoRowHeight !== previousRowHeight) {
            rowNode.__autoHeightChanged = true;
            this.gridPanel.redrawRowsDebounced();
        }
    };

    public onCellValueChanged = (event: CellValueChangedEvent) => {
        _.debounce(() => {
            event.node.__autoHeightChanged = true;
            this.gridPanel.redrawRowsDebounced();
        }, 100);
    };

    private calculateRowHeight(rowNode: RowNode) {
        if (rowNode.__autoHeightCellRendererElements) {
            const heights = Object.values(rowNode.__autoHeightCellRendererElements).map(e => e.element.offsetHeight);
            rowNode.__autoRowHeight = Math.max(...heights);
        }
    }

    private cacheCellElement(rowNode: RowNode, colId: string, element: HTMLElement, async = false) {
        // ensure cache exists as elements can arrive asynchronously after the row comp and cache is removed
        if (rowNode.__autoHeightCellRendererElements && element) {
            rowNode.__autoHeightCellRendererElements[colId] = {element, async};
        }
    }
}
