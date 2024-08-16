import type { GridApi, IRowNode, RowDataTransaction, RowNode } from '@ag-grid-community/core';

import { isGridApi, verifyPositionInRootChildren } from '../../test-utils';
import type { RowSnapshot } from '../row-snapshot-test-utils';

const log = console.log;
const info = console.info;

function rowKey(row: IRowNode | null | undefined): string {
    return row?.key ?? row?.id ?? 'null';
}

export async function executeTransactionsAsync(transactions: RowDataTransaction<any>[], api: GridApi<any>) {
    const promises: Promise<void>[] = [];
    for (const transaction of transactions) {
        promises.push(
            new Promise((resolve) => {
                api.applyTransactionAsync(transaction, () => resolve());
            })
        );
    }

    api.flushAsyncTransactions();
    await Promise.all(promises);
}

function findTreeRootNodes(gridApi: GridApi | IRowNode[]): IRowNode[] {
    const set = new Set<IRowNode>();
    const processNode = (row: IRowNode) => {
        if (row.parent && !row.parent.parent) {
            set.add(row.parent);
        }
    };
    if (Array.isArray(gridApi)) {
        gridApi.forEach(processNode);
    } else {
        gridApi.forEachNode(processNode);
    }
    return Array.from(set);
}

export function findTreeRootNode(gridApi: GridApi | IRowNode[]): IRowNode | null {
    const rootNodes = findTreeRootNodes(gridApi);
    if (rootNodes.length === 0) return null;
    if (rootNodes.length !== 1)
        throw new Error(
            'Expected one root node, but found ' + rootNodes.length + '. ' + rootNodes.map((n) => n.key).join(', ')
        );
    return rootNodes[0];
}

export class TreeDiagram {
    public label: string;
    public root: IRowNode | null = null;
    public diagram: string = '';
    public hasErrors = false;
    public readonly uniqueNodeParents = new Map<IRowNode, IRowNode | null>();
    private readonly uniqueChildrenAfterGroupArrays = new Map<IRowNode[], string>();

    private rowErrors: string[];
    private errorsCount: number = 0;
    private rowIdxCounter: number = 0;

    public constructor(root: IRowNode | IRowNode[] | GridApi, label: string = '') {
        this.label = label;
        this.diagram = '\n';
        const rootNodes = isGridApi(root) || Array.isArray(root) ? findTreeRootNodes(root) : [root];
        if (rootNodes.length === 0) {
            this.diagram += '❌ No tree root\n';
            this.errorsCount = 1;
        }
        for (const root of rootNodes) {
            this.root = root;
            this.recurseRow(root, root.parent, '', -1, -1, true);
        }
    }

    private getNodeType(row: IRowNode): string {
        if (row.level === -1 && row === this.root) {
            return 'ROOT';
        } else if (row.data) {
            if (row.childrenAfterGroup?.length) {
                return 'GROUP';
            }
            return 'LEAF';
        }
        return 'filler';
    }

    private formatRowErrors(errors: string[]): string {
        return errors.map((err) => '❌' + err).join(' ');
    }

    private buildRowInfo(row: IRowNode, type: string, duplicateParent: IRowNode | null | undefined): string {
        let rowInfo = `${type} `;

        if (row.isSelected()) {
            rowInfo += 'selected ';
        }
        if (row.level >= 0 && !row.expanded && row.group) {
            rowInfo += '!expanded ';
        }
        rowInfo += `id:${row.id} `;
        if (row.data?._diagramLabel) {
            rowInfo += 'label:' + row.data._diagramLabel + ' ';
        }
        if (duplicateParent !== undefined) {
            rowInfo += ' ' + this.formatRowErrors(['DUPLICATE in ' + rowKey(duplicateParent)]);
        }

        return rowInfo;
    }

