import {RowRenderer} from "./rowRenderer";
import {GridPanel} from "../gridPanel/gridPanel";
import {Column} from "../entities/column";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {Autowired} from "../context/context";
import {HeaderRenderer} from '../headerRendering/headerRenderer';

@Bean('autoWidthCalculator')
export class AutoWidthCalculator {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('headerRenderer') private headerRenderer: HeaderRenderer;
    @Autowired('enterprise') private enterprise: boolean;

    // this is the trick: we create a dummy container and clone all the cells
    // into the dummy, then check the dummy's width. then destroy the dummy
    // as we don't need it any more.
    // drawback: only the cells visible on the screen are considered
    public getPreferredWidthForColumn(column: Column): number {
        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        var eBodyContainer = this.gridPanel.getBodyContainer();

        // get all the cells that are currently displayed (this only brings back
        // rendered cells, rows not rendered due to row visualisation will not be here)
        var eOriginalCells = this.rowRenderer.getAllCellsForColumn(column);

        // calculate the width for the column with the most text
        var eColumnWidth = this.getPreferredWidth(eBodyContainer, eOriginalCells);

        // we put the dummy into the header container, so it will inherit all the
        // css styles that the real cells are inheriting
        var eHeaderContainer = this.gridPanel.getHeaderContainer();

        // get the header cell for the column
        // we need to wrap it in an array so that it works with the the same function as the body cells
        var eOriginalHeaderCells = [this.headerRenderer.getHeaderCellForColumn(column)];

        // calculate the width for the header column
        // we add extra space so that the sorting icon has room
        var eHeaderWidth = this.getPreferredWidth(eHeaderContainer, eOriginalHeaderCells) + 10;
        // if grid is using enterprise, we need to add extra space for the menu icon
        if(this.enterprise) {
            eHeaderWidth += 20;
        }

        // if the header width is larger than the column width, than it the column width will be over written
        if(eColumnWidth < eHeaderWidth) {
            eColumnWidth = eHeaderWidth;
        }

        // we add 4 as I found without it, the gui still put '...' after some of the texts
        return eColumnWidth + 4;
   }

    private getPreferredWidth(eContainer: HTMLElement, eOriginalCells: HTMLElement[]): number {
        var eDummyContainer = document.createElement('span');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';

        eContainer.appendChild(eDummyContainer);

        eOriginalCells.forEach( (eCell: HTMLElement, index: number) => {
            if(eCell) {
                eDummyContainer.appendChild(this.getCloneParent(eCell));
            }
        });

        // at this point, all the clones are lined up vertically with natural widths. the dummy
        // container will have a width wide enough just to fit the largest.
        var dummyContainerWidth = eDummyContainer.offsetWidth;

        // we are finished with the dummy container, so get rid of it
        eContainer.removeChild(eDummyContainer);

        return dummyContainerWidth;
    }

    private getCloneParent(eCell: HTMLElement): HTMLElement {
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

        return eCloneParent;
    }

}
