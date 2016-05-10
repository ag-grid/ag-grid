import {Utils as _} from '../utils';
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnGroup} from "../entities/columnGroup";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired} from "../context/context";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";
import {Column} from "../entities/column";
import {Context} from "../context/context";
import {RenderedHeaderGroupCell} from "./renderedHeaderGroupCell";
import {RenderedHeaderCell} from "./renderedHeaderCell";
import {DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {MoveColumnController} from "./moveColumnController";
import {ColumnController} from "../columnController/columnController";
import {DropTarget} from "../dragAndDrop/dragAndDropService";
import {GridPanel} from "../gridPanel/gridPanel";
import {PostConstruct} from "../context/context";

export class HeaderContainer {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('$scope') private $scope: any;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;
    private eRoot: HTMLElement;

    private pinned: string;

    private headerElements: IRenderedHeaderElement[] = [];

    private dropTarget: DropTarget;

    constructor(eContainer: HTMLElement, eViewport: HTMLElement, eRoot: HTMLElement, pinned: string) {
        this.eContainer = eContainer;
        this.eRoot = eRoot;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }

    @PostConstruct
    public init(): void {
        var moveColumnController = new MoveColumnController(this.pinned);
        this.context.wireBean(moveColumnController);

        var secondaryContainers: HTMLElement[];
        switch (this.pinned) {
            case Column.PINNED_LEFT: secondaryContainers = this.gridPanel.getDropTargetLeftContainers(); break;
            case Column.PINNED_RIGHT: secondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers(); break;
            default: secondaryContainers = this.gridPanel.getDropTargetBodyContainers(); break;
        }

        var icon = this.pinned ? DragAndDropService.ICON_PINNED : DragAndDropService.ICON_MOVE;

        this.dropTarget = {
            eContainer: this.eViewport ? this.eViewport : this.eContainer,
            iconName: icon,
            eSecondaryContainers: secondaryContainers,
            onDragging: moveColumnController.onDragging.bind(moveColumnController),
            onDragEnter: moveColumnController.onDragEnter.bind(moveColumnController),
            onDragLeave: moveColumnController.onDragLeave.bind(moveColumnController),
            onDragStop: moveColumnController.onDragStop.bind(moveColumnController)
        };
        this.dragAndDropService.addDropTarget(this.dropTarget);
    }

    public removeAllChildren(): void {
        this.headerElements.forEach( (headerElement: IRenderedHeaderElement) => {
            headerElement.destroy();
        });
        this.headerElements.length = 0;
        _.removeAllChildren(this.eContainer);
    }

    public insertHeaderRowsIntoContainer(): void {

        var cellTree = this.columnController.getDisplayedColumnGroups(this.pinned);

        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        for (var dept = 0; ; dept++) {

            var nodesAtDept: ColumnGroupChild[] = [];
            this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);

            // we want to break the for loop when we get to an empty set of cells,
            // that's how we know we have finished rendering the last row.
            if (nodesAtDept.length===0) {
                break;
            }

            var eRow: HTMLElement = document.createElement('div');
            eRow.className = 'ag-header-row';
            eRow.style.top = (dept * rowHeight) + 'px';
            eRow.style.height = rowHeight + 'px';

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
            });

            this.eContainer.appendChild(eRow);
        }

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

    private createHeaderElement(columnGroupChild: ColumnGroupChild): IRenderedHeaderElement {
        var result: IRenderedHeaderElement;
        if (columnGroupChild instanceof ColumnGroup) {
            result = new RenderedHeaderGroupCell(<ColumnGroup> columnGroupChild, this.eRoot, this.$scope, this.dropTarget);
        } else {
            result = new RenderedHeaderCell(<Column> columnGroupChild, this.$scope, this.eRoot, this.dropTarget);
        }
        this.context.wireBean(result);
        return result;
    }

    public onIndividualColumnResized(column: Column): void {
        this.headerElements.forEach( (headerElement: IRenderedHeaderElement) => {
            headerElement.onIndividualColumnResized(column);
        });
    }

}