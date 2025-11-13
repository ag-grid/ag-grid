import type { Column, RowNode } from 'ag-grid-community';
import { isRowNumberCol } from 'ag-grid-community';

import { optionalEscapeString, rowIdAndIndexToString, rowIdToString } from '../grid-test-utils';
import type { GridRows } from './gridRows';

export class GridRowsDiagramNode {
    public parent: GridRowsDiagramNode | null = null;
    public children = new Map<RowNode | null, GridRowsDiagramNode>();
    public hiddenChildren: Set<GridRowsDiagramNode> | null = null;
    public prefix: string = '';

    public constructor(
        public readonly gridRows: GridRows,
        public readonly row: RowNode | null
    ) {}
}

export class GridRowsDiagramTree {
    public readonly diagramRoots = new Map<GridRows, GridRowsDiagramNode>();
    public readonly diagramNodes = new Map<RowNode, GridRowsDiagramNode>();

    public constructor(public readonly gridRows: GridRows) {
        const diagramRoot = this.getDiagramRoot(gridRows)!;
        this.updateDiagramTree(diagramRoot, '', new Set());
    }

    private getRowChildren(row: RowNode): RowNode[] | null {
        return row.childrenAfterSort ?? row.childrenAfterAggFilter ?? row.childrenAfterFilter ?? row.childrenAfterGroup;
    }

    private processHiddenRows(
        gridRows: GridRows,
        row: RowNode,
        processedHiddenRows: Set<RowNode>,
        displayedRowsSet?: Set<RowNode>
    ) {
        if (processedHiddenRows.has(row)) {
            return;
        }
        processedHiddenRows.add(row);

        const children = this.getRowChildren(row);
        if (!children?.length) {
            return;
        }

        let node: GridRowsDiagramNode | null = null;
        for (const child of children) {
            const isHidden = displayedRowsSet ? !displayedRowsSet.has(child) : !this.diagramNodes.has(child);

            if (isHidden && !this.diagramNodes.has(child)) {
                if (!node) {
                    node = this.getDiagramNode(gridRows, row);
                    if (!node) {
                        return;
                    }
                    node.hiddenChildren ??= new Set();
                }

                const diagramChild = this.getDiagramNode(gridRows, child);
                if (diagramChild) {
                    node.hiddenChildren!.add(diagramChild);
                    this.processHiddenRows(gridRows, child, processedHiddenRows, displayedRowsSet);
                }
            }
        }
    }

    public getNodeType(gridRows: GridRows, row: RowNode): string {
        if (row.level === -1 && row === gridRows.rootRowNode) {
            return 'ROOT';
        }
        if (row.footer) {
            return 'footer';
        }
        const values: string[] = [];
        if (row.master) {
            values.push('master');
        }
        if (row.detail) {
            values.push('detail');
        } else if (row.group && !row.data) {
            values.push(row.leafGroup ? 'LEAF_GROUP' : 'filler');
        } else if (row.group || row.childrenAfterGroup?.length || row.hasChildren()) {
            values.push('GROUP');
        }
        if (row.leafGroup && !values.includes('LEAF_GROUP')) {
            values.push('leafGroup');
        }
        if (values.length > 0) {
            return values.join('-');
        }
        return row.data ? 'LEAF' : 'filler';
    }

    public getDiagramRoot(gridRows: GridRows): GridRowsDiagramNode {
        let diagramRoot = this.diagramRoots.get(gridRows);
        if (!diagramRoot) {
            const rootRowNode = gridRows.rootRowNode;
            diagramRoot = new GridRowsDiagramNode(gridRows, rootRowNode);
            this.diagramRoots.set(gridRows, diagramRoot);
            if (rootRowNode) {
                this.diagramNodes.set(rootRowNode, diagramRoot);
            }

            const groupHideParentOfSingleChild = gridRows.api.getGridOption('groupHideParentOfSingleChild') ?? false;
            const groupHideOpenParents = gridRows.api.getGridOption('groupHideOpenParents') ?? false;
            const hasHiddenParentOptions = groupHideOpenParents || !!groupHideParentOfSingleChild;

            this.buildHierarchy(gridRows, diagramRoot, gridRows.displayedRows, groupHideParentOfSingleChild);

            if ((gridRows.options.printHiddenRows ?? true) && !hasHiddenParentOptions) {
                const displayedRowsSet = new Set(gridRows.displayedRows);
                const processedHiddenRows = new Set<RowNode>();
                for (const row of gridRows.displayedRows) {
                    this.processHiddenRows(gridRows, row, processedHiddenRows, displayedRowsSet);
                }
            }
        }
        return diagramRoot;
    }