    private recurseChildren(row: IRowNode, branch: string, level: number, expanded: boolean, children: IRowNode[]) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this.recurseRow(
                child,
                row,
                i === children.length - 1 ? branch + '└─' : branch + '├─',
                level + 1,
                i,
                expanded && (!row.parent || row.expanded)
            );
        }
    }

    private recurseRow(
        row: IRowNode,
        parent: IRowNode | null,
        branch: string,
        level: number,
        idx: number,
        expanded: boolean
    ) {
        if (level < 0) {
            this.rowIdxCounter = -1;
        }

        const duplicateParent = this.uniqueNodeParents.get(row);
        const children = row.childrenAfterGroup;
        const type = this.getNodeType(row);
        const branchPrefix = branch.length ? (children?.length ? '┬ ' : '─ ') : '';
        const rowInfo = this.buildRowInfo(row, type, duplicateParent);

        this.diagram += `${branch}${branchPrefix}${rowKey(row)} ${rowInfo}`;

        let expectedUiLevel: number | undefined = Math.ceil(branch.length / 2 - 1);
        if (expectedUiLevel < 0) {
            expectedUiLevel = undefined;
        }

        this.rowErrors = [];
        if (duplicateParent === undefined) {
            this.uniqueNodeParents.set(row, parent);
            this.checkRow(row, level, parent!, idx, expanded, expectedUiLevel);
        } else {
            this.rowErrors.push('DUPLICATE in ' + rowKey(duplicateParent));
        }
        this.errorsCount += this.rowErrors.length;
        this.hasErrors ||= this.errorsCount > 0;
        this.diagram += ' ' + this.formatRowErrors(this.rowErrors) + '\n';

        if (branch.length > 0) {
            branch = branch.slice(0, -2) + (branch.slice(-2) === '└─' ? '· ' : '│ ');
        }

        if (expanded || !row.parent) {
            ++this.rowIdxCounter;
        }

        if (!duplicateParent && children) {
            this.recurseChildren(row, branch, level, expanded, children);
        }
    }

    private checkRow(
        row: IRowNode<any>,
        level: number,
        parent: IRowNode<any> | null,
        idx: number,
        expanded: boolean,
        expectedUiLevel: number | undefined
    ) {
        if (row === this.root) {
            if (row.id !== 'ROOT_NODE_ID') this.rowErrors.push('ROOT_NODE_ID!');
            if (row.key) this.rowErrors.push('ROOT_NODE_KEY!');
        }
        if (!row.childrenAfterGroup) {
            this.rowErrors.push('childrenAfterGroup=null');
        }
        if (!row.allLeafChildren) {
            this.rowErrors.push('allLeafChildren=null!');
        }
        if (level !== row.level) {
            this.diagram += `row.level:${row.level} `;
            this.rowErrors.push('LEVEL!');
        }
        if (parent !== row.parent) {
            this.rowErrors.push(`PARENT!=${rowKey(parent)}`);
            this.diagram += `row.parent:${rowKey(row.parent)} `;
        }

        // TODO: handle sorting properly for childIndex
        if (row.childIndex !== (level === -1 ? undefined : idx)) {
            this.rowErrors.push('CHILD_INDEX!');
            this.diagram += `row.childIndex:${row.childIndex} `;
        }
        if (row.firstChild !== (level === -1 ? undefined : idx === 0)) {
            this.rowErrors.push('FIRST_CHILD!');
            this.diagram += `row.firstChild:${row.firstChild} `;
        }
        if (parent && row.lastChild !== (idx === (parent.childrenAfterGroup?.length ?? 0) - 1)) {
            this.rowErrors.push('LAST_CHILD!');
            this.diagram += `row.lastChild:${row.lastChild} `;
        }

        const expectedLeafGroup = row.data ? undefined : false; // legacy behaviour, no idea why is undefined
        if (row.leafGroup !== expectedLeafGroup) {
            this.rowErrors.push('LEAF_GROUP!=' + expectedLeafGroup);
            this.diagram += 'row.leafGroup:' + row.leafGroup + ' ';
        }

        const builtChildren = buildChildren(row);

        const expectedAllChildrenCount = builtChildren.allChildrenCount || null;
        if (row.allChildrenCount !== expectedAllChildrenCount) {
            this.rowErrors.push('ALL_CHILDREN_COUNT!=' + expectedAllChildrenCount);
            this.diagram += 'row.allChildrenCount:' + row.allChildrenCount + ' ';
        }

        const leafChildrenErrors = level >= 0 && compareRowsSet(builtChildren.allLeafs, row.allLeafChildren);
        if (leafChildrenErrors) {
            this.rowErrors.push('LEAF_CHILDREN[' + leafChildrenErrors + ']');
            this.diagram += 'row.allLeafChildren:' + row.allLeafChildren?.map(rowKey).join(',') + ' ';
        }

        // rowGroupIndex seems to be null for fillers and undefined otherwise in the original implementation
        const expectedRowGroupIndex = level < 0 || row.data ? undefined : null;
        if (row.rowGroupIndex !== expectedRowGroupIndex) {
            this.rowErrors.push('ROW_GROUP_INDEX!=' + expectedRowGroupIndex);
            this.diagram += `row.rowGroupIndex:${row.rowGroupIndex} `;
        }

        // TODO: we need to handle the case for filters, collapsed groups and sorting
        const expectedRowIndex = level < 0 || !expanded ? null : this.rowIdxCounter >= 0 ? this.rowIdxCounter : null;
        if (row.rowIndex !== expectedRowIndex) {
            this.rowErrors.push('ROW_INDEX!=' + expectedRowIndex);
            this.diagram += 'rowIdx:' + row.rowIndex + ' ';
        }

        const expectedGroup = level < 0 || !!row.childrenAfterGroup?.length;
        if (row.group !== expectedGroup) {
            this.rowErrors.push('group!=' + expectedGroup);
            this.diagram += 'row.group:' + row.group + ' ';
        }

        if (level < 0 && row.expanded) {
            this.rowErrors.push('ROOT_EXPANDED');
        }

        if (row.childrenAfterGroup) {
            const found = row.childrenAfterGroup.find((child) => child.parent !== row);
            if (found !== undefined) {
                this.rowErrors.push('DUPLICATE_CHILDREN_AFTER_GROUP_ARRAY_INSTANCE=' + rowKey(found));
            }
            this.uniqueChildrenAfterGroupArrays.set(row.childrenAfterGroup, rowKey(row));
        }

        if (expanded) {
            if (expectedUiLevel !== row.uiLevel) {
                this.rowErrors.push('UI_LEVEL!=' + expectedUiLevel);
                this.diagram += 'row.uiLevel:' + row.uiLevel + ' ';
            }
        }
    }

    public print(): this {
        log(this.diagram);
        return this;
    }

    public checkEmpty(): void {
        if (this.root?.childrenAfterGroup?.length) {
            const error = new Error(
                'Expected empty tree, but found ' +
                    this.root.childrenAfterGroup.length +
                    ' children.\n' +
                    this.toString()
            );
            Error.captureStackTrace(error, this.checkEmpty);
            throw error;
        }
    }

    public check(diagramSnapshot?: string | string[] | true): void {
        try {
            verifyPositionInRootChildren(this.root?.allLeafChildren ?? []);

            if (diagramSnapshot !== undefined && diagramSnapshot !== true) {
                expect(normalizeDiagram(this.diagram)).toEqual(normalizeDiagram(diagramSnapshot));
            }
            if (this.hasErrors) {
                throw new Error('');
            }
        } catch (e) {
            e.message += '\n' + this.toString();
            Error.captureStackTrace(e, this.check);
            throw e;
        }

        if (diagramSnapshot === true) {
            info(this.toString());
        }
    }

    public toString(): string {
        return (
            (this.label ? '\n🧪 ' + this.label + '\n' : '') +
            this.diagram +
            (this.errorsCount ? '\n❌ TREE HAS ' + this.errorsCount + ' ERRORS\n' : '')
        );
    }
}

