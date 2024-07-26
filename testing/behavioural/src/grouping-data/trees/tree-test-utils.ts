import type { GridApi, IRowNode } from '@ag-grid-community/core';

import type { RowSnapshot } from '../row-snapshot-test-utils';

const log = console.log;
const warn = console.warn;
const info = console.info;

const isGridApi = (node: unknown): node is GridApi =>
    typeof node === 'object' && node !== null && typeof (node as GridApi).setGridOption === 'function';

export function findTreeRootNode(gridApi: GridApi) {
    let root: IRowNode = null;
    gridApi.forEachNode((row) => (root ??= row.parent && !row.parent.parent ? row.parent : null));
    return root;
}

export function checkTreeDiagram(root: IRowNode | GridApi, options: PrintTreeDiagramOptions | boolean = {}): boolean {
    return printTreeDiagram(
        root,
        typeof options === 'boolean' ? { printOnlyOnError: !options } : { printOnlyOnError: true, ...options }
    );
}

export interface PrintTreeDiagramOptions {
    rowToString?: (row: IRowNode) => string;
    printOnlyOnError?: boolean;
}

/** Utility debug function that prints a tree diagram to the console. */
export function printTreeDiagram(
    root: IRowNode | GridApi,
    { rowToString, printOnlyOnError }: PrintTreeDiagramOptions = {}
): boolean {
    if (isGridApi(root)) {
        root = findTreeRootNode(root);
    }
    if (!root) {
        console.warn('* No root found');
        return false;
    }
    let diagram = '';
    let errorsCount = 0;
    const recurse = (row: IRowNode, parent: IRowNode | null, branch: string, level: number): void => {
        const errs = [];
        let children = row.childrenAfterGroup;
        if (!children) {
            children = [];
            errs.push('❌NULL_CHILDREN!');
        }
        const type = row.level === -1 && row === root ? 'ROOT' : row.data ? 'LEAF' : 'filler';
        diagram += `${branch}${branch.length ? (children.length !== 0 ? '┬ ' : '─ ') : ''}${row.key ?? row.id} ${type} level:${level} `;
        if (level !== row.level) {
            diagram += `row.level:${row.level} `;
            errs.push('❌LEVEL!');
        }
        if (parent !== row.parent) {
            errs.push('❌PARENT!');
            diagram += `row.parent:${row.parent ? row.parent?.id : 'null'} `;
        }
        errorsCount += errs.length;
        diagram += `id:${row.id} `;
        if (rowToString) diagram += ' ' + rowToString(row);
        diagram += ' ' + errs.join(' ');
        diagram += '\n';
        if (branch.length) branch = branch.slice(0, -2) + (branch.slice(-2) === '└─' ? '  ' : '│ ');
        children.forEach((child: IRowNode, i: number) =>
            recurse(child, row, i === children.length - 1 ? branch + '└─' : branch + '├─', level + 1)
        );
    };
    recurse(root, root.parent, '', -1);
    if (!printOnlyOnError) {
        log(diagram);
    }
    if (errorsCount > 0) {
        const message = '❌ TREE HAS ' + errorsCount + ' ERRORS';
        warn(printOnlyOnError ? diagram + '\n\n' + message : message);
        return false;
    }
    if (!printOnlyOnError) {
        info('👌 Tree is OK.');
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