    private buildHierarchy(
        gridRows: GridRows,
        root: GridRowsDiagramNode,
        displayedRows: RowNode[],
        groupHideParentOfSingleChild: boolean | 'leafGroupsOnly'
    ) {
        const hasMasterDetail = gridRows.api.getGridOption('masterDetail') ?? false;

        const parentStack: GridRowsDiagramNode[] = [root];
        let survivingGroupNode: GridRowsDiagramNode | null = null;

        for (const row of displayedRows) {
            let diagramNode = this.diagramNodes.get(row);
            if (!diagramNode) {
                diagramNode = new GridRowsDiagramNode(gridRows, row);
                this.diagramNodes.set(row, diagramNode);
            }

            let parentNode: GridRowsDiagramNode;

            if (hasMasterDetail && row.detail && row.parent) {
                parentNode = this.getDiagramNode(gridRows, row.parent) || root;
            } else if (groupHideParentOfSingleChild === true) {
                if (row.group && !survivingGroupNode) {
                    survivingGroupNode = diagramNode;
                    parentNode = root;
                } else {
                    parentNode = row.group ? root : survivingGroupNode || root;
                }
            } else {
                const uiLevel = row.uiLevel ?? 0;

                parentStack.length = Math.min(parentStack.length, uiLevel + 1);
                while (parentStack.length <= uiLevel) {
                    parentStack.push(diagramNode);
                }

                parentNode = parentStack[uiLevel];
                parentStack[uiLevel + 1] = diagramNode;
            }

            if (!diagramNode.parent) {
                diagramNode.parent = parentNode;
                parentNode.children.set(row, diagramNode);
            }

            const detailGridRows = gridRows.getDetailGridRows(row);
            if (detailGridRows) {
                this.attachDetailGrid(diagramNode, detailGridRows);
            }
        }
    }

    private attachDetailGrid(parentNode: GridRowsDiagramNode, detailGridRows: GridRows) {
        const detailRoot = this.getDiagramRoot(detailGridRows);
        detailRoot.parent = parentNode;
        parentNode.children.set(null, detailRoot);

        for (const displayedRow of detailGridRows.displayedRows) {
            const detailChild = this.getDiagramNode(detailGridRows, displayedRow);
            if (detailChild) {
                detailChild.parent = detailRoot;
                detailRoot.children.set(displayedRow, detailChild);
            }
        }
    }

    public getDiagramNode = (gridRows: GridRows, row: RowNode | null): GridRowsDiagramNode | null => {
        if (!row) {
            return this.getDiagramRoot(gridRows);
        }

        let diagramNode = this.diagramNodes.get(row);
        if (!diagramNode) {
            diagramNode = new GridRowsDiagramNode(gridRows, row);
            this.diagramNodes.set(row, diagramNode);

            if (!diagramNode.parent && row.parent) {
                const parentNode = this.getDiagramNode(gridRows, row.parent);
                if (parentNode) {
                    diagramNode.parent = parentNode;
                    parentNode.children.set(row, diagramNode);
                }
            }

            const detailGridRows = gridRows.getDetailGridRows(row);
            if (detailGridRows) {
                this.attachDetailGrid(diagramNode, detailGridRows);
            }
        }
        return diagramNode;
    };

