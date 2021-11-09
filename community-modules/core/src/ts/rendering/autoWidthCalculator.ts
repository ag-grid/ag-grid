import { RowRenderer } from "./rowRenderer";
import { Column } from "../entities/column";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { containsClass, addCssClass } from "../utils/dom";
import { CtrlsService } from "../ctrlsService";
import { RowContainerCtrl } from "../gridBodyComp/rowContainer/rowContainerCtrl";
import { RowCssClassCalculator } from "./row/rowCssClassCalculator";

@Bean('autoWidthCalculator')
export class AutoWidthCalculator extends BeanStub {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('rowCssClassCalculator') public rowCssClassCalculator: RowCssClassCalculator;

    private centerRowContainerCon: RowContainerCtrl;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;
        });
    }

    // this is the trick: we create a dummy container and clone all the cells
    // into the dummy, then check the dummy's width. then destroy the dummy
    // as we don't need it any more.
    // drawback: only the cells visible on the screen are considered
    public getPreferredWidthForColumn(column: Column, skipHeader?: boolean): number {
        const eHeaderCell = this.getHeaderCellForColumn(column);
        // cell isn't visible
        if (!eHeaderCell) { return -1; }

        const eDummyContainer = document.createElement('span');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        const eBodyContainer = this.centerRowContainerCon.getContainerElement();
        eBodyContainer.appendChild(eDummyContainer);

        // get all the cells that are currently displayed (this only brings back
        // rendered cells, rows not rendered due to row visualisation will not be here)
        this.putRowCellsIntoDummyContainer(column, eDummyContainer);

        if (!skipHeader) {
            // we only consider the lowest level cell, not the group cell. in 99% of the time, this
            // will be enough. if we consider groups, then it gets too complicated for what it's worth,
            // as the groups can span columns and this class only considers one column at a time.
            this.cloneItemIntoDummy(eHeaderCell, eDummyContainer);
        }

        // at this point, all the clones are lined up vertically with natural widths. the dummy
        // container will have a width wide enough just to fit the largest.
        const dummyContainerWidth = eDummyContainer.offsetWidth;

        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(eDummyContainer);

        // we add padding as I found sometimes the gui still put '...' after some of the texts. so the
        // user can configure the grid to add a few more pixels after the calculated width
        const autoSizePadding = this.gridOptionsWrapper.getAutoSizePadding();
        return dummyContainerWidth + autoSizePadding;
    }

    private getHeaderCellForColumn(column: Column): HTMLElement | null {

        let element: HTMLElement | null = null;

        this.ctrlsService.getHeaderRowContainerCtrls().forEach(container => {
                const res = container.getHtmlElementForColumnHeader(column);
                if (res!=null) { element = res; }
            }
        );

        return element;
    }

    private putRowCellsIntoDummyContainer(column: Column, eDummyContainer: HTMLElement): void {
        const eCellElements = this.rowRenderer.getAllCellsForColumn(column);
        eCellElements.forEach(eCell  => this.cloneItemIntoDummy(eCell, eDummyContainer));
    }

    private cloneItemIntoDummy(eCell: HTMLElement, eDummyContainer: HTMLElement): void {
        // make a deep clone of the cell
        const eCellClone: HTMLElement = eCell.cloneNode(true) as HTMLElement;
        // the original has a fixed width, we remove this to allow the natural width based on content
        eCellClone.style.width = '';
        // the original has position = absolute, we need to remove this so it's positioned normally
        eCellClone.style.position = 'static';
        eCellClone.style.left = '';
        // we put the cell into a containing div, as otherwise the cells would just line up
        // on the same line, standard flow layout, by putting them into divs, they are laid
        // out one per line
        const eCloneParent = document.createElement('div');

        if (containsClass(eCellClone, 'ag-header-cell')) {
            addCssClass(eCloneParent, 'ag-header');
            addCssClass(eCloneParent, 'ag-header-row');
            eCloneParent.style.position = 'static';
        } else {
            addCssClass(eCloneParent, 'ag-row');
        }

        // find parent using classes (headers have ag-header-cell, rows have ag-row), and copy classes from it.
        // if we didn't do this, things like ag-row-level-2 would be missing if present, which sets indents
        // onto group items.
        let pointer = eCell.parentElement;
        while (pointer) {
            if (pointer.classList.contains('ag-header-row') || pointer.classList.contains('ag-row')) {
                for (let i = 0; i < pointer.classList.length; i++) {
                    const item = pointer.classList[i];

                    // we skip ag-row-position-absolute, as this has structural CSS applied that stops the
                    // element from fitting into it's parent, and we need the element to stretch the parent
                    // as we are measuring the parents width
                    if (item != 'ag-row-position-absolute') {
                        addCssClass(eCloneParent, item);
                    }
                }
                break;
            }
            pointer = pointer.parentElement;
        }

        // table-row, so that each cell is on a row. i also tried display='block', but this
        // didn't work in IE
        eCloneParent.style.display = 'table-row';

        // the twig on the branch, the branch on the tree, the tree in the hole,
        // the hole in the bog, the bog in the clone, the clone in the parent,
        // the parent in the dummy, and the dummy down in the vall-e-ooo, OOOOOOOOO! Oh row the rattling bog....
        eCloneParent.appendChild(eCellClone);
        eDummyContainer.appendChild(eCloneParent);
    }
}
