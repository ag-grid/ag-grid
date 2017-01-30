import {RowRenderer} from "./rowRenderer";
import {GridPanel} from "../gridPanel/gridPanel";
import {Column} from "../entities/column";
import {Bean} from "../context/context";
import {Utils as _} from "../utils";
import {Autowired} from "../context/context";
import {HeaderRenderer} from "../headerRendering/headerRenderer";
import {RenderedHeaderCell} from "../headerRendering/deprecated/renderedHeaderCell";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {HeaderComp} from "../headerRendering/header/headerComp";
import {HeaderWrapperComp} from "../headerRendering/header/headerWrapperComp";
import {Component} from "../widgets/component";

export interface GuiProvider {
    ():HTMLElement
}

@Bean('autoWidthCalculator')
export class AutoWidthCalculator {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('headerRenderer') private headerRenderer: HeaderRenderer;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;


    // this is the trick: we create a dummy container and clone all the cells
    // into the dummy, then check the dummy's width. then destroy the dummy
    // as we don't need it any more.
    // drawback: only the cells visible on the screen are considered
    public getPreferredWidthForColumn(column: Column): number {
        let eHeaderCell = this.getHeaderCellForColumn(column);
        // cell isn't visible
        if (!eHeaderCell) {
            return -1; 
        }

        var eDummyContainer = document.createElement('span');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        var eBodyContainer = this.gridPanel.getBodyContainer();
        eBodyContainer.appendChild(eDummyContainer);

        // get all the cells that are currently displayed (this only brings back
        // rendered cells, rows not rendered due to row visualisation will not be here)
        this.putRowCellsIntoDummyContainer(column, eDummyContainer);

        // also put header cell in
        // we only consider the lowest level cell, not the group cell. in 99% of the time, this
        // will be enough. if we consider groups, then it gets to complicated for what it's worth,
        // as the groups can span columns and this class only considers one column at a time.
        this.cloneItemIntoDummy(eHeaderCell, eDummyContainer);

        // at this point, all the clones are lined up vertically with natural widths. the dummy
        // container will have a width wide enough just to fit the largest.
        var dummyContainerWidth = eDummyContainer.offsetWidth;

        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(eDummyContainer);

        // we add padding as I found without it, the gui still put '...' after some of the texts
        var autoSizePadding = this.gridOptionsWrapper.getAutoSizePadding();
        if (typeof autoSizePadding !== 'number' || autoSizePadding < 0) {
            autoSizePadding = 4;
        }
        return dummyContainerWidth + autoSizePadding;
    }

    private getHeaderCellForColumn(column: Column): HTMLElement {

        let comp : Component = null;

        // find the rendered header cell
        this.headerRenderer.forEachHeaderElement( headerElement => {
            if (headerElement instanceof RenderedHeaderCell) {
                let currentCell = <RenderedHeaderCell> headerElement;
                if (currentCell.getColumn() === column) {
                    comp = currentCell;
                }
            } else if (headerElement instanceof HeaderWrapperComp) {
                let headerWrapperComp = <HeaderWrapperComp> headerElement;
                if (headerWrapperComp.getColumn() === column) {
                    comp = headerWrapperComp;
                }
            }
        });

        return comp ? comp.getGui() : null;
    }
    
    private putRowCellsIntoDummyContainer(column: Column, eDummyContainer: HTMLElement): void {

        var eOriginalCells = this.rowRenderer.getAllCellsForColumn(column);

        eOriginalCells.forEach( (eCell: HTMLElement, index: number) => {
            this.cloneItemIntoDummy(eCell, eDummyContainer);
        });
    }

    private cloneItemIntoDummy(eCell: HTMLElement, eDummyContainer: HTMLElement): void {
        // make a deep clone of the cell
        var eCellClone: HTMLElement = <HTMLElement> eCell.cloneNode(true);
        // the original has a fixed width, we remove this to allow the natural width based on content
        eCellClone.style.width = '';
        // the original has position = absolute, we need to remove this so it's positioned normally
        eCellClone.style.position = 'static';
        eCellClone.style.left = '';
        // we put the cell into a containing div, as otherwise the cells would just line up
        // on the same line, standard flow layout, by putting them into divs, they are laid
        // out one per line
        var eCloneParent = document.createElement('div');
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
