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
        const rootRowNode = this.gridRows.rootRowNode;
        let result = '';

        const processPinnedRow = (row: RowNode, columns: Column[] | null) => {
            if (processedRows.has(row)) {
                result += '[duplicate row ' + rowIdAndIndexToString(row) + ']\n';
                return;
            }
            processedRows.add(row);
            result += this.rowDiagram(this.gridRows, row, columns) + '\n';
        };

        // Pinned top rows
        for (const pinnedRow of this.gridRows.pinnedTopRows) {
            processPinnedRow(pinnedRow, inputColumns);
        }

        result += (rootRowNode ? this.rowDiagram(this.gridRows, rootRowNode, inputColumns) : '[no root row]') + '\n';

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

        // Pinned bottom rows
        for (const pinnedRow of this.gridRows.pinnedBottomRows) {
            processPinnedRow(pinnedRow, inputColumns);
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
        const rowPinned = row.rowPinned;

        // Pinned rows get a special type prefix
        if (rowPinned === 'top') {
            result += 'PINNED_TOP';
        } else if (rowPinned === 'bottom') {
            result += 'PINNED_BOTTOM';
        } else if (
            gridRows.treeData &&
            row.key &&
            !row.footer &&
            (row.data || (typeof row.id === 'string' && row.id.startsWith('row-group-')))
        ) {
            result += optionalEscapeString(row.key) + ' ' + this.getNodeType(gridRows, row);
        } else {
            result += this.getNodeType(gridRows, row);
        }

        // Selection state (not applicable for pinned rows)
        if (!rowPinned) {
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
        }

        if (gridRows.options.printIds !== false) {
            result += ' id:' + rowIdToString(row);
        }

        if (gridRows.options.printRowIndices) {
            result += ' rowIndex:' + row.rowIndex;
        }

        const printedFields = new Set<string>();
        result += this.formatRowColumns(gridRows, row, columns, row === gridRows.rootRowNode, printedFields);
        result += this.formatNodeDataProps(gridRows, row);

        // For pinned rows, also print data fields that weren't already printed by columns
        // (e.g., in pivot mode where pivot columns don't map to pinned row data)
        if (rowPinned && row.data && typeof row.data === 'object') {
            for (const [key, value] of Object.entries(row.data)) {
                if (key !== 'id' && value !== undefined && value !== null && !printedFields.has(key)) {
                    const serialised = typeof value === 'bigint' ? JSON.stringify(`${value}n`) : JSON.stringify(value);
                    result += ` ${key}:${serialised}`;
                }
            }
        }

        return result + ' ';
    }

    private formatRowColumns(
        gridRows: GridRows,
        row: RowNode,
        columns: Column[] | null,
        isRootRowNode = false,
        printedFields?: Set<string>
    ): string {
        if (!columns) {
            return '';
        }
        const omitUndefined = gridRows.options.ignoreUndefinedCells ?? true;
        let result = '';

        for (const column of columns) {
            const columnId = column.getColId();
            if (isRootRowNode && isRowNumberCol(columnId)) {
                continue;
            }

            const value = gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: false });
            let formattedValue = value;
            if (gridRows.options.useFormatter ?? true) {
                formattedValue = gridRows.api.getCellValue({
                    rowNode: row,
                    colKey: column,
                    useFormatter: true,
                });
                if (formattedValue === String(value)) {
                    formattedValue = value;
                }
            }

            const diagramColumnId = isRowNumberCol(columnId) ? 'row-number' : columnId;
            if (value !== undefined || formattedValue) {
                const serialisedValue =
                    typeof (formattedValue || value) === 'bigint'
                        ? JSON.stringify(`${formattedValue || value}n`)
                        : JSON.stringify(formattedValue || value);
                result += ' ' + diagramColumnId + ':' + serialisedValue;
                // Track this field as printed (use the column's field if it has one)
                const colDef = column.getColDef();
                if (colDef.field) {
                    printedFields?.add(colDef.field);
                }
            } else if (!omitUndefined && row.data != null) {
                result += ' ' + diagramColumnId + ':undefined';
            }
        }

        return result;
    }

    private formatNodeDataProps(gridRows: GridRows, row: RowNode): string {
        const dataProps = gridRows.options.nodeDataProps;
        if (!dataProps?.length) {
            return '';
        }

        let result = '';
        for (const prop of dataProps) {
            const dataValue = (row.data as any)?.[prop];
            const serialised =
                typeof dataValue === 'bigint' ? JSON.stringify(`${dataValue}n`) : JSON.stringify(dataValue ?? '');
            result += ` data.${prop}:${serialised}`;
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
