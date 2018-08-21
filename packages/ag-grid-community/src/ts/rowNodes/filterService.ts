import {Bean, Autowired, PostConstruct} from "../context/context";
import {RowNode} from "../entities/rowNode";
import {FilterManager} from "../filter/filterManager";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
@Bean("filterService")
export class FilterService {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private doingTreeData: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
    }

    public filterAccordingToColumnState(rowNode: RowNode): void {
        let filterActive: boolean = this.filterManager.isAnyFilterPresent();
        this.filter (rowNode, filterActive);
    }

    public filter(rowNode: RowNode, filterActive: boolean): void {

        // recursively get all children that are groups to also filter
        if (rowNode.hasChildren()) {

            rowNode.childrenAfterGroup.forEach( node => this.filter(node, filterActive));

            // result of filter for this node
            if (filterActive) {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(childNode => {
                    // a group is included in the result if it has any children of it's own.
                    // by this stage, the child groups are already filtered
                    let passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;

                    // both leaf level nodes and tree data nodes have data. these get added if
                    // the data passes the filter
                    let passBecauseDataPasses = childNode.data && this.filterManager.doesRowPassFilter(childNode);

                    // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass

                    return passBecauseChildren || passBecauseDataPasses;
                });
            } else {
                // if not filtering, the result is the original list
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            }

            this.setAllChildrenCount(rowNode);

        } else {
            rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            rowNode.setAllChildrenCount(null);
        }
    }

    private setAllChildrenCountTreeData(rowNode: RowNode) {
        // for tree data, we include all children, groups and leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach((child: RowNode) => {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }

    private setAllChildrenCountGridGrouping(rowNode: RowNode) {
        // for grid data, we only count the leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach((child: RowNode) => {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            } else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }

    private setAllChildrenCount(rowNode: RowNode) {
        if (this.doingTreeData) {
            this.setAllChildrenCountTreeData(rowNode);
        } else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    }
}