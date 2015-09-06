module awk.grid {

    export interface RowNode {
        /** Unique ID for the node. Can be though of as the index of the row in the original list,
         * however exceptions apply so don't depend on uniqueness. */
        id?: number;
        /** The user provided data */
        data?: any;
        /** The parent node to this node, or empty if top level */
        parent?: RowNode;
        /** How many levels this node is from the top */
        level?: number;
        /** True if this node is a group node (ie has children) */
        group?: boolean;
        /** True if this is the first child in this group */
        firstChild?: boolean;
        /** True if this is the last child in this group */
        lastChild?: boolean;
        /** The index of this node in the group */
        childIndex?: number;
        /** True if this row is a floating row */
        floating?: boolean;
        /** True if this row is a floating top row */
        floatingTop?: boolean;
        /** True if this row is a floating bottom row */
        floatingBottom?: boolean;
        /** If using quick filter, stores a string representation of the row for searching against */
        quickFilterAggregateText?: string;
        /** Groups only - True if row is a footer. Footers  have group = true and footer = true */
        footer?: boolean;
        /** Groups only - Children of this group */
        children?: RowNode[];
        /** Groups only - The field we are pivoting on eg Country*/
        field?: string;
        /** Groups only - The key for the pivot eg Ireland, UK, USA */
        key?: any;
        /** Groups only - Filtered children of this group */
        childrenAfterFilter?: RowNode[];
        /** Groups only - Sorted children of this group */
        childrenAfterSort?: RowNode[];
        /** Groups only - Number of children and grand children */
        allChildrenCount?: number;
        /** Groups only - True if group is expanded, otherwise false */
        expanded?: boolean;
        /** Groups only - If doing footers, reference to the footer node for this group */
        sibling?: RowNode;
        /** Not to be used, internal temporary map used by the grid when creating groups */
        _childrenMap?: {}
    }

}