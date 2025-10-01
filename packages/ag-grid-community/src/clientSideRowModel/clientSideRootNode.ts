import type { RowNode } from '../entities/rowNode';

export const initRootNode = <TData = any>(rootNode: RowNode<TData>): RowNode<TData> => {
    rootNode.group = true;
    rootNode.level = -1;
    rootNode.id = 'ROOT_NODE_ID';
    rootNode.allLeafChildren = [];
    rootNode.childrenAfterGroup = [];
    rootNode.childrenAfterSort = [];
    rootNode.childrenAfterAggFilter = [];
    rootNode.childrenAfterFilter = [];

    initRootSibling(rootNode);
    return rootNode;
};

export const initRootSibling = <TData = any>(rootNode: RowNode<TData>): void => {
    const sibling = rootNode.sibling;
    if (sibling) {
        sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
        sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
        sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        sibling.childrenAfterSort = rootNode.childrenAfterSort;
        sibling.childrenMapped = rootNode.childrenMapped;
        sibling.allLeafChildren = rootNode.allLeafChildren;
    }
};
