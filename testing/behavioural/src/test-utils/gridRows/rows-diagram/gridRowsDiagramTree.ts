import type { Column, RowNode } from 'ag-grid-community';

import { rowIdAndIndexToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import { rowDiagram } from './formatting';
import { GridRowsDiagramNode } from './gridRowsDiagramNode';
import { getRowChildren } from './nodeInfo';

export class GridRowsDiagramTree {
    public readonly diagramRoots = new Map<GridRows, GridRowsDiagramNode>();
    public readonly diagramNodes = new Map<RowNode, GridRowsDiagramNode>();

    public constructor(public readonly gridRows: GridRows) {
        const diagramRoot = this.getDiagramRoot(gridRows)!;
        this.updateDiagramTree(diagramRoot, '', new Set());
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

        const children = getRowChildren(row);
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

            this.buildHierarchy(gridRows, diagramRoot, gridRows.displayedRows);

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

    private buildHierarchy(gridRows: GridRows, root: GridRowsDiagramNode, displayedRows: RowNode[]) {
        const hasMasterDetail = gridRows.api.getGridOption('masterDetail') ?? false;
        const displayedRowsSet = new Set(displayedRows);

        const findDisplayedAncestor = (start: RowNode | null): GridRowsDiagramNode | null => {
            let current: RowNode | null = start;
            while (current) {
                if (current === gridRows.rootRowNode) {
                    return this.getDiagramNode(gridRows, current);
                }
                if (displayedRowsSet.has(current)) {
                    const diagramParent = this.getDiagramNode(gridRows, current);
                    if (diagramParent) {
                        return diagramParent;
                    }
                }
                current = current.parent;
            }
            return null;
        };

        for (const row of displayedRows) {
            let diagramNode = this.diagramNodes.get(row);
            if (!diagramNode) {
                diagramNode = new GridRowsDiagramNode(gridRows, row);
                this.diagramNodes.set(row, diagramNode);
            }

            let parentNode: GridRowsDiagramNode;

            if (hasMasterDetail && row.detail && row.parent) {
                parentNode = this.getDiagramNode(gridRows, row.parent) || root;
            } else {
                let diagramParent: GridRowsDiagramNode | null = null;

                if (row.footer) {
                    diagramParent = findDisplayedAncestor(row.sibling ?? null);
                }

                if (!diagramParent) {
                    diagramParent = findDisplayedAncestor(row.parent ?? null);
                }

                parentNode = diagramParent ?? root;
            }

            if (diagramNode.parent && diagramNode.parent !== parentNode) {
                diagramNode.parent.children.delete(row);
                diagramNode.parent = null;
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
        let result = '';

        // Pinned top rows
        for (const pinnedRow of this.gridRows.pinnedTopRows) {
            result += this.formatPinnedRow(pinnedRow, inputColumns, printErrors, processedRows);
        }

        // Root row
        const rootRowNode = this.gridRows.rootRowNode;
        result += (rootRowNode ? rowDiagram(this.gridRows, rootRowNode, inputColumns) : '[no root row]') + '\n';

        // Displayed rows
        for (const displayedRow of this.gridRows.displayedRows) {
            result += this.formatRowRecursive(this.gridRows, displayedRow, inputColumns, printErrors, processedRows);
        }

        // Pinned bottom rows
        for (const pinnedRow of this.gridRows.pinnedBottomRows) {
            result += this.formatPinnedRow(pinnedRow, inputColumns, printErrors, processedRows);
        }

        // Trailing errors — only included when explicitly printing errors (e.g. for error messages and true mode).
        // In snapshot update mode makeDiagram(false) is used so errors are NOT baked into recorded snapshots.
        if (printErrors) {
            const additionalErrors = this.gridRows.errors.toString({ exclude: processedRows });
            if (additionalErrors.length > 0) {
                result += '\n' + additionalErrors;
            }
            if (this.gridRows.errors.totalErrorsCount > 0) {
                result += '\n❌ GRID HAS ' + this.gridRows.errors.totalErrorsCount + ' ERRORS\n';
            }
        }
        return result;
    }

    private formatPinnedRow(
        row: RowNode,
        columns: Column[] | null,
        printErrors: boolean,
        processedRows: Set<RowNode>
    ): string {
        if (processedRows.has(row)) {
            return '[duplicate row ' + rowIdAndIndexToString(row) + ']\n';
        }
        processedRows.add(row);
        let result = rowDiagram(this.gridRows, row, columns) + '\n';
        if (printErrors) {
            const rowErrors = this.gridRows.errors.get(row);
            if (rowErrors.errors.size > 0) {
                result += rowErrors.toString(' ');
            }
        }
        return result;
    }

    private formatRowRecursive(
        gridRows: GridRows,
        row: RowNode,
        columns: Column[] | null,
        printErrors: boolean,
        processedRows: Set<RowNode>
    ): string {
        if (processedRows.has(row)) {
            return '[duplicate row ' + rowIdAndIndexToString(row) + ']\n';
        }
        processedRows.add(row);

        const diagramNode = this.getDiagramNode(gridRows, row);
        const prefix = diagramNode?.prefix ?? '';
        let result = prefix + rowDiagram(gridRows, row, columns) + '\n';

        if (printErrors) {
            const rowErrors = gridRows.errors.get(row);
            if (rowErrors.errors.size > 0) {
                result += rowErrors.toString(' '.repeat(prefix.length + 1));
            }
        }

        if (diagramNode?.hiddenChildren) {
            for (const child of diagramNode.hiddenChildren) {
                result += this.formatRowRecursive(gridRows, child.row!, columns, printErrors, processedRows);
            }
        }

        const detailGridRows = gridRows.getDetailGridRows(row);
        if (detailGridRows) {
            result += this.formatDetailGrid(detailGridRows, printErrors, processedRows);
        }

        return result;
    }

    private formatDetailGrid(detailGridRows: GridRows, printErrors: boolean, processedRows: Set<RowNode>): string {
        let result = '';
        const detailColumns = detailGridRows.api.getAllGridColumns();
        const detailRoot = this.getDiagramRoot(detailGridRows);
        if (detailRoot.row) {
            result += this.formatRowRecursive(
                detailGridRows,
                detailRoot.row,
                detailColumns,
                printErrors,
                processedRows
            );
        }
        for (const displayedRow of detailGridRows.displayedRows) {
            result += this.formatRowRecursive(detailGridRows, displayedRow, detailColumns, printErrors, processedRows);
        }
        return result;
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
