import {Bean, Context, Autowired} from "../../context/context";
import {RowNode} from "../../entities/rowNode";
import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {SelectionController} from "../../selectionController";
import {EventService} from "../../eventService";
import {IRowNodeStage, StageExecuteParams} from "../../interfaces/iRowNodeStage";
import {ColumnController} from "../../columnController/columnController";
import {PaginationModel} from "./inMemoryRowModel";

@Bean('flattenStage')
export class FlattenStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;

    public execute(params: StageExecuteParams): RowNode[] {
        let rootNode = params.rowNode;

        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var result: RowNode[] = [];

        // putting value into a wrapper so it's passed by reference
        var nextRowTop: NumberWrapper = {value: 0};

        var pivotMode = this.columnController.isPivotMode();

        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = pivotMode && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;

        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        this.resetRowTops(rootNode);

        let paginationModel = params.paginationModel;
        let bla = paginationModel ? {
            currentIndex: 0,
            startIndex: paginationModel.minPotentialIndex,
            endIndex: paginationModel.minPotentialIndex + paginationModel.currentPageSize
        } : null;

        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, pivotMode, bla);

        return result;
    }

    private resetRowTops(rowNode: RowNode): void {
        rowNode.clearRowTop();
        if (rowNode.group) {
            if (rowNode.childrenAfterGroup) {
                for (let i = 0; i<rowNode.childrenAfterGroup.length; i++) {
                    this.resetRowTops(rowNode.childrenAfterGroup[i])
                }
            }
            if (rowNode.sibling) {
                rowNode.sibling.clearRowTop();
            }
        }
    }

    private recursivelyAddToRowsToDisplay(rowsToFlatten: RowNode[], result: RowNode[],
                                          nextRowTop: NumberWrapper, reduce: boolean, bla: any) {
        if (_.missingOrEmpty(rowsToFlatten)) { return; }


        let groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        let hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();

        for (let i = 0; i < rowsToFlatten.length; i++) {
            let rowNode = rowsToFlatten[i];

            let skipBecauseSuppressRow = groupSuppressRow && rowNode.group;
            let skipBecauseReduce = reduce && !rowNode.group;
            let skipBecauseOpen = hideOpenParents && rowNode.expanded;
            let skipGroupNode = skipBecauseReduce || skipBecauseSuppressRow || skipBecauseOpen;

            if (!skipGroupNode) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, bla);
            }
            if (rowNode.group) {
                if (rowNode.expanded) {
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, reduce, bla);

                    // put a footer in if user is looking for it
                    if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                        this.ensureFooterNodeExists(rowNode);
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, bla);
                    }
                }
            }
            if (rowNode.canFlower && rowNode.expanded) {
                let flowerNode = this.createFlowerNode(rowNode);
                this.addRowNodeToRowsToDisplay(flowerNode, result, nextRowTop, bla);
            }
        }
    }

    // duplicated method, it's also in floatingRowModel
    private addRowNodeToRowsToDisplay(rowNode: RowNode, result: RowNode[], nextRowTop: NumberWrapper, bla: any): void {
        let addRow = true;
        if (bla){
            addRow = (bla.currentIndex >= bla.startIndex && bla.currentIndex < bla.endIndex);
        }

        if  (addRow) {
            result.push(rowNode);
            if (_.missing(rowNode.rowHeight)) {
                var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
                rowNode.setRowHeight(rowHeight);
            }
            // rowNode.setRowTop(nextRowTop.value);
            rowNode.setRowIndex(result.length  - 1);
            nextRowTop.value += rowNode.rowHeight;
        }
        if (bla){
            bla.currentIndex++;
        }

    }

    private ensureFooterNodeExists(groupNode: RowNode): void {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (_.exists(groupNode.sibling)) { return; }

        var footerNode = new RowNode();
        this.context.wireBean(footerNode);
        Object.keys(groupNode).forEach(function (key) {
            (<any>footerNode)[key] = (<any>groupNode)[key];
        });
        footerNode.footer = true;
        footerNode.rowTop = null;
        footerNode.oldRowTop = null;
        if (_.exists(footerNode.id)) {
            footerNode.id = 'rowGroupFooter_' + footerNode.id;
        }
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
    }

    private createFlowerNode(parentNode: RowNode): RowNode {

        if (_.exists(parentNode.childFlower)) {
            return parentNode.childFlower;
        } else {
            var flowerNode = new RowNode();
            this.context.wireBean(flowerNode);
            flowerNode.flower = true;
            flowerNode.parent = parentNode;
            if (_.exists(parentNode.id)) {
                flowerNode.id = 'flowerNode_' + parentNode.id;
            }
            flowerNode.data = parentNode.data;
            flowerNode.level = parentNode.level + 1;
            parentNode.childFlower = flowerNode;
            return flowerNode;
        }

    }
}

interface NumberWrapper {
    value: number
}