    public diagramToString(printErrors: boolean, inputColumns: Column[] | null): string {
        const processedRows = new Set<RowNode>();
        const rootRowNode = this.gridRows.rootRowNode;
        let result = (rootRowNode ? this.rowDiagram(this.gridRows, rootRowNode, inputColumns) : '[no root row]') + '\n';

        const processRow = (gridRows: GridRows, row: RowNode, columns: Column[] | null) => {
            if (processedRows.has(row)) {
                result += '[duplicate row ' + rowIdAndIndexToString(row) + ']\n';
                return;
            }
            processedRows.add(row);

            const diagramNode = this.getDiagramNode(gridRows, row);
            const prefix = diagramNode?.prefix ?? '';

            result += prefix + this.rowDiagram(gridRows, row, columns);
            result += '\n';

            if (printErrors) {
                const rowErrors = gridRows.errors.get(row);
                if (rowErrors.errors.size > 0) {
                    result += rowErrors.toString(' '.repeat(prefix.length + 1));
                }
            }
            if (diagramNode?.hiddenChildren) {
                for (const child of diagramNode.hiddenChildren) {
                    processRow(gridRows, child.row!, columns);
                }
            }
            const detailGridRows = gridRows.getDetailGridRows(row);
            if (detailGridRows) {
                const detailColumns = detailGridRows.api.getAllGridColumns();
                const detailRoot = this.getDiagramRoot(detailGridRows);
                if (detailRoot.row) {
                    processRow(detailGridRows, detailRoot.row, detailColumns);
                }
                for (const displayedRow of detailGridRows.displayedRows) {
                    processRow(detailGridRows, displayedRow, detailColumns);
                }
            }
        };

        this.getDiagramRoot(this.gridRows);

        for (const displayedRow of this.gridRows.displayedRows) {
            processRow(this.gridRows, displayedRow, inputColumns);
        }
        const additionalErrors = this.gridRows.errors.toString({ exclude: processedRows });
        if (additionalErrors.length > 0) {
            result += '\n' + additionalErrors;
        }
        if (this.gridRows.errors.totalErrorsCount > 0) {
            result += '\n❌ GRID HAS ' + this.gridRows.errors.totalErrorsCount + ' ERRORS\n';
        }
        return result;
    }

    private rowDiagram(gridRows: GridRows, row: RowNode, columns: Column[] | null): string {
        let result = '';

        if (
            gridRows.treeData &&
            row.key &&
            !row.footer &&
            (row.data || (typeof row.id === 'string' && row.id.startsWith('row-group-')))
        ) {
            result += optionalEscapeString(row.key) + ' ' + this.getNodeType(gridRows, row);
        } else {
            result += this.getNodeType(gridRows, row);
        }

        const selectionState = row.isSelected();
        if (selectionState) {
            result += ' selected';
        } else if (selectionState === undefined) {
            result += ' indeterminate';
        }
        if (row.level >= 0 && !row.expanded && (row.group || row.master || row.isExpandable())) {
            result += ' collapsed';
        }

        if (!gridRows.isRowDisplayed(row) && row !== gridRows.rootRowNode) {
            result += ' hidden';
        }

        if (gridRows.options.printIds !== false) {
            result += ' id:' + rowIdToString(row);
        }

        if (gridRows.options.printRowIndices) {
            result += ' rowIndex:' + row.rowIndex;
        }

        if (columns) {
            const rootRowNode = gridRows.rootRowNode;
            const omitUndefined = gridRows.options.ignoreUndefinedCells ?? false;
            for (const column of columns) {
                const columnId = column.getColId();
                if (row === rootRowNode && isRowNumberCol(columnId)) {
                    continue;
                }
                const value = gridRows.api.getCellValue({ rowNode: row, colKey: column });
                const diagramColumnId = isRowNumberCol(columnId) ? 'row-number' : columnId;
                if (value !== undefined) {
                    result += ' ' + diagramColumnId + ':' + JSON.stringify(value);
                } else if (!omitUndefined && row.data != null) {
                    result += ' ' + diagramColumnId + ':undefined';
                }
            }
        }

        const dataProps = gridRows.options.nodeDataProps;
        if (dataProps?.length) {
            for (const prop of dataProps) {
                const dataValue = (row.data as any)?.[prop];
                const serialised = JSON.stringify(dataValue ?? '');
                result += ` data.${prop}:${serialised}`;
            }
        }

        return result + ' ';
    }

    private updateDiagramTree(node: GridRowsDiagramNode, branch: string, updated: Set<GridRowsDiagramNode>) {
        if (updated.has(node)) {
            return;
        }
        updated.add(node);

        node.prefix = branch + (branch && node.children.size > 0 ? '┬ ' : branch ? '─ ' : '');

        if (node.children.size > 0) {
            const nextBranch = branch
                ? branch.slice(0, -2) + (branch.endsWith('└─') || branch.endsWith('└') ? '· ' : '│ ')
                : '';

            let index = 0;
            for (const child of node.children.values()) {
                const isLast = index === node.children.size - 1;
                this.updateDiagramTree(
                    child,
                    nextBranch + (isLast ? '└' : '├') + (child.row?.footer ? '' : '─'),
                    updated
                );
                index++;
            }
        }
    }
}
