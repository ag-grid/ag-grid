import type { Column, IRowNode, RowNode } from '@ag-grid-community/core';

import { optionalEscapeString, rowIdAndIndexToString, rowIdToString } from '../grid-test-utils';
import type { GridRows } from './gridRows';

export class GridRowsDiagramNode {
    public parent: GridRowsDiagramNode | null = null;
    public children = new Map<RowNode | null, GridRowsDiagramNode>();
    public hiddenChildren: Set<GridRowsDiagramNode> | null = null;
    public prefix: string = '';

    public constructor(public readonly row: RowNode | null) {}
}

export class GridRowsDiagramTree {
    public readonly diagramRoot: GridRowsDiagramNode;
    public readonly diagramNodes = new Map<RowNode | null, GridRowsDiagramNode>();
    #processedHiddenRows = new Set<RowNode>();

    public constructor(public readonly gridRows: GridRows) {
        const { rootRowNode, displayedRows, options } = gridRows;
        this.diagramRoot = this.getDiagramNode(rootRowNode)!;
        this.diagramNodes.set(null, this.diagramRoot);
        this.diagramNodes.set(rootRowNode, this.diagramRoot);

        for (const row of displayedRows) {
            this.getDiagramNode(row);
        }

        if (options.printHiddenRows ?? true) {
            for (const row of displayedRows) {
                this.processHiddenRows(row);
            }
        }

        this.#updateDiagramTree(this.diagramRoot, '', new Set());
    }

    private processHiddenRows(row: RowNode) {
        if (this.#processedHiddenRows.has(row)) {
            return;
        }
        this.#processedHiddenRows.add(row);
        const node = this.getDiagramNode(row);
        if (!node) {
            return;
        }
        const children =
            row.childrenAfterSort ?? row.childrenAfterAggFilter ?? row.childrenAfterFilter ?? row.childrenAfterGroup;
        if (!children) {
            return;
        }
        node.hiddenChildren ??= new Set();
        for (const child of children) {
            if (typeof child !== 'object' || child === null || this.diagramNodes.has(child)) {
                continue;
            }
            const diagramChild = this.getDiagramNode(child);
            if (diagramChild) {
                node.hiddenChildren.add(diagramChild);
                this.processHiddenRows(child);
            }
        }
    }

    public getNodeType(row: IRowNode): string {
        if (row.level === -1 && row === this.gridRows.rootRowNode) {
            return 'ROOT';
        }
        if (row.footer) {
            return 'footer';
        }
        if (!row.data) {
            return 'filler';
        }
        if (row.detail) {
            return 'detail';
        }
        if (row.master) {
            return 'master';
        }
        if (row.childrenAfterGroup?.length) {
            return 'GROUP';
        }
        return 'LEAF';
    }

    public getDiagramNode = (row: RowNode | null): GridRowsDiagramNode | null => {
        if (typeof row !== 'object') {
            return null;
        }
        let diagramNode = this.diagramNodes.get(row);
        if (!diagramNode) {
            diagramNode = new GridRowsDiagramNode(row);
            this.diagramNodes.set(row, diagramNode);
            if (row) {
                let parent: RowNode | null | undefined;
                if (row.footer && typeof row.id === 'string' && row.id?.startsWith('rowGroupFooter_')) {
                    parent = this.gridRows.getById(row.id!.slice('rowGroupFooter_'.length));
                }
                if (!parent) {
                    parent = row.parent ?? null;
                }
                const parentNode = this.getDiagramNode(parent);
                if (parentNode) {
                    diagramNode.parent = parentNode;
                    parentNode.children.set(row, diagramNode);
                }
            }
        }
        return diagramNode;
    };

    public diagramToString(printErrors: boolean, columns: Column[] | null): string {
        const processedRows = new Set<RowNode>();
        const rootRowNode = this.gridRows.rootRowNode;
        let result = (rootRowNode ? this.#rowDiagram(rootRowNode, columns) : '[no root row]') + '\n';

        const processRow = (row: RowNode) => {
            if (processedRows.has(row)) {
                result += '[duplicate row ' + rowIdAndIndexToString(row) + ']\n';
                return;
            }
            processedRows.add(row);
            if (typeof row !== 'object' || !row) {
                result += '[' + row + ']\n';
                return;
            }

            const diagramNode = this.getDiagramNode(row);
            const prefix = diagramNode?.prefix ?? '';

            result += prefix + this.#rowDiagram(row, columns);
            result += '\n';

            if (printErrors) {
                const rowErrors = this.gridRows.errors.get(row);
                if (rowErrors.errors.size > 0) {
                    result += rowErrors.toString(' '.repeat(prefix.length + 1));
                }
            }

            if (diagramNode?.hiddenChildren) {
                for (const child of diagramNode.hiddenChildren) {
                    processRow(child.row!);
                }
            }
        };

        this.gridRows.displayedRows.forEach(processRow);

        const additionalErrors = this.gridRows.errors.toString({ exclude: processedRows });
        if (additionalErrors.length > 0) {
            result += '\n' + additionalErrors;
        }

        if (this.gridRows.errors.totalErrorsCount > 0) {
            result += '\n❌ GRID HAS ' + this.gridRows.errors.totalErrorsCount + ' ERRORS\n';
        }

        return result;
    }

    #rowDiagram(row: RowNode, columns: Column[] | null): string {
        let result = '';
        let typeAdded = false;
        if (
            this.gridRows.treeData &&
            row.key &&
            !row.footer &&
            (row.data || (typeof row.id === 'string' && row.id.startsWith('row-group-')))
        ) {
            result += optionalEscapeString(row.key) + ' ';
            result += this.getNodeType(row) + ' ';
            typeAdded = true;
        }

        if (!typeAdded) {
            result += this.getNodeType(row) + ' ';
        }

        if (row.isSelected()) {
            result += 'selected ';
        }
        if (row.level >= 0 && !row.expanded && row.group) {
            result += 'collapsed ';
        }
        if (!this.gridRows.isRowDisplayed(row) && row !== this.gridRows.rootRowNode) {
            result += 'hidden ';
        }

        if (this.gridRows.options.printIds !== false) {
            result += 'id:' + rowIdToString(row) + ' ';
        }

        if (columns) {
            for (const column of columns) {
                const value = this.gridRows.api.getCellValue({ rowNode: row, colKey: column });
                if (value !== undefined || row.data) {
                    result += column.getColId() + ':' + JSON.stringify(value) + ' ';
                }
            }
        }

        return result;
    }

    #updateDiagramTree(node: GridRowsDiagramNode, branch: string, updated: Set<GridRowsDiagramNode>) {
        if (updated.has(node)) {
            return;
        }
        updated.add(node);
        const branchPrefix = branch.length ? (node.children.size > 0 ? '┬ ' : '─ ') : '';
        node.prefix = branch + branchPrefix;
        if (branch.length > 0) {
            branch = branch.slice(0, -2) + (branch.endsWith('└─') || branch.endsWith('└') ? '· ' : '│ ');
        }
        let index = 0;
        const indexOfLastChild = node.children.size - 1;
        for (const child of node.children.values()) {
            let childBranch = branch + (index === indexOfLastChild ? '└' : '├');
            if (!child.row?.footer) {
                childBranch += '─';
            }
            this.#updateDiagramTree(child, childBranch, updated);
            ++index;
        }
    }
}
