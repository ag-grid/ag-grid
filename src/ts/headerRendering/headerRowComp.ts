
import {Component} from "../widgets/component";
import {PostConstruct, Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnGroup} from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";
import {Column} from "../entities/column";
import {DropTarget} from "../dragAndDrop/dragAndDropService";
import {RenderedHeaderGroupCell} from "./renderedHeaderGroupCell";
import {RenderedHeaderCell} from "./renderedHeaderCell";

export class HeaderRowComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('context') private context: Context;

    private dept: number;
    private pinned: string;

    private headerElements: IRenderedHeaderElement[] = [];

    private eRoot: HTMLElement;
    private dropTarget: DropTarget;

    constructor(dept: number, pinned: string, eRoot: HTMLElement, dropTarget: DropTarget) {
        super(`<div class="ag-header-row"/>`);
        this.dept = dept;
        this.pinned = pinned;
        this.eRoot = eRoot;
        this.dropTarget = dropTarget;
    }

    @PostConstruct
    private init(): void {
        var eRow = this.getGui();

        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        eRow.style.top = (this.dept * rowHeight) + 'px';
        eRow.style.height = rowHeight + 'px';

        var cellTree = this.columnController.getDisplayedColumnGroups(this.pinned);

        var nodesAtDept: ColumnGroupChild[] = [];
        this.addTreeNodesAtDept(cellTree, this.dept, nodesAtDept);

        nodesAtDept.forEach( (child: ColumnGroupChild) => {

            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state
            if (child instanceof ColumnGroup && (<ColumnGroup>child).getDisplayedChildren().length==0) {
                return;
            }

            var renderedHeaderElement = this.createHeaderElement(child);
            this.headerElements.push(renderedHeaderElement);
            var eGui = renderedHeaderElement.getGui();
            eRow.appendChild(eGui);
            
            this.addDestroyFunc( ()=> renderedHeaderElement.destroy() );
        });

    }

    private createHeaderElement(columnGroupChild: ColumnGroupChild): IRenderedHeaderElement {
        var result: IRenderedHeaderElement;
        if (columnGroupChild instanceof ColumnGroup) {
            result = new RenderedHeaderGroupCell(<ColumnGroup> columnGroupChild, this.eRoot, this.dropTarget);
        } else {
            result = new RenderedHeaderCell(<Column> columnGroupChild, this.eRoot, this.dropTarget);
        }
        this.context.wireBean(result);
        return result;
    }

    private addTreeNodesAtDept(cellTree: ColumnGroupChild[], dept: number, result: ColumnGroupChild[]): void {
        cellTree.forEach( (abstractColumn) => {
            if (dept===0) {
                result.push(abstractColumn);
            } else if (abstractColumn instanceof ColumnGroup) {
                var columnGroup = <ColumnGroup> abstractColumn;
                this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept-1, result);
            } else {
                // we are looking for children past a column, so have come to the end,
                // do nothing, and because the tree is balanced, the result of this recursion
                // will be an empty list.
            }
        });
    }
}