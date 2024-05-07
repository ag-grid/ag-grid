import { BeanStub } from "../context/beanStub";
import { Bean, PostConstruct } from "../context/context";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";

export interface SortOption {
    sort: 'asc' | 'desc';
    column: Column;
}

export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}

// this logic is used by both SSRM and CSRM

@Bean('rowNodeSorter')
export class RowNodeSorter extends BeanStub {

    @PostConstruct
    public init(): void {
    }

    public doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[] {

        return rowNodes;
    }

}