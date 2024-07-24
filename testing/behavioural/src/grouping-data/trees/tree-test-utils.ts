import type { GridApi, IRowNode } from '@ag-grid-community/core';

import type { RowSnapshot } from '../row-snapshot-test-utils';

const isGridApi = (node: unknown): node is GridApi =>
    typeof node === 'object' && node !== null && typeof (node as GridApi).setGridOption === 'function';

export function findTreeRootNode(gridApi: GridApi) {
    let root: IRowNode = null;
    gridApi.forEachNode((node) => (root ??= node.parent && !node.parent.parent ? node.parent : null));
    return root;
}

export function checkTreeDiagram(
    root: IRowNode | GridApi,
    { printOnlyOnError, ...options }: PrintTreeDiagramOptions = {}
): boolean {
    return printTreeDiagram(root, { ...options, printOnlyOnError: printOnlyOnError ?? true });
}

export interface PrintTreeDiagramOptions {
    nodeToString?: (node: IRowNode) => string;
    printOnlyOnError?: boolean;
}

/** Utility debug function that prints a tree diagram to the console. */
export function printTreeDiagram(
    root: IRowNode | GridApi,
    { nodeToString, printOnlyOnError }: PrintTreeDiagramOptions = {}
): boolean {
    if (isGridApi(root)) {
        root = findTreeRootNode(root);
    }
    if (!root) {
        console.warn('* Empty tree');
        return;
    }
    let diagram = '';
    let errors = 0;
    const recurse = (node: IRowNode, parent: IRowNode | null, branch: string, level: number): void => {
        const children = node.childrenAfterGroup;
        const errs = [];
        if (level !== node.level) errs.push('❌LEVEL!');
        if (parent !== node.parent) errs.push('❌PARENT!');
        errors += errs.length;
        diagram += `${branch}${branch.length ? (children.length !== 0 ? '┬ ' : '─ ') : ''}${node.key ?? node.id} ${node.data ? 'LEAF' : 'filler'} level:${level} node.level:${node.level} id:${node.id} ${errs.join(',')}`;
        if (nodeToString) diagram += ' ' + nodeToString(node);
        diagram += '\n';
        if (branch.length) branch = branch.slice(0, -2) + (branch.slice(-2) === '└─' ? '  ' : '│ ');
        children.forEach((child: IRowNode, i: number) =>
            recurse(child, node, i === children.length - 1 ? branch + '└─' : branch + '├─', level + 1)
        );
    };
    recurse(root, root.parent, '', -1);
    if (!printOnlyOnError) {
        console.log(diagram);
    }
    if (errors) {
        let message = '❌ TREE HAS ' + errors + ' ERRORS';
        if (printOnlyOnError) {
            message = diagram + '\n' + message;
        }
        console.error(message);
        return false;
    }
    if (!printOnlyOnError) {
        console.info('👌 Tree is OK.');
    }
    return true;
}

export function simpleHierarchyRowData() {
    return [
        { orgHierarchy: ['A'] },
        { orgHierarchy: ['A', 'B'] },
        { orgHierarchy: ['C', 'D'] },
        { orgHierarchy: ['E', 'F', 'G', 'H'] },
    ];
}

export function simpleHierarchyRowSnapshot(): RowSnapshot[] {
    return [
        {
            allChildrenCount: 1,
            allLeafChildren: ['B'],
            childIndex: 0,
            childrenAfterFilter: ['B'],
            childrenAfterGroup: ['B'],
            childrenAfterSort: ['B'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'A' },
            id: '0',
            key: 'A',
            lastChild: false,
            leafGroup: undefined,
            level: 0,
            master: false,
            parentKey: null,
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 0,
            rowIndex: 0,
        },
        {
            allChildrenCount: null,
            allLeafChildren: [],
            childIndex: 0,
            childrenAfterFilter: [],
            childrenAfterGroup: [],
            childrenAfterSort: [],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: false,
            groupData: { 'ag-Grid-AutoColumn': 'B' },
            id: '1',
            key: 'B',
            lastChild: true,
            leafGroup: undefined,
            level: 1,
            master: false,
            parentKey: 'A',
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 1,
            rowIndex: 1,
        },
        {
            allChildrenCount: 1,
            allLeafChildren: ['D'],
            childIndex: 1,
            childrenAfterFilter: ['D'],
            childrenAfterGroup: ['D'],
            childrenAfterSort: ['D'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: false,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'C' },
            id: 'row-group-0-C',
            key: 'C',
            lastChild: false,
            leafGroup: false,
            level: 0,
            master: undefined,
            parentKey: null,
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 0,
            rowIndex: 2,
        },
        {
            allChildrenCount: null,
            allLeafChildren: [],
            childIndex: 0,
            childrenAfterFilter: [],
            childrenAfterGroup: [],
            childrenAfterSort: [],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: false,
            groupData: { 'ag-Grid-AutoColumn': 'D' },
            id: '2',
            key: 'D',
            lastChild: true,
            leafGroup: undefined,
            level: 1,
            master: false,
            parentKey: 'C',
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 1,
            rowIndex: 3,
        },
        {
            allChildrenCount: 3,
            allLeafChildren: ['H'],
            childIndex: 2,
            childrenAfterFilter: ['F'],
            childrenAfterGroup: ['F'],
            childrenAfterSort: ['F'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: false,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'E' },
            id: 'row-group-0-E',
            key: 'E',
            lastChild: true,
            leafGroup: false,
            level: 0,
            master: undefined,
            parentKey: null,
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 0,
            rowIndex: 4,
        },
        {
            allChildrenCount: 2,
            allLeafChildren: ['H'],
            childIndex: 0,
            childrenAfterFilter: ['G'],
            childrenAfterGroup: ['G'],
            childrenAfterSort: ['G'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'F' },
            id: 'row-group-0-E-1-F',
            key: 'F',
            lastChild: true,
            leafGroup: false,
            level: 1,
            master: undefined,
            parentKey: 'E',
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 1,
            rowIndex: 5,
        },
        {
            allChildrenCount: 1,
            allLeafChildren: ['H'],
            childIndex: 0,
            childrenAfterFilter: ['H'],
            childrenAfterGroup: ['H'],
            childrenAfterSort: ['H'],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: true,
            groupData: { 'ag-Grid-AutoColumn': 'G' },
            id: 'row-group-0-E-1-F-2-G',
            key: 'G',
            lastChild: true,
            leafGroup: false,
            level: 2,
            master: undefined,
            parentKey: 'F',
            rowGroupIndex: null,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 2,
            rowIndex: 6,
        },
        {
            allChildrenCount: null,
            allLeafChildren: [],
            childIndex: 0,
            childrenAfterFilter: [],
            childrenAfterGroup: [],
            childrenAfterSort: [],
            detail: undefined,
            displayed: true,
            expanded: true,
            firstChild: true,
            footer: undefined,
            group: false,
            groupData: { 'ag-Grid-AutoColumn': 'H' },
            id: '3',
            key: 'H',
            lastChild: true,
            leafGroup: undefined,
            level: 3,
            master: false,
            parentKey: 'G',
            rowGroupIndex: undefined,
            rowPinned: undefined,
            selectable: true,
            siblingKey: undefined,
            uiLevel: 3,
            rowIndex: 7,
        },
    ];
}