function normalizeDiagram(diagram: string | string[]) {
    let lines = Array.isArray(diagram) ? diagram : diagram.split('\n');
    lines = lines.filter((line) => line.trim().length > 0).map((line) => line.trimEnd());
    const minIndent = Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length ?? 0));
    if (minIndent > 0) lines = lines.map((line) => line.slice(minIndent));
    return lines.join('\n');
}

function buildChildren(row: IRowNode) {
    const allLeafs: IRowNode[] = [];
    let allChildrenCount = 0;
    const recurse = (row: IRowNode) => {
        if (row.childrenAfterGroup) {
            allChildrenCount += row.childrenAfterGroup.length;
            for (const child of row.childrenAfterGroup) {
                if (!child.childrenAfterGroup?.length) {
                    allLeafs.push(child);
                }
                recurse(child);
            }
        }
    };
    recurse(row);
    return { allLeafs, allChildrenCount };
}

function compareRowsSet(
    expected: Set<IRowNode> | IRowNode[] | null | undefined,
    actual: Set<IRowNode> | IRowNode[] | null | undefined
): string {
    const errors: string[] = [];
    const makeSet = (x: Set<IRowNode> | IRowNode[] | null | undefined): Set<IRowNode> => {
        if (!Array.isArray(x)) {
            if (!x) errors.push('[NULL]');
            return x ?? new Set();
        }
        const result = new Set<IRowNode>();
        for (const row of x) {
            if (result.has(row)) errors.push('[DUP]' + rowKey(row));
            result.add(row);
        }
        return result;
    };
    expected = makeSet(expected);
    actual = makeSet(actual);
    for (const row of expected) if (!actual.has(row)) errors.push('-' + rowKey(row));
    for (const row of actual) if (!expected.has(row)) errors.push('+' + rowKey(row));
    return errors.join(' ');
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
            expanded: false,
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
            expanded: false,
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
            expanded: false,
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
