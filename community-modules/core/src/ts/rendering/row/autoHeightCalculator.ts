import { GridPanel } from "../../gridPanel/gridPanel";
import { Autowired, Bean } from "../../context/context";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";
import { CellComp } from "../cellComp";
import { ColumnController } from "../../columnController/columnController";
import { BeanStub } from "../../context/beanStub";
import { addCssClass, clearElement } from "../../utils/dom";
import {RowCssClassCalculator} from "./rowCssClassCalculator";
import {PaginationProxy} from "../../pagination/paginationProxy";

@Bean('autoHeightCalculator')
export class AutoHeightCalculator extends BeanStub {

    @Autowired('beans') private beans: Beans;
    @Autowired("$scope") private $scope: any;
    @Autowired("columnController") private columnController: ColumnController;
    @Autowired("rowCssClassCalculator") private rowCssClassCalculator: RowCssClassCalculator;
    @Autowired("paginationProxy") private paginationProxy: PaginationProxy;

    private gridPanel: GridPanel;

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    public getPreferredHeightForRow(rowNode: RowNode): number {

        const eDummyContainer = document.createElement('div');
        this.addInRowCssClasses(rowNode, eDummyContainer);

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        const eBodyContainer = this.gridPanel.getCenterContainer();
        eBodyContainer.appendChild(eDummyContainer);

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
                false
            );
            cellComp.setParentRow(eDummyContainer);
            cellComps.push(cellComp);
        });

        const template = cellComps.map(cellComp => cellComp.getCreateTemplate()).join(' ');
        eDummyContainer.innerHTML = template;

        // this gets any cellComps that are using components to put the components in
        cellComps.forEach(cellComp => cellComp.afterAttached());

        // we should be able to just take the height of the row at this point, however
        // the row isn't expanding to cover the cell heights, i don't know why, i couldn't
        // figure it out so instead looking at the individual cells instead
        let maxCellHeight = 0;
        for (let i = 0; i < eDummyContainer.children.length; i++) {
            const child = eDummyContainer.children[i] as HTMLElement;
            if (child.offsetHeight > maxCellHeight) {
                maxCellHeight = child.offsetHeight;
            }
        }

        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(eDummyContainer);

        cellComps.forEach(cellComp => {
            // dunno why we need to detach first, doing it here to be consistent with code in RowComp
            cellComp.detach();
            cellComp.destroy();
        });

        return maxCellHeight;
    }

    private addInRowCssClasses(rowNode: RowNode, eDummyContainer: HTMLDivElement) {
        // so any styles on row also get applied in dummy, otherwise
        // the content in dummy may differ to the real
        const rowIndex = rowNode.rowIndex;
        const params = {
            rowNode: rowNode,
            rowIsEven: rowIndex % 2 === 0,
            rowLevel: this.rowCssClassCalculator.calculateRowLevel(rowNode),
            firstRowOnPage: rowIndex === this.beans.paginationProxy.getPageFirstRow(),
            lastRowOnPage: rowIndex === this.beans.paginationProxy.getPageLastRow(),
            printLayout: false,
            expandable: this.rowCssClassCalculator.isExpandable(rowNode)
        };
        const classes = this.rowCssClassCalculator.getInitialRowClasses(params);
        addCssClass(eDummyContainer, classes.join(' '));
    }
}
