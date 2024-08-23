import type { GridApi, IRowNode } from '@ag-grid-community/core';

import {
    checkGridSelectedNodes,
    checkSimpleRowNodeDom,
    findRootNode,
    info,
    log,
    rowKey,
    verifyPositionInRootChildren,
} from '../../test-utils';

export type TreeDiagramStage = 'childrenAfterGroup' | 'childrenAfterFilter' | 'childrenAfterSort';

export interface TreeDiagramOptions {
    /**
     * There are 3 possible stages to get children from:
     * - 'childrenAfterGroup' - children after group stage
     * - 'childrenAfterFilter' - children after filter stage
     * - 'childrenAfterSort' - children after sort stage (last stage and default value)
     */
    stage?: TreeDiagramStage;

    /** The columns to include */
    columns?: string[];

    /** If false, the id will not be shown in the output data */
    includeId?: boolean;

    /** The DOM element to check. If undefined, the DOM will not be checked. */
    checkDom?: Element | string | false | undefined;

    /** True if selected rows should be checked, default is true */
    checkSelectedNodes?: boolean;
}

export class TreeDiagram {
    public readonly api: GridApi;
    public readonly label: string;
    public readonly root: IRowNode | null = null;
    public readonly stage: TreeDiagramStage;
    public readonly options: TreeDiagramOptions;
    public readonly includeId: boolean = true;
    public readonly columns: ReadonlySet<string> = new Set<string>();
    public readonly uniqueNodeParents = new Map<IRowNode, IRowNode | null>();
    public readonly uniqueChildrenAfterGroupArrays = new Map<IRowNode[], string>();

    public hasErrors = false;
    public diagram: string = '';

    private rowErrors: string[];
    private errorsCount: number = 0;
    private rowIdxCounter: number = 0;

