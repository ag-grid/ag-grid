import { GridPanel } from "../gridPanel/gridPanel";
import { Autowired, Bean } from "../context/context";
import { Beans } from "./beans";
import { RowNode } from "../entities/rowNode";
import { CellComp } from "./cellComp";
import { ColumnController } from "../columnController/columnController";
import { _ } from "../utils";

@Bean('autoHeightCalculator')
export class AutoHeightCalculator {

    @Autowired('beans') private beans: Beans;
    @Autowired("$scope") private $scope: any;
    @Autowired("columnController") private columnController: ColumnController;

    private gridPanel: GridPanel;

    private eDummyContainer: HTMLElement;

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

        const cellComps: CellComp[] = [];
        const autoRowHeightCols = this.columnController.getAllAutoRowHeightCols();
        const visibleAutoRowHeightCols = autoRowHeightCols.filter(col => col.isVisible());

        visibleAutoRowHeightCols.forEach(col => {
            const cellComp = new CellComp(
                this.$scope,
                this.beans,
                col,
                rowNode,
                null,
                true,
                false);
            cellComp.setParentRow(this.eDummyContainer);
            cellComps.push(cellComp);
        });

        const template = cellComps.map(cellComp => cellComp.getCreateTemplate()).join(' ');
        this.eDummyContainer.innerHTML = template;

        // this gets any cellComps that are using components to put the components in
        cellComps.forEach(cellComp => cellComp.afterAttached());

        // we should be able to just take the height of the row at this point, however
        // the row isn't expanding to cover the cell heights, i don't know why, i couldn't
        // figure it out so instead looking at the individual cells instead
        let maxCellHeight = 0;
        for (let i = 0; i < this.eDummyContainer.children.length; i++) {
            const child = this.eDummyContainer.children[i] as HTMLElement;
            if (child.offsetHeight > maxCellHeight) {
                maxCellHeight = child.offsetHeight;
            }
        }

        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(this.eDummyContainer);

        cellComps.forEach(cellComp => {
            // dunno why we need to detach first, doing it here to be consistent with code in RowComp
            cellComp.detach();
            cellComp.destroy();
        });

        // in case anything left over from last time
        _.clearElement(this.eDummyContainer);

        return maxCellHeight;
    }
}
