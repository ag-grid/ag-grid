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

    public filterAccordingToColumnState (rowNode:RowNode):void{
        let filterActive:boolean = this.filterManager.isAnyFilterPresent();
        this.filter (rowNode, filterActive);
    }

    public filter(rowNode: RowNode, filterActive: boolean): void {

        // recursively get all children that are groups to also filter
        rowNode.childrenAfterGroup.forEach( child => {
            if (child.group) {
                this.filter(child, filterActive);
            }
        });

        // result of filter for this node
        let filterResult: RowNode[];

        if (filterActive) {
            filterResult = [];

            rowNode.childrenAfterGroup.forEach( childNode => {
                if (childNode.group) {
                    // a group is included in the result if it has any children of it's own.
                    // by this stage, the child groups are already filtered
                    if (childNode.childrenAfterFilter.length > 0) {
                        filterResult.push(childNode);
                    }
                } else {
                    // a leaf level node is included if it passes the filter
                    if (this.filterManager.doesRowPassFilter(childNode)) {
                        filterResult.push(childNode);
                    }
                }
            });

        } else {
            // if not filtering, the result is the original list
            filterResult = rowNode.childrenAfterGroup;
        }

        rowNode.childrenAfterFilter = filterResult;

        this.setAllChildrenCount(rowNode);
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