    public constructor(api: GridApi, label: string | null | undefined, options: TreeDiagramOptions) {
        this.api = api;
        this.stage = options.stage ?? 'childrenAfterSort';
        this.label = label ?? '';
        const root = findRootNode(api);
        this.root = root!;
        this.options = options;
        this.columns = new Set(options.columns);
        this.includeId = options.includeId ?? true;
        this.diagram = '\n';
        if (!this.root) {
            this.diagram += '❌ No tree root\n';
            this.errorsCount = 1;
        } else {
            this.recurseRow(this.root, this.root.parent, '', -1, -1, true);
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
        if (this.includeId) {
            rowInfo += `id:${row.id} `;
        }
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
        const children = row[this.stage];
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
        if (level !== row.level) {
            this.diagram += `row.level:${row.level} `;
            this.rowErrors.push('LEVEL!');
        }
        if (parent !== row.parent) {
            this.rowErrors.push(`PARENT!=${rowKey(parent)}`);
            this.diagram += `row.parent:${rowKey(row.parent)} `;
        }

        if (row.childIndex !== (level === -1 ? undefined : idx)) {
            this.rowErrors.push('CHILD_INDEX!');
            this.diagram += `row.childIndex:${row.childIndex} `;
        }
        if (row.firstChild !== (level === -1 ? undefined : idx === 0)) {
            this.rowErrors.push('FIRST_CHILD!');
            this.diagram += `row.firstChild:${row.firstChild} `;
        }
        if (parent && row.lastChild !== (idx === (parent[this.stage]?.length ?? 0) - 1)) {
            this.rowErrors.push('LAST_CHILD!');
            this.diagram += `row.lastChild:${row.lastChild} `;
        }

        const expectedLeafGroup = row.data ? undefined : false; // legacy behaviour, no idea why is undefined
        if (row.leafGroup !== expectedLeafGroup) {
            this.rowErrors.push('LEAF_GROUP!=' + expectedLeafGroup);
            this.diagram += 'row.leafGroup:' + row.leafGroup + ' ';
        }

        const builtChildren = buildChildren(row, this.stage);

        let expectedAllChildrenCount: number | null = builtChildren.allChildrenCount;
        if (level >= 0 && !expectedAllChildrenCount) {
            expectedAllChildrenCount = null;
        }
        if (row.allChildrenCount !== expectedAllChildrenCount) {
            this.rowErrors.push('ALL_CHILDREN_COUNT!=' + expectedAllChildrenCount);
            this.diagram += 'row.allChildrenCount:' + row.allChildrenCount + ' ';
        }

        const leafChildrenErrors =
            level >= 0 && builtChildren.allLeafs && compareRowsSet(builtChildren.allLeafs, row.allLeafChildren);
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

        if (row[this.stage]) {
            const found = row[this.stage]!.find((child) => child.parent !== row);
            if (found !== undefined) {
                this.rowErrors.push('DUPLICATE_CHILDREN_AFTER_GROUP_ARRAY_INSTANCE=' + rowKey(found));
            }
            this.uniqueChildrenAfterGroupArrays.set(row[this.stage]!, rowKey(row));
        }

        if (expanded) {
            if (expectedUiLevel !== row.uiLevel) {
                this.rowErrors.push('UI_LEVEL!=' + expectedUiLevel);
                this.diagram += 'row.uiLevel:' + row.uiLevel + ' ';
            }
        }

        if (this.columns.size && parent) {
            for (const column of this.columns) {
                const cellValue = this.api.getCellValue({ rowNode: row, colKey: column });
                if (cellValue !== undefined || row.data) {
                    this.diagram += `${column}:${JSON.stringify(cellValue)} `;
                }
            }
        }

        if (row.childrenAfterGroup === null) {
            this.rowErrors.push('childrenAfterGroup=null');
        }
        if (row.childrenAfterFilter === null) {
            this.rowErrors.push('childrenAfterFilter=null');
        }
        if (row.childrenAfterSort === null) {
            this.rowErrors.push('childrenAfterSort=null');
        }
        if (!row.allLeafChildren) {
            this.rowErrors.push('allLeafChildren=null!');
        }

        // Verify that childrenAfterGroup does not contains duplicates
        if (row.childrenAfterGroup) {
            const childrenAfterGroupSet = new Set(row.childrenAfterGroup);
            if (childrenAfterGroupSet.size !== row.childrenAfterGroup.length) {
                this.rowErrors.push('DUPLICATE_CHILDREN_AFTER_GROUP=' + row.childrenAfterGroup.map(rowKey).join(','));
            }
        }

        // Verify that childrenAfterFilter does not contains duplicates
        if (row.childrenAfterFilter) {
            const childrenAfterFilterSet = new Set(row.childrenAfterFilter);
            if (childrenAfterFilterSet.size !== row.childrenAfterFilter.length) {
                this.rowErrors.push('DUPLICATE_CHILDREN_AFTER_FILTER=' + row.childrenAfterFilter.map(rowKey).join(','));
            }
        }

        // Verify that childrenAfterSort does not contains duplicates
        if (row.childrenAfterSort) {
            const childrenAfterSortSet = new Set(row.childrenAfterSort);
            if (childrenAfterSortSet.size !== row.childrenAfterSort.length) {
                this.rowErrors.push('DUPLICATE_CHILDREN_AFTER_SORT=' + row.childrenAfterSort.map(rowKey).join(','));
            }
        }

        // Verify that childrenAfterFilter is a subset or the same as childrenAfterGroup
        if (row.childrenAfterGroup && row.childrenAfterFilter) {
            const childrenAfterGroupSet = new Set(row.childrenAfterGroup);
            for (const child of row.childrenAfterFilter) {
                if (!childrenAfterGroupSet.has(child)) {
                    this.rowErrors.push('childrenAfterFilterNotInGroup=' + rowKey(child));
                }
            }
        }

        // Verify that childrenAfterSort is a subset or the same as childrenAfterFilter
        if (row.childrenAfterFilter && row.childrenAfterSort) {
            const childrenAfterFilterSet = new Set(row.childrenAfterFilter);
            for (const child of row.childrenAfterSort) {
                if (!childrenAfterFilterSet.has(child)) {
                    this.rowErrors.push('childrenAfterSortNotInFilter=' + rowKey(child));
                }
            }
        }
    }

    public print(): this {
        log(this.diagram);
        return this;
    }

    /** This verifies that the final DOM structure matches the tree data. */
    public checkDom(element: Element | null | string) {
        if (typeof element === 'string') {
            element = document.getElementById(element) ?? document.querySelector(element);
        }
        if (!element) {
            throw new Error('No grid HTMLElement found');
        }

        const expectedIds: string[] = [];
        const recurse = (row: IRowNode, parentExpanded: boolean) => {
            for (const child of row.childrenAfterSort ?? []) {
                if (parentExpanded) {
                    expectedIds.push(child.id!);
                    checkSimpleRowNodeDom(element, this.api, child);
                }
                recurse(child, parentExpanded && child.expanded);
            }
        };

        recurse(this.root!, true);

        const allRowsIds: string[] = [];
        element.querySelectorAll('[row-id]').forEach((el) => {
            allRowsIds.push(el.getAttribute('row-id')!);
        });

        expectedIds.sort();
        allRowsIds.sort();

        expect(allRowsIds).toEqual(expectedIds);
    }

    public checkEmpty(): void {
        if (this.root?.[this.stage]?.length) {
            const error = new Error(
                'Expected empty tree, but found ' + this.root[this.stage]!.length + ' children.\n' + this.toString()
            );
            Error.captureStackTrace(error, this.checkEmpty);
            throw error;
        }
    }

    public check(diagramSnapshot?: string | string[] | true): this {
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

        try {
            if (this.options.checkSelectedNodes ?? true) {
                checkGridSelectedNodes(this.api);
            }

            if (this.options.checkDom) {
                this.checkDom(this.options.checkDom);
            }
        } catch (e) {
            e.message += '\n' + this.toString();
            throw e;
        }

        return this;
    }

    public toString(): string {
        return (
            (this.label ? '\n✱ ' + this.label + '\n' : '') +
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

function buildChildren(row: IRowNode, stage: TreeDiagramStage) {
    const allLeafs: IRowNode[] | null = stage === 'childrenAfterGroup' ? [] : null;
    let allChildrenCount = 0;
    const recurse = (row: IRowNode) => {
        const children = row[stage];
        if (children) {
            allChildrenCount += children.length;
            for (const child of children) {
                if (allLeafs !== null) {
                    if (!child[stage]?.length) {
                        allLeafs.push(child);
                    }
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
