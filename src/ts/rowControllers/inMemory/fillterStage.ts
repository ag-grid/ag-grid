import {Bean} from "../../context/context";
import {Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {FilterManager} from "../../filter/filterManager";
import {RowNode} from "../../entities/rowNode";
import {IRowNodeStage} from "../../interfaces/iRowNodeStage";

@Bean('filterStage')
export class FilterStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('filterManager') private filterManager: FilterManager;

    public execute(rowsToFilter: RowNode[]): RowNode[] {

        var filterActive: boolean;

        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterActive = false;
        } else {
            filterActive = this.filterManager.isAnyFilterPresent();
        }

        var result: RowNode[];
        if (filterActive) {
            result = this.filterItems(rowsToFilter);
        } else {
            // do it here
            result = rowsToFilter;
            this.recursivelyResetFilter(rowsToFilter);
        }

        return result;
    }

    private filterItems(rowNodes: RowNode[]) {
        var result: RowNode[] = [];

        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var node = rowNodes[i];

            if (node.group) {
                // deal with group
                node.childrenAfterFilter = this.filterItems(node.children);
                if (node.childrenAfterFilter.length > 0) {
                    node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                    result.push(node);
                }
            } else {
                if (this.filterManager.doesRowPassFilter(node)) {
                    result.push(node);
                }
            }
        }

        return result;
    }

    private recursivelyResetFilter(nodes: RowNode[]) {
        if (!nodes) {
            return;
        }
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterFilter = node.children;
                this.recursivelyResetFilter(node.children);
                node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
            }
        }
    }

    private getTotalChildCount(rowNodes: any) {
        var count = 0;
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group) {
                count += item.allChildrenCount;
            } else {
                count++;
            }
        }
        return count;
    }
}
